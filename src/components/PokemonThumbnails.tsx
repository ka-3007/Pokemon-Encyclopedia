/* eslint-disable @next/next/no-img-element */
import React from 'react';

type Props = {
  id: number;
  name: string;
  image: string;
  iconImage: string;
  type: string;
  japaneseTypes: string[];
  description: string;
};

// アロー関数でコンポーネントを定義
const PokemonThumbnails = ({ id, name, image, iconImage, type, japaneseTypes, description }: Props) => {
  const style = `thumb-container ${type}`;

  return (
    <div className={style}>
      <div className="number">
        <small>#0{id}</small>
      </div>
      <img src={image} alt={name} />
      <img src={iconImage} alt={name} className="icon-image" />
      <div className="detail-wrapper">
        <h4>{name}</h4>
        <h3>{japaneseTypes.join(' / ')}</h3>

        {/* <p>{description}</p> */}
      </div>
    </div>
  );
};

// デフォルトエクスポートする
export default PokemonThumbnails;
