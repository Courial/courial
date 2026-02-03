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
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              {subtitle}
            </p>
          </div>

          {/* Main Showcase Section */}
          <div className="relative flex w-full max-w-5xl items-center justify-center">
            {/* Carousel Wrapper */}
            <div className="relative flex h-[500px] w-full items-center justify-center md:h-[600px]">
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
                    {/* Phone Frame */}
                    <div className="relative h-[450px] w-[220px] overflow-hidden rounded-[40px] border-[8px] border-foreground bg-foreground shadow-2xl md:h-[550px] md:w-[270px]">
                      {/* Notch */}
                      <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground" />
                      {/* Screen */}
                      <div className="h-full w-full overflow-hidden rounded-[32px] bg-muted">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                        />
                      </div>
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
