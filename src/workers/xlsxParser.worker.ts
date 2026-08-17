// Web Worker para parsing de arquivos XLSX em background (não bloqueia UI)
// Recebe: ArrayBuffer do arquivo
// Envia: Array de sheets ou erro

import * as XLSX from "xlsx";

interface ParserMessage {
  type: "parse";
  arrayBuffer: ArrayBuffer;
}

interface ParsedSheet {
  name: string;
  rows: (string | number | null)[][];
}

interface ProgressMessage {
  type: "progress";
  status: string;
}

interface CompleteMessage {
  type: "complete";
  data: ParsedSheet[];
}

interface ErrorMessage {
  type: "error";
  error: string;
}

type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;

self.onmessage = async (event: MessageEvent<ParserMessage>) => {
  const { type, arrayBuffer } = event.data;

  if (type !== "parse") return;

  try {
    self.postMessage({ type: "progress", status: "Parseando arquivo..." } as ProgressMessage);

    // Parse do XLSX
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const sheets: ParsedSheet[] = [];

    for (let i = 0; i < wb.SheetNames.length; i++) {
      const name = wb.SheetNames[i];
      const ws = wb.Sheets[name];

      self.postMessage({
        type: "progress",
        status: `Processando aba ${i + 1}/${wb.SheetNames.length}: ${name}`,
      } as ProgressMessage);

      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
        header: 1,
        defval: null,
      });

      sheets.push({ name, rows });
    }

    self.postMessage({ type: "complete", data: sheets } as CompleteMessage);
  } catch (e) {
    self.postMessage({
      type: "error",
      error: e instanceof Error ? e.message : "Erro desconhecido",
    } as ErrorMessage);
  }
};

export {};
