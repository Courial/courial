import React from 'react';
import appScreenshot from '@/assets/app-screenshot.png';

export const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background pt-16">
      {/* Background Gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-muted/50 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-screen flex-col items-center justify-center px-4 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight gradient-text-black-orange md:text-7xl lg:text-8xl">
            Anything? Possible.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl whitespace-pre-line">
            {"A people-first, AI-powered, high-touch logistics platform.\nFrom white-glove concierge to chauffeur services, we manage the complex—so you can focus on what truly matters."}
          </p>
        </div>

        {/* Single Phone Mockup */}
        <div className="relative h-[500px] w-[245px] md:h-[650px] md:w-[318px]">
          {/* Phone Frame */}
          <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] p-[3px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] md:rounded-[45px]">
            {/* Inner bezel */}
            <div className="relative h-full w-full overflow-hidden rounded-[33px] bg-gradient-to-b from-[#3a3a3a] to-[#1a1a1a] p-[2px] md:rounded-[42px]">
              {/* Screen */}
              <div className="relative h-full w-full overflow-hidden rounded-[31px] bg-background md:rounded-[40px]">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-3 z-20 h-[28px] w-[90px] -translate-x-1/2 rounded-full bg-black md:h-[32px] md:w-[100px]" />
                <img
                  src={appScreenshot}
                  alt="Courial app home screen"
                  className="h-full w-full object-cover"
                />
                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 z-20 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-white/80 md:w-[140px]" />
              </div>
            </div>
            {/* Side buttons */}
            <div className="absolute -left-[2px] top-[100px] h-[30px] w-[3px] rounded-l-sm bg-[#2a2a2a]" />
            <div className="absolute -left-[2px] top-[140px] h-[50px] w-[3px] rounded-l-sm bg-[#2a2a2a]" />
            <div className="absolute -left-[2px] top-[200px] h-[50px] w-[3px] rounded-l-sm bg-[#2a2a2a]" />
            <div className="absolute -right-[2px] top-[150px] h-[70px] w-[3px] rounded-r-sm bg-[#2a2a2a]" />
          </div>
        </div>
      </div>
    </div>
  );
};
