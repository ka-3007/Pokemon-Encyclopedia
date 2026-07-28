import { PokemonEvolutionData } from '@/services/processEvolutionChain';

export type PokemonModel = {
  dataVersion?: number;
  // 画像内容のSHA-1ハッシュ。URLが違っても中身が同じ画像(メテノの隕石フォルムなど)の判定に使う
  imageHash?: string | null;
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
