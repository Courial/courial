import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiDocsDialogProps {
  trigger: React.ReactNode;
}

export const ApiDocsDialog = ({ trigger }: ApiDocsDialogProps) => {
  const [open, setOpen] = useState(false);

  const mailtoHref =
    "mailto:support@courial.com?subject=API%20Access%20Request%20-%20%5BYour%20Company%20Name%5D&body=Hi%20Courial%20Team%2C%0A%0AI%27d%20like%20to%20request%20access%20to%20the%20Courial%20API.%0A%0AOur%20Team%2FCompany%3A%20%5BBriefly%20describe%20who%20you%20are%5D%0A%0AUse%20Case%3A%20%5BHow%20do%20you%20plan%20to%20use%20the%20API%3F%5D%0A%0AEstimated%20Volume%3A%20%5BHow%20many%20deliveries%2Frequests%20per%20month%3F%5D%0A%0ALooking%20forward%20to%20the%20sandbox%20credentials.%0A%0ABest%2C%0A%5BYour%20Name%5D";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[hsl(0,0%,12%)] text-white border-none rounded-[50px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-white text-center">
            Build with Courial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2 px-2">
          {/* Introduction */}
          <p className="text-white/80 text-base leading-relaxed">
            Ready to integrate our delivery infrastructure into your stack? We provide custom API
            access to ensure every partner has the right tools for their specific scale.
          </p>

          {/* The Fast Track to Access */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              The Fast Track to Access
            </h3>

            <ol className="space-y-5">
              <li>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-white/60">1.</span>
                  <h4 className="text-lg font-bold text-white">Drop us a line</h4>
                </div>
                <p className="text-white/70 text-sm mt-1 ml-7">
                  <a
                    href={mailtoHref}
                    className="text-primary font-semibold hover:underline"
                  >
                    Email Support
                  </a>{" "}
                  with a quick summary of your team and your intended use case.
                </p>
              </li>

              <li>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-white/60">2.</span>
                  <h4 className="text-lg font-bold text-white">Get White-Listed</h4>
                </div>
                <p className="text-white/70 text-sm mt-1 ml-7">
                  We'll review your details and send over documentation and sandbox credentials
                  within 72 hours.
                </p>
              </li>

              <li>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-white/60">3.</span>
                  <h4 className="text-lg font-bold text-white">Ship it</h4>
                </div>
                <p className="text-white/70 text-sm mt-1 ml-7">
                  Start building and scaling your logistics immediately.
                </p>
              </li>
            </ol>
          </div>

          {/* The Fine Print */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              The Fine Print
            </h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>
                  <strong className="text-white/90">As-is:</strong> The API is provided
                  "as-is"—standard reliability and performance apply.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>
                  <strong className="text-white/90">Security:</strong> Keep your credentials locked
                  down; no sharing with third parties.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                <span>
                  <strong className="text-white/90">Usage:</strong> We reserve the right to revoke
                  access if the API is misused.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
