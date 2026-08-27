import { apiFetch } from "./config";

// Espelha src/app/api/omdb/rating/route.ts do BatataFlix Web.
export async function omdbRating(imdbId: string): Promise<number | null> {
  const resp = await apiFetch<{ notaImdb: number | null }>(`/api/omdb/rating?imdbId=${imdbId}`);
  return resp.notaImdb;
}
