import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Poster } from "@/components/Poster";
import type { Filme } from "@/lib/domain/types";

// Porte fiel da animação de sortear() do BatataFlix original (mesmo
// algoritmo de RouletteDialog.tsx do app web): 14-20 sorteios com atraso
// crescente (55 + n² * 1.1ms) até parar no escolhido.
export function RouletteModal({
  visible,
  onClose,
  filmes,
  onVerFilme,
}: {
  visible: boolean;
  onClose: () => void;
  filmes: Filme[];
  onVerFilme: (filme: Filme) => void;
}) {
  const [atual, setAtual] = useState<Filme | null>(null);
  const [girando, setGirando] = useState(true);
  const [opacidade, setOpacidade] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function girar() {
    if (!filmes.length) return;
    setGirando(true);
    const max = 14 + Math.floor(Math.random() * 7);
    let n = 0;
    const passo = () => {
      const escolhido = filmes[Math.floor(Math.random() * filmes.length)];
      setAtual(escolhido);
      setOpacidade(n < max - 1 ? 0.55 : 1);
      n++;
      if (n < max) {
        timeoutRef.current = setTimeout(passo, 55 + n * n * 1.1);
      } else {
        setGirando(false);
      }
    };
    timeoutRef.current = setTimeout(passo, 0);
  }

  useEffect(() => {
    const inicial = visible ? setTimeout(girar, 0) : null;
    return () => {
      if (inicial) clearTimeout(inicial);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm items-center gap-4 rounded-2xl bg-card p-6">
          <Text className="text-center text-lg font-bold text-foreground">
            {girando ? "🎲 Sorteando..." : filmes.length === 1 ? "🎲 Só tem esse mesmo!" : "🎲 O Batata escolheu!"}
          </Text>

          {atual && (
            <View style={{ opacity: opacidade }} className="items-center gap-2">
              <Poster filme={atual} width={144} height={208} radius={16} />
              <Text className="text-center text-lg font-extrabold text-foreground">{atual.titulo}</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {atual.ano}
                {atual.notaImdb != null ? ` · ⭐ IMDb ${atual.notaImdb.toFixed(1)}` : ""}
              </Text>
            </View>
          )}

          <View className="mt-2 w-full flex-row justify-center gap-2">
            <Pressable onPress={onClose} className="rounded-md border border-border px-4 py-2.5">
              <Text className="text-sm font-medium text-foreground">Fechar</Text>
            </Pressable>
            <Pressable
              onPress={girar}
              disabled={girando}
              className="rounded-md bg-amber-400 px-4 py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-black">🎲 De novo</Text>
            </Pressable>
            <Pressable
              disabled={girando || !atual}
              onPress={() => atual && onVerFilme(atual)}
              className="rounded-md bg-accent px-4 py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-white">🎬 Ver filme</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
