# Plataforma de Ingestão "Excel Online" — Front-end (MVP)

Editor de planilha no navegador (Univer) que importa/exporta `.xlsx` (SheetJS) e
**publica** o workbook para o back (Django + DRF), que grava no SQL Server e alimenta o Power BI.

**Escopo atual: 1 usuário, 1 relatório.** Sem gestão de múltiplas pastas nem seleção de
relatório — `id_usuario` e `cod_relatorio` são fixos em `src/config.ts`, e há um único
Código da Conexão global.

## Rodar

```bash
npm install
npm run dev
```

Sem `VITE_API_BASE_URL` definido, roda em **modo mock** (sem servidor): a camada de API
é simulada, então dá para testar o fluxo inteiro offline (gerar Código da Conexão,
importar, editar, publicar). Quando o back subir, copie `.env.example` para `.env` e
aponte `VITE_API_BASE_URL` — nenhum componente muda.

## Estrutura

```
src/
  config.ts       usuário e relatório fixos (o "1 e 1" do escopo atual)
  api/
    types.ts      contratos (generateCode, publish) — o acordo com o DRF
    client.ts     factory: mock vs http por env var (único ponto de troca)
    mockClient.ts servidor simulado (código único, hash persistido)
    httpClient.ts DRF real: POST /api/codigo/ e POST /api/publicar/
  lib/
    univer.ts        ciclo de vida do Univer + snapshot <-> abas
    xlsx.ts          import/export .xlsx (SheetJS)
    connectionCode.ts  Código da Conexão único (localStorage por ora)
  components/
    Editor.tsx       monta o Univer
    SettingsModal.tsx  gera/guarda o Código da Conexão
  App.tsx           shell: toolbar + editor + publicação
```

## Fluxo

1. Configurações → **Gerar código** (aparece uma vez; fica guardado localmente).
2. Importar `.xlsx` ou editar direto. Abas livres dentro do único workbook.
3. **Publicar** → snapshot do workbook vai pro back com o código no header.

## Decisões técnicas embutidas

- **Duas serializações distintas**: o *snapshot do Univer* (workbook em JSON) é o payload
  cru (bronze) da publicação; o *.xlsx* é só a ponte de import/export com o Excel do usuário.
- **Código da Conexão** viaja em header (`X-Codigo-Conexao`), nunca no corpo logável;
  cliente guarda o código, servidor guarda só o hash.
- **Front 100% estático** → hospedável na Vercel; o back roda perto do banco.

## Pendências / fora do escopo atual

- Multi-pasta, multi-relatório, multi-usuário, RLS, `dim_pasta`: adiados.
- Bundle grande (Univer traz o motor de documento): code-splitting depois, não urgente.
- Estética/paleta: neutras por ora.
