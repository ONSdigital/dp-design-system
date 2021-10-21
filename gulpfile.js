const browserify = require('browserify')
const gulp = require('gulp')
const gulpIf = require('gulp-if')
const buffer = require('vinyl-buffer')
const source = require('vinyl-source-stream')
const gulpTerser = require('gulp-terser')
const sass = require('node-sass')
const gulpSass = require('gulp-sass')
const nodeSassGlobImporter = require('node-sass-glob-importer')

const babelEsmConfig = require('./babel.conf.esm.js')
const babelNomoduleConfig = require('./babel.conf.nomodule')

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

const DESIGN_SYSTEM_MODULE_PATH = './node_modules/@ons/design-system'
const OUTPUT_DIRECTORY = './dist/assets'

const scripts = [
  {
    entryPoint: './src/js/main.js',
    outputFile: 'main.js',
    config: babelEsmConfig,
  },
  {
    entryPoint: ['./src/js/polyfills.js', './src/js/main.js'],
    outputFile: 'main.es5.js',
    config: babelNomoduleConfig,
  },
]

function createBuildScriptTask({ entryPoint, outputFile, config }) {
  const taskName = `build-script:${outputFile}`

  const terserOptions = {
    compress: {
      drop_console: true,
    },
  }

  gulp.task(taskName, () => {
    return browserify(entryPoint, { debug: isDevelopment })
      .transform('babelify', { ...config })
      .bundle()
      .pipe(source(outputFile))
      .pipe(buffer())
      .pipe(gulpIf(isProduction, gulpTerser(terserOptions)))
      .pipe(gulp.dest(`${OUTPUT_DIRECTORY}/js`))
  })
  return taskName
}

gulp.task('copy-static-assets-from-design-system', () => {
  gulp
    .src(`${DESIGN_SYSTEM_MODULE_PATH}/fonts/**`)
    .pipe(gulp.dest(`${OUTPUT_DIRECTORY}/fonts`))
  return gulp
    .src(`${DESIGN_SYSTEM_MODULE_PATH}/favicons/**`)
    .pipe(gulp.dest(`${OUTPUT_DIRECTORY}/favicons`))
})

gulp.task('build-styles', () => {
  const sassCompiler = gulpSass(sass)
  const sassOptions = {
    importer: nodeSassGlobImporter(),
    outputStyle: isProduction ? 'compressed' : '',
  }
  
  return gulp
    .src('./src/scss/*.scss')
    .pipe(sassCompiler(sassOptions).on('error', sassCompiler.logError))
    .pipe(gulp.dest('./dist/assets/css'))
})

gulp.task('build-script', gulp.series(...scripts.map(createBuildScriptTask)))

gulp.task('watch-and-build', async () => {
  gulp.watch('./src/js/**', gulp.series('build-script'))
  gulp.watch('./src/scss/**/*.scss', gulp.series('build-styles'))
})

gulp.task(
  'build',
  gulp.series(
    gulp.parallel('build-script', 'build-styles'),
    'copy-static-assets-from-design-system'
  )
)

gulp.task('watch', gulp.series('build', 'watch-and-build'))
