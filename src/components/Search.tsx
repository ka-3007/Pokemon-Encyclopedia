import { types } from '@/utils/PokemonType';
import React, { Dispatch, SetStateAction } from 'react';

type Props = {
  selectedType: string | undefined;
  setSelectedType: Dispatch<SetStateAction<string | undefined>>;
  onSearch: () => Promise<void>;
  onReset: () => Promise<void>;
};

const Search = ({ selectedType, setSelectedType, onSearch, onReset }: Props) => {
  return (
    <div className="py-2">
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">フィルター選択</option>
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            placeholder="検索キーワード"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={onSearch}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            検索
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default Search;
