import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Camera, Image as ImageIcon, X, ChevronDown, ChevronUp, MessageSquare, Check, CheckCheck } from "lucide-react";
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
  read?: boolean;
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

const DEFAULT_QUICK_REPLIES = [
  "Are you on the way?",
  "Are you here?",
  "I'm on my way. Please wait me.",
  "Sorry. Too far. Thanks.",
  "Okay",
  "How far away are you from me?",
  "Come closer",
  "On my way",
];

const QR_STORAGE_KEY = "courial_quick_replies";

const loadQuickReplies = (): string[] => {
  try {
    const saved = localStorage.getItem(QR_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [...DEFAULT_QUICK_REPLIES];
};

const saveQuickReplies = (replies: string[]) => {
  localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(replies));
};

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
  const [quickReplies, setQuickReplies] = useState<string[]>(loadQuickReplies);
  const [removeMode, setRemoveMode] = useState(false);
  const [addingReply, setAddingReply] = useState(false);
  const [newReplyText, setNewReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyFetchedRef = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
          read: m.isRead ?? true,
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

  // Listen for incoming messages, typing, and read receipts via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const messageHandler = (rawData: any) => {
      try {
        const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const data = parsed?.data ?? parsed;

        if (data.orderId && String(data.orderId) !== String(orderId)) return;
        if (data.senderType === "user") return;

        const msg: ChatMessage = {
          from: "courial",
          text: data.messageType === 1 ? "" : (data.message || ""),
          time: formatTime(),
          type: data.messageType === 1 ? "image" : "text",
          imageUrl: data.messageType === 1 ? data.message : undefined,
          read: false,
        };
        setMessages((prev) => [...prev, msg]);
        setIsTyping(false);
      } catch (err) {
        console.error("[RideChat] Error parsing incoming message:", err);
      }
    };

    const typingHandler = (rawData: any) => {
      try {
        const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const data = parsed?.data ?? parsed;
        if (data.orderId && String(data.orderId) !== String(orderId)) return;
        if (data.senderType === "user") return;

        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      } catch {}
    };

    const readHandler = (rawData: any) => {
      try {
        const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const data = parsed?.data ?? parsed;
        if (data.orderId && String(data.orderId) !== String(orderId)) return;

        // Mark all user messages as read
        setMessages((prev) =>
          prev.map((m) => (m.from === "user" ? { ...m, read: true } : m))
        );
      } catch {}
    };

    socket.on("ride_chat_message", messageHandler);
    socket.on("ride_chat_typing", typingHandler);
    socket.on("ride_chat_read", readHandler);
    return () => {
      socket.off("ride_chat_message", messageHandler);
      socket.off("ride_chat_typing", typingHandler);
      socket.off("ride_chat_read", readHandler);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socketRef, orderId]);

  // Emit typing event when user types
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      const socket = socketRef.current;
      if (socket && e.target.value.trim()) {
        socket.emit("ride_chat_typing", {
          senderId,
          receiverId,
          orderId,
          senderType: "user",
        });
      }
    },
    [socketRef, senderId, receiverId, orderId]
  );

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

    setMessages((prev) => [...prev, { from: "user", text, time: formatTime(), type: "text", read: false }]);
    emitMessage(text, 0);
    setInput("");
  }, [input, emitMessage]);

  // Send quick reply
  const handleQuickReply = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { from: "user", text, time: formatTime(), type: "text", read: false }]);
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
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        const dataUrl = result;

        setMessages((prev) => [
          ...prev,
          { from: "user", text: "", time: formatTime(), type: "image", imageUrl: dataUrl, read: false },
        ]);

        emitMessage(base64, 1, ext);
      };
      reader.readAsDataURL(file);
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
      <div className={cn("rounded-xl overflow-hidden", darkMode ? "" : "border border-border bg-background")}>
        {/* Header — solid black, full-bleed */}
        <div className={cn(
          "p-3 flex items-center justify-center",
          darkMode ? "bg-black" : "bg-foreground"
        )}>
          <p className={cn(
            "text-sm font-medium tracking-wide text-center",
            darkMode ? "text-white" : "text-background"
          )}>
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
                    ? "bg-background/20 text-foreground rounded-br-md"
                    : darkMode
                    ? "border border-background/15 bg-background/10 text-background rounded-bl-md"
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
                  <p className={cn("text-sm leading-snug", msg.from === "user" && "text-background/75")}>{msg.text}</p>
                )}
                <div className={cn(
                  "flex items-center gap-1 mt-0.5",
                  msg.from === "user" ? "justify-end" : "justify-start"
                )}>
                  <span
                    className={cn(
                      "text-[8px]",
                      msg.from === "user" ? "text-background/30" : darkMode ? "text-background/30" : "text-muted-foreground"
                    )}
                  >
                    {msg.time}
                  </span>
                  {msg.from === "user" && (
                    msg.read ? (
                      <CheckCheck className={cn("w-3 h-3", darkMode ? "text-primary" : "text-primary")} />
                    ) : (
                      <Check className={cn("w-3 h-3", darkMode ? "text-background/30" : "text-muted-foreground")} />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="flex justify-start"
              >
                <div className={cn(
                  "rounded-2xl rounded-bl-md px-4 py-2.5",
                  darkMode
                    ? "border border-background/15 bg-background/10"
                    : "bg-muted"
                )}>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-bounce",
                      darkMode ? "bg-background/40" : "bg-muted-foreground/50"
                    )} style={{ animationDelay: "0ms" }} />
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-bounce",
                      darkMode ? "bg-background/40" : "bg-muted-foreground/50"
                    )} style={{ animationDelay: "150ms" }} />
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-bounce",
                      darkMode ? "bg-background/40" : "bg-muted-foreground/50"
                    )} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* Quick Messages header */}
        <div className={cn("mx-3 border-t", darkMode ? "border-background/15" : "border-border")} />
        <div className={cn("px-3 pt-2 pb-1.5", darkMode ? "" : "")}>
          <button
            onClick={() => setShowQuickReplies((p) => !p)}
            className={cn("flex items-center gap-1.5 text-xs transition-colors w-full", darkMode ? "text-primary hover:text-primary/80" : "text-primary hover:text-primary/80")}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-normal">Quick replies</span>
            {showQuickReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
            <Camera className="w-9 h-9" strokeWidth={0.8} />
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
            onChange={handleInputChange}
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
            <Send className="w-6 h-6" strokeWidth={0.8} />
          </button>
        </div>

        {/* Quick Replies (below input) — no divider */}

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
               {quickReplies.map((reply) => (
                 <button
                   key={reply}
                   onClick={() => {
                     if (removeMode) {
                       const updated = quickReplies.filter((r) => r !== reply);
                       setQuickReplies(updated);
                       saveQuickReplies(updated);
                       if (updated.length === 0) setRemoveMode(false);
                     } else {
                       handleQuickReply(reply);
                     }
                   }}
                   className={cn(
                     "px-2.5 py-1 text-[10px] rounded-full border transition-colors",
                     removeMode
                       ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                       : darkMode
                       ? "border-background/15 bg-background/10 text-background hover:bg-background/20"
                       : "border-border bg-muted/50 text-foreground hover:bg-muted"
                   )}
                 >
                   {removeMode && <X className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />}
                   {reply}
                 </button>
               ))}
             </motion.div>
           )}
         </AnimatePresence>

         {/* Add new reply inline input */}
         <AnimatePresence>
           {addingReply && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               exit={{ opacity: 0, height: 0 }}
               transition={{ duration: 0.15 }}
               className="px-3 pb-2 overflow-hidden"
             >
               <div className="flex gap-1.5 items-center">
                 <Input
                   value={newReplyText}
                   onChange={(e) => setNewReplyText(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === "Enter") {
                       const text = newReplyText.trim();
                       if (text && !quickReplies.includes(text)) {
                         const updated = [...quickReplies, text];
                         setQuickReplies(updated);
                         saveQuickReplies(updated);
                       }
                       setNewReplyText("");
                       setAddingReply(false);
                     } else if (e.key === "Escape") {
                       setNewReplyText("");
                       setAddingReply(false);
                     }
                   }}
                   placeholder="Type a quick reply…"
                   autoFocus
                   className={cn(
                     "text-[10px] h-7 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0",
                     darkMode
                       ? "bg-background/10 border-background/15 text-background placeholder:text-background/30"
                       : "bg-muted/50 border-border placeholder:text-muted-foreground"
                   )}
                 />
                 <button
                   onClick={() => {
                     const text = newReplyText.trim();
                     if (text && !quickReplies.includes(text)) {
                       const updated = [...quickReplies, text];
                       setQuickReplies(updated);
                       saveQuickReplies(updated);
                     }
                     setNewReplyText("");
                     setAddingReply(false);
                   }}
                   className="shrink-0 text-primary text-[10px] font-medium px-2"
                 >
                   Save
                 </button>
                 <button
                   onClick={() => { setNewReplyText(""); setAddingReply(false); }}
                   className={cn("shrink-0 text-[10px] px-1", darkMode ? "text-background/50" : "text-muted-foreground")}
                 >
                   Cancel
                 </button>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Add / Remove quick reply */}
         {showQuickReplies && (
         <div className={cn("px-3 pb-3 flex items-center justify-center gap-1.5 text-[10px]", darkMode ? "text-background/60" : "text-muted-foreground")}>
            <button
              onClick={() => { setAddingReply(true); setRemoveMode(false); }}
              className="px-2 py-0.5 rounded-full bg-background/85 text-foreground font-medium hover:bg-background/75 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setRemoveMode((p) => !p); setAddingReply(false); }}
              className={cn(
                "px-2 py-0.5 rounded-full border font-medium transition-colors",
                removeMode
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : darkMode ? "border-background/20 text-background hover:bg-background/10" : "border-border text-foreground hover:bg-muted"
              )}
            >
              {removeMode ? "Done" : "Remove"}
            </button>
            <span className="text-primary font-normal">a Quick reply</span>
          </div>
         )}
       </div>
     </motion.div>
   );
 };
