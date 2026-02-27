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
    socket.on("AcceptOrder_listener", (rawData: any) => {
      console.log("[CourialSocket] AcceptOrder_listener received:", rawData);

      try {
        const parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const payload = parsedData?.data ?? parsedData;

        // Normalize payload shape from different backend variants
        const courialData =
          payload?.courial ??
          payload?.driver ??
          payload?.acceptedCourial ??
          payload?.accepted_courial ??
          payload?.courialData ??
          payload;

        const firstName = courialData?.firstName || courialData?.first_name || "";
        const lastName = courialData?.lastName || courialData?.last_name || "";
        const fullNameFromParts = `${firstName} ${lastName}`.trim();

        const ratingRaw =
          courialData?.rating ??
          courialData?.avg_rating ??
          courialData?.averageRating ??
          5;

        const driver: CourialDriver = {
          id:
            courialData?.id ||
            courialData?.courial_id ||
            courialData?.driverId ||
            courialData?.driver_id ||
            courialData?.userId ||
            courialData?.user_id ||
            "",
          name:
            courialData?.name ||
            courialData?.full_name ||
            courialData?.fullName ||
            fullNameFromParts ||
            "Your Courial",
          rating: Number(ratingRaw) || 5.0,
          phone: courialData?.phone || courialData?.contact || courialData?.mobile || "",
          image:
            courialData?.image ||
            courialData?.profile_image ||
            courialData?.profileImage ||
            courialData?.avatar ||
            courialData?.avatar_url ||
            "",
          vehicleColor: courialData?.vehicleColor || courialData?.vehicle_color || courialData?.vehicle?.color || "",
          vehicleMake: courialData?.vehicleMake || courialData?.vehicle_make || courialData?.vehicle?.make || "",
          vehicleModel: courialData?.vehicleModel || courialData?.vehicle_model || courialData?.vehicle?.model || "",
          licensePlate:
            courialData?.licensePlate ||
            courialData?.license_plate ||
            courialData?.plateNumber ||
            courialData?.vehicle?.license_plate ||
            "",
          memberSince:
            courialData?.memberSince ||
            courialData?.member_since ||
            courialData?.created_at ||
            courialData?.createdAt ||
            courialData?.joinedAt ||
            "",
        };

        console.log("[CourialSocket] Parsed accepted courial:", driver);
        onAccepted(driver);
      } catch (err) {
        console.error("[CourialSocket] Error parsing AcceptOrder data:", err, rawData);
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
