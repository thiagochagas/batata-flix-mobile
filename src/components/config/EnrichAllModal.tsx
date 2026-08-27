import { useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { atualizarFilme, filmeParaInput } from "@/lib/actions/filmes";
import { ApiChaveAusenteError } from "@/lib/api/config";
import { enriquecer } from "@/lib/api/enriquecer";
import type { DadosEnriquecidos, Filme } from "@/lib/domain/types";

const CONCORRENCIA = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Porte fiel de enrichAll() do BatataFlix original / EnrichAllButton.tsx do
// app web: pool de 5 workers concorrentes, pequena pausa entre buscas,
// progresso salvo filme a filme (pode parar no meio).
export function EnrichAllModal({
  visible,
  onClose,
  pendentes,
  onConcluido,
}: {
  visible: boolean;
  onClose: () => void;
  pendentes: Filme[];
  onConcluido: () => void;
}) {
  const [rodando, setRodando] = useState(false);
  const [cancelar, setCancelar] = useState(false);
  const [done, setDone] = useState(0);
  const [found, setFound] = useState(0);
  const [fail, setFail] = useState(0);
  const [atual, setAtual] = useState("");
  const [concluido, setConcluido] = useState(false);
  const cancelarRef = useRef(false);

  async function iniciar() {
    if (rodando) return;
    setRodando(true);
    setCancelar(false);
    setConcluido(false);
    setDone(0);
    setFound(0);
    setFail(0);
    cancelarRef.current = false;

    const fila = [...pendentes];
    let idx = 0;
    let localFound = 0;
    let localFail = 0;

    async function worker() {
      while (idx < fila.length && !cancelarRef.current) {
        const filme = fila[idx++];
        setAtual(filme.titulo);
        try {
          const dados: DadosEnriquecidos | null = await enriquecer({
            titulo: filme.titulo,
            ano: filme.ano,
          });
          if (dados) {
            const input = filmeParaInput(filme);
            if (dados.posterUrl) input.posterUrl = dados.posterUrl;
            if (dados.ano) input.ano = dados.ano;
            if (dados.diretor && !input.diretor) input.diretor = dados.diretor;
            if (dados.atores && !input.atores) input.atores = dados.atores;
            if (dados.generos.length && (!input.generos || !input.generos.length)) input.generos = dados.generos;
            if (dados.notaImdb != null) input.notaImdb = dados.notaImdb;
            if (dados.duracao) input.duracao = dados.duracao;
            if (dados.sinopse) input.sinopse = dados.sinopse;
            if (dados.elenco.length) input.elenco = dados.elenco;
            if (dados.providers.length) {
              input.providers = dados.providers;
              input.providerLink = dados.providerLink;
            }
            input.tmdbId = dados.tmdbId;
            if (dados.imdbId) input.imdbId = dados.imdbId;

            await atualizarFilme(filme.id, input);
            localFound++;
            setFound(localFound);
          } else {
            localFail++;
            setFail(localFail);
          }
        } catch (err) {
          if (err instanceof ApiChaveAusenteError) {
            cancelarRef.current = true;
            setCancelar(true);
            break;
          }
          localFail++;
          setFail(localFail);
        }
        setDone((d) => d + 1);
        await sleep(60);
      }
    }

    await Promise.all(Array.from({ length: CONCORRENCIA }, () => worker()));
    setRodando(false);
    setConcluido(true);
    onConcluido();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !rodando && onClose()}>
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm gap-3 rounded-2xl bg-card p-6">
          <Text className="text-center text-lg font-bold text-foreground">
            {concluido
              ? cancelar
                ? "⏹️ Parado"
                : "🎉 Concluído!"
              : rodando
                ? "🔍 Buscando dados online..."
                : "🔍 Buscar dados de todos os filmes"}
          </Text>

          {!rodando && !concluido && (
            <Text className="text-center text-sm text-muted-foreground">
              {pendentes.length} filme(s) sem dados do TMDb. Isso pode levar alguns minutos.
            </Text>
          )}

          {(rodando || concluido) && (
            <View className="gap-2">
              <View className="h-2 overflow-hidden rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${pendentes.length ? (done / pendentes.length) * 100 : 0}%` }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted-foreground">
                  {done} / {pendentes.length}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  ✅ {found} · ⚠️ {fail}
                </Text>
              </View>
              <Text className="text-sm text-foreground">
                {concluido
                  ? cancelar
                    ? "Progresso salvo. Pode retomar depois."
                    : "Acervo enriquecido com sucesso!"
                  : `🎬 ${atual}`}
              </Text>
            </View>
          )}

          <View className="mt-1 flex-row justify-center gap-2">
            {!rodando && !concluido && (
              <>
                <Pressable onPress={onClose} className="rounded-md border border-border px-4 py-2.5">
                  <Text className="text-sm font-medium text-foreground">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={iniciar}
                  disabled={pendentes.length === 0}
                  className="rounded-md bg-accent px-4 py-2.5 disabled:opacity-50"
                >
                  <Text className="text-sm font-medium text-white">Começar</Text>
                </Pressable>
              </>
            )}
            {rodando && !concluido && (
              <Pressable
                onPress={() => {
                  cancelarRef.current = true;
                  setCancelar(true);
                }}
                className="rounded-md border border-border px-4 py-2.5"
              >
                <Text className="text-sm font-medium text-foreground">Cancelar</Text>
              </Pressable>
            )}
            {concluido && (
              <Pressable onPress={onClose} className="rounded-md bg-accent px-4 py-2.5">
                <Text className="text-sm font-medium text-white">Fechar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
