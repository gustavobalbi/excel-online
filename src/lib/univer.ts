import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import sheetsCorePtBR from "@univerjs/preset-sheets-core/locales/pt-BR";
import "@univerjs/preset-sheets-core/lib/index.css";

import type { WorkbookSnapshot } from "../api/types";

export interface UniverHandle {
  univerAPI: ReturnType<typeof createUniver>["univerAPI"];
  dispose: () => void;
}

/** Cria uma instância do Univer montada no container e devolve a Facade API + dispose. */
export function mountUniver(container: HTMLElement): UniverHandle {
  const { univer, univerAPI } = createUniver({
    locale: LocaleType.PT_BR,
    locales: { [LocaleType.PT_BR]: mergeLocales(sheetsCorePtBR) },
    presets: [UniverSheetsCorePreset({ container })],
  });

  return {
    univerAPI,
    dispose: () => univer.dispose(),
  };
}

/** Snapshot do workbook ativo — vira o payload cru (bronze), workbook inteiro em JSON. */
export function saveActiveSnapshot(handle: UniverHandle): WorkbookSnapshot | null {
  const wb = handle.univerAPI.getActiveWorkbook();
  return wb ? (wb.save() as unknown as WorkbookSnapshot) : null;
}

/** Extrai abas (matriz de células) de um snapshot do Univer — usado para exportar .xlsx. */
export function snapshotToSheets(
  snapshot: WorkbookSnapshot,
): { name: string; rows: (string | number | null)[][] }[] {
  const sheets = (snapshot as { sheets?: Record<string, {
    name?: string;
    cellData?: Record<string, Record<string, { v?: string | number }>>;
  }> }).sheets ?? {};

  return Object.values(sheets).map((s) => {
    const cellData = s.cellData ?? {};
    let maxR = 0;
    let maxC = 0;
    for (const r of Object.keys(cellData)) {
      maxR = Math.max(maxR, Number(r));
      for (const c of Object.keys(cellData[r])) maxC = Math.max(maxC, Number(c));
    }
    const rows: (string | number | null)[][] = [];
    for (let r = 0; r <= maxR; r++) {
      const row: (string | number | null)[] = [];
      for (let c = 0; c <= maxC; c++) row.push(cellData[r]?.[c]?.v ?? null);
      rows.push(row);
    }
    return { name: s.name ?? "Planilha", rows };
  });
}

/** Converte abas lidas de um .xlsx no formato de dados de workbook que o Univer cria. */
export function buildWorkbookData(
  sheets: { name: string; rows: (string | number | null)[][] }[],
): WorkbookSnapshot {
  const sheetOrder: string[] = [];
  const sheetsObj: Record<string, unknown> = {};

  sheets.forEach((s, i) => {
    const id = `sheet-${i}`;
    sheetOrder.push(id);

    const cellData: Record<number, Record<number, { v: string | number }>> = {};
    let maxCols = 1;
    s.rows.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val === null || val === "") return;
        (cellData[r] ??= {})[c] = { v: val };
        if (c + 1 > maxCols) maxCols = c + 1;
      });
    });

    sheetsObj[id] = {
      id,
      name: s.name,
      cellData,
      rowCount: Math.max(100, s.rows.length + 10),
      columnCount: Math.max(26, maxCols + 5),
    };
  });

  return {
    id: `wb-${Date.now()}`,
    name: "Importado",
    sheetOrder,
    sheets: sheetsObj,
  };
}
