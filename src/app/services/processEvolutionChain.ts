// 型定義
export interface PokemonEvolutionData {
  normalEvolution: string[];
  specialEvolution: string[];
}

export function processEvolutionChain(chain: any): PokemonEvolutionData {
  const evolutionData: PokemonEvolutionData = {
    normalEvolution: [],
    specialEvolution: [],
  };

  if (chain.evolves_to.length === 1) {
    // 通常の進化パターン
    let currentStage = chain;
    while (currentStage) {
      evolutionData.normalEvolution.push(currentStage.species.name);
      if (currentStage.evolves_to.length === 1) {
        currentStage = currentStage.evolves_to[0];
      } else if (currentStage.evolves_to.length > 1) {
        // 最後の段階で複数の進化がある場合（例：ポワルン）
        evolutionData.specialEvolution = [
          currentStage.species.name,
          ...currentStage.evolves_to.map((evolution: any) => evolution.species.name),
        ];
        break;
      } else {
        break;
      }
    }
  } else if (chain.evolves_to.length > 1) {
    // 特殊な進化パターン（イーブイなど）
    evolutionData.specialEvolution = [
      chain.species.name,
      ...chain.evolves_to.map((evolution: any) => evolution.species.name),
    ];
  }

  return evolutionData;
}
