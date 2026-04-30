import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmAction } from "../confirm-action.js";

const originalWindow = globalThis.window;

describe("confirmAction", () => {
  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("retorna false cuando window.confirm no está disponible", () => {
    globalThis.window = undefined;

    expect(confirmAction("Mensaje")).toBe(false);
  });

  it("delega la confirmación a window.confirm", () => {
    const confirm = vi.fn(() => true);
    globalThis.window = { confirm };

    expect(confirmAction("Mensaje crítico")).toBe(true);
    expect(confirm).toHaveBeenCalledWith("Mensaje crítico");
  });
});
