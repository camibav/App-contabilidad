import { describe, expect, it, vi, afterEach } from "vitest";
import { confirmAction } from "../confirm-action.js";

afterEach(() => {
  vi.restoreAllMocks();
  delete globalThis.window;
});

describe("confirmAction", () => {
  it("retorna false cuando no hay window.confirm disponible", async () => {
    await expect(confirmAction("Mensaje")).resolves.toBe(false);
  });

  it("usa window.confirm como fallback cuando no hay elementos de modal", async () => {
    globalThis.window = {
      confirm: vi.fn(() => true),
    };

    await expect(
      confirmAction({
        title: "Título",
        message: "Mensaje crítico",
      })
    ).resolves.toBe(true);

    expect(window.confirm).toHaveBeenCalledWith("Título\n\nMensaje crítico");
  });

  it("resuelve true al confirmar en el modal personalizado", async () => {
    const dialog = buildDialogMock();
    const elements = buildElementsMock(dialog);

    const resultPromise = confirmAction({
      elements,
      title: "Eliminar",
      message: "Mensaje",
      confirmLabel: "Aceptar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });

    elements.confirmDialogConfirmButton.click();

    await expect(resultPromise).resolves.toBe(true);
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.close).toHaveBeenCalledWith("confirmed");
  });

  it("resuelve false al cancelar en el modal personalizado", async () => {
    const dialog = buildDialogMock();
    const elements = buildElementsMock(dialog);

    const resultPromise = confirmAction({
      elements,
      title: "Eliminar",
      message: "Mensaje",
      tone: "warning",
    });

    elements.confirmDialogCancelButton.click();

    await expect(resultPromise).resolves.toBe(false);
    expect(dialog.close).toHaveBeenCalledWith("cancelled");
  });
});

function buildDialogMock() {
  const listeners = new Map();

  return {
    open: false,
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    showModal: vi.fn(function showModal() {
      this.open = true;
    }),
    close: vi.fn(function close() {
      this.open = false;
    }),
    addEventListener: vi.fn((eventName, listener) => {
      listeners.set(eventName, listener);
    }),
    removeEventListener: vi.fn((eventName) => {
      listeners.delete(eventName);
    }),
  };
}

function buildElementsMock(dialog) {
  return {
    confirmDialog: dialog,
    confirmDialogTitle: { textContent: "" },
    confirmDialogMessage: { textContent: "" },
    confirmDialogConfirmButton: buildButtonMock(),
    confirmDialogCancelButton: buildButtonMock(),
  };
}

function buildButtonMock() {
  const listeners = new Map();

  return {
    textContent: "",
    focus: vi.fn(),
    addEventListener: vi.fn((eventName, listener) => {
      listeners.set(eventName, listener);
    }),
    removeEventListener: vi.fn((eventName) => {
      listeners.delete(eventName);
    }),
    click() {
      listeners.get("click")?.();
    },
  };
}
