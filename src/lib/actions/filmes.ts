import { supabase } from "@/lib/supabase/client";
import type { ElencoItem, Filme, Oscar, ProviderItem, StatusFilme } from "@/lib/domain/types";
import type { FilmeInput } from "@/lib/validation/filme";
import type { ActionResult } from "./types";

// Mesmas colunas/queries de src/lib/storage/filmes.ts do BatataFlix Web,
// só trocando o createClient() com cookies do servidor Next.js pelo client
// do Supabase com sessão persistida no AsyncStorage (mesmo projeto, RLS
// continua sendo aplicada por auth.uid() = usuario_id nas policies).

interface LinhaFilme {
  id: string;
  usuario_id: string;
  legado_id: string | null;
  titulo: string;
  ano: number | null;
  generos: string[];
  diretor: string | null;
  atores: string | null;
  duracao: number | null;
  onde: string | null;
  minha_nota: number | null;
  nota_imdb: number | null;
  oscar: Oscar;
  premios: string | null;
  obs: string | null;
  companhia: string | null;
  favorito: boolean;
  rever: boolean;
  ordem: number | null;
  ordem_rever: number | null;
  status: StatusFilme;
  poster_url: string | null;
  tmdb_id: number | null;
  imdb_id: string | null;
  sinopse: string | null;
  elenco: ElencoItem[];
  providers: ProviderItem[];
  provider_link: string | null;
  added_at: string;
}

function paraFilme(linha: LinhaFilme): Filme {
  return {
    id: linha.id,
    usuarioId: linha.usuario_id,
    legadoId: linha.legado_id,
    titulo: linha.titulo,
    ano: linha.ano,
    generos: linha.generos ?? [],
    diretor: linha.diretor,
    atores: linha.atores,
    duracao: linha.duracao,
    onde: linha.onde,
    minhaNota: linha.minha_nota,
    notaImdb: linha.nota_imdb,
    oscar: linha.oscar,
    premios: linha.premios,
    obs: linha.obs,
    companhia: linha.companhia,
    favorito: linha.favorito,
    rever: linha.rever,
    ordem: linha.ordem,
    ordemRever: linha.ordem_rever,
    status: linha.status,
    posterUrl: linha.poster_url,
    tmdbId: linha.tmdb_id,
    imdbId: linha.imdb_id,
    sinopse: linha.sinopse,
    elenco: linha.elenco ?? [],
    providers: linha.providers ?? [],
    providerLink: linha.provider_link,
    addedAt: linha.added_at,
  };
}

function paraColunas(input: FilmeInput) {
  return {
    legado_id: input.legadoId ?? null,
    titulo: input.titulo,
    ano: input.ano ?? null,
    generos: input.generos ?? [],
    diretor: input.diretor || null,
    atores: input.atores || null,
    duracao: input.duracao ?? null,
    onde: input.onde || null,
    minha_nota: input.status === "quero" ? null : (input.minhaNota ?? null),
    nota_imdb: input.notaImdb ?? null,
    oscar: input.oscar ?? "",
    premios: input.premios || null,
    obs: input.obs || null,
    companhia: input.status === "assistido" ? input.companhia || null : null,
    favorito: input.favorito ?? false,
    rever: input.status === "assistido" ? (input.rever ?? false) : false,
    ordem: input.ordem ?? null,
    ordem_rever: input.ordemRever ?? null,
    status: input.status,
    poster_url: input.posterUrl ?? null,
    tmdb_id: input.tmdbId ?? null,
    imdb_id: input.imdbId ?? null,
    sinopse: input.sinopse ?? null,
    elenco: input.elenco ?? [],
    providers: input.providers ?? [],
    provider_link: input.providerLink ?? null,
  };
}

async function usuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

async function proximoValor(
  userId: string,
  coluna: "ordem" | "ordem_rever",
  eqExtra: Record<string, unknown>
): Promise<number> {
  const { data } = await supabase
    .from("filmes")
    .select(coluna)
    .eq("usuario_id", userId)
    .match(eqExtra);
  const linhas = (data ?? []) as unknown as Record<string, number | null>[];
  const max = Math.max(0, ...linhas.map((r) => r[coluna] ?? 0));
  return max + 1;
}

export async function listarFilmes(
  status?: StatusFilme | StatusFilme[]
): Promise<ActionResult<Filme[]>> {
  try {
    const user = await usuarioAtual();
    let query = supabase.from("filmes").select("*").eq("usuario_id", user.id);
    if (status) {
      query = query.in("status", Array.isArray(status) ? status : [status]);
    }
    const { data, error } = await query.order("added_at", { ascending: false });
    if (error) return { ok: false, error: `Falha ao listar filmes: ${error.message}` };
    return { ok: true, data: (data as LinhaFilme[]).map(paraFilme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao listar filmes." };
  }
}

// Filmes assistidos marcados pra rever — filtra no banco em vez de trazer
// todo o acervo assistido e descartar em JS.
export async function listarFilmesParaRever(): Promise<ActionResult<Filme[]>> {
  try {
    const user = await usuarioAtual();
    const { data, error } = await supabase
      .from("filmes")
      .select("*")
      .eq("usuario_id", user.id)
      .eq("status", "assistido")
      .eq("rever", true)
      .order("added_at", { ascending: false });
    if (error) return { ok: false, error: `Falha ao listar filmes: ${error.message}` };
    return { ok: true, data: (data as LinhaFilme[]).map(paraFilme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao listar filmes." };
  }
}

export async function buscarFilme(id: string): Promise<ActionResult<Filme>> {
  try {
    const user = await usuarioAtual();
    const { data, error } = await supabase
      .from("filmes")
      .select("*")
      .eq("id", id)
      .eq("usuario_id", user.id)
      .maybeSingle();
    if (error || !data) return { ok: false, error: error?.message ?? "Filme não encontrado." };
    return { ok: true, data: paraFilme(data as LinhaFilme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao buscar filme." };
  }
}

export async function criarFilme(input: FilmeInput): Promise<ActionResult<Filme>> {
  try {
    const user = await usuarioAtual();
    const colunas = paraColunas(input);
    if (colunas.status === "quero" && colunas.ordem == null) {
      colunas.ordem = await proximoValor(user.id, "ordem", { status: "quero" });
    }
    if (colunas.rever && colunas.ordem_rever == null) {
      colunas.ordem_rever = await proximoValor(user.id, "ordem_rever", { rever: true });
    }

    const { data, error } = await supabase
      .from("filmes")
      .insert({ ...colunas, usuario_id: user.id })
      .select("*")
      .single();
    if (error) return { ok: false, error: `Falha ao criar filme: ${error.message}` };
    return { ok: true, data: paraFilme(data as LinhaFilme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao criar filme." };
  }
}

export async function atualizarFilme(id: string, input: FilmeInput): Promise<ActionResult<Filme>> {
  try {
    const user = await usuarioAtual();
    const colunas = paraColunas(input);
    if (colunas.status === "quero" && colunas.ordem == null) {
      colunas.ordem = await proximoValor(user.id, "ordem", { status: "quero" });
    }
    if (colunas.rever && colunas.ordem_rever == null) {
      colunas.ordem_rever = await proximoValor(user.id, "ordem_rever", { rever: true });
    }

    const { data, error } = await supabase
      .from("filmes")
      .update(colunas)
      .eq("id", id)
      .eq("usuario_id", user.id)
      .select("*")
      .maybeSingle();
    if (error) return { ok: false, error: `Falha ao atualizar filme: ${error.message}` };
    if (!data) return { ok: false, error: "Filme não encontrado." };
    return { ok: true, data: paraFilme(data as LinhaFilme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao atualizar filme." };
  }
}

export async function excluirFilme(id: string): Promise<ActionResult> {
  try {
    const user = await usuarioAtual();
    const { data, error } = await supabase
      .from("filmes")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: `Falha ao excluir filme: ${error.message}` };
    if (!data) return { ok: false, error: "Filme não encontrado." };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao excluir filme." };
  }
}

// Troca a posição (▲▼) de dois filmes na fila — usada em Quero Ver (campo
// "ordem") e Quero Rever (campo "ordemRever"), mesma mecânica de swap do
// storage/filmes.ts do app web.
export async function reordenarFilmes(
  idA: string,
  idB: string,
  campo: "ordem" | "ordemRever"
): Promise<ActionResult> {
  try {
    const user = await usuarioAtual();
    const coluna = campo === "ordem" ? "ordem" : "ordem_rever";

    const { data, error } = await supabase
      .from("filmes")
      .select(`id, ${coluna}`)
      .eq("usuario_id", user.id)
      .in("id", [idA, idB]);
    if (error) return { ok: false, error: `Falha ao reordenar: ${error.message}` };

    const linhas = data as unknown as Record<string, string | number | null>[];
    const linhaA = linhas.find((l) => l.id === idA);
    const linhaB = linhas.find((l) => l.id === idB);
    if (!linhaA || !linhaB) return { ok: false, error: "Filme não encontrado." };

    const [{ error: erroA }, { error: erroB }] = await Promise.all([
      supabase
        .from("filmes")
        .update({ [coluna]: linhaB[coluna] })
        .eq("id", idA)
        .eq("usuario_id", user.id),
      supabase
        .from("filmes")
        .update({ [coluna]: linhaA[coluna] })
        .eq("id", idB)
        .eq("usuario_id", user.id),
    ]);
    if (erroA || erroB) return { ok: false, error: `Falha ao reordenar: ${(erroA || erroB)?.message}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao reordenar." };
  }
}

export function filmeParaInput(f: Filme): FilmeInput {
  return {
    legadoId: f.legadoId,
    titulo: f.titulo,
    ano: f.ano,
    generos: f.generos,
    diretor: f.diretor,
    atores: f.atores,
    duracao: f.duracao,
    onde: f.onde,
    minhaNota: f.minhaNota,
    notaImdb: f.notaImdb,
    oscar: f.oscar,
    premios: f.premios,
    obs: f.obs,
    companhia: f.companhia,
    favorito: f.favorito,
    rever: f.rever,
    ordem: f.ordem,
    ordemRever: f.ordemRever,
    status: f.status,
    posterUrl: f.posterUrl,
    tmdbId: f.tmdbId,
    imdbId: f.imdbId,
    sinopse: f.sinopse,
    elenco: f.elenco,
    providers: f.providers,
    providerLink: f.providerLink,
  };
}
