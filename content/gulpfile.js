var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var cssshrink = require('gulp-cssshrink');
var header = require('gulp-header');
var size = require('gulp-size');
var connect = require('gulp-connect');

var jade = require('gulp-jade');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-ruby-sass');
var minifycss = require('gulp-minify-css');


var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');


var onError = function (err) {
    gutil.beep();
    console.log(err);
    console.log('*****MESSAGE*****');
    console.log(err.message);
};

var paths = {
    jade: ['./partials/jade/*.jade'],
    fonts: ['./icon-fonts/**/*.*'],
    scripts: ['./js/app/*.js', './js/modules/*.js'],
    sass: ['./sass/*.scss', './sass/**/*.scss', './sass/*.sass', './sass/**/*.sass']
};


gulp.task('move', function(){
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  gulp.src(paths.fonts, { base: './' })
  .pipe(gulp.dest('../public/'))
});

/**
 * Compile JADE into HTML
 */
gulp.task('fonts', function () {
    gulp.src(paths.fonts)
        .pipe(connect.reload())
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(jade({
            pretty: false
        }))
        .pipe(gulp.dest('../public/icon-fonts/'))
});

/**
 * Compile JADE into HTML
 */
gulp.task('jade', function () {
    gulp.src(paths.jade)
        .pipe(connect.reload())
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(jade({
            pretty: false
        }))
        .pipe(gulp.dest('../public/partials/'))
});

/**
 * Concat app scripts
 */
gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(connect.reload())
        .pipe(concat('built.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(size({title: 'built.js'}))
        .pipe(gulp.dest('../public/js/dist/'))
        .pipe(rename('built.min.js'))
        .pipe(uglify())
        .pipe(size({title: 'built.min.js'}))
        .pipe(gulp.dest('../public/js/dist/'))
});

/**
 * Compile SASS files
 */
gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(connect.reload())
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sass({
            quiet: true,
            lineNumbers: true,
            sourcemap: false,
            style: 'compressed',
            loadPath: require('node-neat').includePaths
        }))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(size({title: 'style.css'}))
        .pipe(gulp.dest('../public/css/'))
});

gulp.task('minify-css', function() {
  gulp.src(['../public/css/*.css', '../public/css/**/*.css'])
    .pipe(minifycss({keepBreaks:true}))
    .pipe(gulp.dest('../public/dist/'))
});



/**
 *Watch files
 */
gulp.task('watch:jade', function () {
    gulp.watch(paths.jade, ['jade']);
});
gulp.task('watch:fonts', function () {
    gulp.watch(paths.fonts, ['fonts']);
});
gulp.task('watch:scripts', function () {
    gulp.watch(paths.scripts, ['scripts']);
});
gulp.task('watch:sass', function () {
    gulp.watch(paths.sass, ['sass']);
});
gulp.task('watch:dev', ['watch:jade', 'watch:scripts', 'watch:sass']);




/**
 * Default task
 */
gulp.task('buildAssets', ['jade','scripts','sass']);
//gulp.task('default', ['buildAssets','watch:dev']);
gulp.task('default', ['watch:dev']);