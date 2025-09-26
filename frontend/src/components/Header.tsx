import React, { useState, useRef } from "react";
import {
  Menu,
  AlertTriangle,
  User,
  LogOut,
  UserCheck,
  Info,
  Volume2,
  Phone,
} from "lucide-react";
import { Button } from "./ui/button";
// Removed dropdown menu imports as we no longer need them
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import { ConnectivityIndicator } from "./ConnectivityIndicator";
import { BackendStatus } from "./BackendStatus";
import {
  getCurrentLocation,
  getLocationErrorMessage,
  isLocationSupported,
} from "../utils/geolocationUtils";
import { toast } from "sonner@2.0.3";

interface HeaderProps {
  onMenuToggle: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onNavigate,
  onLogout,
}) => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const [isBuzzerActive, setIsBuzzerActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const buzzerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEmergencyAlert = async () => {
    try {
      if (!isLocationSupported()) {
        // Browser doesn't support geolocation
        const alertData = {
          id: Date.now().toString(),
          userId: user?.id || "unknown",
          userEmail: user?.email || "Unknown User",
          latitude: null,
          longitude: null,
          timestamp: new Date().toISOString(),
          type: "emergency",
          message:
            "Emergency alert sent by citizen (location unavailable)",
          status: "active",
        };

        const existingAlerts = JSON.parse(
          localStorage.getItem("emergencyAlerts") || "[]",
        );
        existingAlerts.unshift(alertData);
        localStorage.setItem(
          "emergencyAlerts",
          JSON.stringify(existingAlerts),
        );

        toast.success(
          translate("emergencyAlertSentNoLocation"),
        );
        return;
      }

      try {
        // Try to get location
        const location = await getCurrentLocation();

        // Create alert object with GPS location
        const alertData = {
          id: Date.now().toString(),
          userId: user?.id || "unknown",
          userEmail: user?.email || "Unknown User",
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString(),
          type: "emergency",
          message: "Emergency alert sent by citizen",
          status: "active",
        };

        // Store alert in localStorage for government dashboard to access
        const existingAlerts = JSON.parse(
          localStorage.getItem("emergencyAlerts") || "[]",
        );
        existingAlerts.unshift(alertData);
        localStorage.setItem(
          "emergencyAlerts",
          JSON.stringify(existingAlerts),
        );

        toast.success(translate("emergencyAlertSent"));
      } catch (locationError: any) {
        // Location failed, send alert without GPS location
        console.log(
          "Location unavailable for emergency alert:",
          locationError,
        );

        const alertData = {
          id: Date.now().toString(),
          userId: user?.id || "unknown",
          userEmail: user?.email || "Unknown User",
          latitude: null,
          longitude: null,
          timestamp: new Date().toISOString(),
          type: "emergency",
          message:
            "Emergency alert sent by citizen (location unavailable)",
          status: "active",
        };

        const existingAlerts = JSON.parse(
          localStorage.getItem("emergencyAlerts") || "[]",
        );
        existingAlerts.unshift(alertData);
        localStorage.setItem(
          "emergencyAlerts",
          JSON.stringify(existingAlerts),
        );

        // Show user-friendly message
        if (locationError.userFriendlyMessage) {
          toast.info(locationError.userFriendlyMessage);
        } else {
          toast.success(
            translate("emergencyAlertSentNoLocation"),
          );
        }
      }
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      toast.error(translate("emergencyAlertFailed"));
    }
  };

  // Removed profile navigation handlers as we no longer need them

  const handleBuzzer = () => {
    if (isBuzzerActive) {
      // Stop the buzzer if it's already active
      stopBuzzer();
      return;
    }

    try {
      // Create audio context and oscillator for loud buzzer sound
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;

      // Create oscillator and gain nodes
      oscillatorRef.current = audioContext.createOscillator();
      gainNodeRef.current = audioContext.createGain();

      const oscillator = oscillatorRef.current;
      const gainNode = gainNodeRef.current;

      // Configure the buzzer sound - loud, attention-grabbing tone
      oscillator.type = "square"; // Square wave for harsh buzzer sound
      oscillator.frequency.value = 800; // 800Hz - loud and attention-grabbing
      gainNode.gain.value = 0.3; // Loud but not ear-damaging

      // Connect audio nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start the buzzer
      oscillator.start();
      setIsBuzzerActive(true);

      // Create pulsing effect
      const pulseInterval = setInterval(() => {
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value =
            gainNodeRef.current.gain.value === 0.3 ? 0.1 : 0.3;
        }
      }, 200);

      // Stop after 30 seconds
      buzzerTimeoutRef.current = setTimeout(() => {
        clearInterval(pulseInterval);
        stopBuzzer();
      }, 30000);

      toast.success(translate("emergencyBuzzerActivated"));
    } catch (error) {
      console.error("Error starting buzzer:", error);
      toast.error(translate("buzzerPermissionError"));
    }
  };

  const stopBuzzer = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (buzzerTimeoutRef.current) {
        clearTimeout(buzzerTimeoutRef.current);
        buzzerTimeoutRef.current = null;
      }
      gainNodeRef.current = null;
      setIsBuzzerActive(false);
      toast.info(translate("emergencyBuzzerStopped"));
    } catch (error) {
      console.error("Error stopping buzzer:", error);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (buzzerTimeoutRef.current) {
        clearTimeout(buzzerTimeoutRef.current);
      }
      stopBuzzer();
    };
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      toast.success(translate("loggedOutSuccessfully"));
    }
  };

  return (
    <header className="bg-red-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="text-white hover:bg-red-700"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Center - Rotating Notice */}
        <div className="flex-1 mx-4 overflow-hidden relative h-10 flex items-center">
          <div className="absolute whitespace-nowrap animate-marquee bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium">
            {translate("tsunamiWarning")}
          </div>
        </div>

        {/* Right side - Connectivity, Backend Status, Emergency buttons, and Logout */}
        <div className="flex items-center gap-3">
          <BackendStatus />
          <ConnectivityIndicator />

          <Button
            onClick={handleEmergencyAlert}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full animate-pulse"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {translate("emergencyAlert")}
          </Button>

          {/* Emergency Button */}
          <Button
            onClick={handleBuzzer}
            className={`${
              isBuzzerActive
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-orange-500 hover:bg-orange-600"
            } text-white px-5 py-2 rounded-full transition-all duration-200`}
          >
            <Volume2
              className={`h-4 w-4 mr-2 ${isBuzzerActive ? "animate-bounce" : ""}`}
            />
            {isBuzzerActive
              ? translate("stop")
              : translate("emergency")}
          </Button>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:bg-red-700 flex items-center ml-1"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {translate("logout")}
          </Button>
        </div>
      </div>

      {/* CSS for marquee animation */}
      <style jsx="true">{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </header>
  );
};