import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const ChatBubble = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isBookingPage = location.pathname === "/book";

  const handleClick = () => {
    setIsVisible(false);
    navigate("/help");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isBookingPage) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
           className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
           aria-label="Help Center"
         >
           <MessageCircle className="w-5 h-5" fill="currentColor" stroke="currentColor" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
