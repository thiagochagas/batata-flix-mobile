import type { ReactNode } from "react";
import { View } from "react-native";
import { vars } from "nativewind";
import { corDestaqueAtual, useConfiguracoes } from "@/contexts/ConfiguracoesContext";
import { hexParaTriplet } from "@/lib/color";

// Equivalente móvel do AccentApplier.tsx do app web (que seta CSS vars no
// <html>): aqui as vars --color-accent/--color-accent-2 são aplicadas via
// nativewind vars() num View que envolve toda a árvore, então qualquer tela
// que use `bg-accent`/`text-accent` reflete a cor escolhida em Configurações.
export function AccentProvider({ children }: { children: ReactNode }) {
  const { configuracoes } = useConfiguracoes();
  const [cor, cor2] = corDestaqueAtual(configuracoes);

  return (
    <View
      style={[
        { flex: 1 },
        vars({
          "--color-accent": hexParaTriplet(cor),
          "--color-accent-2": hexParaTriplet(cor2),
        }),
      ]}
    >
      {children}
    </View>
  );
}
