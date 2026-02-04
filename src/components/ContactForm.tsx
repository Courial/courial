import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(20),
  language: z.string().min(1, "Please select a language"),
  interest: z.string().min(1, "Please select an interest"),
  referralSource: z.string().min(1, "Please tell us how you found us"),
  inMarket: z.string().min(1, "Please answer this question"),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const languages = [
  "English",
  "Spanish",
  "Thai",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Tagalog",
  "Hindi",
  "Other",
];

const interests = [
  { value: "user", label: "User" },
  { value: "courial", label: "Courial (Deliver for us)" },
  { value: "merchant", label: "Merchant (Partner with us)" },
  { value: "job", label: "Job (Work for us)" },
];

const referralSources = [
  "Google",
  "YouTube",
  "Word of Mouth",
  "Instagram",
  "Facebook",
  "X",
  "Job Board",
  "Apple App Store",
  "Google Play Store",
];

export const ContactForm = () => {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);
      
      // For now, just show success - can be connected to backend later
      console.log("Form submitted:", validatedData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error("Please fill in all required fields correctly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-3xl p-8 md:p-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
        Contact Us
      </h2>
      <p className="text-muted-foreground mb-8">
        Got questions or comments? Love us? Think we could do better?
        <br />
        Whatever the case, we love it when you share.
      </p>

      {/* Info Boxes */}
      <div className="space-y-4 mb-8">
        <div className="border-2 border-primary rounded-xl p-4 bg-primary/5">
          <p className="text-sm">
            If you're interested in signing up to drive for Courial, there's no need to leave a message here.
            Simply click this link to explore options for downloading the partner app:{" "}
            <Link to="/courials" className="text-primary font-semibold hover:underline">
              Partner App
            </Link>.
          </p>
        </div>
        <div className="border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Looking to make extra cash by referring business leads our way? It's simple—send us
            potential clients or partners, and when they turn into successful deals, you'll earn money!
            Find out all the details and get started{" "}
            <Link to="/partners" className="text-primary font-semibold hover:underline">
              here
            </Link>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="First Name"
              value={formData.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Last Name"
              value={formData.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Language Select */}
        <div className="space-y-2 max-w-xs">
          <Label>What is your primary language? *</Label>
          <Select
            value={formData.language || ""}
            onValueChange={(value) => handleInputChange("language", value)}
          >
            <SelectTrigger className={errors.language ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang.toLowerCase()}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && (
            <p className="text-sm text-destructive">{errors.language}</p>
          )}
        </div>

        {/* Language Note */}
        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-xl">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground italic">
            <span className="font-semibold">Nota importante:</span> Actualmente, solo podemos brindar soporte a Courials y usuarios que hablen inglés. Si deseas continuar, por favor comprende que puede ser difícil comunicarte con nuestro equipo de soporte y despacho si no hablas, lees y escribes en inglés con fluidez.{" "}
            <span className="not-italic">
              (Currently, we can only support English-speaking Courials and users. If you wish to continue, please understand that it may be difficult to communicate with our support and dispatch teams if you do not speak, read, and write English well.)
            </span>
          </p>
        </div>

        {/* Interest Radio Group */}
        <div className="space-y-3">
          <Label>Choose Your Interest *</Label>
          <RadioGroup
            value={formData.interest || ""}
            onValueChange={(value) => handleInputChange("interest", value)}
            className="space-y-2"
          >
            {interests.map((interest) => (
              <div key={interest.value} className="flex items-center space-x-3">
                <RadioGroupItem value={interest.value} id={`interest-${interest.value}`} />
                <Label htmlFor={`interest-${interest.value}`} className="font-normal cursor-pointer">
                  {interest.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.interest && (
            <p className="text-sm text-destructive">{errors.interest}</p>
          )}
        </div>

        {/* Referral Source Radio Group */}
        <div className="space-y-3">
          <Label>How did you find us? *</Label>
          <RadioGroup
            value={formData.referralSource || ""}
            onValueChange={(value) => handleInputChange("referralSource", value)}
            className="grid grid-cols-2 md:grid-cols-3 gap-2"
          >
            {referralSources.map((source) => (
              <div key={source} className="flex items-center space-x-3">
                <RadioGroupItem value={source.toLowerCase()} id={`source-${source}`} />
                <Label htmlFor={`source-${source}`} className="font-normal cursor-pointer">
                  {source}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.referralSource && (
            <p className="text-sm text-destructive">{errors.referralSource}</p>
          )}
        </div>

        {/* Market Link */}
        <p className="text-sm text-muted-foreground">
          If you are inquiring about our markets, here's a list of our{" "}
          <Link to="/markets" className="text-primary font-semibold hover:underline">
            Most Active Markets
          </Link>.
        </p>

        {/* In Market Radio Group */}
        <div className="space-y-3">
          <Label>Are we in your market? *</Label>
          <RadioGroup
            value={formData.inMarket || ""}
            onValueChange={(value) => handleInputChange("inMarket", value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="yes" id="market-yes" />
              <Label htmlFor="market-yes" className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="no" id="market-no" />
              <Label htmlFor="market-no" className="font-normal cursor-pointer">
                No. What's the name of your market? Tell us what opportunities we're missing.
              </Label>
            </div>
          </RadioGroup>
          {errors.inMarket && (
            <p className="text-sm text-destructive">{errors.inMarket}</p>
          )}
        </div>

        {/* Message Textarea */}
        <div className="space-y-2">
          <Label htmlFor="message">What's on your mind? *</Label>
          <Textarea
            id="message"
            placeholder="What's on your mind?"
            value={formData.message || ""}
            onChange={(e) => handleInputChange("message", e.target.value)}
            className={`min-h-[120px] ${errors.message ? "border-destructive" : ""}`}
          />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          {isSubmitting ? (
            "Sending..."
          ) : (
            <>
              Submit
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};
