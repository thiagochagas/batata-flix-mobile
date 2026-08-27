import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { FormField } from "@/components/FormField";
import { FormSelect } from "@/components/FormSelect";
import { GenreChips } from "@/components/GenreChips";
import { RatingSlider } from "@/components/RatingSlider";
import { COMPANHIA_OPCOES, ONDE_ASSISTIR_OPCOES } from "@/lib/domain/enums";
import { atualizarFilme, criarFilme, excluirFilme } from "@/lib/actions/filmes";
import { ApiChaveAusenteError, ApiBaseUrlAusenteError } from "@/lib/api/config";
import { enriquecer } from "@/lib/api/enriquecer";
import { confirmar } from "@/lib/confirm";
import type { DadosEnriquecidos, ElencoItem, Filme, ProviderItem, StatusFilme } from "@/lib/domain/types";
import type { FilmeInput } from "@/lib/validation/filme";

interface FormState {
  titulo: string;
  ano: string;
  diretor: string;
  atores: string;
  duracao: string;
  onde: string;
  generos: string[];
  minhaNota: number;
  notaImdb: string;
  oscar: "" | "ganhou" | "indicado";
  premios: string;
  obs: string;
  companhia: string;
  favorito: boolean;
  rever: boolean;
  posterUrl: string;
  tmdbId: string;
  imdbId: string;
}

const VAZIO: FormState = {
  titulo: "",
  ano: "",
  diretor: "",
  atores: "",
  duracao: "",
  onde: "",
  generos: [],
  minhaNota: 0,
  notaImdb: "",
  oscar: "",
  premios: "",
  obs: "",
  companhia: "",
  favorito: false,
  rever: false,
  posterUrl: "",
  tmdbId: "",
  imdbId: "",
};

function filmeParaForm(f: Filme): FormState {
  return {
    titulo: f.titulo,
    ano: f.ano != null ? String(f.ano) : "",
    diretor: f.diretor ?? "",
    atores: f.atores ?? "",
    duracao: f.duracao != null ? String(f.duracao) : "",
    onde: f.onde ?? "",
    generos: f.generos,
    minhaNota: f.minhaNota ?? 0,
    notaImdb: f.notaImdb != null ? String(f.notaImdb) : "",
    oscar: f.oscar,
    premios: f.premios ?? "",
    obs: f.obs ?? "",
    companhia: f.companhia ?? "",
    favorito: f.favorito,
    rever: f.rever,
    posterUrl: f.posterUrl ?? "",
    tmdbId: f.tmdbId != null ? String(f.tmdbId) : "",
    imdbId: f.imdbId ?? "",
  };
}

const OSCAR_OPCOES = [
  { value: "", label: "— nenhum" },
  { value: "ganhou", label: "🏆 Ganhou o Oscar" },
  { value: "indicado", label: "🎖️ Indicado ao Oscar" },
];

// Porte RN de FilmeFormDialog.tsx do app web (formulário de novo/editar
// filme), usado tanto por filme/novo.tsx quanto filme/[id]/editar.tsx.
export function FilmeForm({ status, filme }: { status: StatusFilme; filme: Filme | null }) {
  const [form, setForm] = useState<FormState>(() => (filme ? filmeParaForm(filme) : VAZIO));
  const [extra, setExtra] = useState<{
    sinopse: string;
    elenco: ElencoItem[];
    providers: ProviderItem[];
    providerLink: string;
  }>(() =>
    filme
      ? {
          sinopse: filme.sinopse ?? "",
          elenco: filme.elenco,
          providers: filme.providers,
          providerLink: filme.providerLink ?? "",
        }
      : { sinopse: "", elenco: [], providers: [], providerLink: "" }
  );
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function toggleGenero(g: string) {
    setForm((f) => ({
      ...f,
      generos: f.generos.includes(g) ? f.generos.filter((x) => x !== g) : [...f.generos, g],
    }));
  }

  async function buscarOnline() {
    if (!form.titulo.trim()) {
      setErro("Digite o título primeiro.");
      return;
    }
    setErro(null);
    setBuscando(true);
    try {
      const dados = await enriquecer({ titulo: form.titulo, ano: form.ano ? +form.ano : null });
      if (!dados) {
        setErro("🤷 Não encontrei esse filme.");
        return;
      }
      aplicarDados(dados);
    } catch (err) {
      setErro(
        err instanceof ApiChaveAusenteError
          ? "🔑 Falta a chave do TMDb no servidor."
          : err instanceof ApiBaseUrlAusenteError
            ? "⚙️ Configure EXPO_PUBLIC_API_BASE_URL no .env."
            : "❌ Erro na busca. Sem internet?"
      );
    } finally {
      setBuscando(false);
    }
  }

  function aplicarDados(dados: DadosEnriquecidos) {
    setForm((f) => ({
      ...f,
      titulo: dados.titulo || f.titulo,
      ano: dados.ano ? String(dados.ano) : f.ano,
      diretor: dados.diretor || f.diretor,
      atores: dados.atores || f.atores,
      duracao: dados.duracao ? String(dados.duracao) : f.duracao,
      notaImdb: dados.notaImdb != null ? String(dados.notaImdb) : f.notaImdb,
      posterUrl: dados.posterUrl || "",
      tmdbId: dados.tmdbId ? String(dados.tmdbId) : "",
      imdbId: dados.imdbId || "",
      generos: dados.generos.length ? dados.generos : f.generos,
    }));
    setExtra({
      sinopse: dados.sinopse,
      elenco: dados.elenco,
      providers: dados.providers,
      providerLink: dados.providerLink,
    });
  }

  async function salvar() {
    if (!form.titulo.trim()) {
      setErro("⚠️ Dá um nome pro filme!");
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const payload: FilmeInput = {
        titulo: form.titulo.trim(),
        ano: form.ano ? +form.ano : null,
        diretor: form.diretor.trim() || null,
        atores: form.atores.trim() || null,
        duracao: form.duracao ? +form.duracao : null,
        onde: form.onde || null,
        generos: form.generos,
        minhaNota: status === "quero" ? null : form.minhaNota || null,
        notaImdb: form.notaImdb ? +form.notaImdb : null,
        oscar: form.oscar,
        premios: form.premios.trim() || null,
        obs: form.obs.trim() || null,
        favorito: form.favorito,
        rever: status === "assistido" && form.rever,
        companhia: status === "assistido" ? form.companhia || null : null,
        sinopse: extra.sinopse || null,
        elenco: extra.elenco,
        providers: extra.providers,
        providerLink: extra.providerLink || null,
        posterUrl: form.posterUrl || null,
        tmdbId: form.tmdbId ? +form.tmdbId : null,
        imdbId: form.imdbId || null,
        status,
      };

      const resultado = filme ? await atualizarFilme(filme.id, payload) : await criarFilme(payload);
      if (!resultado.ok) {
        setErro(resultado.error ?? "Não deu para salvar o filme.");
        return;
      }
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  function excluir() {
    if (!filme) return;
    confirmar(
      `Excluir "${filme.titulo}"?`,
      "Isso apaga o filme de vez (não dá para desfazer).",
      async () => {
        setExcluindo(true);
        const resultado = await excluirFilme(filme.id);
        setExcluindo(false);
        if (!resultado.ok) {
          setErro(resultado.error ?? "Falha ao excluir.");
          return;
        }
        router.dismissTo("/(tabs)");
      }
    );
  }

  return (
    <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Título *</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={form.titulo}
            onChangeText={(v) => set("titulo", v)}
            placeholder="Ex: O Poderoso Chefão"
            placeholderTextColor="#737373"
            autoFocus
            className="flex-1 rounded-md border border-border px-3 py-2.5 text-sm text-foreground"
          />
          <Pressable
            onPress={buscarOnline}
            disabled={buscando}
            className="items-center justify-center rounded-md bg-accent px-4 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-white">{buscando ? "..." : "🔍"}</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Ano" value={form.ano} onChangeText={(v) => set("ano", v)} keyboardType="number-pad" placeholder="1972" />
        </View>
        <View className="flex-1">
          <FormField label="Duração (min)" value={form.duracao} onChangeText={(v) => set("duracao", v)} keyboardType="number-pad" placeholder="175" />
        </View>
      </View>

      <FormField label="Direção" value={form.diretor} onChangeText={(v) => set("diretor", v)} placeholder="Francis Ford Coppola" />
      <FormField label="Atores principais" value={form.atores} onChangeText={(v) => set("atores", v)} placeholder="Al Pacino, Marlon Brando" />

      <View className="gap-1.5">
        <Text className="text-xs text-muted-foreground">Gêneros / tipo</Text>
        <GenreChips selecionados={form.generos} onToggle={toggleGenero} />
      </View>

      {status === "assistido" && (
        <View className="gap-1.5">
          <Text className="text-xs text-muted-foreground">Minha nota</Text>
          <RatingSlider value={form.minhaNota} onChange={(v) => set("minhaNota", Math.round(v))} />
          <Text className="text-xs text-muted-foreground">
            Arraste até 0 para deixar &quot;sem nota&quot; e avaliar depois.
          </Text>
        </View>
      )}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Nota IMDb (pública)" value={form.notaImdb} onChangeText={(v) => set("notaImdb", v)} keyboardType="decimal-pad" placeholder="9.2" />
        </View>
        <View className="flex-1">
          <FormSelect
            label="Onde assistir"
            value={form.onde}
            onChange={(v) => set("onde", v)}
            placeholder="—"
            options={ONDE_ASSISTIR_OPCOES.map((o) => ({ value: o, label: o }))}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormSelect label="Oscar" value={form.oscar} onChange={(v) => set("oscar", v as FormState["oscar"])} options={OSCAR_OPCOES} />
        </View>
        <View className="flex-1">
          <FormField label="Outros prêmios" value={form.premios} onChangeText={(v) => set("premios", v)} placeholder="Cannes, Globo de Ouro..." />
        </View>
      </View>

      {status === "assistido" && (
        <FormSelect
          label="👥 Com quem assistiu"
          value={form.companhia}
          onChange={(v) => set("companhia", v)}
          placeholder="—"
          options={COMPANHIA_OPCOES.map((o) => ({ value: o, label: o }))}
        />
      )}

      <FormField
        label={status === "quero" ? "Por que quer ver? (opcional)" : "Observações livres"}
        value={form.obs}
        onChangeText={(v) => set("obs", v)}
        multiline
        placeholder="O que marcou? O que gostou, o que não gostou, aquela cena..."
      />

      <View className="flex-row items-center justify-between rounded-md border border-border px-3 py-2.5">
        <Text className="text-sm text-foreground">⭐ Favorito do Batata</Text>
        <Switch value={form.favorito} onValueChange={(v) => set("favorito", v)} />
      </View>

      {status === "assistido" && (
        <View className="flex-row items-center justify-between rounded-md border border-border px-3 py-2.5">
          <Text className="text-sm text-foreground">🔁 Quero rever este filme</Text>
          <Switch value={form.rever} onValueChange={(v) => set("rever", v)} />
        </View>
      )}

      {erro && <Text className="text-sm text-destructive">{erro}</Text>}

      <View className="flex-row gap-3 pt-2">
        <Pressable
          onPress={salvar}
          disabled={salvando}
          className="flex-1 items-center rounded-md bg-accent py-3 disabled:opacity-50"
        >
          <Text className="font-medium text-white">{salvando ? "Salvando..." : "💾 Salvar"}</Text>
        </Pressable>
        {filme && (
          <Pressable
            onPress={excluir}
            disabled={excluindo}
            className="flex-1 items-center rounded-md border border-destructive py-3 disabled:opacity-50"
          >
            <Text className="font-medium text-destructive">{excluindo ? "Excluindo..." : "Excluir"}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
