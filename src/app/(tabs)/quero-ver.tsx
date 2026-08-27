import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FilaView } from "@/components/filmes/FilaView";
import { atualizarFilme, filmeParaInput, listarFilmes } from "@/lib/actions/filmes";
import type { Filme } from "@/lib/domain/types";

export default function QueroVerScreen() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const resultado = await listarFilmes("quero");
    if (resultado.ok && resultado.data) setFilmes(resultado.data);
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function marcarAssistido(filme: Filme) {
    const input = filmeParaInput(filme);
    input.status = "assistido";
    const resultado = await atualizarFilme(filme.id, input);
    if (resultado.ok) carregar();
  }

  return (
    <FilaView
      filmes={filmes}
      carregando={carregando}
      campo="ordem"
      acaoLabel="✅ Assisti"
      onAcao={marcarAssistido}
      onReordenado={carregar}
      mostrarRoleta
      fabHref="/filme/novo?status=quero"
      emoji="🎯"
      tituloVazio="Fila vazia"
      subtituloVazio="Anote os filmes que você quer ver e organize a prioridade."
      legenda="🎯 Sua fila de próximos filmes. Use ▲▼ para ordenar e ✅ Assisti quando terminar."
    />
  );
}
