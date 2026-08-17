import type { ApiClient } from "./types";
import { MockApiClient } from "./mockClient";
import { HttpApiClient } from "./httpClient";

// Único ponto de decisão entre "sem servidor" (mock) e "com servidor" (DRF).
// Sem VITE_API_BASE_URL definido, roda no modo mock — é o estado atual.
const base = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api: ApiClient = base ? new HttpApiClient(base) : new MockApiClient();

export const usandoMock = !base;
