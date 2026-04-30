import { describe, expect, it, vi } from "vitest";
import { debounce } from "../debounce.js";

describe("debounce", () => {
  it("ejecuta el callback solo una vez después del retraso", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 250);

    debouncedCallback("a");
    debouncedCallback("b");
    debouncedCallback("c");

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(249);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("c");

    vi.useRealTimers();
  });

  it("permite cancelar una ejecución pendiente", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 250);

    debouncedCallback();
    debouncedCallback.cancel();
    vi.advanceTimersByTime(250);

    expect(callback).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
