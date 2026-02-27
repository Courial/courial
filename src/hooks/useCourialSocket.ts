import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://gocourial.com";

export interface CourialDriver {
  id: string;
  name: string;
  rating: number;
  phone: string;
  image: string;
  vehicleColor: string;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  memberSince: string;
}

interface UseCourialSocketOptions {
  /** Auth token from courial_api_token localStorage */
  token: string | null;
  /** Whether to connect (true after successful booking) */
  enabled: boolean;
  /** Callback when a courial accepts the order */
  onAccepted: (driver: CourialDriver) => void;
}

/**
 * Connects to the Courial real-time socket after booking
 * and listens for the AcceptOrder_listener event.
 */
export function useCourialSocket({ token, enabled, onAccepted }: UseCourialSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("[CourialSocket] Disconnecting");
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !token) return;

    console.log("[CourialSocket] Connecting to", SOCKET_URL);

    const socket = io(SOCKET_URL, {
      query: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[CourialSocket] Connected, id:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[CourialSocket] Disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[CourialSocket] Connection error:", err.message);
    });

    // Log ALL incoming events for debugging
    socket.onAny((eventName, ...args) => {
      console.log("[CourialSocket] Event received:", eventName, args);
    });

    // Listen for the AcceptOrder event
    socket.on("AcceptOrder_listener", (data: any) => {
      console.log("[CourialSocket] AcceptOrder_listener received:", data);

      try {
        // Extract courial info from the payload
        const courialData = data?.courial || data?.driver || data?.data?.courial || data?.data?.driver || data;

        const driver: CourialDriver = {
          id: courialData?.id || courialData?.courial_id || courialData?.driverId || "",
          name: courialData?.name || courialData?.full_name || courialData?.firstName
            ? `${courialData.firstName || ""} ${courialData.lastName || ""}`.trim()
            : "Your Courial",
          rating: parseFloat(courialData?.rating || courialData?.avg_rating) || 5.0,
          phone: courialData?.phone || courialData?.contact || courialData?.mobile || "",
          image: courialData?.image || courialData?.profile_image || courialData?.avatar || "",
          vehicleColor: courialData?.vehicleColor || courialData?.vehicle_color || "",
          vehicleMake: courialData?.vehicleMake || courialData?.vehicle_make || "",
          vehicleModel: courialData?.vehicleModel || courialData?.vehicle_model || "",
          licensePlate: courialData?.licensePlate || courialData?.license_plate || courialData?.plateNumber || "",
          memberSince: courialData?.memberSince || courialData?.created_at || courialData?.joinedAt || "",
        };

        // Validate minimum info
        if (driver.id || driver.name !== "Your Courial") {
          console.log("[CourialSocket] Courial accepted:", driver);
          onAccepted(driver);
        } else {
          console.warn("[CourialSocket] AcceptOrder data missing courial info, using raw:", data);
          onAccepted(driver);
        }
      } catch (err) {
        console.error("[CourialSocket] Error parsing AcceptOrder data:", err);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, token, onAccepted]);

  return { connected, disconnect };
}
