import { z } from "zod";

export const elencoItemSchema = z.object({
  nome: z.string(),
  personagem: z.string(),
  foto: z.string().nullable(),
});

export const providerItemSchema = z.object({
  nome: z.string(),
  logo: z.string().nullable(),
  tipo: z.string(),
});

export const filmeInputSchema = z.object({
  legadoId: z.string().nullable().optional(),
  titulo: z.string().min(1, "Dá um nome pro filme."),
  ano: z.number().int().nullable().optional(),
  generos: z.array(z.string()).optional(),
  diretor: z.string().nullable().optional(),
  atores: z.string().nullable().optional(),
  duracao: z.number().int().nullable().optional(),
  onde: z.string().nullable().optional(),
  minhaNota: z.number().int().min(1).max(10).nullable().optional(),
  notaImdb: z.number().min(0).max(10).nullable().optional(),
  oscar: z.enum(["", "ganhou", "indicado"]).optional(),
  premios: z.string().nullable().optional(),
  obs: z.string().nullable().optional(),
  companhia: z.string().nullable().optional(),
  favorito: z.boolean().optional(),
  rever: z.boolean().optional(),
  ordem: z.number().int().nullable().optional(),
  ordemRever: z.number().int().nullable().optional(),
  status: z.enum(["assistido", "quero"]),
  posterUrl: z.string().nullable().optional(),
  tmdbId: z.number().int().nullable().optional(),
  imdbId: z.string().nullable().optional(),
  sinopse: z.string().nullable().optional(),
  elenco: z.array(elencoItemSchema).optional(),
  providers: z.array(providerItemSchema).optional(),
  providerLink: z.string().nullable().optional(),
  addedAt: z.string().optional(),
});

export type FilmeInput = z.infer<typeof filmeInputSchema>;
