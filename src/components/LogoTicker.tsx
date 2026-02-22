import React from 'react';
import amazonLogo from '@/assets/logos/amazon.png';
import appleLogo from '@/assets/logos/apple.png';
import chaseLogo from '@/assets/logos/chase.png';
import cokeLogo from '@/assets/logos/coke.png';
import ferrariLogo from '@/assets/logos/ferrari.png';
import fordLogo from '@/assets/logos/ford.png';
import metaLogo from '@/assets/logos/meta.png';
import modernaLogo from '@/assets/logos/moderna.png';
import neuralinkLogo from '@/assets/logos/neuralink.png';
import paloaltoLogo from '@/assets/logos/paloalto.png';
import sequoiaLogo from '@/assets/logos/sequoia.png';
import thermofisherLogo from '@/assets/logos/thermofisher.png';
import tmobileLogo from '@/assets/logos/tmobile.png';
import ezcaterLogo from '@/assets/logos/ezcater.png';
import sohohouseLogo from '@/assets/logos/sohohouse.png';

const logos = [
  { name: 'Amazon', src: amazonLogo },
  { name: 'Apple', src: appleLogo },
  { name: 'Chase', src: chaseLogo },
  { name: 'Coca-Cola', src: cokeLogo },
  { name: 'Ferrari', src: ferrariLogo },
  { name: 'Ford', src: fordLogo },
  { name: 'Meta', src: metaLogo },
  { name: 'Moderna', src: modernaLogo },
  { name: 'Neuralink', src: neuralinkLogo },
  { name: 'Palo Alto Networks', src: paloaltoLogo },
  { name: 'Sequoia', src: sequoiaLogo },
  { name: 'Soho House', src: sohohouseLogo },
  { name: 'Thermo Fisher', src: thermofisherLogo },
  { name: 'T-Mobile', src: tmobileLogo },
  { name: 'ezCater', src: ezcaterLogo },
];

const LogoSet = ({ keyPrefix }: { keyPrefix: string }) => (
  <div className="flex shrink-0 items-center gap-16 px-8">
    {logos.map((logo, index) => (
      <div
        key={`${keyPrefix}-${index}`}
        className="flex shrink-0 items-center justify-center"
      >
        <img
          src={logo.src}
          alt={logo.name}
          className="h-8 w-auto max-w-[120px] object-contain opacity-70 transition-opacity hover:opacity-100 md:h-10 md:max-w-[150px]"
        />
      </div>
    ))}
  </div>
);

export const LogoTicker: React.FC = () => {
  return (
    <section className="w-full bg-background pb-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted By
        </p>
      </div>
      
      <div className="container mx-auto px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
        
        <div className="flex animate-scroll">
          <LogoSet keyPrefix="logo-1" />
          <LogoSet keyPrefix="logo-2" />
        </div>
      </div>
    </section>
  );
};
