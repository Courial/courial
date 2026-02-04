import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";

const apiDocsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(20),
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  companyUrl: z.string().trim().url("Invalid URL").or(z.string().length(0)).optional(),
  companyDescription: z.string().trim().min(1, "Please tell us about your company").max(2000),
});

type ApiDocsFormData = z.infer<typeof apiDocsSchema>;

interface ApiDocsDialogProps {
  trigger: React.ReactNode;
}

export const ApiDocsDialog = ({ trigger }: ApiDocsDialogProps) => {
  const [formData, setFormData] = useState<Partial<ApiDocsFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInputChange = (field: keyof ApiDocsFormData, value: string) => {
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
      const validatedData = apiDocsSchema.parse(formData);
      console.log("API Docs form submitted:", validatedData);
      toast.success("Request submitted successfully! We'll review your application and get back to you soon.");
      setFormData({});
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Access Our API</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introduction */}
          <p className="text-muted-foreground">
            Courial's API is designed to help you seamlessly integrate our platform into your business, 
            providing a range of services to optimize your delivery and logistics needs. To ensure that 
            our API is shared with partners who will leverage it effectively, we require all potential 
            partners to complete a brief questionnaire. This allows us to understand your business goals 
            and ensure our API aligns with your objectives.
          </p>

          {/* How to Get Access */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">How to Get Access?</h3>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="space-y-1">
                <span className="font-semibold">Complete the Questionnaire below</span>
                <p className="text-muted-foreground text-sm ml-5">
                  Please fill out our short questionnaire so we can assess your use case and tailor our API 
                  access accordingly. This helps us understand your specific requirements and ensure that our 
                  solution will provide the best value.
                </p>
              </li>
              <li className="space-y-1">
                <span className="font-semibold">Review & Approval</span>
                <p className="text-muted-foreground text-sm ml-5">
                  Once the questionnaire is submitted, our team will review your responses. If your business 
                  goals align with Courial's capabilities, we will provide access to the API documentation 
                  along with sandbox credentials for testing.
                </p>
              </li>
              <li className="space-y-1">
                <span className="font-semibold">Get Started</span>
                <p className="text-muted-foreground text-sm ml-5">
                  After approval, you will gain access to Courial's API, enabling you to integrate our 
                  platform with your systems and start optimizing your operations.
                </p>
              </li>
            </ol>
          </div>

          {/* API Terms of Use */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide">API Terms of Use</h3>
            <p className="text-muted-foreground text-sm">
              By accessing Courial's API, you agree to the following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm ml-2">
              <li>
                The API is provided "as-is," and Courial makes no warranties regarding its reliability, 
                performance, or suitability for your specific use case.
              </li>
              <li>
                You agree not to share your API credentials with third parties without written permission 
                from Courial.
              </li>
              <li>
                Courial reserves the right to revoke or suspend access to the API at any time if it is 
                determined that misuse or unauthorized access has occurred.
              </li>
            </ul>
          </div>

          {/* Support Team Link */}
          <p className="text-sm text-muted-foreground">
            If you have any questions, feel free to reach out to our{" "}
            <a href="/help" className="text-primary font-semibold hover:underline">
              support team
            </a>
            .
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-firstName">First Name *</Label>
                <Input
                  id="api-firstName"
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
                <Label htmlFor="api-lastName">Last Name *</Label>
                <Input
                  id="api-lastName"
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
                <Label htmlFor="api-email">Email *</Label>
                <Input
                  id="api-email"
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
                <Label htmlFor="api-phone">Phone Number *</Label>
                <Input
                  id="api-phone"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-companyName">Company Name *</Label>
                <Input
                  id="api-companyName"
                  placeholder="Company Name"
                  value={formData.companyName || ""}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className={errors.companyName ? "border-destructive" : ""}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-companyUrl">Company URL</Label>
                <Input
                  id="api-companyUrl"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.companyUrl || ""}
                  onChange={(e) => handleInputChange("companyUrl", e.target.value)}
                  className={errors.companyUrl ? "border-destructive" : ""}
                />
                {errors.companyUrl && (
                  <p className="text-sm text-destructive">{errors.companyUrl}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-companyDescription">Tell us about your company *</Label>
              <Textarea
                id="api-companyDescription"
                placeholder="Tell us about your company and how you plan to use our API..."
                value={formData.companyDescription || ""}
                onChange={(e) => handleInputChange("companyDescription", e.target.value)}
                className={`min-h-[120px] ${errors.companyDescription ? "border-destructive" : ""}`}
              />
              {errors.companyDescription && (
                <p className="text-sm text-destructive">{errors.companyDescription}</p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-foreground text-background hover:bg-foreground/90 px-8"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
