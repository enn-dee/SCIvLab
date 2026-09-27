import { apiFetch } from "../utils/api";
import {
  getOfflineDraft,
  getAutoSyncDrafts,
  isAutoSyncEnabled,
  publishAutoSyncStatus,
  removeOfflineDraft,
} from "./offlineMode";
import { getQueuedSubmissions } from "./offlineDb";

let activeSync = null;

const attemptKey = (draft) =>
  `scivlab:auto-sync-attempt:${localStorage.getItem("user") || "anonymous"}:${draft.practicalId}:${draft.language}`;

const draftSignature = (draft) => `${draft.savedAt}:${draft.code}`;

export const syncAutoSyncDrafts = () => {
  if (activeSync) return activeSync;

  activeSync = (async () => {
    let queuedSubmissions;
    try {
      queuedSubmissions = await getQueuedSubmissions();
    } catch (error) {
      console.error("Unable to inspect queued offline submissions", error);
      queuedSubmissions = [];
    }

    const queuedKeys = new Set(
      queuedSubmissions.map(
        (item) => `${item.practicalId}:${item.language}`,
      ),
    );
    const drafts = getAutoSyncDrafts();
    for (const draft of drafts) {
      if (!isAutoSyncEnabled(draft.practicalId)) continue;
      const queuedKey = `${draft.practicalId}:${draft.language}`;
      if (queuedKeys.has(queuedKey)) continue;
      const currentDraft = getOfflineDraft(draft.practicalId, draft.language);
      if (
        !currentDraft ||
        currentDraft.savedAt !== draft.savedAt ||
        currentDraft.code !== draft.code
      ) {
        continue;
      }
      const key = attemptKey(draft);
      if (localStorage.getItem(key) === draftSignature(draft)) continue;

      publishAutoSyncStatus({
        state: "syncing",
        draft,
        labName: draft.labName,
        practicalTitle: draft.practicalTitle,
      });

      try {
        const testResponse = await apiFetch(
          `submissions/${draft.practicalId}/run?all=1`,
          {
            method: "POST",
            body: JSON.stringify({
              solutionCode: draft.code,
              language: draft.language,
            }),
          },
        );
        const testData = await testResponse.json();
        if (!testResponse.ok) {
          throw new Error(testData.error || "Unable to run test cases");
        }
        if (!Array.isArray(testData.results) || !testData.results.length) {
          throw new Error("No test case results were returned; draft was not submitted");
        }

        const latestDraft = getOfflineDraft(draft.practicalId, draft.language);
        if (
          !isAutoSyncEnabled(draft.practicalId) ||
          latestDraft?.savedAt !== draft.savedAt ||
          latestDraft?.code !== draft.code
        ) {
          publishAutoSyncStatus({
            state: "cancelled",
            draft,
            labName: draft.labName,
            practicalTitle: draft.practicalTitle,
            message: isAutoSyncEnabled(draft.practicalId)
              ? "The draft changed during testing; the newer draft was kept."
              : "Auto sync was turned off; the draft was kept.",
          });
          continue;
        }

        const failedTests = (testData.results || []).filter(
          (result) => !result.passed,
        );
        if (failedTests.length) {
          localStorage.setItem(key, draftSignature(draft));
          publishAutoSyncStatus({
            state: "failed",
            draft,
            labName: draft.labName,
            practicalTitle: draft.practicalTitle,
            failedTests,
          });
          continue;
        }

        const submitResponse = await apiFetch(
          `submissions/${draft.practicalId}/submit`,
          {
            method: "POST",
            body: JSON.stringify({
              solutionCode: draft.code,
              language: draft.language,
              idempotencyKey: `auto-${draft.syncId}`,
            }),
          },
        );
        const submitData = await submitResponse.json();
        if (!submitResponse.ok) {
          throw new Error(submitData.error || "Unable to submit draft");
        }

        const savedDraft = getOfflineDraft(draft.practicalId, draft.language);
        if (
          savedDraft?.savedAt === draft.savedAt &&
          savedDraft?.code === draft.code
        ) {
          removeOfflineDraft(draft.practicalId, draft.language);
        }
        localStorage.removeItem(key);
        publishAutoSyncStatus({
          state: "success",
          draft,
          labName: draft.labName,
          practicalTitle: draft.practicalTitle,
        });
      } catch (error) {
        console.error("Unable to auto-sync offline draft", error);
        publishAutoSyncStatus({
          state: "error",
          draft,
          labName: draft.labName,
          practicalTitle: draft.practicalTitle,
          message: error.message,
        });
      }
    }
  })().finally(() => {
    activeSync = null;
  });

  return activeSync;
};
