import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/widget.ts',
  output: {
    file: 'dist/widget.js',
    format: 'umd',
    name: 'ChatWidget'
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
}