import type {
  ApiClient,
  GenerateCodeResult,
  PublishRequest,
  PublishResult,
} from "./types";
import { ApiError } from "./types";

// Servidor simulado em memória enquanto não há conexão ao SQL Server.
// Escopo: um único Código da Conexão global. O hash é persistido em localStorage
// (simulando o "banco") para que o teste offline sobreviva a reloads.

const HASH_KEY = "excelonline:mock:codigoHash";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// hash de brincadeira só p/ o mock (o back real usa SHA-256). Não é segurança de verdade.
function fakeHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
}

function randomCode(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export class MockApiClient implements ApiClient {
  async generateCode(): Promise<GenerateCodeResult> {
    await delay();
    const codigo = randomCode();
    localStorage.setItem(HASH_KEY, fakeHash(codigo)); // guarda só o hash
    return { codigo };
  }

  async publish(req: PublishRequest, codigo: string): Promise<PublishResult> {
    await delay(400);
    const hashEsperado = localStorage.getItem(HASH_KEY);
    if (!hashEsperado) throw new ApiError(409, "Ainda não há Código da Conexão gerado");
    if (fakeHash(codigo) !== hashEsperado) {
      throw new ApiError(401, "Código da Conexão inválido");
    }

    // as "abas" saem das chaves de sheets no snapshot do Univer
    const sheets = (req.snapshot as { sheets?: Record<string, { name?: string }> }).sheets ?? {};
    const abas = Object.values(sheets).map((s) => s.name ?? "Planilha").filter(Boolean);

    return {
      ok: true,
      publicado_em: new Date().toISOString(),
      linhas_bronze: 1,
      abas_tratadas: abas.length ? abas : ["Planilha1"],
    };
  }
}
