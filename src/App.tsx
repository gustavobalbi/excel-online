import { useRef, useState } from "react";
import { Editor } from "./components/Editor";
import { SettingsModal } from "./components/SettingsModal";
import { api, usandoMock } from "./api/client";
import { CONFIG } from "./config";
import type { WorkbookSnapshot } from "./api/types";
import type { UniverHandle } from "./lib/univer";
import { saveActiveSnapshot, buildWorkbookData, snapshotToSheets } from "./lib/univer";
import { readXlsx, downloadXlsx } from "./lib/xlsx";
import { getCodigo } from "./lib/connectionCode";

export default function App() {
  const [status, setStatus] = useState<string>("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // dados iniciais do editor + chave p/ forçar remontagem ao importar
  const [initialData, setInitialData] = useState<WorkbookSnapshot | undefined>();
  const [editorKey, setEditorKey] = useState(0);

  const handleRef = useRef<UniverHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function importar(file: File) {
    const sheets = await readXlsx(file);
    setInitialData(buildWorkbookData(sheets));
    setEditorKey((k) => k + 1); // remonta o editor com os dados importados
    setStatus(`Importado: ${file.name} (${sheets.length} aba(s))`);
  }

  function exportar() {
    const handle = handleRef.current;
    if (!handle) return;
    const snap = saveActiveSnapshot(handle);
    if (!snap) return;
    downloadXlsx(snapshotToSheets(snap), `${CONFIG.cod_relatorio}.xlsx`);
  }

  async function publicar() {
    const handle = handleRef.current;
    if (!handle) return;

    const codigo = getCodigo();
    if (!codigo) {
      setStatus("Defina o Código da Conexão nas configurações antes de publicar.");
      setSettingsOpen(true);
      return;
    }

    const snapshot = saveActiveSnapshot(handle);
    if (!snapshot) {
      setStatus("Nada para publicar.");
      return;
    }

    setStatus("Publicando…");
    try {
      const res = await api.publish(
        { cod_relatorio: CONFIG.cod_relatorio, snapshot },
        codigo,
      );
      setStatus(
        `Publicado ${new Date(res.publicado_em).toLocaleTimeString()} — ` +
          `abas tratadas: ${res.abas_tratadas.join(", ")}`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? `Erro: ${e.message}` : "Erro ao publicar");
    }
  }

  return (
    <div className="app">
      <div className="toolbar">
        <strong style={{ fontSize: 14 }}>{CONFIG.cod_relatorio}</strong>
        <span style={{ fontSize: 13, color: "#888" }}>{CONFIG.nome_relatorio}</span>
        <span style={{ width: 8 }} />
        <button onClick={() => fileInputRef.current?.click()}>Importar .xlsx</button>
        <button onClick={exportar}>Exportar .xlsx</button>
        <button onClick={() => setSettingsOpen(true)}>Configurações</button>
        <span className="spacer" />
        <span className="status">{status}</span>
        {usandoMock && <span className="badge-mock">modo mock (sem servidor)</span>}
        <button className="primary" onClick={publicar}>
          Publicar
        </button>
      </div>

      <Editor
        key={editorKey}
        data={initialData}
        onReady={(h) => (handleRef.current = h)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importar(f);
          e.target.value = "";
        }}
      />

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
