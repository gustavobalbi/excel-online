// Escopo atual: 1 usuário + 1 relatório. Estes valores são fixos e ficam
// concentrados aqui — o dia em que virar multi-usuário/multi-relatório,
// isto some e volta a ser dado dinâmico.
export const CONFIG = {
  id_usuario: "u-001",
  nome_usuario: "Usuário Revemar",
  cod_relatorio: "REV-000",
  nome_relatorio: "Relatório único (MVP)",
} as const;
