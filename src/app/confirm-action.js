export function confirmAction(message) {
  if (typeof window === "undefined" || typeof window.confirm !== "function") {
    return false;
  }

  return window.confirm(String(message ?? ""));
}
