import type { DadosEnriquecidos, ProviderItem, TopFilmeItem } from "@/lib/domain/types";
import { apiFetch } from "./config";

// Espelha src/app/api/tmdb/*/route.ts do BatataFlix Web.

export function tmdbSearch(titulo: string, ano?: number | null): Promise<DadosEnriquecidos | null> {
  const params = new URLSearchParams({ titulo });
  if (ano) params.set("ano", String(ano));
  return apiFetch(`/api/tmdb/search?${params.toString()}`);
}

export function tmdbDetails(tmdbId: number): Promise<DadosEnriquecidos | null> {
  return apiFetch(`/api/tmdb/details?tmdbId=${tmdbId}`);
}

export function tmdbProviders(tmdbId: number): Promise<ProviderItem[]> {
  return apiFetch(`/api/tmdb/providers?tmdbId=${tmdbId}`);
}

export function tmdbTopRated(page: number): Promise<{ page: number; items: TopFilmeItem[] }> {
  return apiFetch(`/api/tmdb/top-rated?page=${page}`);
}
