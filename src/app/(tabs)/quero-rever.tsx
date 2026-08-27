import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FilaView } from "@/components/filmes/FilaView";
import { atualizarFilme, filmeParaInput, listarFilmesParaRever } from "@/lib/actions/filmes";
import type { Filme } from "@/lib/domain/types";

export default function QueroReverScreen() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const resultado = await listarFilmesParaRever();
    if (resultado.ok && resultado.data) setFilmes(resultado.data);
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function marcarRevisto(filme: Filme) {
    const input = filmeParaInput(filme);
    input.rever = false;
    const resultado = await atualizarFilme(filme.id, input);
    if (resultado.ok) carregar();
  }

  return (
    <FilaView
      filmes={filmes}
      carregando={carregando}
      campo="ordemRever"
      acaoLabel="✔️ Já revi"
      onAcao={marcarRevisto}
      onReordenado={carregar}
      mostrarNota
      mostrarRoleta
      emoji="🔁"
      tituloVazio="Nenhum filme pra rever ainda"
      subtituloVazio="Abra um filme assistido e toque em 🔁 Quero rever para ele entrar aqui."
      legenda="🔁 Filmes que você já viu e quer rever. Use ▲▼ para ordenar e ✔️ Já revi quando rever."
    />
  );
}
