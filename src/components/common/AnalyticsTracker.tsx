import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { sendAnalyticsEvent } from "../../lib/analytics";
import { recordPageView } from "../../lib/contentStore";

export default function AnalyticsTracker() {
  const location = useLocation();
  const currentPathRef = useRef<string>(location.pathname);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const prevPath = currentPathRef.current;
    const prevStartTime = startTimeRef.current;
    const newPath = location.pathname;

    // Send duration beacon for previous route if it was a public path
    if (prevPath && !prevPath.startsWith("/admin") && prevPath !== newPath) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - prevStartTime) / 1000));
      sendAnalyticsEvent({
        path: prevPath,
        durationSeconds: elapsedSeconds,
        isExit: true,
      });
    }

    // Reset tracking state for new route
    currentPathRef.current = newPath;
    startTimeRef.current = Date.now();

    // If new route is not an admin route, record fresh pageview
    if (!newPath.startsWith("/admin")) {
      // Keep local contentStore sync for instant offline mock fallback
      recordPageView(newPath);

      // Send pageview to backend
      sendAnalyticsEvent({
        path: newPath,
        durationSeconds: 0,
      }).catch(() => {});
    }
  }, [location.pathname]);

  // Window unload or tab hidden: report final session duration for current page
  useEffect(() => {
    const handleUnloadOrHide = () => {
      const activePath = currentPathRef.current;
      if (activePath && !activePath.startsWith("/admin")) {
        const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        sendAnalyticsEvent({
          path: activePath,
          durationSeconds: elapsedSeconds,
          isExit: true,
        }).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleUnloadOrHide();
      } else if (document.visibilityState === "visible") {
        startTimeRef.current = Date.now();
      }
    };

    window.addEventListener("beforeunload", handleUnloadOrHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnloadOrHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
