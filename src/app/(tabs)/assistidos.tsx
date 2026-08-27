import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SlidersHorizontal } from "lucide-react-native";
import { FilmeCard } from "@/components/filmes/FilmeCard";
import {
  FiltrosAssistidosSheet,
  type OrdenacaoAssistidos,
  type Premiacao,
} from "@/components/filmes/FiltrosAssistidosSheet";
import { listarFilmes } from "@/lib/actions/filmes";
import type { Filme } from "@/lib/domain/types";

const GAP = 12;
const PADDING = 16;
const COLUNAS = 2;

export default function AssistidosScreen() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState("");
  const [diretor, setDiretor] = useState("");
  const [premiacao, setPremiacao] = useState<Premiacao>("");
  const [ordenar, setOrdenar] = useState<OrdenacaoAssistidos>("minha");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const largura = Dimensions.get("window").width;
  const larguraCard = (largura - PADDING * 2 - GAP * (COLUNAS - 1)) / COLUNAS;

  const carregar = useCallback(async () => {
    const resultado = await listarFilmes("assistido");
    if (resultado.ok && resultado.data) setFilmes(resultado.data);
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const diretores = useMemo(
    () => [...new Set(filmes.filter((f) => f.diretor).map((f) => f.diretor!.trim()))].sort(),
    [filmes]
  );

  const lista = useMemo(() => {
    let l = filmes;
    const q = busca.toLowerCase();
    if (q) l = l.filter((f) => `${f.titulo} ${f.diretor ?? ""} ${f.atores ?? ""}`.toLowerCase().includes(q));
    if (genero) l = l.filter((f) => f.generos.includes(genero));
    if (diretor) l = l.filter((f) => (f.diretor ?? "").trim() === diretor);
    if (premiacao === "oscarWin") l = l.filter((f) => f.oscar === "ganhou");
    if (premiacao === "oscarNom") l = l.filter((f) => f.oscar === "indicado" || f.oscar === "ganhou");
    if (premiacao === "any") l = l.filter((f) => f.oscar || f.premios);

    return [...l].sort((a, b) => {
      if (ordenar === "minha") return (b.minhaNota ?? 0) - (a.minhaNota ?? 0);
      if (ordenar === "imdb") return (b.notaImdb ?? 0) - (a.notaImdb ?? 0);
      if (ordenar === "title") return a.titulo.localeCompare(b.titulo);
      if (ordenar === "year") return (b.ano ?? 0) - (a.ano ?? 0);
      if (ordenar === "dir") return (a.diretor || "zzz").localeCompare(b.diretor || "zzz");
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
  }, [filmes, busca, genero, diretor, premiacao, ordenar]);

  const filtrosAtivos = [genero, diretor, premiacao].filter(Boolean).length;

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 p-4 pb-2">
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por título, diretor, ator..."
          placeholderTextColor="#737373"
          className="flex-1 rounded-md border border-border px-3 py-2.5 text-sm text-foreground"
        />
        <Pressable
          onPress={() => setFiltrosAbertos(true)}
          className="flex-row items-center gap-1.5 rounded-md border border-border px-3 py-2.5"
        >
          <SlidersHorizontal size={16} color="#a3a3a3" />
          {filtrosAtivos > 0 && (
            <View className="size-4 items-center justify-center rounded-full bg-accent">
              <Text className="text-[10px] font-bold text-white">{filtrosAtivos}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {lista.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-5xl">🍿</Text>
          <Text className="text-center text-lg font-bold text-foreground">Nada por aqui</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Adicione filmes que você já assistiu.
          </Text>
          <Pressable
            onPress={() => router.push("/filme/novo?status=assistido")}
            className="mt-1 rounded-md bg-accent px-4 py-2.5"
          >
            <Text className="text-sm font-semibold text-white">+ Adicionar filme</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={lista}
          key={COLUNAS}
          numColumns={COLUNAS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: PADDING, gap: GAP }}
          columnWrapperStyle={{ gap: GAP }}
          renderItem={({ item }) => (
            <FilmeCard filme={item} largura={larguraCard} onPress={() => router.push(`/filme/${item.id}`)} />
          )}
        />
      )}

      <Pressable
        onPress={() => router.push("/filme/novo?status=assistido")}
        className="absolute bottom-6 right-6 size-14 items-center justify-center rounded-full bg-accent shadow-lg"
      >
        <Text className="text-2xl text-white">+</Text>
      </Pressable>

      <FiltrosAssistidosSheet
        visible={filtrosAbertos}
        onClose={() => setFiltrosAbertos(false)}
        genero={genero}
        onGenero={setGenero}
        diretor={diretor}
        onDiretor={setDiretor}
        diretoresDisponiveis={diretores}
        premiacao={premiacao}
        onPremiacao={setPremiacao}
        ordenar={ordenar}
        onOrdenar={setOrdenar}
      />
    </View>
  );
}
