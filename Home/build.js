const esbuild = require('esbuild')

const buildParams = {
  color: true,
  define: {
    global: 'window'
  },
  entryPoints: ['src/index.js'],
  loader: {
    '.js': 'jsx',
    '.html': 'text',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.eot': 'file',
    '.ttf': 'file',
    '.gif': 'file'
  },
  bundle: true,
  outdir: 'build',
  minify: true,
  format: 'cjs',
  sourcemap: true,
  logLevel: 'info',
  inject: ['./esbuild-require.js']
}

esbuild.build(buildParams).catch(() => process.exit(1))
