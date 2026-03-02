import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CountrySelect from "@/components/CountrySelect";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const splitPhone = (intlPhone: string) => {
  try {
    const parsed = parsePhoneNumber(intlPhone);
    if (parsed) {
      return { countryCode: `+${parsed.countryCallingCode}`, nationalNumber: parsed.nationalNumber };
    }
  } catch {}
  const match = intlPhone.match(/^\+(\d{1,3})(\d+)$/);
  return match
    ? { countryCode: `+${match[1]}`, nationalNumber: match[2] }
    : { countryCode: "", nationalNumber: intlPhone };
};

const formatDisplayPhone = (countryCode: string, national: string): string => {
  const digits = national.replace(/\D/g, "");
  if (digits.length === 10) return `${countryCode} (${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 9) return `${countryCode} (${digits.slice(0,2)}) (${digits.slice(2,5)})-(${digits.slice(5)})`;
  return `${countryCode} ${digits}`;
};

export function PhoneVerificationGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [needsPhone, setNeedsPhone] = useState(false);
  const [view, setView] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState<string | undefined>("");
  const [otp, setOtp] = useState("");
  const [deviceID, setDeviceID] = useState("");
  const [otpCountryCode, setOtpCountryCode] = useState("");
  const [otpNationalNumber, setOtpNationalNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState<string>("US");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => { if (d?.country_code) setDefaultCountry(d.country_code); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (loading || !user) { setNeedsPhone(false); return; }
    // User has verified phone if courial_user flag is set by verify-otp
    const meta = user.user_metadata || {};
    if (meta.courial_user && meta.phone) {
      setNeedsPhone(false);
    } else if (user.app_metadata?.provider === "google" || user.app_metadata?.provider === "apple") {
      // Social login user without verified phone
      setNeedsPhone(true);
    } else {
      setNeedsPhone(false);
    }
  }, [user, loading]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMessage("");
    if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) return setError("Please enter a valid phone number.");
    setBtnLoading(true);

    const { countryCode, nationalNumber } = splitPhone(phone.trim());
    setOtpCountryCode(countryCode);
    setOtpNationalNumber(nationalNumber);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({ country_code: countryCode, phone: nationalNumber, type: "1" }),
      });
      const data = await res.json();
      if (!res.ok || data.success === 0 || data.success === false) {
        // If user not found with type 1, try type 0
        const res2 = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
          body: JSON.stringify({ country_code: countryCode, phone: nationalNumber, type: "0" }),
        });
        const data2 = await res2.json();
        if (!res2.ok || data2.success === 0 || data2.success === false) {
          setError(data2.msg || data.msg || "Failed to send OTP");
        } else {
          setDeviceID(data2.deviceID || "");
          setView("otp");
          setSuccessMessage("Sent to\n" + formatDisplayPhone(countryCode, nationalNumber));
        }
      } else {
        setDeviceID(data.deviceID || "");
        setView("otp");
        setSuccessMessage("Sent to\n" + formatDisplayPhone(countryCode, nationalNumber));
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setBtnLoading(false);
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const code = otpValue || otp;
    setError(""); setSuccessMessage("");
    if (code.length < 4) return setError("Please enter the 4-digit code.");
    setBtnLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({
          country_code: otpCountryCode,
          phone: otpNationalNumber,
          otp: code,
          deviceId: deviceID,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "OTP verification failed");
        setBtnLoading(false);
        return;
      }

      // Store Courial token
      if (data.courial_data?.data?.token) {
        localStorage.setItem("courial_api_token", data.courial_data.data.token);
      }

      // Update the current Supabase user's metadata with phone info
      const fullPhone = `${otpCountryCode}${otpNationalNumber}`;
      await supabase.auth.updateUser({
        phone: fullPhone,
        data: {
          phone: fullPhone,
          country_code: otpCountryCode,
          courial_user: true,
          courial_id: data.courial_data?.data?.id,
        },
      });

      // Also sync to Courial backend with social_id
      if (user) {
        const meta = user.user_metadata || {};
        fetch(`${SUPABASE_URL}/functions/v1/sync-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
          body: JSON.stringify({
            first_name: meta.full_name?.split(" ")[0] || meta.name?.split(" ")[0] || "",
            last_name: meta.full_name?.split(" ").slice(1).join(" ") || "",
            email: user.email || meta.email || "",
            country_code: otpCountryCode,
            phone: otpNationalNumber,
            social_id: user.id,
            auth_id: user.id,
          }),
        }).catch(() => {});
      }

      setNeedsPhone(false);
    } catch {
      setError("Network error. Please try again.");
    }
    setBtnLoading(false);
  };

  if (!needsPhone) return <>{children}</>;

  return (
    <>
      {children}
      {/* Full-screen gate overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-foreground/25 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-64"
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 relative shadow-2xl flex flex-col items-center backdrop-blur-sm">
            <Phone className="w-6 h-6 text-background/70 mb-2" />
            <h2 className="text-xl font-bold text-center mb-1">Phone Required</h2>
            <p className="text-xs text-background/60 text-center mb-4">
              Verify your phone number to continue
            </p>

            <AnimatePresence mode="wait">
              {view === "phone" && (
                <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <PhoneInput
                      international
                      defaultCountry={defaultCountry as any}
                      value={phone}
                      onChange={setPhone}
                      className="auth-phone-input auth-phone-input--dark"
                      countrySelectComponent={CountrySelect}
                    />
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMessage && <p className="text-xs text-primary text-center whitespace-pre-line">{successMessage}</p>}
                    <Button type="submit" disabled={btnLoading}
                      className="rounded-lg h-11 w-full text-sm font-medium bg-foreground text-background border border-background/30 hover:bg-foreground/90">
                      {btnLoading ? "Sending…" : "Send Code"}
                    </Button>
                  </form>
                </motion.div>
              )}

              {view === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                  <p className="text-center text-xs text-background/60 mb-4">4-digit code sent to your phone</p>
                  <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-3">
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <input
                          key={i}
                          id={`pvg-otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          autoFocus={i === 0}
                          value={otp[i] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (!val && !e.target.value) return;
                            const newOtp = otp.split("");
                            newOtp[i] = val.slice(-1);
                            const joined = newOtp.join("").slice(0, 4);
                            setOtp(joined);
                            if (val && i < 3) document.getElementById(`pvg-otp-${i + 1}`)?.focus();
                            if (joined.length === 4) setTimeout(() => handleVerifyOtp(joined), 100);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[i] && i > 0) {
                              document.getElementById(`pvg-otp-${i - 1}`)?.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
                            setOtp(paste);
                            const focusIdx = Math.min(paste.length, 3);
                            document.getElementById(`pvg-otp-${focusIdx}`)?.focus();
                            if (paste.length === 4) setTimeout(() => handleVerifyOtp(paste), 100);
                          }}
                          className="w-8 h-8 rounded-lg bg-transparent text-background text-center text-sm font-mono border border-background/30 outline-none focus:ring-1 focus:ring-primary"
                        />
                      ))}
                    </div>
                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                    {successMessage && <p className="text-xs text-primary text-center whitespace-pre-line">{successMessage}</p>}
                    <button type="button" onClick={() => { setView("phone"); setOtp(""); setError(""); setSuccessMessage(""); }}
                      className="text-xs text-background/60 hover:text-background hover:underline w-full text-center">
                      Change number
                    </button>
                    {btnLoading && <p className="text-xs text-background/60 text-center">Verifying…</p>}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
