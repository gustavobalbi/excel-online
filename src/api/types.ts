// Contratos da API. Escopo atual: 1 usuário + 1 relatório -> não há entidade
// "pasta" nem seleção de relatório. Só o essencial: gerar o Código da Conexão
// e publicar o workbook.

/** Snapshot do workbook do Univer (o payload cru/bronze — workbook inteiro em JSON). */
export type WorkbookSnapshot = Record<string, unknown>;

/** Corpo do POST de publicação. O relatório é fixo (config), vai junto para o back registrar. */
export interface PublishRequest {
  cod_relatorio: string;
  snapshot: WorkbookSnapshot;
}

export interface PublishResult {
  ok: boolean;
  publicado_em: string;         // ISO
  linhas_bronze: number;        // 1 (o "extrato" novo)
  abas_tratadas: string[];      // nomes das abas que o back explodiu na camada tratada
}

/** Retorno da geração do Código da Conexão. O código em claro só aparece UMA vez, aqui. */
export interface GenerateCodeResult {
  codigo: string;               // token forte, mostrado uma única vez ao usuário
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Contrato do cliente. Duas implementações: MockApiClient (sem servidor) e
 * HttpApiClient (DRF). Trocar uma pela outra não toca em nenhum componente.
 */
export interface ApiClient {
  /** Gera (ou regera) o Código da Conexão único da instância. */
  generateCode(): Promise<GenerateCodeResult>;
  /** Publica o workbook. `codigo` é o Código da Conexão guardado nas configurações. */
  publish(req: PublishRequest, codigo: string): Promise<PublishResult>;
}
