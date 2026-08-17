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

      // Nota: AutoFilter nativo do Univer pode ser ativado via UI
      // (clique direito em célula → Filtro Automático)
      // A API de automação via código pode variar conforme a versão do Univer
      // Por enquanto, apenas marcamos que foi tentado
      autoFilterAppliedRef.current = true;
      console.debug("AutoFilter hook ready (use UI para ativar)");
    } catch (e) {
      console.debug("Erro ao preparar AutoFilter:", e);
    }
  }, [handle]);

  return { enableAutoFilter };
}
