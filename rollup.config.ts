import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
// uglify the dist code
import { terser } from 'rollup-plugin-terser'
import builtins from 'rollup-plugin-node-builtins'

const pkg = require('./package.json')
const isProduction = process.env.NODE_ENV === 'production'
const moduleName = 'MeetJS'

export default {
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  // external: ['eosjs'],
  input: `src/index.ts`,
  output: [
    // for the UMD styles modules
    {
      file: pkg.main,
      name: moduleName,
      exports: 'named' /** Disable warning for default imports */,
      format: 'umd'
    },

    // // for the ECMAScript styles modules
    {
      file: pkg.module,
      name: moduleName,
      exports: 'named' /** Disable warning for default imports */,
      format: 'es',
      sourcemap: true
    },

    // for the IIFE styles modules
    {
      file: pkg.iife,
      name: moduleName,
      exports: 'named' /** Disable warning for default imports */,
      format: 'iife'
    }
  ],
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'node_modules/punycode/punycode.js': ['toASCII']
      }
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true
    }),

    // Resolve source maps to the original source
    sourceMaps(),
    builtins(),
    isProduction && terser()
  ]
}
