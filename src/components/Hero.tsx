import React from 'react';
import appScreenshot from '@/assets/app-screenshot.png';

export const Hero: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full pt-20 pb-12 px-4 bg-background">
      <img
        src={appScreenshot}
        alt="Courial app home screen"
        className="max-w-full max-h-[85vh] object-contain"
      />
    </div>
  );
};
