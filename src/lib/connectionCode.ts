// Código da Conexão único da instância (escopo 1 usuário + 1 relatório).
// No MVP fica em localStorage do navegador. O código em claro vive só do lado
// do cliente; o servidor guarda apenas o hash.

const KEY = "excelonline:codigo";

export function getCodigo(): string | null {
  return localStorage.getItem(KEY);
}

export function setCodigo(codigo: string): void {
  localStorage.setItem(KEY, codigo);
}

export function clearCodigo(): void {
  localStorage.removeItem(KEY);
}
