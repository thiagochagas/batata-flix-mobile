import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { ACCENTS } from "@/lib/domain/enums";
import type { Configuracoes } from "@/lib/domain/types";
import type { ConfiguracoesInput } from "@/lib/validation/configuracoes";
import { atualizarConfiguracoes, obterOuCriarConfiguracoes } from "@/lib/actions/configuracoes";
import { useAuth } from "./AuthContext";

interface ConfiguracoesContextValue {
  configuracoes: Configuracoes | null;
  carregando: boolean;
  // Aplica localmente + persiste no Supabase — mesma dupla ação da
  // AparenciaForm do app web (tema/corDestaque sobrescrevem a preferência
  // do sistema, igual ao comportamento do BatataFlix Web).
  salvar: (input: ConfiguracoesInput) => Promise<void>;
}

const ConfiguracoesContext = createContext<ConfiguracoesContextValue | null>(null);

export function ConfiguracoesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { setColorScheme } = useNativewindColorScheme();
  const [configuracoes, setConfiguracoes] = useState<Configuracoes | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!session) {
      setConfiguracoes(null);
      setCarregando(false);
      return;
    }
    let cancelado = false;
    setCarregando(true);
    obterOuCriarConfiguracoes().then((resultado) => {
      if (cancelado) return;
      if (resultado.ok && resultado.data) {
        setConfiguracoes(resultado.data);
        setColorScheme(resultado.data.tema);
      }
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [session, setColorScheme]);

  async function salvar(input: ConfiguracoesInput) {
    if (input.tema) setColorScheme(input.tema);
    if (configuracoes) {
      setConfiguracoes({ ...configuracoes, ...input });
    }
    const resultado = await atualizarConfiguracoes(input);
    if (resultado.ok && resultado.data) setConfiguracoes(resultado.data);
  }

  return (
    <ConfiguracoesContext.Provider value={{ configuracoes, carregando, salvar }}>
      {children}
    </ConfiguracoesContext.Provider>
  );
}

export function useConfiguracoes(): ConfiguracoesContextValue {
  const ctx = useContext(ConfiguracoesContext);
  if (!ctx) throw new Error("useConfiguracoes precisa ser usado dentro de ConfiguracoesProvider");
  return ctx;
}

export function corDestaqueAtual(configuracoes: Configuracoes | null): [string, string] {
  if (!configuracoes) return [ACCENTS[0][0], ACCENTS[0][1]];
  const preset = ACCENTS.find(([cor]) => cor === configuracoes.corDestaque);
  return preset ? [preset[0], preset[1]] : [configuracoes.corDestaque, configuracoes.corDestaque];
}
