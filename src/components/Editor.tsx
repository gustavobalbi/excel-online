import { useEffect, useRef } from "react";
import { mountUniver, type UniverHandle } from "../lib/univer";
import type { WorkbookSnapshot } from "../api/types";

interface EditorProps {
  /** Dados iniciais (ex.: vindos de um .xlsx importado). Sem isso, abre um workbook vazio. */
  data?: WorkbookSnapshot;
  /** Devolve o handle do Univer ao pai (para salvar snapshot / publicar). */
  onReady: (handle: UniverHandle) => void;
}

export function Editor({ data, onReady }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const handle = mountUniver(containerRef.current);
    handle.univerAPI.createWorkbook(data ?? {});
    onReady(handle);
    return () => handle.dispose();
    // remonta quando `data` muda (import troca a referência via key no pai)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="editor-surface" />;
}
