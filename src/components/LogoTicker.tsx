import React from 'react';
import { cn } from '@/lib/utils';

const logos = [
  { name: 'Zipcar', color: 'text-green-600' },
  { name: 'Cisco', color: 'text-blue-600' },
  { name: 'JPMorganChase', color: 'text-foreground' },
  { name: 'Jamba', color: 'text-orange-500' },
  { name: 'Howard Hughes', color: 'text-foreground', italic: true },
  { name: 'gopuff', color: 'text-blue-500' },
  { name: 'RedHat', color: 'text-red-600' },
  { name: 'CarGurus', color: 'text-purple-600' },
  { name: 'AT&T', color: 'text-blue-400' },
  { name: 'Sizzler', color: 'text-red-500' },
];

export const LogoTicker: React.FC = () => {
  return (
    <section className="w-full overflow-hidden bg-background pb-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted By
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll">
          {/* First set of logos */}
          <div className="flex shrink-0 items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="flex shrink-0 items-center justify-center"
              >
                <span
                  className={cn(
                    'whitespace-nowrap text-xl font-semibold opacity-70 transition-opacity hover:opacity-100 md:text-2xl',
                    logo.color,
                    logo.italic && 'font-serif italic'
                  )}
                >
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Duplicate set for seamless loop */}
          <div className="flex shrink-0 items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className="flex shrink-0 items-center justify-center"
              >
                <span
                  className={cn(
                    'whitespace-nowrap text-xl font-semibold opacity-70 transition-opacity hover:opacity-100 md:text-2xl',
                    logo.color,
                    logo.italic && 'font-serif italic'
                  )}
                >
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
