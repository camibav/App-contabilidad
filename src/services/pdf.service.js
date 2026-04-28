import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.mjs";

export async function loadPdfFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();

  return pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;
}

export async function extractEmbeddedPdfText(pdf, onStatus = () => {}) {
  const pagesText = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    onStatus(`Reading embedded text from page ${pageNumber} of ${pdf.numPages}...`);

    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .filter(Boolean)
      .join(" ");

    if (pageText.trim()) {
      pagesText.push(`--- PAGE ${pageNumber} ---\n${pageText}`);
    }

    page.cleanup();
  }

  return pagesText.join("\n\n");
}

export async function extractTextWithOcr(pdf, onStatus = () => {}) {
  const tesseractModule = await import(
    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js"
  );

  const Tesseract = tesseractModule.default ?? tesseractModule;
  const createWorker = Tesseract.createWorker;

  if (typeof createWorker !== "function") {
    console.log("Tesseract module:", tesseractModule);
    throw new Error("Tesseract createWorker function was not found.");
  }

  const worker = await createWorker("spa", 1, {
    logger: (message) => {
      if (message.status && typeof message.progress === "number") {
        const progress = Math.round(message.progress * 100);
        onStatus(`OCR ${message.status}: ${progress}%`);
      }
    },
  });

  const pagesText = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      onStatus(`Rendering page ${pageNumber} of ${pdf.numPages} for OCR...`);

      const page = await pdf.getPage(pageNumber);
      const canvas = await renderPageToCanvas(page, 3);

      onStatus(`Running OCR on page ${pageNumber} of ${pdf.numPages}...`);

      const result = await worker.recognize(canvas);
      const pageText = result.data.text.trim();

      pagesText.push(`--- PAGE ${pageNumber} OCR ---\n${pageText}`);

      page.cleanup();
    }

    return pagesText.join("\n\n");
  } finally {
    await worker.terminate();
  }
}

async function renderPageToCanvas(page, scale = 3) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context could not be created.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}
