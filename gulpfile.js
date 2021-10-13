const browserify = require('browserify')
const gulp = require('gulp')
const gulpIf = require('gulp-if')
const gulpSass = require('gulp-sass')
const gulpSourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const gulpTerser = require('gulp-terser');

const sass = require('node-sass')

const babelEsmConfig = require('./babel.conf.esm.js')
const babelNomoduleConfig = require('./babel.conf.nomodule')

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const terserOptions = {
    compress: {
        drop_console: true
    }
}

const sassCompiler = gulpSass(sass)

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

function createBuildScriptTask({ entryPoint, outputFile, config}) {
    const taskName = `build-script:${outputFile}`
    gulp.task(taskName, () => {
        return browserify(entryPoint, { debug: isDevelopment })
            .transform('babelify', { ...config, sourceMaps: isDevelopment })
            .bundle()
            .pipe(source(outputFile))
            .pipe(buffer())
            .pipe(gulpIf(isDevelopment, gulpSourcemaps.init({ loadMaps: true })))
            .pipe(gulpIf(isProduction, gulpTerser(terserOptions)))
            .pipe(gulpIf(isDevelopment, gulpSourcemaps.write('./dist/assets/js')))
            .pipe(gulp.dest('./dist/assets/js'))
    })
    return taskName
}

gulp.task('build-script', gulp.series(...scripts.map(createBuildScriptTask)))

gulp.task('build', gulp.series('build-script'))
