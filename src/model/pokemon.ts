import { PokemonEvolutionData } from '@/services/processEvolutionChain';

export type PokemonModel = {
  dataVersion?: number;
  id: number;
  name: string;
  japaneseName: string;
  image: string;
  iconImage: string;
  types: string[];
  japaneseTypes: string[];
  height: number;
  weight: number;
  description: string;
  evolutionData: PokemonEvolutionData;
  formNames: string[];
};
