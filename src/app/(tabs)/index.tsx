import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarPanel } from "@/components/dashboard/BarPanel";
import { listarFilmes } from "@/lib/actions/filmes";
import { computeDashboardStats } from "@/lib/domain/dashboard-stats";
import type { Filme } from "@/lib/domain/types";

const GAP = 10;
const PADDING = 16;

export default function PainelScreen() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const largura = Dimensions.get("window").width;
  const larguraCard = (largura - PADDING * 2 - GAP * 2) / 3;

  const carregar = useCallback(async (comAtualizando = false) => {
    if (comAtualizando) setAtualizando(true);
    const resultado = await listarFilmes();
    if (resultado.ok && resultado.data) {
      setFilmes(resultado.data);
      setErro(null);
    } else {
      setErro(resultado.error ?? "Falha ao carregar filmes.");
    }
    setCarregando(false);
    setAtualizando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar(false);
    }, [carregar])
  );

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (filmes.length === 0) {
    return (
      <ScrollView
        contentContainerClassName="flex-1 items-center justify-center gap-3 px-8 py-20"
        className="bg-background"
      >
        <Text className="text-5xl">🥔🎬</Text>
        <Text className="text-center text-lg font-bold text-foreground">
          O Batata está com fome de filme!
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          Comece adicionando um filme ou explorando o Top IMDb.
        </Text>
        <Pressable
          onPress={() => router.push("/filme/novo?status=assistido")}
          className="mt-2 rounded-md bg-accent px-4 py-2.5"
        >
          <Text className="text-sm font-semibold text-white">+ Adicionar filme</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const stats = computeDashboardStats(filmes);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => carregar(true)} />}
    >
      {erro && <Text className="text-sm text-destructive">{erro}</Text>}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
        <StatCard icone="🍿" valor={stats.assistidosCount} label="Assistidos" largura={larguraCard} />
        <StatCard icone="⭐" valor={stats.mediaNota} label="Nota média" largura={larguraCard} />
        <StatCard icone="🕐" valor={`${stats.horasTotais}h`} label="Maratona total" largura={larguraCard} />
        <StatCard icone="🎯" valor={stats.naFilaCount} label="Na fila" largura={larguraCard} />
        <StatCard icone="🏆" valor={stats.oscarsCount} label="Oscars" largura={larguraCard} />
        <StatCard icone="🎞️" valor={stats.decadaFavorita} label="Década favorita" largura={larguraCard} />
      </View>

      <View className="gap-3 rounded-xl border border-border bg-card p-4">
        <Text className="text-base font-semibold text-foreground">🏆 Melhores notas do Batata</Text>
        {stats.topNotas.length === 0 ? (
          <Text className="text-sm text-muted-foreground">Dê notas aos seus filmes para ver o ranking.</Text>
        ) : (
          stats.topNotas.map((f, i) => (
            <Pressable
              key={f.id}
              onPress={() => router.push(`/filme/${f.id}`)}
              className="flex-row items-center gap-3 rounded-lg bg-secondary/50 p-2.5"
            >
              <Text className="w-6 shrink-0 text-base font-black text-amber-400">{i + 1}º</Text>
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-sm font-bold text-foreground">
                  {f.titulo}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {f.ano} {f.diretor ? `· ${f.diretor}` : ""}
                </Text>
              </View>
              <Text className="shrink-0 text-lg font-black text-green-500">{f.minhaNota}</Text>
            </Pressable>
          ))
        )}
      </View>

      <BarPanel titulo="🎭 Gêneros favoritos" itens={stats.generoBars} vazio="Adicione gêneros aos filmes." />
      <BarPanel titulo="🎬 Diretores mais vistos" itens={stats.diretorBars} vazio="Adicione a direção dos filmes." />
      <BarPanel titulo="📅 Sua evolução (últimos 6 meses)" itens={stats.monthBars} vazio="" />
    </ScrollView>
  );
}
