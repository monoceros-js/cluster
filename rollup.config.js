import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import { global, filename } from './monoceros.config.json'

const babelOptions = {
  exclude: /node_modules/,
  babelrc: false,
}

const output = [
  {
    file: `./dist/${filename}.js`,
    format: 'esm',
    name: global,
  },
]

export default {
  input: './src/index.js',
  output,
  plugins: [resolve(), babel(babelOptions)],
}
