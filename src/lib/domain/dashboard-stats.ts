import type { Filme } from "@/lib/domain/types";

export interface BarItem {
  label: string;
  valor: number;
}

export interface DashboardStats {
  assistidosCount: number;
  mediaNota: string;
  horasTotais: number;
  naFilaCount: number;
  oscarsCount: number;
  decadaFavorita: string;
  topNotas: Filme[];
  generoBars: BarItem[];
  diretorBars: BarItem[];
  monthBars: BarItem[];
}

// Porte fiel dos cálculos de renderDash() do BatataFlix original (mesma
// lógica de src/lib/domain/dashboard-stats.ts do app web).
export function computeDashboardStats(filmes: Filme[]): DashboardStats {
  const watched = filmes.filter((f) => f.status === "assistido");
  const want = filmes.filter((f) => f.status === "quero");
  const rated = watched.filter((f) => (f.minhaNota ?? 0) > 0);

  const mediaNota = rated.length
    ? (rated.reduce((s, f) => s + (f.minhaNota ?? 0), 0) / rated.length).toFixed(1)
    : "—";
  const horasTotais = Math.round(watched.reduce((s, f) => s + (f.duracao ?? 0), 0) / 60);
  const oscarsCount = watched.filter((f) => f.oscar === "ganhou").length;

  const decCnt = new Map<number, number>();
  filmes.forEach((f) => {
    if (f.ano) {
      const dc = Math.floor(f.ano / 10) * 10;
      decCnt.set(dc, (decCnt.get(dc) ?? 0) + 1);
    }
  });
  const decTop = [...decCnt.entries()].sort((a, b) => b[1] - a[1])[0];
  const decadaFavorita = decTop
    ? "Anos " + (decTop[0] >= 2000 ? decTop[0] : decTop[0] - 1900)
    : "—";

  const topNotas = [...rated]
    .sort(
      (a, b) =>
        (b.minhaNota ?? 0) - (a.minhaNota ?? 0) ||
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )
    .slice(0, 6);

  const generoCnt = new Map<string, number>();
  filmes.forEach((f) => f.generos.forEach((g) => generoCnt.set(g, (generoCnt.get(g) ?? 0) + 1)));
  const generoBars = [...generoCnt.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, valor]) => ({ label, valor }));

  const diretorCnt = new Map<string, number>();
  filmes.forEach((f) => {
    if (f.diretor) {
      f.diretor.split(",").forEach((d) => {
        const nome = d.trim();
        if (nome) diretorCnt.set(nome, (diretorCnt.get(nome) ?? 0) + 1);
      });
    }
  });
  const diretorBars = [...diretorCnt.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, valor]) => ({ label, valor }));

  const now = new Date();
  const months: { key: string; label: string; valor: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valor: 0,
    });
  }
  watched.forEach((f) => {
    if (!f.addedAt) return;
    const d = new Date(f.addedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const mes = months.find((m) => m.key === key);
    if (mes) mes.valor++;
  });

  return {
    assistidosCount: watched.length,
    mediaNota,
    horasTotais,
    naFilaCount: want.length,
    oscarsCount,
    decadaFavorita,
    topNotas,
    generoBars,
    diretorBars,
    monthBars: months.map(({ label, valor }) => ({ label, valor })),
  };
}
