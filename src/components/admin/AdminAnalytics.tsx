import { BarChart3 } from "lucide-react";

export const AdminAnalytics = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Site Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Website traffic & performance</p>
      </div>

      <div className="rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl bg-muted mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Google Analytics Integration</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Connect your Google Analytics 4 property to view real-time traffic data, page views, visitor demographics, and more — all from Mission Control.
        </p>
        <p className="text-muted-foreground text-xs mt-4 max-w-sm">
          To set up, provide your GA4 Property ID and a Google Cloud service account key with GA4 Data API access.
        </p>
      </div>
    </div>
  );
};
