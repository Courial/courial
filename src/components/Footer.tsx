import { Link } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";
import courialLogo from "@/assets/courial-logo.png";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { name: "X", icon: XIcon, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

const footerLinks = {
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "API Docs", href: "/api" },
  ],
  services: [
    { name: "Customers", href: "/" },
    { name: "Businesses", href: "/business" },
    { name: "Courials", href: "/courials" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "ICA", href: "/ica" },
  ],
  company: [
    { name: "Blog", href: "/blog" },
    { name: "Swag", href: "/swag" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Current Markets */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-background mb-4 text-sm">Current Markets</h4>
            <ul className="space-y-1.5">
              <li className="text-sm text-background/60 leading-normal">San Francisco Bay Area</li>
              <li className="text-sm text-background/60 leading-normal">Los Angeles Area</li>
              <li className="text-sm text-background/60 leading-normal">Boston</li>
              <li className="text-sm text-background/60 leading-normal">New York City</li>
              <li className="text-sm text-background/60 leading-normal">San Diego</li>
            </ul>
            <Link 
              to="/markets" 
              className="text-sm text-primary hover:underline mt-3 inline-block"
            >
              Get the full list
            </Link>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-background mb-4 capitalize text-sm">
                {category}
              </h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {category === "company" && (
                <div className="flex flex-row gap-2 mt-4">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center bg-black text-white p-2 rounded-lg border border-white/30 hover:border-white/50 transition-colors"
                    aria-label="Download on the App Store"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center bg-black text-white p-2 rounded-lg border border-white/30 hover:border-white/50 transition-colors"
                    aria-label="Get it on Google Play"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path fill="#EA4335" d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 0 1-.609-.92V2.734a1 1 0 0 1 .609-.92z"/>
                      <path fill="#FBBC04" d="M14.499 12.707l2.302 2.302-10.937 6.333 8.635-8.635z"/>
                      <path fill="#4285F4" d="M16.801 9.491l2.807 1.626a1 1 0 0 1 0 1.73l-2.807 1.626L14.309 12l2.492-2.509z"/>
                      <path fill="#34A853" d="M5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-background/20 gap-6">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Courial. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-background/60 hover:text-background transition-colors"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};