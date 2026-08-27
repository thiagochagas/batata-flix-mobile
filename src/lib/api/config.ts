// Cliente HTTP para as rotas /api/* do BatataFlix Web publicado — usadas só
// pelas buscas que dependem das chaves do TMDb/OMDb (nunca embutidas no
// bundle do app mobile). CRUD de filmes/configurações não passa por aqui:
// vai direto pro Supabase (ver lib/actions/*).

export class ApiChaveAusenteError extends Error {}
export class ApiBaseUrlAusenteError extends Error {}

function baseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new ApiBaseUrlAusenteError(
      "EXPO_PUBLIC_API_BASE_URL não configurado. Defina a URL do BatataFlix Web publicado no .env."
    );
  }
  return url.replace(/\/$/, "");
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (resp.status === 412) {
    const body = (await resp.json().catch(() => null)) as { error?: string } | null;
    throw new ApiChaveAusenteError(body?.error ?? "Chave TMDb/OMDb não configurada no servidor.");
  }
  if (!resp.ok) throw new Error(`Falha na requisição (${resp.status}).`);
  return (await resp.json()) as T;
}
