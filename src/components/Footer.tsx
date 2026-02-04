import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background">
      {/* Main Footer Row */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Legal Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/ica"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ICA
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Center - Techstars Logo & Social Icons */}
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-muted-foreground tracking-tight">
              techstars<span className="text-foreground">_</span>
            </span>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Threads"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.306 1.332-3.2.899-.869 2.14-1.397 3.585-1.53.936-.086 2.07-.039 3.376.136-.102-.628-.313-1.148-.638-1.563-.438-.559-1.108-.847-1.996-.857h-.071c-.683.01-1.56.181-2.303.871l-1.407-1.503c1.123-1.044 2.532-1.502 3.704-1.485 1.512.024 2.731.574 3.532 1.592.673.858 1.058 1.964 1.15 3.303.168.066.335.137.5.214 1.188.553 2.123 1.396 2.704 2.435.764 1.362.893 3.105.342 4.651-.856 2.402-3.07 3.935-6.146 4.254-.378.04-.759.058-1.14.058zm1.14-8.71c-.903 0-1.821.134-2.467.44-.543.257-.876.619-.912 1.046-.036.422.176.83.598 1.104.457.295 1.122.45 1.87.419 1.002-.054 1.772-.405 2.29-1.046.36-.447.612-1.04.753-1.77-.72-.124-1.427-.193-2.132-.193z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right - App Store Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] leading-none">Download on the</div>
                <div className="text-sm font-semibold leading-tight">App Store</div>
              </div>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] leading-none">GET IT ON</div>
                <div className="text-sm font-semibold leading-tight">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-6">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Courial. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
