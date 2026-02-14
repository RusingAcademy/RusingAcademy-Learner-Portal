import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Users,
  Settings,
  Maximize2,
  MessageSquare,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JitsiVideoRoomProps {
  sessionId: string;
  roomName: string;
  coachName: string;
  learnerName: string;
  scheduledDuration: number; // in minutes
  onEnd?: () => void;
  isCoach?: boolean;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: JitsiMeetOptions) => JitsiMeetAPI;
  }
}

interface JitsiMeetOptions {
  roomName: string;
  width: string | number;
  height: string | number;
  parentNode: HTMLElement;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

interface JitsiMeetAPI {
  executeCommand: (command: string, ...args: unknown[]) => void;
  addListener: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  dispose: () => void;
  getParticipantsInfo: () => Array<{ displayName: string; participantId: string }>;
}

export function JitsiVideoRoom({
  sessionId,
  roomName,
  coachName,
  learnerName,
  scheduledDuration,
  onEnd,
  isCoach = false,
}: JitsiVideoRoomProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEn = language === "en";
  
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiMeetAPI | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showChat, setShowChat] = useState(false);

  // Timer for session duration
  useEffect(() => {
    if (!isConnected) return;
    
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate remaining time
  const remainingSeconds = scheduledDuration * 60 - elapsedTime;
  const isOvertime = remainingSeconds < 0;

  // Load Jitsi Meet API
  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Jitsi Meet API"));
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();
        
        if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

        // Create unique room name with session ID for security
        const secureRoomName = `lingueefy-${sessionId}-${roomName.replace(/\s+/g, "-").toLowerCase()}`;

        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName: secureRoomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableInviteFunctions: true,
            toolbarButtons: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "settings",
              "raisehand",
              "videoquality",
              "tileview",
            ],
            // Branding
            brandingRoomAlias: "Lingueefy Session",
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: "",
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            MOBILE_APP_PROMO: false,
            DEFAULT_BACKGROUND: "#1a1a2e",
            DEFAULT_LOGO_URL: "",
            JITSI_WATERMARK_LINK: "",
          },
          userInfo: {
            displayName: user?.name || (isCoach ? coachName : learnerName),
            email: user?.email || undefined,
          },
        });

        jitsiApiRef.current = api;

        // Event listeners
        api.addListener("videoConferenceJoined", () => {
          setIsConnected(true);
          setIsLoading(false);
        });

        api.addListener("videoConferenceLeft", () => {
          setIsConnected(false);
          onEnd?.();
        });

        api.addListener("audioMuteStatusChanged", (data: unknown) => {
          const { muted } = data as { muted: boolean };
          setIsMuted(muted);
        });

        api.addListener("videoMuteStatusChanged", (data: unknown) => {
          const { muted } = data as { muted: boolean };
          setIsVideoOff(muted);
        });

        api.addListener("screenSharingStatusChanged", (data: unknown) => {
          const { on } = data as { on: boolean };
          setIsScreenSharing(on);
        });

        api.addListener("participantJoined", () => {
          setParticipantCount((prev) => prev + 1);
        });

        api.addListener("participantLeft", () => {
          setParticipantCount((prev) => Math.max(1, prev - 1));
        });

      } catch (error) {
        console.error("Failed to initialize Jitsi:", error);
        setIsLoading(false);
      }
    };

    initJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [sessionId, roomName, coachName, learnerName, isCoach, user, onEnd]);

  // Control functions
  const toggleMute = () => {
    jitsiApiRef.current?.executeCommand("toggleAudio");
  };

  const toggleVideo = () => {
    jitsiApiRef.current?.executeCommand("toggleVideo");
  };

  const toggleScreenShare = () => {
    jitsiApiRef.current?.executeCommand("toggleShareScreen");
  };

  const toggleChat = () => {
    jitsiApiRef.current?.executeCommand("toggleChat");
    setShowChat(!showChat);
  };

  const endCall = () => {
    jitsiApiRef.current?.executeCommand("hangup");
  };

  const toggleFullscreen = () => {
    if (jitsiContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        jitsiContainerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                isConnected ? "bg-green-500" : "bg-yellow-500"
              )} />
              <CardTitle className="text-white text-lg">
                {isEn ? "Live Session" : "Session en direct"}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-white border-white/30">
              <Shield className="h-3 w-3 mr-1" />
              {isEn ? "Encrypted" : "Chiffré"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Participants */}
            <div className="flex items-center gap-1 text-white/80">
              <Users className="h-4 w-4" />
              <span className="text-sm">{participantCount}</span>
            </div>
            
            {/* Timer */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-mono",
              isOvertime 
                ? "bg-red-500/20 text-red-400" 
                : remainingSeconds < 300 
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/10 text-white/80"
            )}>
              <Clock className="h-3 w-3" />
              <span>{formatTime(elapsedTime)}</span>
              <span className="text-white/75">/</span>
              <span>{scheduledDuration}:00</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">
                {isEn ? "Connecting to session..." : "Connexion à la session..."}
              </p>
            </div>
          </div>
        )}

        {/* Jitsi Container */}
        <div 
          ref={jitsiContainerRef} 
          className="w-full h-[500px] bg-slate-900"
        />

        {/* Custom Control Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-sm rounded-full">
          {/* Mute Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full h-12 w-12 transition-colors",
              isMuted 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Video Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full h-12 w-12 transition-colors",
              isVideoOff 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          {/* Screen Share Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full h-12 w-12 transition-colors",
              isScreenSharing 
                ? "bg-teal-500 hover:bg-teal-600 text-white" 
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={toggleScreenShare}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          {/* Chat Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full h-12 w-12 transition-colors",
              showChat 
                ? "bg-teal-500 hover:bg-teal-600 text-white" 
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
            onClick={toggleChat}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-white/10 hover:bg-white/20 text-white"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          {/* End Call Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 text-white ml-2"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-session waiting room component
export function SessionWaitingRoom({
  sessionId,
  coachName,
  coachPhoto,
  scheduledAt,
  onJoin,
}: {
  sessionId: string;
  coachName: string;
  coachPhoto?: string;
  scheduledAt: Date;
  onJoin: () => void;
}) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [canJoin, setCanJoin] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const diff = scheduledAt.getTime() - now.getTime();
      
      // Can join 5 minutes before scheduled time
      if (diff <= 5 * 60 * 1000) {
        setCanJoin(true);
        setCountdown("");
      } else {
        setCanJoin(false);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        {/* Coach Avatar */}
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-teal-500">
          {coachPhoto ? (
            <img loading="lazy" src={coachPhoto} alt={coachName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
              {coachName.charAt(0)}
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {isEn ? "Session with" : "Session avec"} {coachName}
        </h2>

        {canJoin ? (
          <>
            <p className="text-muted-foreground mb-6">
              {isEn 
                ? "Your session is ready to start!"
                : "Votre session est prête à commencer!"}
            </p>
            <Button size="lg" onClick={onJoin} className="w-full">
              <Video className="h-5 w-5 mr-2" />
              {isEn ? "Join Session" : "Rejoindre la session"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              {isEn 
                ? "Session starts in"
                : "La session commence dans"}
            </p>
            <div className="text-4xl font-mono font-bold text-teal-600 mb-6">
              {countdown}
            </div>
            <Button size="lg" disabled className="w-full">
              <Clock className="h-5 w-5 mr-2" />
              {isEn ? "Waiting..." : "En attente..."}
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          {isEn 
            ? "You can join up to 5 minutes before the scheduled time"
            : "Vous pouvez rejoindre jusqu'à 5 minutes avant l'heure prévue"}
        </p>
      </CardContent>
    </Card>
  );
}
