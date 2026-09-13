import {
  cacheResponse,
  getCachedResponse,
  removeDisallowedCacheEntries,
} from "../offline/offlineDb";

const cacheKey = (endpoint) => {
  const user = localStorage.getItem("user") || "anonymous";
  return `${user}:${endpoint}`;
};

const localCacheKey = (endpoint) => `scivlab:offline:${cacheKey(endpoint)}`;

const isOfflineCacheable = (endpoint) => {
  const path = endpoint.split("?")[0];
  if (endpoint.includes("fresh=1")) return false;
  return (
    path === "student/labs" ||
    /^labs\/[^/]+$/.test(path) ||
    /^practicals\/lab\/[^/]+$/.test(path) ||
    path === "submissions/my" ||
    /^submissions\/my\/[^/]+$/.test(path) ||
    /^marks\/lab\/[^/]+$/.test(path) ||
    /^attendance\/student\/[^/]+\/[^/]+$/.test(path) ||
    /^evaluations\/submission\/[^/]+$/.test(path)
  );
};

export const cleanOfflineCache = async () => {
  const isAllowedKey = (key) => {
    return (
      key.includes(":student/labs") ||
      key.includes(":labs/") ||
      key.includes(":practicals/lab/") ||
      key.includes(":submissions/my") ||
      key.includes(":marks/lab/") ||
      key.includes(":attendance/student/") ||
      key.includes(":evaluations/submission/")
    );
  };
  try {
    await removeDisallowedCacheEntries(isAllowedKey);
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (
        key?.startsWith("scivlab:offline:") &&
        (key.endsWith(":algorithms") ||
          key.includes(":progress/user-progress") ||
          key.includes(":algo-progress"))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn("Unable to clean disallowed offline cache entries", error);
  }
};

const cacheJsonResponse = async (endpoint, response) => {
  if (!isOfflineCacheable(endpoint)) return response;
  if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
    const payload = await response.clone().json();
    const key = localCacheKey(endpoint);
    try {
      localStorage.setItem(key, JSON.stringify({ payload, cachedAt: Date.now() }));
    } catch (error) {
      console.warn("Unable to write local offline cache", error);
    }
    try {
      await cacheResponse(cacheKey(endpoint), payload);
    } catch (error) {
      // Storage is an enhancement; it must never break a successful online request.
      console.warn("Unable to cache API response for offline use", error);
    }
  }
  return response;
};

const responseFromCache = (cached) =>
  new Response(JSON.stringify(cached.payload), {
    status: 200,
    headers: { "Content-Type": "application/json", "X-Offline-Cache": "true" },
  });

const fetchWithTimeout = (url, options, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const originalSignal = options.signal;
  const abortRequest = () => controller.abort();

  if (originalSignal) {
    if (originalSignal.aborted) controller.abort();
    else originalSignal.addEventListener("abort", abortRequest, { once: true });
  }

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
    originalSignal?.removeEventListener("abort", abortRequest);
  });
};

const getOfflineResponse = async (endpoint) => {
  if (!isOfflineCacheable(endpoint)) return null;
  try {
    const cached = await getCachedResponse(cacheKey(endpoint));
    if (cached) return responseFromCache(cached);
  } catch (error) {
    console.warn("Unable to read IndexedDB offline cache", error);
  }
  try {
    const localCached = localStorage.getItem(localCacheKey(endpoint));
    return localCached ? responseFromCache(JSON.parse(localCached)) : null;
  } catch (error) {
    console.warn("Unable to read local offline cache", error);
    return null;
  }
};

// export const apiFetch = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");

//   const response = await fetch(`/api/${endpoint}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: token,
//       ...options.headers,
//     },
//   });

//   const contentType = response.headers.get("content-type");
//   const isJson = contentType && contentType.includes("application/json");

//   if (!isJson) {
//     const text = await response.text();
//     console.error(
//       `Non-JSON response (${response.status}): ${text.substring(0, 200)}`,
//     );
//     throw new Error(
//       "API returned HTML instead of JSON. Backend might not be running or proxy not working.",
//     );
//   }

//   if (!response.ok) {
//     const data = await response
//       .clone()
//       .json()
//       .catch(() => ({}));
//     throw new Error(
//       data.msg || data.error || `Request failed (${response.status})`,
//     );
//   }

//   return response;
// };

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // 🔥 If body is FormData, do NOT set Content-Type
  const isFormData = options.body instanceof FormData;

  const headers = {
    // Only set Content-Type for JSON, skip for FormData
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: token,
    ...options.headers,
  };
  const testWeek = localStorage.getItem("scivlab:test-week");
  if (testWeek) headers["X-SCIVLab-Test-Week"] = testWeek;

  if (!options.method || options.method === "GET") {
    if (!navigator.onLine) {
      const cachedResponse = await getOfflineResponse(endpoint);
      if (cachedResponse) return cachedResponse;
    }
  }

  // Remove Content-Type header if it was set to undefined (in case options.headers overrides)
  // but we handle it by not including it.

  let response;
  try {
    response = await fetchWithTimeout(`/api/${endpoint}`, { ...options, headers });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (options.method && options.method !== "GET") throw error;
    const cachedResponse = await getOfflineResponse(endpoint);
    if (cachedResponse) return cachedResponse;
    throw error;
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!isJson) {
    const text = await response.text();
    console.error(
      `Non-JSON response (${response.status}): ${text.substring(0, 200)}`,
    );
    throw new Error(
      "API returned HTML instead of JSON. Backend might not be running or proxy not working.",
    );
  }

  if (!response.ok) {
    const data = await response
      .clone()
      .json()
      .catch(() => ({}));
    throw new Error(
      data.msg || data.error || `Request failed (${response.status})`,
    );
  }

  return cacheJsonResponse(endpoint, response);
};
