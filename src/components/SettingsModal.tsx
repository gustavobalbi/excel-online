import { useState } from "react";
import { api } from "../api/client";
import { CONFIG } from "../config";
import { getCodigo, setCodigo } from "../lib/connectionCode";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [codigo, setCodigoState] = useState(getCodigo() ?? "");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setBusy(true);
    setErro(null);
    try {
      const res = await api.generateCode();
      setRevealed(res.codigo);       // mostrado só uma vez
      setCodigo(res.codigo);
      setCodigoState(res.codigo);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gerar código");
    } finally {
      setBusy(false);
    }
  }

  function salvar() {
    setCodigo(codigo.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Configurações</h3>
        <p style={{ fontSize: 13, color: "#666" }}>
          Relatório: <b>{CONFIG.cod_relatorio}</b> — {CONFIG.nome_relatorio}
        </p>

        <label>Código da Conexão</label>
        <input
          value={codigo}
          onChange={(e) => setCodigoState(e.target.value)}
          placeholder="cole aqui o Código da Conexão"
        />

        {revealed && (
          <>
            <label>Código gerado (guarde agora — não será mostrado de novo)</label>
            <div className="code-reveal">{revealed}</div>
          </>
        )}

        {erro && <p style={{ color: "#c0392b", fontSize: 13 }}>{erro}</p>}

        <div className="row">
          <button onClick={gerar} disabled={busy}>
            Gerar / regerar código
          </button>
          <button className="primary" onClick={salvar}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
