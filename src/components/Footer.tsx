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
  company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Swag", href: "/swag" },
  ],
  services: [
    { name: "For Customers", href: "/" },
    { name: "For Businesses", href: "/business" },
    { name: "For Partners", href: "/partners" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "API Docs", href: "/api" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Current Markets */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-foreground mb-4 text-sm">Current Markets</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>San Francisco Bay Area</li>
              <li>Los Angeles Area</li>
              <li>Boston</li>
              <li>New York City</li>
              <li>San Diego</li>
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
              <h4 className="font-semibold text-foreground mb-4 capitalize text-sm">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Courial. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
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