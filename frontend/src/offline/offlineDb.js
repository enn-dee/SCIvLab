const DB_NAME = "scivlab-offline";
const DB_VERSION = 1;
const CACHE_STORE = "api-cache";
const OUTBOX_STORE = "submission-outbox";

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runTransaction = async (storeName, mode, operation) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getCachedResponse = async (key) =>
  runTransaction(CACHE_STORE, "readonly", (store) => store.get(key));

export const cacheResponse = async (key, payload) =>
  runTransaction(CACHE_STORE, "readwrite", (store) =>
    store.put({ key, payload, cachedAt: Date.now() }),
  );

export const queueSubmission = async (submission) =>
  runTransaction(OUTBOX_STORE, "readwrite", (store) =>
    store.put({ ...submission, id: crypto.randomUUID(), createdAt: Date.now() }),
  );

export const getQueuedSubmissions = async () =>
  runTransaction(OUTBOX_STORE, "readonly", (store) => store.getAll());

export const removeQueuedSubmission = async (id) =>
  runTransaction(OUTBOX_STORE, "readwrite", (store) => store.delete(id));
