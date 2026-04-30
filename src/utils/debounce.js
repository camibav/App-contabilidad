export function debounce(callback, delay = 250) {
  let timeoutId = null;

  function debouncedCallback(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback(...args);
    }, delay);
  }

  debouncedCallback.cancel = () => {
    if (!timeoutId) {
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debouncedCallback;
}
