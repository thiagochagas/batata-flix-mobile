// Porte verbatim de src/lib/domain/types.ts do BatataFlix Web — mesmos
// campos (camelCase), só sem os tipos exclusivos de banner/tema visual
// (BannerModo/bannerImagem*), que não fazem sentido no app mobile.

export type StatusFilme = "assistido" | "quero";
export type Oscar = "" | "ganhou" | "indicado";

export interface ElencoItem {
  nome: string;
  personagem: string;
  foto: string | null;
}

export interface ProviderItem {
  nome: string;
  logo: string | null;
  tipo: string;
}

export interface Filme {
  id: string;
  usuarioId: string;
  legadoId: string | null;
  titulo: string;
  ano: number | null;
  generos: string[];
  diretor: string | null;
  atores: string | null;
  duracao: number | null;
  onde: string | null;
  minhaNota: number | null;
  notaImdb: number | null;
  oscar: Oscar;
  premios: string | null;
  obs: string | null;
  companhia: string | null;
  favorito: boolean;
  rever: boolean;
  ordem: number | null;
  ordemRever: number | null;
  status: StatusFilme;
  posterUrl: string | null;
  tmdbId: number | null;
  imdbId: string | null;
  sinopse: string | null;
  elenco: ElencoItem[];
  providers: ProviderItem[];
  providerLink: string | null;
  addedAt: string;
}

export type Tema = "dark" | "light";

// Configurações relevantes no mobile — sem bannerModo/bannerImagem* (fundo
// customizado é uma tela cheia, feature exclusiva do app web/desktop).
export interface Configuracoes {
  usuarioId: string;
  tema: Tema;
  corDestaque: string;
}

// Retorno das rotas /api/tmdb/* e /api/enriquecer do BatataFlix Web —
// dados prontos para preencher o formulário ou enriquecer um filme já
// existente.
export interface DadosEnriquecidos {
  titulo: string;
  ano: number | null;
  generos: string[];
  diretor: string;
  atores: string;
  elenco: ElencoItem[];
  sinopse: string;
  duracao: number | null;
  posterUrl: string | null;
  tmdbId: number;
  imdbId: string | null;
  notaImdb: number | null;
  providers: ProviderItem[];
  providerLink: string;
}

export interface TopFilmeItem {
  tmdbId: number;
  titulo: string;
  ano: number | null;
  voto: number | null;
  posterUrl: string | null;
}
