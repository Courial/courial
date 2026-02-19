import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { AnimatePresence, motion } from "framer-motion";

export function Toaster() {
  const { toasts } = useToast();

  const visibleToasts = toasts.filter((t) => t.open !== false);

  return (
    <ToastProvider>
      <AnimatePresence>
        {visibleToasts.length > 0 && (
          /* Backdrop */
          <motion.div
            key="toast-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-foreground/25 backdrop-blur-md flex items-center justify-center pointer-events-none"
          />
        )}
      </AnimatePresence>

      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent border-0 shadow-none p-0 pointer-events-none">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }}
                className="relative pointer-events-auto rounded-[20px] bg-foreground/75 text-background px-7 py-6 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center max-w-[260px] w-full"
              >
                {title && (
                  <ToastTitle className="text-base font-bold text-background mb-1">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm text-background/75 leading-snug">
                    {description}
                  </ToastDescription>
                )}
                {action && <div className="mt-3">{action}</div>}
                <ToastClose className="absolute top-3 right-3 text-background/50 hover:text-background opacity-100 rounded-md p-1 transition-colors" />
              </motion.div>
            </AnimatePresence>
          </Toast>
        );
      })}
      <ToastViewport className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-0 max-w-none" />
    </ToastProvider>
  );
}
