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
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    
    // Add tracks from local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingService.sendIceCandidate(userId, event.candidate);
      }
    };

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      this.onParticipantAddedCallback(userId, userName, event.streams[0]); // Pass the userName
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  private async handleUserJoined(userId: string, userName: string) {
    console.log(`User joined: ${userName} (${userId}). Creating peer connection as ${this.signalingService.isHost ? 'host' : 'participant'}`);
    
    // Everyone should create connections with new users, not just the host
    const peerConnection = await this.createPeerConnection(userId, userName);
    
    // If we're the host OR we joined after them (we're the newer participant)
    // This ensures connections are created in one direction only to avoid duplicates
    if (this.signalingService.isHost || this.signalingService.userId > userId) {
      console.log(`Initiating connection to ${userName} (${userId})`);
      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.signalingService.sendOffer(userId, offer);
    } else {
      console.log(`Waiting for offer from ${userName} (${userId})`);
      // For participants that joined earlier, wait for their offer
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
    const peerConnection = await this.createPeerConnection(userId);
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    this.signalingService.sendAnswer(userId, answer);
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
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
    }
  }

  public async toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
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
