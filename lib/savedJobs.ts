const SAVED_JOBS_KEY = "pandawork_saved_job_ids";

function getStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

const SAVED_JOBS_CHANGED = "pandawork_saved_jobs_changed";

function setStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(SAVED_JOBS_CHANGED, { detail: ids }));
  } catch {
    // ignore
  }
}

export function onSavedJobsChange(callback: (ids: string[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<string[]>).detail ?? getStorage());
  window.addEventListener(SAVED_JOBS_CHANGED, handler);
  return () => window.removeEventListener(SAVED_JOBS_CHANGED, handler);
}

export function getSavedJobIds(): string[] {
  return getStorage();
}

export function isJobSaved(jobId: string): boolean {
  return getStorage().includes(jobId);
}

export function addSavedJobId(jobId: string): void {
  const ids = getStorage();
  if (ids.includes(jobId)) return;
  setStorage([...ids, jobId]);
}

export function removeSavedJobId(jobId: string): void {
  setStorage(getStorage().filter((id) => id !== jobId));
}

export function toggleSavedJobId(jobId: string): boolean {
  const ids = getStorage();
  const included = ids.includes(jobId);
  if (included) {
    setStorage(ids.filter((id) => id !== jobId));
    return false;
  }
  setStorage([...ids, jobId]);
  return true;
}
