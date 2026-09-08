import {
  getCachedResponse,
  getQueuedSubmissions,
  queueSubmission,
  removeQueuedSubmission,
} from "./offlineDb";

export const isOffline = () => !navigator.onLine;

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

export const saveOfflineDraft = (practicalId, language, code) => {
  try {
    localStorage.setItem(
      draftKey(practicalId, language),
      JSON.stringify({ practicalId, language, code, savedAt: Date.now() }),
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

export const flushSubmissionOutbox = async (submit) => {
  if (isOffline()) return;
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
