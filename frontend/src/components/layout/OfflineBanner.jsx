import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { isOffline, subscribeToServerStatus } from "../../offline/offlineMode";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(isOffline);

  useEffect(() => {
    return subscribeToServerStatus((online) => setOffline(!online));
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-amber-400/30 bg-zinc-950/95 px-4 py-2 text-xs text-amber-200 shadow-xl backdrop-blur">
      <span className="flex items-center gap-2">
        <WifiOff size={14} />
        Offline mode: Cached labs are available for students.
      </span>
    </div>
  );
}
