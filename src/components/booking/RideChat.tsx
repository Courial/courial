import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Camera, Image as ImageIcon, X, ChevronDown, ChevronUp, MessageSquare, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Socket } from "socket.io-client";

interface ChatMessage {
  from: "user" | "courial";
  text: string;
  time: string;
  type?: "text" | "image";
  imageUrl?: string;
}

interface RideChatProps {
  orderId: string;
  senderId: string;
  receiverId: string;
  courialName: string;
  socketRef: React.MutableRefObject<Socket | null>;
  visible: boolean;
  darkMode?: boolean;
}

const QUICK_REPLIES = [
  "Are you on the way?",
  "Are you here?",
  "I'm on my way. Please wait me.",
  "Sorry. Too far. Thanks.",
  "Okay",
  "How far away are you from me?",
  "Come closer",
  "On my way",
];

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const RideChat: React.FC<RideChatProps> = ({
  orderId,
  senderId,
  receiverId,
  courialName,
  socketRef,
  visible,
  darkMode = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyFetchedRef = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    if (!orderId || historyFetchedRef.current) return;
    historyFetchedRef.current = true;

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("courial_api_token");
        if (!token) return;

        const res = await fetch(
          `https://gocourial.com/userApis/ride/${orderId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          console.warn("[RideChat] Failed to fetch history:", res.status);
          return;
        }
        const data = await res.json();
        const history = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

        const parsed: ChatMessage[] = history.map((m: any) => ({
          from: m.senderType === "user" ? "user" as const : "courial" as const,
          text: m.messageType === 1 ? "" : (m.message || ""),
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
            : "",
          type: m.messageType === 1 ? "image" as const : "text" as const,
          imageUrl: m.messageType === 1 ? m.message : undefined,
        }));

        setMessages(parsed);
      } catch (err) {
        console.error("[RideChat] Error fetching history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [orderId]);

  // Listen for incoming messages via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (rawData: any) => {
      try {
        const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const data = parsed?.data ?? parsed;

        // Only process messages for this order
        if (data.orderId && String(data.orderId) !== String(orderId)) return;
        // Only process messages from the driver
        if (data.senderType === "user") return;

        const msg: ChatMessage = {
          from: "courial",
          text: data.messageType === 1 ? "" : (data.message || ""),
          time: formatTime(),
          type: data.messageType === 1 ? "image" : "text",
          imageUrl: data.messageType === 1 ? data.message : undefined,
        };
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error("[RideChat] Error parsing incoming message:", err);
      }
    };

    socket.on("ride_chat_message", handler);
    return () => {
      socket.off("ride_chat_message", handler);
    };
  }, [socketRef, orderId]);

  // Emit a chat message
  const emitMessage = useCallback(
    (text: string, messageType: 0 | 1, fileType?: string) => {
      const socket = socketRef.current;
      if (!socket) {
        console.warn("[RideChat] No socket connection to send message");
        return;
      }

      const payload = {
        senderId,
        receiverId,
        orderId,
        fileType: fileType || "",
        messageType,
        message: text,
        senderType: "user",
        isCustomQuickMessage: false,
      };

      console.log("[RideChat] Emitting ride_chat_message:", { ...payload, message: messageType === 1 ? "<base64>" : text });
      socket.emit("ride_chat_message", payload);
    },
    [socketRef, senderId, receiverId, orderId]
  );

  // Send text message
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text, time: formatTime(), type: "text" }]);
    emitMessage(text, 0);
    setInput("");
  }, [input, emitMessage]);

  // Send quick reply
  const handleQuickReply = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { from: "user", text, time: formatTime(), type: "text" }]);
      emitMessage(text, 0);
    },
    [emitMessage]
  );

  // Handle photo selection
  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 portion (remove data:image/...;base64, prefix)
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        const dataUrl = result; // Keep full data URL for local preview

        // Add to local messages immediately
        setMessages((prev) => [
          ...prev,
          { from: "user", text: "", time: formatTime(), type: "image", imageUrl: dataUrl },
        ]);

        // Emit via socket
        emitMessage(base64, 1, ext);
      };
      reader.readAsDataURL(file);

      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [emitMessage]
  );

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className={cn("rounded-xl", darkMode ? "" : "border border-border bg-background")}>
      {/* Header */}
        <div className={cn("p-3 border-b flex items-center justify-center", darkMode ? "border-background/10" : "border-border")}>
          <p className={cn("text-sm font-medium tracking-wide text-center", darkMode ? "text-background/50" : "text-muted-foreground")}>
            Chat with {courialName.split(" ")[0]}
          </p>
        </div>

        {/* Messages */}
        <div className="p-3 space-y-2.5 max-h-[280px] overflow-y-auto">
          {loadingHistory && messages.length === 0 && (
            <p className={cn("text-xs text-center py-2", darkMode ? "text-background/40" : "text-muted-foreground")}>Loading messages…</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2",
                  msg.from === "user"
                    ? "bg-background/50 text-foreground rounded-br-md"
                    : darkMode
                    ? "bg-background/8 text-background rounded-bl-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                {msg.type === "image" && msg.imageUrl ? (
                  <img
                    src={msg.imageUrl}
                    alt="Photo"
                    className="rounded-lg max-w-full max-h-[160px] object-cover cursor-pointer"
                    onClick={() => window.open(msg.imageUrl, "_blank")}
                  />
                ) : (
                  <p className="text-sm leading-snug">{msg.text}</p>
                )}
                <p
                  className={cn(
                    "text-[10px] mt-0.5",
                    msg.from === "user" ? "text-muted-foreground/60" : darkMode ? "text-background/30" : "text-muted-foreground"
                  )}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Messages header */}
        <div className={cn("px-3 pt-2 pb-1.5 border-t", darkMode ? "border-background/10" : "border-border")}>
          <button
            onClick={() => setShowQuickReplies((p) => !p)}
            className={cn("flex items-center gap-1.5 text-xs transition-colors w-full", darkMode ? "text-primary hover:text-primary/80" : "text-primary hover:text-primary/80")}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-normal">Quick replies</span>
            <span className="ml-auto">
              {showQuickReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </button>
        </div>

        {/* Input row */}
        <div className={cn("px-3 py-2 flex gap-2 items-center", darkMode ? "" : "")}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              darkMode
                ? "text-background/50 hover:text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Send photo"
          >
            <Camera className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Enter message"
            className={cn(
              "text-sm h-9 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border",
              darkMode
                ? "bg-background/10 border-background/15 text-background placeholder:text-background/30 focus-visible:border-background/15"
                : "bg-muted/50 border-border placeholder:text-muted-foreground"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Replies (below input) */}
        <AnimatePresence>
          {showQuickReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="px-3 pb-3 flex flex-wrap gap-1.5 overflow-hidden"
            >
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] rounded-full border transition-colors",
                    darkMode
                      ? "border-background/15 bg-background/10 text-background hover:bg-background/20"
                      : "border-border bg-muted/50 text-foreground hover:bg-muted"
                  )}
                >
                  {reply}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add / Remove quick reply */}
        <div className={cn("px-3 pb-3 flex items-center justify-center gap-1 text-[10px]", darkMode ? "text-background/60" : "text-muted-foreground")}>
          <button className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-0.5">
            <Plus className="w-2.5 h-2.5" /> Add
          </button>
          <span>or</span>
          <button className={cn("px-2 py-0.5 rounded-full border font-medium transition-colors flex items-center gap-0.5", darkMode ? "border-background/20 text-background hover:bg-background/10" : "border-border text-foreground hover:bg-muted")}>
            <Minus className="w-2.5 h-2.5" /> Remove
          </button>
          <span className="text-primary font-normal">a Quick reply</span>
        </div>
      </div>
    </motion.div>
  );
};
