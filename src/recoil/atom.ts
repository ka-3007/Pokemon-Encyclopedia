import { PokemonModel } from '@/model/pokemon';
import { atom } from 'recoil';

export const allPokemonsState = atom<PokemonModel[]>({
  key: 'allPokemonsState',
  default: [],
});

export const urlState = atom<string>({
  key: 'urlState',
  default: 'https://pokeapi.co/api/v2/pokemon?limit=50',
});
