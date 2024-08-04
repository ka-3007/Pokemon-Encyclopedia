/* eslint-disable @next/next/no-img-element */
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const backgroundStyle =
    types.length > 1
      ? { background: `linear-gradient(135deg, var(--${types[0]}) 50%, var(--${types[1]}) 50%)` }
      : { background: `var(--${types[0]})` };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans">
      <div
        className="flex flex-col md:flex-row w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg"
        style={backgroundStyle}
      >
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center mobile-img">
          <img src={image} alt={name} className="w-64 h-64 md:w-80 md:h-80 object-contain" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between mobile-description">
          <div>
            <div className="text-gray-600 text-base md:text-lg mb-2 md:mb-3">#{id.toString().padStart(3, '0')}</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">{name}</h2>
            <h3 className="text-xl md:text-2xl mb-4 md:mb-6">{japaneseTypes.join(' / ')}</h3>
            <p className="text-sm md:text-base mb-6 md:mb-8 bg-white bg-opacity-50 p-4 md:p-6 rounded-lg shadow-inner">
              {description}
            </p>
          </div>
          <div className="flex flex-col space-y-3 md:space-y-4">
            <div className="flex items-center">
              <span className="font-semibold mr-2 md:mr-3 text-gray-700">重さ:</span>
              <span className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-full text-sm shadow-md">{weight} kg</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2 md:mr-3 text-gray-700">高さ:</span>
              <span className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-full text-sm shadow-md">{height} m</span>
            </div>
          </div>
        </div>
      </div>
      <button onClick={router.back} className="mt-4 flex items-center text-blue-500 hover:text-blue-700">
        <ChevronLeft size={20} />
        <span className="ml-1">戻る</span>
      </button>
    </div>
  );
};

export default PokemonDetail;
