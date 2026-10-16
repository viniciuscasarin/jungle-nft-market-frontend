export const RESUME_CONTEXT_KEY = 'nft.resume.context';

export interface ResumeContext {
  userId: string;
  path: string;
  search: string;
  drafts: Record<string, unknown>;
  savedAt: string;
}

export interface RestoredResumeResult {
  path: string;
  search: string;
  drafts: Record<string, unknown>;
  isSameUser: boolean;
}

export interface ResumeStore {
  saveContext(context: ResumeContext): void;
  getContext(): ResumeContext | null;
  clearContext(): void;
  restoreForUser(userId: string): RestoredResumeResult | null;
}

export function createResumeStore(storage?: Storage): ResumeStore {
  const getStorage = (): Storage | undefined => {
    if (storage) return storage;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
    return undefined;
  };

  return {
    saveContext(context: ResumeContext): void {
      try {
        getStorage()?.setItem(RESUME_CONTEXT_KEY, JSON.stringify(context));
      } catch {
        // Fallback gracefully on storage quota or access issues
      }
    },
    getContext(): ResumeContext | null {
      try {
        const raw = getStorage()?.getItem(RESUME_CONTEXT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ResumeContext;
      } catch {
        return null;
      }
    },
    clearContext(): void {
      try {
        getStorage()?.removeItem(RESUME_CONTEXT_KEY);
      } catch {
        // Fallback gracefully
      }
    },
    restoreForUser(userId: string): RestoredResumeResult | null {
      const context = this.getContext();
      if (!context) return null;

      // Clear immediately upon consumption to prevent stale state re-application
      this.clearContext();

      const isSameUser = context.userId === userId;
      return {
        path: context.path,
        search: context.search,
        drafts: isSameUser ? context.drafts : {},
        isSameUser,
      };
    },
  };
}

export const resumeStore: ResumeStore = createResumeStore();
