import { useState, useEffect } from "react";

export function useBackendHealth(): { isHealthy: boolean | null } {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => {
        if (cancelled) return;
        setIsHealthy(res.ok);
      })
      .catch(() => {
        if (cancelled) return;
        setIsHealthy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { isHealthy };
}
