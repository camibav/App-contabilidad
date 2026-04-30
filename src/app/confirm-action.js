const DEFAULT_CONFIRM_TITLE = "Confirmar acción";
const DEFAULT_CONFIRM_LABEL = "Confirmar";
const DEFAULT_CANCEL_LABEL = "Cancelar";
const DEFAULT_TONE = "default";
const CONFIRM_DIALOG_TONES = ["default", "danger", "warning", "info"];

export function confirmAction(options = {}) {
  const normalizedOptions = normalizeConfirmOptions(options);

  if (!canUseCustomConfirmDialog(normalizedOptions.elements)) {
    return Promise.resolve(confirmWithNativeDialog(normalizedOptions));
  }

  return openCustomConfirmDialog(normalizedOptions);
}

function normalizeConfirmOptions(options) {
  if (typeof options === "string") {
    return {
      elements: null,
      title: DEFAULT_CONFIRM_TITLE,
      message: options,
      confirmLabel: DEFAULT_CONFIRM_LABEL,
      cancelLabel: DEFAULT_CANCEL_LABEL,
      tone: DEFAULT_TONE,
    };
  }

  const tone = String(options.tone ?? DEFAULT_TONE).trim().toLowerCase();

  return {
    elements: options.elements ?? null,
    title: String(options.title ?? DEFAULT_CONFIRM_TITLE).trim() || DEFAULT_CONFIRM_TITLE,
    message: String(options.message ?? "").trim(),
    confirmLabel:
      String(options.confirmLabel ?? DEFAULT_CONFIRM_LABEL).trim() || DEFAULT_CONFIRM_LABEL,
    cancelLabel:
      String(options.cancelLabel ?? DEFAULT_CANCEL_LABEL).trim() || DEFAULT_CANCEL_LABEL,
    tone: CONFIRM_DIALOG_TONES.includes(tone) ? tone : DEFAULT_TONE,
  };
}

function canUseCustomConfirmDialog(elements) {
  const dialog = elements?.confirmDialog;

  return Boolean(
    dialog &&
      typeof dialog.showModal === "function" &&
      typeof dialog.close === "function" &&
      elements.confirmDialogTitle &&
      elements.confirmDialogMessage &&
      elements.confirmDialogConfirmButton &&
      elements.confirmDialogCancelButton
  );
}

function openCustomConfirmDialog(options) {
  const {
    elements,
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone,
  } = options;

  const dialog = elements.confirmDialog;
  const titleElement = elements.confirmDialogTitle;
  const messageElement = elements.confirmDialogMessage;
  const confirmButton = elements.confirmDialogConfirmButton;
  const cancelButton = elements.confirmDialogCancelButton;

  titleElement.textContent = title;
  messageElement.textContent = message;
  confirmButton.textContent = confirmLabel;
  cancelButton.textContent = cancelLabel;

  resetConfirmDialogTone(dialog);
  dialog.classList.add(`confirm-dialog--${tone}`);

  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = () => {
      confirmButton.removeEventListener("click", handleConfirmClick);
      cancelButton.removeEventListener("click", handleCancelClick);
      dialog.removeEventListener("cancel", handleCancelEvent);
    };

    const complete = (result) => {
      if (resolved) {
        return;
      }

      resolved = true;
      cleanup();

      if (dialog.open) {
        dialog.close(result ? "confirmed" : "cancelled");
      }

      resolve(result);
    };

    const handleConfirmClick = () => complete(true);
    const handleCancelClick = () => complete(false);
    const handleCancelEvent = (event) => {
      event.preventDefault();
      complete(false);
    };

    confirmButton.addEventListener("click", handleConfirmClick);
    cancelButton.addEventListener("click", handleCancelClick);
    dialog.addEventListener("cancel", handleCancelEvent);

    try {
      if (dialog.open) {
        dialog.close("reopened");
      }

      dialog.showModal();
    } catch (error) {
      console.error("No se pudo abrir el modal de confirmación.", error);
      cleanup();
      resolve(confirmWithNativeDialog(options));
      return;
    }

    if (tone === "danger") {
      cancelButton.focus();
      return;
    }

    confirmButton.focus();
  });
}

function resetConfirmDialogTone(dialog) {
  dialog.classList.remove(
    ...CONFIRM_DIALOG_TONES.map((tone) => `confirm-dialog--${tone}`)
  );
}

function confirmWithNativeDialog({ title, message }) {
  if (typeof window === "undefined" || typeof window.confirm !== "function") {
    return false;
  }

  return window.confirm(buildNativeConfirmMessage({ title, message }));
}

function buildNativeConfirmMessage({ title, message }) {
  if (!message) {
    return title;
  }

  return `${title}\n\n${message}`;
}
