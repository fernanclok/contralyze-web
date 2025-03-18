export function clearLocalStorage() {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }