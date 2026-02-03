import React from 'react';
import { HeroSection } from '@/components/ui/feature-carousel';

// Placeholder images - user will replace these later
const images = [
  {
    src: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=800&fit=crop',
    alt: 'Courial app screen 1',
  },
  {
    src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=800&fit=crop',
    alt: 'Courial app screen 2',
  },
  {
    src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=800&fit=crop',
    alt: 'Courial app screen 3',
  },
  {
    src: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=400&h=800&fit=crop',
    alt: 'Courial app screen 4',
  },
  {
    src: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=800&fit=crop',
    alt: 'Courial app screen 5',
  },
];

const title = (
  <>
    Anything? Possible.
  </>
);

export const Hero: React.FC = () => {
  return (
    <HeroSection
      title={title}
      subtitle="From documents and dry cleaning to furniture and groceries. The trusted on-demand platform that makes complex logistics needs simple."
      images={images}
      className="pt-16"
    />
  );
};
