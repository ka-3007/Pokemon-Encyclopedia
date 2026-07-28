import Image from 'next/image';
import React from 'react';

type Props = {
  id: number;
  name: string;
  image: string;
  iconImage: string;
  japaneseTypes: string[];
  types: string[];
};

// アロー関数でコンポーネントを定義
const PokemonThumbnails = ({ id, name, image, iconImage, japaneseTypes, types }: Props) => {
  const backgroundStyle =
    types.length > 1
      ? { background: `linear-gradient(135deg, var(--${types[0]}) 50%, var(--${types[1]}) 50%)` }
      : { background: `var(--${types[0]})` };

  return (
    <div className="thumb-container" style={backgroundStyle}>
      <div className="number">
        <small>#0{id}</small>
      </div>
      {/* next/imageはデフォルトで遅延読み込みされ、ビューポート付近の画像だけリクエストされる */}
      <Image src={image} alt={name} width={120} height={120} />
      <Image src={iconImage} alt={name} className="icon-image" width={60} height={60} />
      <div className="detail-wrapper">
        <h4>{name}</h4>
        <h3>{japaneseTypes.join(' / ')}</h3>
      </div>
    </div>
  );
};

// デフォルトエクスポートする
export default PokemonThumbnails;
