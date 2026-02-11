import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, Mail, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type View = "main" | "phone-signin" | "otp" | "signup";

const Auth = () => {
  const [view, setView] = useState<View>("main");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [password, setPassword] = useState("");
  const [signinPhone, setSigninPhone] = useState<string | undefined>("");
  const [otp, setOtp] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string>("US");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-detect country from device location
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (data?.country_code) setDefaultCountry(data.country_code);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => /^\+[1-9]\d{6,14}$/.test(v);
  const clearMessages = () => { setError(""); setSuccessMessage(""); };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    clearMessages();
    setLoading(true);
    const { error: socialError } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (socialError) setError(socialError.message);
    setLoading(false);
  };

  const handleSignInSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!signinPhone || !validatePhone(signinPhone)) return setError("Please enter a valid phone number.");
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: signinPhone.trim() });
    if (otpError) setError(otpError.message);
    else { setView("otp"); setSuccessMessage("We sent a code to " + signinPhone); }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!name.trim()) return setError("Please enter your name.");
    if (!validateEmail(email)) return setError("Please enter a valid email.");
    if (!phone || !validatePhone(phone)) return setError("Please enter a valid phone number.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim(), phone: phone.trim() } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    if (otpError) setSuccessMessage("Account created! Check your email to confirm.");
    else { setView("otp"); setSuccessMessage("We sent a code to " + phone); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (otp.length < 6) return setError("Please enter the 6-digit code.");
    setLoading(true);
    const phoneNumber = (mode === "signin" ? signinPhone : phone)?.trim() || "";
    const { error: verifyError } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: otp, type: "sms" });
    if (verifyError) setError(verifyError.message);
    else { toast({ title: mode === "signin" ? "Signed in successfully" : "Phone verified!" }); navigate("/"); }
    setLoading(false);
  };

  const goBack = () => {
    clearMessages();
    setOtp("");
    if (view === "otp") setView(mode === "signin" ? "phone-signin" : "signup");
    else if (view === "phone-signin" || view === "signup") setView("main");
    else navigate("/");
  };

  const toggleMode = () => {
    clearMessages();
    setOtp("");
    if (mode === "signin") { setMode("signup"); setView("signup"); }
    else { setMode("signin"); setView("main"); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs"
      >
        <div className="rounded-3xl bg-foreground text-background p-6 relative shadow-2xl">
          {/* Back arrow */}
          <button onClick={goBack} className="absolute top-5 left-5 text-background/70 hover:text-background transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mt-2 mb-8">
            {view === "otp" ? "Verify" : view === "signup" ? "Sign Up" : "Login"}
          </h1>

          <AnimatePresence mode="wait">
            {/* ── Main Login View ── */}
            {view === "main" && (
              <motion.div key="main" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center gap-3"
              >
                <Button onClick={() => handleSocialLogin("google")} disabled={loading}
                  className="rounded-full h-11 px-6 text-sm font-medium gap-2 bg-background text-foreground hover:bg-background/90 w-auto">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  with Google
                </Button>

                <Button onClick={() => handleSocialLogin("apple")} disabled={loading}
                  className="rounded-full h-11 px-6 text-sm font-medium gap-2 bg-transparent border border-background/30 text-background hover:bg-background/10 w-auto">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  with Apple
                </Button>

                <Button onClick={() => { setMode("signin"); setView("phone-signin"); clearMessages(); }} disabled={loading}
                  className="rounded-full h-11 px-6 text-sm font-medium gap-2 bg-background text-foreground hover:bg-background/90 w-auto">
                  <Phone className="w-4 h-4 shrink-0" />
                  with Phone
                </Button>

                <p className="text-center text-xs text-background/60 pt-3">
                  Not a member?{" "}
                  <button onClick={toggleMode} className="text-background font-bold hover:underline">Sign up.</button>
                </p>
              </motion.div>
            )}

            {/* ── Phone Sign In ── */}
            {view === "phone-signin" && (
              <motion.div key="phone-signin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSignInSendOtp} className="space-y-3">
                  <PhoneInput
                    international
                    defaultCountry={defaultCountry as any}
                    value={signinPhone}
                    onChange={setSigninPhone}
                    className="auth-phone-input"
                  />
                  {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  {successMessage && <p className="text-xs text-primary text-center">{successMessage}</p>}
                  <div className="flex justify-center">
                    <Button type="submit" disabled={loading}
                      className="rounded-full h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      {loading ? "Sending…" : "Send Code"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Sign Up Form ── */}
            {view === "signup" && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSignUp} className="space-y-2.5">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <Input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-full pl-10 bg-background text-foreground border-0 text-sm" maxLength={100} autoFocus />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-full pl-10 bg-background text-foreground border-0 text-sm" maxLength={255} />
                  </div>
                  <PhoneInput
                    international
                    defaultCountry={defaultCountry as any}
                    value={phone}
                    onChange={setPhone}
                    className="auth-phone-input"
                  />
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <Input type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-full pl-10 bg-background text-foreground border-0 text-sm" maxLength={128} />
                  </div>
                  {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  {successMessage && <p className="text-xs text-primary text-center">{successMessage}</p>}
                  <div className="flex justify-center pt-1">
                    <Button type="submit" disabled={loading}
                      className="rounded-full h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      {loading ? "Creating…" : "Create Account"}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-background/60 pt-1">
                    Already a member?{" "}
                    <button type="button" onClick={toggleMode} className="text-background font-bold hover:underline">Sign in.</button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── OTP ── */}
            {view === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-center text-xs text-background/60 mb-4">We sent a 6-digit code to your phone</p>
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <Input type="text" inputMode="numeric" placeholder="000000" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-11 rounded-full text-center text-lg tracking-[0.3em] bg-background text-foreground border-0 font-mono"
                    maxLength={6} autoFocus />
                  {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  {successMessage && <p className="text-xs text-primary text-center">{successMessage}</p>}
                  <div className="flex justify-center">
                    <Button type="submit" disabled={loading}
                      className="rounded-full h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      {loading ? "Verifying…" : "Verify Code"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
