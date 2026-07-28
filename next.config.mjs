/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      // PokeAPIのスプライト画像 (official-artwork / dream_world / home など)
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
    // 配信元 (raw.githubusercontent.com) のキャッシュ期限は5分と短いため、
    // 最適化済み画像を1日キャッシュしてブラウザにも長期キャッシュさせる
    minimumCacheTTL: 60 * 60 * 24,
    // dream_worldのスプライトとローカルのフォールバック画像がSVGのため許可する
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
