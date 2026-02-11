import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogIn,
  Lock,
  Mail,
  ArrowLeft,
  UserPlus,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
import courialLogo from "@/assets/courial-logo.png";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"form" | "otp">("form");

  // Sign-up fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Sign-in field (phone only)
  const [signinPhone, setSigninPhone] = useState("");

  // OTP
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => /^\+[1-9]\d{6,14}$/.test(v);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // ── Sign Up ──
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!name.trim()) return setError("Please enter your name.");
    if (!validateEmail(email)) return setError("Please enter a valid email.");
    if (!validatePhone(phone))
      return setError("Phone must be in international format, e.g. +1234567890");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);

    // 1. Create account with email + password
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name.trim(), phone: phone.trim() },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Send phone OTP for verification
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
    });

    if (otpError) {
      // Account created but phone OTP failed — still show success for email
      setSuccessMessage(
        "Account created! Check your email to confirm. Phone verification is currently unavailable."
      );
    } else {
      setStep("otp");
      setSuccessMessage("We sent a code to " + phone);
    }

    setLoading(false);
  };

  // ── Sign In (phone OTP) ──
  const handleSignInSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!validatePhone(signinPhone))
      return setError("Phone must be in international format, e.g. +1234567890");

    setLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: signinPhone.trim(),
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setStep("otp");
      setSuccessMessage("We sent a code to " + signinPhone);
    }

    setLoading(false);
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (otp.length < 6) return setError("Please enter the 6-digit code.");

    setLoading(true);

    const phoneNumber = mode === "signin" ? signinPhone.trim() : phone.trim();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: mode === "signin" ? "sms" : "sms",
    });

    if (verifyError) {
      setError(verifyError.message);
    } else {
      toast({ title: mode === "signin" ? "Signed in successfully" : "Phone verified!" });
      navigate("/");
    }

    setLoading(false);
  };

  // ── Social Login ──
  const handleSocialLogin = async (provider: "google" | "apple") => {
    clearMessages();
    setLoading(true);

    const { error: socialError } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });

    if (socialError) {
      setError(socialError.message);
    }

    setLoading(false);
  };

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setStep("form");
    clearMessages();
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={courialLogo}
              alt="Courial"
              className="h-8 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {mode === "signin" ? (
                <LogIn className="w-5 h-5 text-foreground" />
              ) : (
                <UserPlus className="w-5 h-5 text-foreground" />
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-foreground text-center">
            {step === "otp"
              ? "Enter verification code"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </h1>
          <p className="text-muted-foreground text-center mt-2 text-sm">
            {step === "otp"
              ? "We sent a 6-digit code to your phone"
              : mode === "signin"
              ? "Enter your phone number to get a code"
              : "Get started with Courial"}
          </p>

          {/* ──── OTP Step ──── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                autoFocus
              />

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {successMessage && (
                <p className="text-sm text-primary text-center">{successMessage}</p>
              )}

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  clearMessages();
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
              >
                Back
              </button>
            </form>
          )}

          {/* ──── Sign In Form (phone only) ──── */}
          {step === "form" && mode === "signin" && (
            <form onSubmit={handleSignInSendOtp} className="mt-8 space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={signinPhone}
                  onChange={(e) => setSigninPhone(e.target.value)}
                  className="pl-10"
                  maxLength={16}
                />
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {successMessage && (
                <p className="text-sm text-primary text-center">{successMessage}</p>
              )}

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Sending code..." : "Send Code"}
              </Button>
            </form>
          )}

          {/* ──── Sign Up Form ──── */}
          {step === "form" && mode === "signup" && (
            <form onSubmit={handleSignUp} className="mt-8 space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  maxLength={255}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  maxLength={16}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  maxLength={128}
                />
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {successMessage && (
                <p className="text-sm text-primary text-center">{successMessage}</p>
              )}

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* Social login divider */}
          {step === "form" && (
            <>
              <div className="flex items-center gap-3 mt-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleSocialLogin("google")}
                  disabled={loading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={loading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </Button>
              </div>
            </>
          )}

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="text-foreground font-medium hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Back */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
