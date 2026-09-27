const HEALTH_CHECK_INTERVAL = 5000;
const HEALTH_CHECK_TIMEOUT = 3000;

let serverOnline = null;
let lastCheckedAt = 0;
let healthCheck = null;
const listeners = new Set();

const updateServerStatus = (online) => {
  if (serverOnline === online) return;
  serverOnline = online;
  listeners.forEach((listener) => listener(online));
};

export const isServerOnline = () => serverOnline === true;

export const subscribeToServerStatus = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const checkServerOnline = (force = false) => {
  if (healthCheck) return healthCheck;
  if (!force && Date.now() - lastCheckedAt < HEALTH_CHECK_INTERVAL) {
    return Promise.resolve(isServerOnline());
  }

  healthCheck = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      HEALTH_CHECK_TIMEOUT,
    );

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
        signal: controller.signal,
      });
      lastCheckedAt = Date.now();
      const online = response.ok;
      updateServerStatus(online);
      return online;
    } catch {
      lastCheckedAt = Date.now();
      updateServerStatus(false);
      return false;
    } finally {
      clearTimeout(timeoutId);
      healthCheck = null;
    }
  })();

  return healthCheck;
};
