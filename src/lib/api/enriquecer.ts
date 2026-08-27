import type { DadosEnriquecidos } from "@/lib/domain/types";
import { apiFetch } from "./config";

// Espelha src/app/api/enriquecer/route.ts do BatataFlix Web — orquestra
// busca+detalhes+providers+nota IMDb num só request. Usado pelo formulário,
// pelo detalhe do filme, pelo Top IMDb e pelo "Enriquecer acervo".
export function enriquecer(
  params: { titulo: string; ano?: number | null } | { tmdbId: number }
): Promise<DadosEnriquecidos | null> {
  return apiFetch("/api/enriquecer", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
