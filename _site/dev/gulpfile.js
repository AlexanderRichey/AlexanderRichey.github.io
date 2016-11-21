var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var webpack = require('webpack-stream');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concatCss = require('gulp-concat-css');
var cleanCSS = require('gulp-clean-css');


gulp.task('sass', function () {
  return gulp.src([
    './node_modules/aos/dist/aos.css',
    './css/devicons.css',
    './css/main.scss'
  ])
  .pipe(sass().on('error', sass.logError))
  .pipe(concatCss('styles.min.css'))
  .pipe(cleanCSS())
  .pipe(gulp.dest('./dist/'));
});

gulp.task('webpack', function() {
  return gulp.src('./javascripts/entry.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./javascripts/'));
});

gulp.task('scripts', function () {
  return gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/aos/dist/aos.js',
      './javascripts/bundle.js'
    ])
      .pipe(concat('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist/'));
  }
);

gulp.task('default', gulpSequence(['webpack', 'sass'], 'scripts'));
