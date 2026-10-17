import { types } from '@/utils/PokemonType';
import React, { useState } from 'react';

type Props = {
  onSearch: (searchInput: string, selectedType: string | undefined) => Promise<void>;
  onReset: () => Promise<void>;
};

// 入力中の値はこのコンポーネント内だけで管理し、検索実行時にだけ親へ渡す。
// 親のstateにすると1文字入力するたびに一覧全体が再レンダリングされて入力が重くなる
const Search = ({ onSearch, onReset }: Props) => {
  const [selectedType, setSelectedType] = useState<string>();
  const [searchInput, setSearchInput] = useState('');

  const handleReset = async () => {
    setSearchInput('');
    setSelectedType('');
    await onReset();
  };

  return (
    <div className="py-2">
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-8">
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="w-full sm:w-48 px-3 py-2 mb-2 sm:mb-0 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full sm:w-auto grow px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button
            onClick={() => onSearch(searchInput, selectedType)}
            className="w-full sm:w-auto px-4 py-2 mb-2 sm:mb-0 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border"
          >
            検索
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-500"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default Search;
