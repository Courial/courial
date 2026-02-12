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
import { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CountrySelect from "@/components/CountrySelect";
import Index from "./Index";
import appleIcon from "@/assets/apple-icon.png";

type View = "main" | "phone-signin" | "otp" | "signup";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Parse an E.164 phone into { countryCode, nationalNumber } */
const splitPhone = (intlPhone: string) => {
  try {
    const parsed = parsePhoneNumber(intlPhone);
    if (parsed) {
      return {
        countryCode: `+${parsed.countryCallingCode}`,
        nationalNumber: parsed.nationalNumber,
      };
    }
  } catch {}
  // Fallback: assume first 1-3 digits after + are country code
  const match = intlPhone.match(/^\+(\d{1,3})(\d+)$/);
  return match
    ? { countryCode: `+${match[1]}`, nationalNumber: match[2] }
    : { countryCode: "", nationalNumber: intlPhone };
};

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
  const [deviceID, setDeviceID] = useState<string>("");
  const [otpCountryCode, setOtpCountryCode] = useState<string>("");
  const [otpNationalNumber, setOtpNationalNumber] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => { if (data?.country_code) setDefaultCountry(data.country_code); })
      .catch(() => {});
  }, []);

  // Check if already logged in on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/", { replace: true });
    });
  }, [navigate]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => /^\+[1-9]\d{6,14}$/.test(v);
  const clearMessages = () => { setError(""); setSuccessMessage(""); };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    clearMessages();
    setLoading(true);
    const { error: socialError } = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (socialError) setError(socialError.message);
    setLoading(false);
  };

  const handleSignInSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!signinPhone || !validatePhone(signinPhone)) return setError("Please enter a valid phone number.");
    setLoading(true);

    const { countryCode, nationalNumber } = splitPhone(signinPhone.trim());
    setOtpCountryCode(countryCode);
    setOtpNationalNumber(nationalNumber);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({ country_code: countryCode, phone: nationalNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
      } else {
        setDeviceID(data.deviceID || "");
        setView("otp");
        setSuccessMessage("We sent a code to " + signinPhone);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
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

    const { countryCode, nationalNumber } = splitPhone(phone.trim());
    setOtpCountryCode(countryCode);
    setOtpNationalNumber(nationalNumber);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({ country_code: countryCode, phone: nationalNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
      } else {
        setDeviceID(data.deviceID || "");
        setView("otp");
        setSuccessMessage("We sent a code to " + phone);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (otp.length < 4) return setError("Please enter the 4-digit code.");
    setLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({
          country_code: otpCountryCode,
          phone: otpNationalNumber,
          otp,
          deviceId: deviceID,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "OTP verification failed");
        setLoading(false);
        return;
      }
      
      // Step 1: Get session tokens via raw fetch (reliable, doesn't hang)
      const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const session = await signInRes.json();
      if (!signInRes.ok) {
        setError(session.error_description || session.msg || "Sign in failed");
        setLoading(false);
        return;
      }

      // Step 2: Store session in localStorage and do a full page reload
      // This guarantees the SDK picks up the session on next mount
      const projectRef = SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1] || "";
      localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(session));
      setVerifySuccess(true);
      setLoading(false);
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err) {
      console.error("verify-otp fetch error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
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
    <>
      {/* Render the home page behind */}
      <div className="pointer-events-none">
        <Index />
      </div>

      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop — click to dismiss */}
        <div
          className="absolute inset-0 bg-foreground/25 backdrop-blur-md"
          onClick={() => navigate("/")}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-64"
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 relative shadow-2xl flex flex-col items-center backdrop-blur-sm">
            {/* Back arrow */}
            <button onClick={goBack} className="absolute top-5 left-5 text-background/70 hover:text-background transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mt-2 mb-6">
              {view === "otp" ? "Verify" : view === "signup" ? "Sign Up" : "Login"}
            </h1>

            <AnimatePresence mode="wait">
              {/* ── Main Login View ── */}
              {view === "main" && (
              <motion.div key="main" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <Button onClick={() => handleSocialLogin("google")} disabled={loading}
                    className="rounded-lg h-11 w-full text-sm font-medium gap-2 bg-transparent border border-background/30 text-background hover:bg-background/10">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    with Google
                  </Button>

                  <Button onClick={() => handleSocialLogin("apple")} disabled={loading}
                    className="rounded-lg h-11 w-full text-sm font-medium gap-2 bg-transparent border border-background/30 text-background hover:bg-background/10">
                    <img src={appleIcon} alt="Apple" className="w-4 shrink-0" />
                    with Apple
                  </Button>

                  <Button onClick={() => { setMode("signin"); setView("phone-signin"); clearMessages(); }} disabled={loading}
                    className="rounded-lg h-11 w-full text-sm font-medium gap-2 bg-transparent border border-background/30 text-background hover:bg-background/10">
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
              <motion.div key="phone-signin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <form onSubmit={handleSignInSendOtp} className="space-y-3">
                    <PhoneInput international defaultCountry={defaultCountry as any} value={signinPhone} onChange={setSigninPhone} className="auth-phone-input auth-phone-input--dark" countrySelectComponent={CountrySelect} />
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMessage && <p className="text-xs text-primary text-center">{successMessage}</p>}
                    <div className="flex justify-center">
                      <Button type="submit" disabled={loading} className="rounded-lg h-11 w-full text-sm font-medium bg-foreground text-background border border-background/30 hover:bg-foreground/90">
                        {loading ? "Sending…" : "Send Code"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── Sign Up Form ── */}
              {view === "signup" && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <form onSubmit={handleSignUp} className="space-y-2.5">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-background/50" />
                      <Input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
                        className="h-11 rounded-lg pl-10 bg-transparent text-background border border-background/30 text-sm placeholder:text-background/40 focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" maxLength={100} autoFocus />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-background/50" />
                      <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-lg pl-10 bg-transparent text-background border border-background/30 text-sm placeholder:text-background/40 focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" maxLength={255} />
                    </div>
                    <PhoneInput international defaultCountry={defaultCountry as any} value={phone} onChange={setPhone} className="auth-phone-input auth-phone-input--dark" countrySelectComponent={CountrySelect} />
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-background/50" />
                      <Input type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-lg pl-10 bg-transparent text-background border border-background/30 text-sm placeholder:text-background/40 focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" maxLength={128} />
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMessage && <p className="text-xs text-primary text-center">{successMessage}</p>}
                    <div className="flex justify-center pt-1">
                      <Button type="submit" disabled={loading} className="rounded-lg h-11 w-full text-sm font-medium bg-foreground text-background border border-background/30 hover:bg-foreground/90">
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
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                   <p className="text-center text-xs text-background/60 mb-4">We sent a 4-digit code to your phone</p>
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <Input type="text" inputMode="numeric" placeholder="0000" value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-11 rounded-lg text-center text-lg tracking-[0.3em] bg-background text-foreground border-0 font-mono"
                      maxLength={4} autoFocus />
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMessage && <p className="text-xs text-primary text-center">{successMessage}</p>}
                    <div className="flex justify-center">
                      <Button type="submit" disabled={loading} className="rounded-lg h-11 w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
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
    </>
  );
};

export default Auth;
