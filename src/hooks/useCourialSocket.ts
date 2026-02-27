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
  vehicleYear: string;
  licensePlate: string;
  memberSince: string;
  latitude: number | null;
  longitude: number | null;
}

interface UseCourialSocketOptions {
  /** Auth token from courial_api_token localStorage */
  token: string | null;
  /** Whether to connect (true after successful booking) */
  enabled: boolean;
  /** Callback when a courial accepts the order */
  onAccepted: (driver: CourialDriver) => void;
  /** Callback when courial location updates */
  onLocationUpdate?: (coords: { lat: number; lng: number }) => void;
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

        // The backend sends driver info inside a "Provider" object
        const provider = payload?.Provider ?? payload?.provider ?? {};

        // Also look at top-level payload for fallback fields
        const courialData =
          payload?.courial ??
          payload?.driver ??
          payload?.acceptedCourial ??
          payload?.accepted_courial ??
          payload?.courialData ??
          payload;

        // Prefer Provider object for name & image
        const firstName = provider?.first_name || provider?.firstName || courialData?.firstName || courialData?.first_name || "";
        const lastName = provider?.last_name || provider?.lastName || courialData?.lastName || courialData?.last_name || "";
        const fullNameFromParts = `${firstName} ${lastName}`.trim();
        const providerImage = provider?.image || provider?.profile_image || "";

        // Provider.UserVehicle for plate number
        const userVehicle = provider?.UserVehicle ?? provider?.userVehicle ?? {};

        const ratingRaw =
          provider?.rating ??
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
            fullNameFromParts ||
            courialData?.name ||
            courialData?.full_name ||
            courialData?.fullName ||
            "Your Courial",
          rating: Number(ratingRaw) || 5.0,
          phone: courialData?.phone || courialData?.contact || courialData?.mobile || "",
          image:
            providerImage ||
            courialData?.image ||
            courialData?.profile_image ||
            courialData?.profileImage ||
            courialData?.avatar ||
            courialData?.avatar_url ||
            "",
          vehicleColor: userVehicle?.color || courialData?.vehicleColor || courialData?.vehicle_color || "",
          vehicleMake: userVehicle?.make || courialData?.vehicleMake || courialData?.vehicle_make || "",
          vehicleModel: userVehicle?.model || courialData?.vehicleModel || courialData?.vehicle_model || "",
          vehicleYear: userVehicle?.year || courialData?.vehicleYear || courialData?.vehicle_year || "",
          licensePlate:
            userVehicle?.plate_number ||
            userVehicle?.plateNumber ||
            courialData?.licensePlate ||
            courialData?.license_plate ||
            courialData?.plateNumber ||
            courialData?.vehicle?.license_plate ||
            "",
          memberSince:
            provider?.since_year ||
            provider?.sinceYear ||
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
