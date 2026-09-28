import {
  getCachedResponse,
  getQueuedSubmissions,
  queueSubmission,
  removeQueuedSubmission,
} from "./offlineDb";
import {
  checkServerOnline,
  isServerOnline,
  subscribeToServerStatus,
} from "./serverStatus";

export const isOffline = () => !isServerOnline();
export { checkServerOnline, subscribeToServerStatus };

const expired = (item, fallbackDate) => {
  const deadline = item?.deadline || fallbackDate;
  return deadline ? new Date(deadline).getTime() < Date.now() : false;
};

export const hideExpiredLabs = (labs) =>
  isOffline() ? labs.filter((lab) => !expired(lab)) : labs;

export const hideExpiredPracticals = (practicals, labDeadline) =>
  isOffline()
    ? practicals.filter((practical) => !expired(practical, labDeadline))
    : practicals;

export const queueOfflineSubmission = (practical, code, language) =>
  queueSubmission({
    practicalId: practical._id,
    labId: practical.labId,
    solutionCode: code,
    language,
  });

const draftKey = (practicalId, language) => {
  const user = localStorage.getItem("user") || "anonymous";
  return `scivlab:offline-draft:${user}:${practicalId}:${language}`;
};

const autoSyncKey = (practicalId) => {
  const user = localStorage.getItem("user") || "anonymous";
  return `scivlab:auto-sync:${user}:${practicalId}`;
};

export const isAutoSyncEnabled = (practicalId) =>
  localStorage.getItem(autoSyncKey(practicalId)) === "true";

export const setAutoSyncEnabled = (practicalId, enabled) => {
  const key = autoSyncKey(practicalId);
  if (enabled) localStorage.setItem(key, "true");
  else localStorage.removeItem(key);
  const attemptPrefix = `scivlab:auto-sync-attempt:${localStorage.getItem("user") || "anonymous"}:${practicalId}:`;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const storedKey = localStorage.key(index);
    if (storedKey?.startsWith(attemptPrefix)) localStorage.removeItem(storedKey);
  }
};

export const getAutoSyncDrafts = () => {
  const user = localStorage.getItem("user") || "anonymous";
  const prefix = `scivlab:offline-draft:${user}:`;
  const drafts = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;

    let draft;
    try {
      draft = JSON.parse(localStorage.getItem(key));
    } catch (error) {
      console.warn("Unable to read saved offline draft", error);
      continue;
    }
    if (
      draft?.practicalId &&
      draft?.labId &&
      draft?.labKind === "academic" &&
      draft?.offlineDraft === true &&
      typeof draft.code === "string" &&
      isAutoSyncEnabled(draft.practicalId)
    ) {
      drafts.push(draft);
    }
  }
  return drafts;
};

export const saveOfflineDraft = (
  practicalId,
  language,
  code,
  metadata = {},
) => {
  try {
    localStorage.setItem(
      draftKey(practicalId, language),
      JSON.stringify({
        ...metadata,
        practicalId,
        language,
        code,
        savedAt: Date.now(),
        syncId: crypto.randomUUID(),
      }),
    );
    localStorage.removeItem(
      `scivlab:auto-sync-attempt:${localStorage.getItem("user") || "anonymous"}:${practicalId}:${language}`,
    );
  } catch (error) {
    console.error("Unable to save offline assignment draft", error);
  }
};

export const getOfflineDraft = (practicalId, language) => {
  const languages = Array.isArray(language) ? language : [language];
  try {
    for (const itemLanguage of languages) {
      const draft = localStorage.getItem(draftKey(practicalId, itemLanguage));
      if (draft) return JSON.parse(draft);
    }
    return null;
  } catch (error) {
    console.error("Unable to read offline assignment draft", error);
    return null;
  }
};

export const removeOfflineDraft = (practicalId, language) => {
  try {
    localStorage.removeItem(draftKey(practicalId, language));
  } catch (error) {
    console.error("Unable to remove offline assignment draft", error);
  }
};

const syncStatusListeners = new Set();

export const publishAutoSyncStatus = (status) => {
  syncStatusListeners.forEach((listener) => listener(status));
};

export const subscribeToAutoSyncStatus = (listener) => {
  syncStatusListeners.add(listener);
  return () => syncStatusListeners.delete(listener);
};

export const flushSubmissionOutbox = async (submit) => {
  if (!(await checkServerOnline())) return;
  const queued = await getQueuedSubmissions();
  for (const item of queued) {
    try {
      await submit(item);
      await removeQueuedSubmission(item.id);
    } catch (error) {
      // Keep the item queued; the next online event can retry it.
      console.error("Unable to sync offline submission", error);
    }
  }
};

export const readCachedJson = async (key) => {
  const cached = await getCachedResponse(key);
  return cached?.payload ?? null;
};
