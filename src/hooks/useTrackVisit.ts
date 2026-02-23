import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "courial_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export const useTrackVisit = () => {
  const location = useLocation();
  const enteredAt = useRef<number>(Date.now());

  useEffect(() => {
    const sessionId = getSessionId();
    const pagePath = location.pathname;
    enteredAt.current = Date.now();

    // Send the visit (fire-and-forget, no duration yet)
    supabase.functions.invoke("track-visit", {
      body: { session_id: sessionId, page_path: pagePath },
    }).catch(() => {});

    // On unmount / route change, send duration update
    return () => {
      const duration = Math.round((Date.now() - enteredAt.current) / 1000);
      if (duration > 0 && duration < 3600) {
        // Use sendBeacon-style fire-and-forget
        supabase.functions.invoke("track-visit", {
          body: { session_id: sessionId, page_path: pagePath, duration_seconds: duration },
        }).catch(() => {});
      }
    };
  }, [location.pathname]);
};
