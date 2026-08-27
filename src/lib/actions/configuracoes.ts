import { supabase } from "@/lib/supabase/client";
import type { Configuracoes, Tema } from "@/lib/domain/types";
import type { ConfiguracoesInput } from "@/lib/validation/configuracoes";
import type { ActionResult } from "./types";

// Mesma tabela/colunas de src/lib/storage/configuracoes.ts do BatataFlix
// Web — só lendo tema/cor_destaque (banner_modo/banner_imagem_path/
// escurecimento são exclusivos do fundo customizado, tela cheia do app
// web/desktop, fora de escopo no mobile).

interface LinhaConfiguracoes {
  usuario_id: string;
  tema: Tema;
  cor_destaque: string;
}

function paraConfiguracoes(linha: LinhaConfiguracoes): Configuracoes {
  return {
    usuarioId: linha.usuario_id,
    tema: linha.tema,
    corDestaque: linha.cor_destaque,
  };
}

async function usuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

export async function obterOuCriarConfiguracoes(): Promise<ActionResult<Configuracoes>> {
  try {
    const user = await usuarioAtual();
    const { data } = await supabase
      .from("configuracoes")
      .select("usuario_id, tema, cor_destaque")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (data) return { ok: true, data: paraConfiguracoes(data as LinhaConfiguracoes) };

    const { data: criado, error } = await supabase
      .from("configuracoes")
      .insert({ usuario_id: user.id })
      .select("usuario_id, tema, cor_destaque")
      .single();
    if (error) return { ok: false, error: `Falha ao criar configurações: ${error.message}` };
    return { ok: true, data: paraConfiguracoes(criado as LinhaConfiguracoes) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao obter configurações." };
  }
}

export async function atualizarConfiguracoes(
  input: ConfiguracoesInput
): Promise<ActionResult<Configuracoes>> {
  try {
    const user = await usuarioAtual();
    const colunas: Record<string, unknown> = { atualizado_em: new Date().toISOString() };
    if (input.tema !== undefined) colunas.tema = input.tema;
    if (input.corDestaque !== undefined) colunas.cor_destaque = input.corDestaque;

    const { data, error } = await supabase
      .from("configuracoes")
      .upsert({ usuario_id: user.id, ...colunas })
      .select("usuario_id, tema, cor_destaque")
      .single();
    if (error) return { ok: false, error: `Falha ao atualizar configurações: ${error.message}` };
    return { ok: true, data: paraConfiguracoes(data as LinhaConfiguracoes) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao atualizar configurações." };
  }
}
