/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
    'postprocessing',
  ],
  webpack(config) {
    config.module.rules.push({
      test:    /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use:     ['raw-loader'],
    })
    return config
  },
  images: {
    domains: [],
  },
}

export default config
