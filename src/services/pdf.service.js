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
    onStatus(`Leyendo texto embebido de la página ${pageNumber} de ${pdf.numPages}...`);

    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = buildPageTextFromItems(textContent.items);

    if (pageText.trim()) {
      pagesText.push(`--- PÁGINA ${pageNumber} ---\n${pageText}`);
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
    console.log("Módulo Tesseract:", tesseractModule);
    throw new Error("No se encontró la función createWorker de Tesseract.");
  }

  const worker = await createWorker("spa", 1, {
    logger: (message) => {
      if (message.status && typeof message.progress === "number") {
        const progress = Math.round(message.progress * 100);
        onStatus(`OCR ${translateOcrStatus(message.status)}: ${progress}%`);
      }
    },
  });

  const pagesText = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      onStatus(`Renderizando página ${pageNumber} de ${pdf.numPages} para OCR...`);

      const page = await pdf.getPage(pageNumber);
      const canvas = await renderPageToCanvas(page, 3);

      onStatus(`Ejecutando OCR en la página ${pageNumber} de ${pdf.numPages}...`);

      const result = await worker.recognize(canvas);
      const pageText = result.data.text.trim();

      pagesText.push(`--- PÁGINA ${pageNumber} OCR ---\n${pageText}`);

      page.cleanup();
    }

    return pagesText.join("\n\n");
  } finally {
    await worker.terminate();
  }
}

function buildPageTextFromItems(items = []) {
  const rows = [];
  const yTolerance = 2;

  for (const item of items) {
    if (typeof item.str !== "string" || !item.str.trim()) {
      continue;
    }

    const x = Number(item.transform?.[4] ?? 0);
    const y = Number(item.transform?.[5] ?? 0);

    let row = rows.find((currentRow) => Math.abs(currentRow.y - y) <= yTolerance);

    if (!row) {
      row = {
        y,
        items: [],
      };

      rows.push(row);
    }

    row.items.push({
      x,
      text: item.str.trim(),
    });
  }

  return rows
    .sort((firstRow, secondRow) => secondRow.y - firstRow.y)
    .map((row) =>
      row.items
        .sort((firstItem, secondItem) => firstItem.x - secondItem.x)
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .join("\n");
}

async function renderPageToCanvas(page, scale = 3) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo crear el contexto Canvas.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}


function translateOcrStatus(status) {
  const normalizedStatus = String(status ?? "").toLowerCase();
  const statusLabels = {
    "loading tesseract core": "cargando núcleo de Tesseract",
    "initializing tesseract": "inicializando Tesseract",
    "loading language traineddata": "cargando datos del idioma",
    "initializing api": "inicializando API de OCR",
    "recognizing text": "reconociendo texto",
  };

  return statusLabels[normalizedStatus] ?? status;
}
