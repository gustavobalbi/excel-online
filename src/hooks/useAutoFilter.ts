import { useCallback, useRef } from "react";
import type { UniverHandle } from "../lib/univer";

export function useAutoFilter(handle: UniverHandle | null) {
  const autoFilterAppliedRef = useRef(false);

  const enableAutoFilter = useCallback(() => {
    if (!handle || autoFilterAppliedRef.current) return;

    try {
      const workbook = handle.univerAPI.getActiveWorkbook();
      if (!workbook) return;

      const worksheet = workbook.getActiveSheet();
      if (!worksheet) return;

      // Aplicar AutoFilter na primeira linha (header)
      // Univer.js aplica AutoFilter via SetRowFilterCommand
      const command = {
        id: "sheet.command.set-filter-criteria",
        params: {
          sheetId: worksheet.getSheetId(),
          range: {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 100, // assumir 100 colunas como limite
          },
        },
      };

      // Tentar executar comando (pode não estar disponível na versão)
      try {
        handle.univerAPI.executeCommand(command);
        autoFilterAppliedRef.current = true;
      } catch {
        // Versão do Univer pode não suportar este comando
        // AutoFilter pode ser habilitado via UI do usuário
        console.debug("AutoFilter não disponível nesta versão do Univer");
      }
    } catch (e) {
      console.debug("Erro ao habilitar AutoFilter:", e);
    }
  }, [handle]);

  return { enableAutoFilter };
}
