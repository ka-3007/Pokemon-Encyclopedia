/* eslint-disable @next/next/no-img-element */
import React from 'react';

type Props = {
  id: number;
  name: string;
  image: string;
  japaneseTypes: string[];
  description: string;
  types: string[];
  height: number;
  weight: number;
};

const PokemonDetail = ({ id, name, image, japaneseTypes, description, types, height, weight }: Props) => {
  const backgroundStyle =
    types.length > 1
      ? { background: `linear-gradient(135deg, var(--${types[0]}) 50%, var(--${types[1]}) 50%)` }
      : { background: `var(--${types[0]})` };

  return (
    <div
      className="flex flex-col md:flex-row w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg"
      style={backgroundStyle}
    >
      <div className="w-full md:w-1/2 p-12 flex items-center justify-center">
        <img src={image} alt={name} className="w-80 h-80 object-contain" />
      </div>
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-between">
        <div>
          <div className="text-gray-600 text-lg mb-3">#0{id}</div>
          <h2 className="text-4xl font-bold mb-3">{name}</h2>
          <h3 className="text-2xl mb-6">{japaneseTypes.join(' / ')}</h3>
          <p className="text-base mb-8 bg-white bg-opacity-50 p-6 rounded-lg shadow-inner">{description}</p>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <span className="font-semibold mr-3 text-gray-700">重さ:</span>
            <span className="bg-white px-6 py-3 rounded-full text-sm shadow-md">{weight} kg</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-3 text-gray-700">高さ:</span>
            <span className="bg-white px-6 py-3 rounded-full text-sm shadow-md">{height} m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
