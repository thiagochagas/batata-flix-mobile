import { useCallback, useState } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { TopFilmeCard } from "@/components/filmes/TopFilmeCard";
import { criarFilme, listarFilmes } from "@/lib/actions/filmes";
import { ApiBaseUrlAusenteError, ApiChaveAusenteError } from "@/lib/api/config";
import { enriquecer } from "@/lib/api/enriquecer";
import { tmdbTopRated } from "@/lib/api/tmdb";
import type { DadosEnriquecidos, Filme, TopFilmeItem } from "@/lib/domain/types";
import type { FilmeInput } from "@/lib/validation/filme";

const MAX_PAGINAS = 50;
const GAP = 12;
const PADDING = 16;
const COLUNAS = 2;

function estaNoAcervo(item: TopFilmeItem, acervo: Filme[]): boolean {
  return acervo.some(
    (f) =>
      (item.tmdbId && f.tmdbId === item.tmdbId) ||
      (f.titulo.toLowerCase() === item.titulo.toLowerCase() && (f.ano ?? "") === (item.ano ?? ""))
  );
}

export default function TopImdbScreen() {
  const [acervo, setAcervo] = useState<Filme[]>([]);
  const [itens, setItens] = useState<TopFilmeItem[]>([]);
  const [pagina, setPagina] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [adicionandoId, setAdicionandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const largura = Dimensions.get("window").width;
  const larguraCard = (largura - PADDING * 2 - GAP * (COLUNAS - 1)) / COLUNAS;

  useFocusEffect(
    useCallback(() => {
      listarFilmes().then((resultado) => {
        if (resultado.ok && resultado.data) setAcervo(resultado.data);
      });
    }, [])
  );

  async function carregarMais() {
    setCarregando(true);
    setErro(null);
    try {
      const data = await tmdbTopRated(pagina + 1);
      setItens((prev) => {
        const vistos = new Set(prev.map((p) => p.tmdbId));
        return [...prev, ...data.items.filter((i) => !vistos.has(i.tmdbId))];
      });
      setPagina(data.page);
    } catch (err) {
      setErro(
        err instanceof ApiChaveAusenteError
          ? "🔑 Configure a chave do TMDb no servidor (.env.local do web)."
          : err instanceof ApiBaseUrlAusenteError
            ? "⚙️ Configure EXPO_PUBLIC_API_BASE_URL no .env."
            : "❌ Erro ao carregar. Verifique internet e a chave TMDb."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function adicionar(item: TopFilmeItem, status: "quero" | "assistido") {
    setAdicionandoId(item.tmdbId);
    setErro(null);
    let dados: DadosEnriquecidos | null = null;
    try {
      dados = await enriquecer({ tmdbId: item.tmdbId });
    } catch {
      // segue com os dados básicos do item, sem enriquecer
    }

    const payload: FilmeInput = {
      titulo: dados?.titulo || item.titulo,
      ano: dados?.ano ?? item.ano,
      diretor: dados?.diretor || null,
      atores: dados?.atores || null,
      duracao: dados?.duracao ?? null,
      onde: null,
      generos: dados?.generos ?? [],
      minhaNota: null,
      notaImdb: dados?.notaImdb ?? item.voto,
      oscar: "",
      premios: null,
      obs: null,
      companhia: null,
      favorito: false,
      rever: false,
      sinopse: dados?.sinopse || null,
      elenco: dados?.elenco ?? [],
      providers: dados?.providers ?? [],
      providerLink: dados?.providerLink || null,
      posterUrl: dados?.posterUrl || item.posterUrl,
      tmdbId: dados?.tmdbId ?? item.tmdbId,
      imdbId: dados?.imdbId ?? null,
      status,
    };

    const resultado = await criarFilme(payload);
    setAdicionandoId(null);
    if (resultado.ok && resultado.data) {
      setAcervo((prev) => [resultado.data!, ...prev]);
    } else {
      setErro(resultado.error ?? "Não deu para adicionar.");
    }
  }

  if (itens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <Text className="text-5xl">🏆</Text>
        <Text className="text-center text-lg font-bold text-foreground">Carregue os melhores filmes</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Precisa de internet e da chave do TMDb configurada no BatataFlix Web. Cada carga traz 20
          títulos, do 1º ao 1000º melhor avaliado.
        </Text>
        {erro && <Text className="text-center text-sm text-destructive">{erro}</Text>}
        <Pressable
          onPress={carregarMais}
          disabled={carregando}
          className="mt-1 rounded-md bg-amber-400 px-4 py-2.5 disabled:opacity-50"
        >
          <Text className="text-sm font-bold text-black">
            {carregando ? "Carregando..." : "⬇️ Carregar Top filmes"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={itens}
        key={COLUNAS}
        numColumns={COLUNAS}
        keyExtractor={(item) => String(item.tmdbId)}
        contentContainerStyle={{ padding: PADDING, gap: GAP }}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <TopFilmeCard
            item={item}
            largura={larguraCard}
            noAcervo={estaNoAcervo(item, acervo)}
            adicionando={adicionandoId === item.tmdbId}
            onAdicionar={(status) => adicionar(item, status)}
          />
        )}
        ListFooterComponent={
          <View className="items-center gap-2 py-4">
            {erro && <Text className="text-center text-sm text-destructive">{erro}</Text>}
            <Text className="text-sm text-muted-foreground">
              {itens.length} filmes carregados (até o {pagina * 20}º)
            </Text>
            {pagina < MAX_PAGINAS ? (
              <Pressable
                onPress={carregarMais}
                disabled={carregando}
                className="rounded-md bg-amber-400 px-4 py-2.5 disabled:opacity-50"
              >
                <Text className="text-sm font-bold text-black">
                  {carregando ? "Carregando..." : "⬇️ Carregar mais 20"}
                </Text>
              </Pressable>
            ) : (
              <Text className="text-sm text-muted-foreground">🏁 Top 1000 completo!</Text>
            )}
          </View>
        }
      />
    </View>
  );
}
