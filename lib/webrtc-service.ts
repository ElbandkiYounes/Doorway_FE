import { SignalingService } from './signaling-service';

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private signalingService: SignalingService;
  private onParticipantAddedCallback: (id: string, name: string | undefined, stream: MediaStream) => void = () => {};
  private onParticipantRemovedCallback: (id: string) => void = () => {};
  private onParticipantWaitingCallback: (id: string, name?: string, avatar?: string) => void = () => {};
  private onParticipantAdmittedCallback: (id: string) => void = () => {};
  private onAdmittedCallback: () => void = () => {};
  private onRejectedCallback: () => void = () => {};
  
  constructor(roomId: string, userId: string, isHost: boolean, userName?: string) {
    this.signalingService = new SignalingService(roomId, userId, isHost, userName);
    
    // Set up signaling event handlers
    this.signalingService.onUserJoined = (userId, userName) => this.handleUserJoined(userId, userName); // Ensure userName is passed
    this.signalingService.onUserLeft = (userId) => this.handleUserLeft(userId);
    this.signalingService.onOffer = (userId, offer) => this.handleOffer(userId, offer);
    this.signalingService.onAnswer = (userId, answer) => this.handleAnswer(userId, answer);
    this.signalingService.onIceCandidate = (userId, candidate) => this.handleIceCandidate(userId, candidate);
    
    // Set up waiting room event handlers
    this.signalingService.onParticipantWaiting = (userId, name, avatar) => 
      this.onParticipantWaitingCallback(userId, name, avatar);
    this.signalingService.onParticipantAdmitted = (userId) => 
      this.onParticipantAdmittedCallback(userId);
    this.signalingService.onAdmitted = () => this.onAdmittedCallback();
    this.signalingService.onRejected = () => this.onRejectedCallback();
  }

  public async initialize(): Promise<MediaStream> {
    try {
      // Request user media (camera and microphone)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      return this.localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  public setCallbacks(
    onParticipantAdded: (id: string, name: string | undefined, stream: MediaStream) => void,
    onParticipantRemoved: (id: string) => void
  ) {
    this.onParticipantAddedCallback = onParticipantAdded;
    this.onParticipantRemovedCallback = onParticipantRemoved;
  }
  
  public setWaitingRoomCallbacks(
    onParticipantWaiting: (id: string, name?: string, avatar?: string) => void,
    onParticipantAdmitted: (id: string) => void,
    onAdmitted: () => void,
    onRejected: () => void
  ) {
    this.onParticipantWaitingCallback = onParticipantWaiting;
    this.onParticipantAdmittedCallback = onParticipantAdmitted;
    this.onAdmittedCallback = onAdmitted;
    this.onRejectedCallback = onRejected;
  }

  private async createPeerConnection(userId: string, userName?: string): Promise<RTCPeerConnection> {
    // STUN servers for NAT traversal
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    };

    console.log(`Creating peer connection for ${userId}${userName ? ` (${userName})` : ''}`);
    const peerConnection = new RTCPeerConnection(configuration);
    
    // Add tracks from local stream to peer connection
    if (this.localStream) {
      console.log(`Adding ${this.localStream.getTracks().length} local tracks to peer connection for ${userId}`);
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    } else {
      console.warn(`No local stream available when creating peer connection for ${userId}`);
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingService.sendIceCandidate(userId, event.candidate);
      }
    };
    
    // Log ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}: ${peerConnection.iceConnectionState}`);
    };

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log(`Received tracks from ${userId}:`, event.streams);
      if (event.streams && event.streams[0]) {
        this.onParticipantAddedCallback(userId, userName, event.streams[0]);
      } else {
        console.warn(`Received track event from ${userId} but no streams were present`);
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  private async handleUserJoined(userId: string, userName: string) {
    console.log(`User joined: ${userName} (${userId}). Creating peer connection as ${this.signalingService.isHost ? 'host' : 'participant'}`);
    
    try {
      // Create a peer connection for each new user that joins
      let peerConnection = this.peerConnections.get(userId);
      
      if (!peerConnection) {
        console.log(`Creating new peer connection for user ${userId} (${userName})`);
        peerConnection = await this.createPeerConnection(userId, userName);
      }
      
      // For mesh topology, we need to establish who initiates the connection to avoid duplicates
      // Use a deterministic approach: the peer with the "smaller" ID initiates
      const shouldInitiate = this.signalingService.userId.localeCompare(userId) < 0;
      
      if (shouldInitiate) {
        console.log(`Initiating connection to ${userName} (${userId})`);
        
        // Create and send offer
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await peerConnection.setLocalDescription(offer);
        this.signalingService.sendOffer(userId, offer);
      } else {
        console.log(`Waiting for offer from ${userName} (${userId})`);
        // The other peer will initiate
      }
    } catch (error) {
      console.error(`Error handling user joined for ${userId}:`, error);
    }
  }

  private handleUserLeft(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
      this.onParticipantRemovedCallback(userId);
    }
  }

  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit) {
    try {
      console.log(`Received offer from ${userId}, current connections:`, Array.from(this.peerConnections.keys()));
      
      // Check if we already have a connection for this user
      let peerConnection = this.peerConnections.get(userId);
      
      // If no connection exists, create one
      if (!peerConnection) {
        console.log(`Creating new peer connection for ${userId}`);
        peerConnection = await this.createPeerConnection(userId);
      }
      
      // Check connection state
      const currentState = peerConnection.signalingState;
      console.log(`Current signaling state for connection with ${userId}: ${currentState}`);
      
      if (currentState !== 'stable') {
        // If we're not in stable state, try to roll back first
        try {
          console.log(`Connection with ${userId} is in ${currentState} state - attempting to roll back`);
          await peerConnection.setLocalDescription({type: "rollback"});
          console.log(`Successfully rolled back connection with ${userId}`);
        } catch (e) {
          console.warn(`Failed to rollback connection state with ${userId}, will attempt to proceed anyway:`, e);
        }
      }
      
      // Now set the remote description
      console.log(`Setting remote offer description for ${userId}`);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and send answer
      console.log(`Creating answer for ${userId}`);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log(`Sending answer to ${userId}`);
      this.signalingService.sendAnswer(userId, answer);
    } catch (error) {
      console.error(`Error handling offer from ${userId}:`, error);
    }
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      console.warn(`Received answer from ${userId} but no peer connection exists`);
      return;
    }
    
    try {
      // Check connection state before setting remote description
      const currentState = peerConnection.signalingState;
      console.log(`Handling answer from ${userId}, current state: ${currentState}`);
      
      // Only set the remote description if we're in the correct state
      if (currentState === 'have-local-offer') {
        console.log(`Setting remote answer for connection with ${userId}`);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Successfully set remote description (answer) for user ${userId}`);
      } else if (currentState === 'stable') {
        console.warn(`Cannot set remote description: peer connection is in ${currentState} state, expected 'have-local-offer'`);
        console.log(`This may indicate the answer was already processed or arrived too late.`);
        
        // Re-initiate connection if we're the host and the connection is already stable
        if (this.signalingService.isHost) {
          console.log(`Host re-initiating connection to ${userId} as previous signaling may have failed`);
          // We'll try to renegotiate
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await peerConnection.setLocalDescription(offer);
          this.signalingService.sendOffer(userId, offer);
        }
      } else {
        console.warn(`Connection with ${userId} is in unexpected state: ${currentState}`);
      }
    } catch (error) {
      console.error(`Error setting remote description for ${userId}:`, error);
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error(`Error adding ICE candidate from ${userId}:`, error);
      }
    } else {
      console.warn(`Received ICE candidate for unknown peer: ${userId}`);
    }
  }
  
  // Waiting room management
  public admitParticipant(participantId: string) {
    this.signalingService.admitParticipant(participantId);
  }
  
  public rejectParticipant(participantId: string) {
    this.signalingService.rejectParticipant(participantId);
  }

  public async toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // Broadcast state change to all participants
      this.signalingService.broadcastMediaState({
        audio: enabled,
        video: this.localStream.getVideoTracks().length > 0 ? 
          this.localStream.getVideoTracks()[0].enabled : false
      });
    }
  }

  public async toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // Broadcast state change to all participants
      this.signalingService.broadcastMediaState({
        audio: this.localStream.getAudioTracks().length > 0 ? 
          this.localStream.getAudioTracks()[0].enabled : false,
        video: enabled
      });
    }
  }

  public async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      
      // Replace video track with screen share track
      const videoTrack = screenStream.getVideoTracks()[0];
      
      this.peerConnections.forEach((peerConnection) => {
        const senders = peerConnection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track?.kind === 'video'
        );
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      });
      
      // When screen sharing stops
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  public async stopScreenShare() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      
      this.peerConnections.forEach((peerConnection) => {
        const senders = peerConnection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track?.kind === 'video'
        );
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      });
    }
  }

  public disconnect() {
    // Close all peer connections
    this.peerConnections.forEach(connection => {
      connection.close();
    });
    this.peerConnections.clear();
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close signaling connection
    this.signalingService.disconnect();
  }
}
