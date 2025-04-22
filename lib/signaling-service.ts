import { io, Socket } from 'socket.io-client';

// Static socket instance to prevent duplicate connections
let globalSocketInstance: Socket | null = null;

export class SignalingService {
  private socket: Socket | null = null;
  private roomId: string;
  private userId: string;
  public isHost: boolean;
  private userName: string;
  private initialized = false;

  // Track processed notifications to prevent duplicates
  private processedNotifications = new Set<string>();

  // Event callbacks
  public onUserJoined: (userId: string, name: string, avatar?: string) => void = () => {};
  public onUserLeft: (userId: string) => void = () => {};
  public onOffer: (userId: string, offer: RTCSessionDescriptionInit) => void = () => {};
  public onAnswer: (userId: string, answer: RTCSessionDescriptionInit) => void = () => {};
  public onIceCandidate: (userId: string, candidate: RTCIceCandidateInit) => void = () => {};
  public onMediaStateChanged: (userId: string, audioEnabled: boolean, videoEnabled: boolean) => void = () => {};

  // Waiting room callbacks
  public onParticipantWaiting: (userId: string, name?: string, avatar?: string) => void = () => {};
  public onParticipantAdmitted: (userId: string) => void = () => {};
  public onRejected: () => void = () => {};
  public onAdmitted: () => void = () => {};

  // New event callbacks for code editor
  public onCodeUpdated: (userId: string, code: string, language: string, cursorPosition?: any) => void = () => {};
  public onCodeExecuted: (userId: string) => void = () => {};
  public onCodeExecutionResult: (result: string, language: string) => void = () => {};

  constructor(roomId: string, userId: string, isHost: boolean, userName?: string) {
    this.roomId = roomId;
    this.userId = userId;
    this.isHost = isHost;
    this.userName = userName || 'Guest';

    // If we already have a socket instance, disconnect it
    if (globalSocketInstance) {
      console.log('Clearing existing socket connection before creating a new one');
      globalSocketInstance.disconnect();
      globalSocketInstance = null;
    }

    this.connect();
  }

  private async connect() {
    // Prevent duplicate initializations
    if (this.initialized) {
      console.log('SignalingService already initialized, skipping duplicate initialization');
      return;
    }

    this.initialized = true;
    console.log(`Connecting to signaling server (${this.isHost ? 'Host' : 'Participant'} mode) with user ID: ${this.userId}`);

    // Make sure Socket.IO server is initialized
    try {
      await fetch('/api/meeting-signaling');
    } catch (e) {
      console.error('Failed to initialize signaling server:', e);
    }

    // Connect to socket.io server with explicit URL and better connection options
    this.socket = io('/', {  // Use root path
      transports: ['websocket', 'polling'],  // Try websocket first
      forceNew: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,  // Increased timeout
      path: '/socket.io/',  // Make sure the path matches server
      withCredentials: false,  // Try without credentials
      autoConnect: true
    });

    // Store the socket instance globally to prevent duplicates
    globalSocketInstance = this.socket;

    this.socket.on('connect', () => {
      console.log(`Connected to signaling server with ID: ${this.socket?.id}, User: ${this.userId}, Role: ${this.isHost ? 'Host' : 'Participant'}`);

      // Join room
      this.socket?.emit('join', {
        roomId: this.roomId,
        userId: this.userId,
        isHost: this.isHost,
        userName: this.userName
      });

      if (this.isHost) {
        console.log(`Host ${this.userId} joining room ${this.roomId}`);
      } else {
        console.log(`Participant ${this.userId} attempting to join room ${this.roomId}`);
      }
    });

    this.socket.on('joined', (data) => {
      console.log(`Successfully joined room: ${data.roomId} as ${this.isHost ? 'host' : 'participant'}`);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err, err.message);
      // Try to reconnect with different transport if websocket fails
      if (this.socket) {
        console.log('Trying to reconnect with different transport');
        this.socket.io.opts.transports = ['polling', 'websocket'];
        this.socket.io.engine.close();
        this.socket.connect();
      }
    });

    this.socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    // Set up message handlers for signaling
    this.socket.on('user-joined', (data) => {
      console.log(`User joined: ${data.userName} (${data.userId})`);
      this.onUserJoined(data.userId, data.userName, data.userAvatar);
    });

    this.socket.on('user-left', (data) => {
      console.log(`User left: ${data.userId}`);
      this.onUserLeft(data.userId);
    });

    this.socket.on('offer', (data) => {
      console.log(`Received offer from: ${data.userId}`);
      this.onOffer(data.userId, data.offer);
    });

    this.socket.on('answer', (data) => {
      console.log(`Received answer from: ${data.userId}`);
      this.onAnswer(data.userId, data.answer);
    });

    this.socket.on('ice-candidate', (data) => {
      // console.log('Received ICE candidate from:', data.userId);
      this.onIceCandidate(data.userId, data.candidate);
    });

    this.socket.on('media-state-changed', (data) => {
      console.log(`Received media state update from: ${data.userId}`, data);
      this.onMediaStateChanged(data.userId, data.audioEnabled, data.videoEnabled);
    });

    // Waiting room events
    this.socket.on('waiting', (data) => {
      // Generate a notification ID if not provided
      const notificationId = data.notificationId || `${data.userId}-${Date.now()}`;

      // Check if we've already processed this notification
      if (this.processedNotifications.has(notificationId)) {
        console.log(`[DUPLICATE] Ignoring duplicate waiting notification: ${notificationId}`);
        return;
      }

      // Store notification ID to prevent duplicates
      this.processedNotifications.add(notificationId);

      if (this.isHost) {
        console.log(`[HOST] Participant waiting: ${data.userName} (${data.userId}) - Notification ID: ${notificationId}`);
      } else {
        console.log(`[PARTICIPANT] Someone is waiting: ${data.userId} - Notification ID: ${notificationId}`);
      }

      // Trigger the callback with participant info
      this.onParticipantWaiting(data.userId, data.userName, data.userAvatar);
    });

    this.socket.on('admitted', () => {
      console.log('[PARTICIPANT] You have been admitted to the meeting');
      this.onAdmitted();
    });

    this.socket.on('rejected', () => {
      console.log('[PARTICIPANT] You have been rejected from the meeting');
      this.onRejected();
    });

    this.socket.on('disconnect', () => {
      console.log(`Disconnected from signaling server (${this.isHost ? 'Host' : 'Participant'} mode)`);
      // Clear processed notifications on disconnect to avoid memory leaks
      this.processedNotifications.clear();
    });

    // Code editor events
    this.socket.on('code-updated', (data) => {
      console.log(`Received code update from: ${data.userId}`);
      console.log('Code:', data.code);
      this.onCodeUpdated(data.userId, data.code, data.language, data.cursorPosition);
    });

    this.socket.on('code-executed', (data) => {
      console.log(`User ${data.userId} executed code`);
      this.onCodeExecuted(data.userId);
    });

    this.socket.on('code-execution-result', (data) => {
      console.log('Received code execution result');
      this.onCodeExecutionResult(data.result, data.language);
    });
  }

  // Methods to send signaling messages
  public sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('offer', {
        roomId: this.roomId,
        targetUserId,
        userId: this.userId,
        offer
      });
    }
  }

  public sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('answer', {
        roomId: this.roomId,
        targetUserId,
        userId: this.userId,
        answer
      });
    }
  }

  public sendIceCandidate(targetUserId: string, candidate: RTCIceCandidate) {
    if (this.socket) {
      this.socket.emit('ice-candidate', {
        roomId: this.roomId,
        targetUserId,
        userId: this.userId,
        candidate
      });
    }
  }

  public broadcastMediaState(state: { audio: boolean, video: boolean }) {
    if (this.socket) {
      console.log(`Broadcasting media state: audio=${state.audio}, video=${state.video}`);
      this.socket.emit('media-state', {
        roomId: this.roomId,
        userId: this.userId,
        audioEnabled: state.audio,
        videoEnabled: state.video
      });
    }
  }

  public sendMediaState(targetUserId: string, state: { audio: boolean, video: boolean }) {
    if (this.socket) {
      console.log(`Sending media state to ${targetUserId}: audio=${state.audio}, video=${state.video}`);
      this.socket.emit('direct-media-state', {
        roomId: this.roomId,
        userId: this.userId,
        targetUserId: targetUserId,
        audioEnabled: state.audio,
        videoEnabled: state.video
      });
    }
  }

  // New methods to send code-related messages
  public updateCode(code: string, language: string, cursorPosition?: any) {
    if (this.socket) {
      this.socket.emit('code-update', {
        roomId: this.roomId,
        userId: this.userId,
        code,
        language,
        cursorPosition
      });
    }
  }

  public executeCode(code: string, language: string) {
    if (this.socket) {
      this.socket.emit('code-execute', {
        roomId: this.roomId,
        userId: this.userId,
        code,
        language
      });
    }
  }

  // Waiting room management
  public admitParticipant(participantId: string) {
    console.log(`[HOST] Admitting participant: ${participantId}`);
    if (this.socket) {
      this.socket.emit('admit', {
        roomId: this.roomId,
        userId: this.userId,
        targetUserId: participantId
      });
    }
  }

  public rejectParticipant(participantId: string) {
    console.log(`[HOST] Rejecting participant: ${participantId}`);
    if (this.socket) {
      this.socket.emit('reject', {
        roomId: this.roomId,
        userId: this.userId,
        targetUserId: participantId
      });
    }
  }

  public disconnect() {
    console.log(`Disconnecting from signaling server (${this.isHost ? 'Host' : 'Participant'})`);
    if (this.socket) {
      this.socket.emit('leave', {
        roomId: this.roomId,
        userId: this.userId
      });

      this.socket.disconnect();
      this.socket = null;
      globalSocketInstance = null;
    }
  }

  public leaveMeeting() {
    if (this.socket) {
      this.socket.emit('leave', {
        roomId: this.roomId,
        userId: this.userId,
      });
      this.disconnect();
    }
  }
}