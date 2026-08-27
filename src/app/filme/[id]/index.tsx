import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Poster } from "@/components/Poster";
import { ratingColor } from "@/lib/domain/filme-utils";
import { atualizarFilme, buscarFilme, excluirFilme, filmeParaInput } from "@/lib/actions/filmes";
import { ApiChaveAusenteError } from "@/lib/api/config";
import { enriquecer } from "@/lib/api/enriquecer";
import { confirmar } from "@/lib/confirm";
import type { DadosEnriquecidos, Filme } from "@/lib/domain/types";

export default function FilmeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filme, setFilme] = useState<Filme | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    buscarFilme(id).then((resultado) => {
      if (resultado.ok && resultado.data) {
        setFilme(resultado.data);
        setErro(null);
      } else {
        setErro(resultado.error ?? "Filme não encontrado.");
      }
      setCarregando(false);
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!filme) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-destructive">{erro ?? "Filme não encontrado."}</Text>
      </View>
    );
  }

  const cor = ratingColor(filme);
  const meta: string[] = [];
  if (filme.ano) meta.push(String(filme.ano));
  if (filme.diretor) meta.push(`🎬 ${filme.diretor}`);
  if (filme.atores) meta.push(`🎭 ${filme.atores}`);
  if (filme.duracao) meta.push(`⏱️ ${filme.duracao} min`);
  if (filme.onde) meta.push(`📺 ${filme.onde}`);
  if (filme.companhia) meta.push(`👥 ${filme.companhia}`);
  if (filme.favorito) meta.push("⭐ Favorito");

  async function buscarOnline() {
    if (!filme) return;
    setBuscando(true);
    setErro(null);
    try {
      const dados: DadosEnriquecidos | null = filme.tmdbId
        ? await enriquecer({ tmdbId: filme.tmdbId })
        : await enriquecer({ titulo: filme.titulo, ano: filme.ano });
      if (!dados) {
        setErro("🤷 Não encontrei esse filme.");
        return;
      }
      const input = filmeParaInput(filme);
      input.ano = dados.ano ?? input.ano;
      input.duracao = dados.duracao ?? input.duracao;
      input.posterUrl = dados.posterUrl ?? input.posterUrl;
      input.tmdbId = dados.tmdbId ?? input.tmdbId;
      input.imdbId = dados.imdbId ?? input.imdbId;
      input.notaImdb = dados.notaImdb ?? input.notaImdb;
      input.sinopse = dados.sinopse ?? input.sinopse;
      input.elenco = dados.elenco.length ? dados.elenco : input.elenco;
      input.providers = dados.providers.length ? dados.providers : input.providers;
      input.providerLink = dados.providerLink || input.providerLink;
      if (!input.diretor && dados.diretor) input.diretor = dados.diretor;
      if (!input.atores && dados.atores) input.atores = dados.atores;
      if ((!input.generos || !input.generos.length) && dados.generos.length) input.generos = dados.generos;

      const resultado = await atualizarFilme(filme.id, input);
      if (resultado.ok) carregar();
      else setErro(resultado.error ?? "Não deu para atualizar.");
    } catch (err) {
      setErro(err instanceof ApiChaveAusenteError ? "🔑 Falta a chave do TMDb no servidor." : "❌ Erro na busca. Sem internet?");
    } finally {
      setBuscando(false);
    }
  }

  async function alternarRever() {
    if (!filme) return;
    setProcessando(true);
    const input = filmeParaInput(filme);
    input.rever = !filme.rever;
    const resultado = await atualizarFilme(filme.id, input);
    setProcessando(false);
    if (resultado.ok) carregar();
  }

  async function moverStatus() {
    if (!filme) return;
    setProcessando(true);
    const input = filmeParaInput(filme);
    input.status = filme.status === "quero" ? "assistido" : "quero";
    const resultado = await atualizarFilme(filme.id, input);
    setProcessando(false);
    if (resultado.ok) router.back();
  }

  function excluir() {
    if (!filme) return;
    confirmar(
      `Excluir "${filme.titulo}"?`,
      "Isso apaga o filme de vez (não dá para desfazer). O Batata vai ficar triste. 🥔",
      async () => {
        setProcessando(true);
        const resultado = await excluirFilme(filme.id);
        setProcessando(false);
        if (resultado.ok) router.back();
        else setErro(resultado.error ?? "Não deu para excluir.");
      }
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 pb-10">
      <View className="flex-row gap-4 bg-secondary/40 p-5">
        <Poster filme={filme} width={88} height={128} radius={10} />
        <View className="flex-1 justify-end pb-1">
          <Text className="text-xl font-black leading-tight text-foreground">{filme.titulo}</Text>
        </View>
      </View>

      <View className="gap-4 px-4">
        <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
          {meta.map((m, i) => (
            <Text key={i} className="text-sm text-muted-foreground">
              {m}
            </Text>
          ))}
        </View>

        {(filme.oscar || filme.premios) && (
          <View className="flex-row flex-wrap gap-1.5">
            {filme.oscar === "ganhou" && (
              <View className="rounded-full bg-amber-400 px-3 py-1">
                <Text className="text-xs font-bold text-black">🏆 Ganhou o Oscar</Text>
              </View>
            )}
            {filme.oscar === "indicado" && (
              <View className="rounded-full bg-amber-400 px-3 py-1">
                <Text className="text-xs font-bold text-black">🎖️ Indicado ao Oscar</Text>
              </View>
            )}
            {filme.premios && (
              <View className="rounded-full bg-amber-400 px-3 py-1">
                <Text className="text-xs font-bold text-black">🏅 {filme.premios}</Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-row gap-3">
          <View className="flex-1 items-center rounded-lg border border-border p-3">
            {filme.status === "quero" ? (
              <Text style={{ color: cor }} className="text-lg font-black">
                🎯 Na fila
              </Text>
            ) : (
              <Text style={{ color: cor }} className="text-2xl font-black">
                {filme.minhaNota == null || filme.minhaNota === 0 ? "—" : filme.minhaNota}
              </Text>
            )}
            <Text className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {filme.status === "quero" ? "status" : "Minha nota"}
            </Text>
          </View>
          <View className="flex-1 items-center rounded-lg border border-border p-3">
            <Text className="text-2xl font-black text-amber-400">
              {filme.notaImdb != null ? filme.notaImdb.toFixed(1) : "—"}
            </Text>
            <Text className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">Nota IMDb</Text>
          </View>
        </View>

        {filme.generos.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {filme.generos.map((g) => (
              <View key={g} className="rounded-full border border-border bg-secondary px-2.5 py-1">
                <Text className="text-xs font-semibold text-muted-foreground">{g}</Text>
              </View>
            ))}
          </View>
        )}

        {filme.providers.length > 0 && (
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              📺 Onde assistir (Brasil)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {filme.providers.slice(0, 8).map((p, i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-1.5 rounded-lg border border-border bg-card py-1 pl-1.5 pr-3"
                >
                  {p.logo && <Image source={{ uri: p.logo }} style={{ width: 24, height: 24, borderRadius: 4 }} />}
                  <Text className="text-xs font-semibold text-foreground">{p.nome}</Text>
                  {(p.tipo === "rent" || p.tipo === "buy") && (
                    <Text className="text-xs text-muted-foreground">(aluguel)</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {filme.sinopse && (
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sinopse</Text>
            <Text className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
              {filme.sinopse}
            </Text>
          </View>
        )}

        {filme.elenco.length > 0 && (
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Elenco principal
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
              {filme.elenco.map((a, i) => (
                <View key={i} style={{ width: 80 }} className="items-center">
                  <View className="h-26 w-20 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {a.foto ? (
                      <Image source={{ uri: a.foto }} style={{ width: 80, height: 104 }} />
                    ) : (
                      <Text className="text-2xl font-black text-muted-foreground">{(a.nome || "?")[0]}</Text>
                    )}
                  </View>
                  <Text numberOfLines={1} className="mt-1 text-[11px] font-bold text-foreground">
                    {a.nome}
                  </Text>
                  {a.personagem && (
                    <Text numberOfLines={1} className="text-[10px] text-muted-foreground">
                      {a.personagem}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {filme.obs && (
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Observações</Text>
            <Text className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
              {filme.obs}
            </Text>
          </View>
        )}

        {erro && <Text className="text-sm text-destructive">{erro}</Text>}

        <View className="flex-row flex-wrap gap-2 pt-2">
          <Pressable
            onPress={() => router.push(`/filme/${filme.id}/editar`)}
            className="rounded-md bg-accent px-4 py-2.5"
          >
            <Text className="text-sm font-semibold text-white">✏️ Editar</Text>
          </Pressable>
          <Pressable
            onPress={moverStatus}
            disabled={processando}
            className="rounded-md border border-border px-4 py-2.5 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-foreground">
              {filme.status === "quero" ? "✅ Já assisti!" : "🎯 Voltar p/ Quero Ver"}
            </Text>
          </Pressable>
          {filme.status === "assistido" && (
            <Pressable
              onPress={alternarRever}
              disabled={processando}
              className="rounded-md border border-border px-4 py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-foreground">
                {filme.rever ? "🔁 Remover do Rever" : "🔁 Quero rever"}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={buscarOnline}
            disabled={buscando}
            className="rounded-md border border-border px-4 py-2.5 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-foreground">
              {buscando ? "Buscando..." : "🔍 Buscar online"}
            </Text>
          </Pressable>
          <Pressable
            onPress={excluir}
            disabled={processando}
            className="rounded-md border border-destructive px-4 py-2.5 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-destructive">🗑️ Excluir</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
