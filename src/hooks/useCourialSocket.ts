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
  language: string | null;
}

interface UseCourialSocketOptions {
  /** Auth token from courial_api_token localStorage */
  token: string | null;
  /** Whether to connect (true after successful booking) */
  enabled: boolean;
  /** Accepted driver ID (Provider.id) for matching live updates */
  acceptedDriverId?: string | null;
  /** Callback when a courial accepts the order */
  onAccepted: (driver: CourialDriver) => void;
  /** Callback when courial location updates */
  onLocationUpdate?: (coords: { lat: number; lng: number }) => void;
  /** Callback when delivery status changes */
  onStatusChange?: (status: string) => void;
  /** Callback when completion photo is received */
  onCompletionPhoto?: (photoUrl: string) => void;
  /** Callback when pickup photo & item count are received */
  onPickupDetails?: (details: { pickupPhoto: string | null; numberOfPackages: number | null }) => void;
  /** Callback when drop-off proof photo is received */
  onDropoffPhoto?: (photoUrl: string) => void;
}

/**
 * Connects to the Courial real-time socket after booking
 * and listens for the AcceptOrder_listener event.
 */
export function useCourialSocket({ token, enabled, acceptedDriverId, onAccepted, onLocationUpdate, onStatusChange, onCompletionPhoto, onPickupDetails, onDropoffPhoto }: UseCourialSocketOptions) {
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
          id: String(
            provider?.id ||
            provider?.user_id ||
            provider?.userId ||
            courialData?.id ||
            courialData?.courial_id ||
            courialData?.driverId ||
            courialData?.driver_id ||
            courialData?.userId ||
            courialData?.user_id ||
            ""
          ),
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
          latitude: (() => { const v = provider?.latitude ?? courialData?.latitude; const n = v != null ? parseFloat(String(v)) : NaN; return isNaN(n) ? null : n; })(),
          longitude: (() => { const v = provider?.longitude ?? courialData?.longitude; const n = v != null ? parseFloat(String(v)) : NaN; return isNaN(n) ? null : n; })(),
          language: provider?.language || provider?.preferred_language || courialData?.language || courialData?.preferred_language || null,
        };

        console.log("[CourialSocket] Parsed accepted courial:", driver);
        onAccepted(driver);
      } catch (err) {
        console.error("[CourialSocket] Error parsing AcceptOrder data:", err, rawData);
      }
    });

    // Listen for real-time location updates from the courier
    const locationEvents = [
      "LocationUpdate", "location_update", "ProviderLocation",
      "provider_location", "updateLocation", "update_location",
      "driverLiveUpdate",
    ];
    locationEvents.forEach((eventName) => {
      socket.on(eventName, (rawData: any) => {
        console.log(`[CourialSocket] ${eventName} received:`, rawData);
        try {
          const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
          const data = parsed?.data ?? parsed;

          // For driverLiveUpdate, match partnerId (driver) to accepted driver ID
          if (eventName === "driverLiveUpdate" && acceptedDriverId) {
            const eventPartnerId = String(data?.partnerId ?? data?.partner_id ?? "");
            if (eventPartnerId && eventPartnerId !== String(acceptedDriverId)) {
              // Don't log every skip to reduce noise
              return;
            }
          }

          const lat = parseFloat(data?.latitude ?? data?.lat);
          const lng = parseFloat(data?.longitude ?? data?.lng);
          if (!isNaN(lat) && !isNaN(lng) && onLocationUpdate) {
            onLocationUpdate({ lat, lng });
          }
        } catch (err) {
          console.error(`[CourialSocket] Error parsing ${eventName}:`, err);
        }
      });
    });

    // Listen for delivery lifecycle status events
    const statusListeners: Record<string, string> = {
      confirmPickupPointArrival_listener: "Courial at Pickup",
      confirmPickup_listener: "Courial Picked Up",
      confirmDeliveryPointArrival_listener: "Courial at Drop-off",
      confirmDelivery_listener: "Order Complete",
    };

    Object.entries(statusListeners).forEach(([eventName, status]) => {
      socket.on(eventName, (rawData: any) => {
        console.log(`[CourialSocket] ${eventName} RAW payload:`, JSON.stringify(rawData));
        if (onStatusChange) {
          onStatusChange(status);
        }

        // Try to extract pickup/dropoff details from ANY status event
        try {
          const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
          const data = parsed?.data ?? parsed;

          // Flatten: also check nested objects like Provider, order, delivery
          const flat = {
            ...data,
            ...(data?.Provider ?? {}),
            ...(data?.provider ?? {}),
            ...(data?.order ?? {}),
            ...(data?.delivery ?? {}),
          };

          // Extract pickup photo + item count
          if (onPickupDetails) {
            // Note: do NOT use flat.image as fallback — that's the driver's profile image from Provider
            const pickupPhoto = data?.pickupLocationPhoto ?? data?.pickup_location_photo ?? flat?.pickupLocationPhoto ?? flat?.pickup_location_photo ?? flat?.pickupPhoto ?? flat?.pickup_photo ?? flat?.Identification_image ?? flat?.identification_image ?? null;
            // Check data first (before flat) to avoid Provider fields overwriting real values
            // over45Lbs is a boolean flag (0/1), NOT a count — exclude it from package count
            const rawPackages = data?.numberOfPackages ?? data?.number_of_packages ?? data?.noOfPackages ?? data?.no_of_packages ?? data?.itemCount ?? data?.item_count ?? data?.packageCount ?? data?.package_count ?? data?.totalItems ?? data?.total_items ?? data?.parcels ?? flat?.numberOfPackages ?? flat?.number_of_packages ?? flat?.noOfPackages ?? flat?.no_of_packages ?? flat?.itemCount ?? flat?.item_count ?? flat?.packageCount ?? flat?.package_count ?? flat?.totalItems ?? flat?.total_items ?? flat?.parcels ?? null;
            // Log ALL keys + full data to find the correct field
            console.log(`[CourialSocket] Package count debug - rawPackages resolved:`, rawPackages, `| data keys:`, Object.keys(data || {}), `| flat keys:`, Object.keys(flat || {}), `| FULL data:`, JSON.stringify(data));
            // Also check orderimages array
            const orderImages = flat?.orderimages ?? flat?.orderImages ?? [];
            const firstOrderImage = Array.isArray(orderImages) && orderImages.length > 0 ? (orderImages[0]?.image ?? orderImages[0]?.url ?? orderImages[0]) : null;
            const resolvedPhoto = (pickupPhoto && pickupPhoto !== "") ? pickupPhoto : (typeof firstOrderImage === "string" && firstOrderImage !== "" ? firstOrderImage : null);
            if (resolvedPhoto || rawPackages != null) {
              const numberOfPackages = rawPackages != null ? parseInt(String(rawPackages), 10) : null;
              console.log(`[CourialSocket] Pickup details extracted - photo: ${resolvedPhoto}, packages: ${numberOfPackages}, orderImages:`, orderImages);
              onPickupDetails({
                pickupPhoto: resolvedPhoto,
                numberOfPackages: isNaN(numberOfPackages as number) ? null : numberOfPackages,
              });
            }
          }

          // Extract drop-off proof photo
          if (onDropoffPhoto) {
            const photo = flat?.takeDeliveryPhoto ?? flat?.take_delivery_photo ?? flat?.dropoffPhoto ?? flat?.dropoff_photo ?? flat?.deliveryPhoto ?? flat?.delivery_photo ?? null;
            if (photo) {
              console.log(`[CourialSocket] Dropoff photo extracted:`, photo);
              onDropoffPhoto(photo);
            }
          }
        } catch (err) {
          console.error(`[CourialSocket] Error parsing status event details:`, err);
        }
      });
    });

    // Listen for completion photo events
    const photoEvents = [
      "completionPhoto", "completion_photo", "deliveryPhoto",
      "delivery_photo", "proofOfDelivery", "proof_of_delivery",
    ];
    photoEvents.forEach((eventName) => {
      socket.on(eventName, (rawData: any) => {
        console.log(`[CourialSocket] ${eventName} received:`, rawData);
        try {
          const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
          const data = parsed?.data ?? parsed;
          const photoUrl = data?.photo_url ?? data?.photoUrl ?? data?.image ?? data?.url ?? data?.photo ?? "";
          if (photoUrl && onCompletionPhoto) {
            onCompletionPhoto(photoUrl);
          }
        } catch (err) {
          console.error(`[CourialSocket] Error parsing ${eventName}:`, err);
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, token, acceptedDriverId, onAccepted, onLocationUpdate, onStatusChange, onCompletionPhoto, onPickupDetails, onDropoffPhoto]);

  return { connected, disconnect };
}
