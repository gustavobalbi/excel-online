import * as XLSX from "xlsx";

// Import/export de .xlsx (SheetJS). Separado do snapshot do Univer de propósito:
// - .xlsx é a ponte com o mundo Excel do usuário (importar/baixar arquivo).
// - o snapshot do Univer é o que vai pro bronze na publicação.
//
// Modelo simples: cada aba vira uma matriz de linhas (array de arrays).
export interface SheetData {
  name: string;
  rows: (string | number | null)[][];
}

/** Lê um .xlsx para uma lista de abas (matriz de células). */
export async function readXlsx(file: File): Promise<SheetData[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: null,
    });
    return { name, rows };
  });
}

/** Gera e baixa um .xlsx a partir de abas (matriz de células). */
export function downloadXlsx(sheets: SheetData[], filename = "planilha.xlsx"): void {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31)); // limite de nome de aba do Excel
  }
  XLSX.writeFile(wb, filename);
}
