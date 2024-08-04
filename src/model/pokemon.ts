import { PokemonEvolutionData } from '@/app/services/processEvolutionChain';

export type PokemonModel = {
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
