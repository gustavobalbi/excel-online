import type {
  ApiClient,
  GenerateCodeResult,
  PublishRequest,
  PublishResult,
} from "./types";
import { ApiError } from "./types";

// Cliente HTTP real contra o back (Django + DRF). Ainda não usado por padrão
// (não há servidor). Quando o back subir, aponte VITE_API_BASE_URL.
//
// Endpoints previstos (escopo 1 usuário + 1 relatório):
//   POST /api/codigo/       -> gera o Código da Conexão único
//   POST /api/publicar/     -> publica (Código vai no header)

async function req<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.detail ?? body.message ?? msg;
    } catch {
      /* corpo não-JSON */
    }
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export class HttpApiClient implements ApiClient {
  private base: string;
  constructor(base: string) {
    this.base = base;
  }

  generateCode(): Promise<GenerateCodeResult> {
    return req<GenerateCodeResult>(this.base, "/api/codigo/", { method: "POST" });
  }

  publish(reqBody: PublishRequest, codigo: string): Promise<PublishResult> {
    // O Código da Conexão NÃO vai no corpo: segue em header, sobre HTTPS (§4).
    return req<PublishResult>(this.base, "/api/publicar/", {
      method: "POST",
      headers: { "X-Codigo-Conexao": codigo },
      body: JSON.stringify(reqBody),
    });
  }
}
