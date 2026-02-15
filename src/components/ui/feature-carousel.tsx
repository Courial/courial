import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle: string;
  images: { src: string; alt: string }[];
}

export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ title, subtitle, images, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(Math.floor(images.length / 2));

    const handleNext = React.useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    React.useEffect(() => {
      const timer = setInterval(() => {
        handleNext();
      }, 4000);
      return () => clearInterval(timer);
    }, [handleNext]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative min-h-screen w-full overflow-hidden bg-background',
          className
        )}
        {...props}
      >
        {/* Background Gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-muted/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-muted/30 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full min-h-screen flex-col items-center justify-center px-4 py-20">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight gradient-text-black-orange md:text-7xl lg:text-8xl">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl whitespace-pre-line">
              {subtitle}
            </p>
          </div>

          {/* Main Showcase Section */}
          <div className="relative flex w-full max-w-5xl items-center justify-center">
            {/* Carousel Wrapper */}
            <div className="relative flex h-[420px] w-full items-center justify-center md:h-[600px]">
              {images.map((image, index) => {
                const offset = index - currentIndex;
                const total = images.length;
                let pos = (offset + total) % total;
                if (pos > Math.floor(total / 2)) {
                  pos = pos - total;
                }

                const isCenter = pos === 0;
                const isAdjacent = Math.abs(pos) === 1;

                return (
                  <div
                    key={index}
                    className="absolute transition-all duration-500 ease-out"
                    style={{
                      transform: `translateX(${pos * 220}px) scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7}) translateZ(${isCenter ? 0 : -100}px)`,
                      zIndex: isCenter ? 30 : isAdjacent ? 20 : 10,
                      opacity: isCenter ? 1 : isAdjacent ? 0.7 : 0.4,
                      filter: isCenter ? 'none' : 'blur(2px)',
                      visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
                    }}
                  >
                    {/* Phone Frame - Realistic iPhone Style */}
                    <div className="relative h-[360px] w-[176px] overflow-hidden rounded-[36px] bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] p-[3px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] md:h-[550px] md:w-[270px] md:rounded-[45px]">
                      {/* Inner bezel */}
                      <div className="relative h-full w-full overflow-hidden rounded-[33px] bg-gradient-to-b from-[#3a3a3a] to-[#1a1a1a] p-[2px] md:rounded-[42px]">
                        {/* Screen container */}
                        <div className="relative h-full w-full overflow-hidden rounded-[31px] bg-background md:rounded-[40px]">
                          {/* Dynamic Island */}
                          <div className="absolute left-1/2 top-3 z-20 h-[28px] w-[90px] -translate-x-1/2 rounded-full bg-black md:h-[32px] md:w-[100px]" />
                          {/* Screen Content */}
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="h-full w-full object-cover"
                          />
                          {/* Home Indicator */}
                          <div className="absolute bottom-2 left-1/2 z-20 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-white/80 md:w-[140px]" />
                        </div>
                      </div>
                      {/* Side buttons - Volume */}
                      <div className="absolute -left-[2px] top-[100px] h-[30px] w-[3px] rounded-l-sm bg-[#2a2a2a]" />
                      <div className="absolute -left-[2px] top-[140px] h-[50px] w-[3px] rounded-l-sm bg-[#2a2a2a]" />
                      <div className="absolute -left-[2px] top-[200px] h-[50px] w-[3px] rounded-l-sm bg-[#2a2a2a]" />
                      {/* Side button - Power */}
                      <div className="absolute -right-[2px] top-[150px] h-[70px] w-[3px] rounded-r-sm bg-[#2a2a2a]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="absolute left-4 z-40 h-12 w-12 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-muted md:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 z-40 h-12 w-12 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-muted md:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="mt-8 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  index === currentIndex ? 'w-6 bg-foreground' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

HeroSection.displayName = 'HeroSection';
