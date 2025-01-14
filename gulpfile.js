var gulp = require('gulp');
var $ = require('gulp-load-plugins')({rename: {'gulp-rev-delete-original':'revdel', 'gulp-if': 'if'}});

gulp.task('copy', function() {
    return gulp.src(['site/assets/{img,font}/**/*', 'site/app.yaml'], {base: 'site'})
        .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function() {
    return gulp.src('dist/', {read: false})
        .pipe($.clean());
});
        
gulp.task('minify-js', function() {
    return gulp.src('site/**/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest('dist/'))
});

gulp.task('minify-css', function() {
    return gulp.src('site/**/*.css')
        .pipe($.cssnano({safe: true}))
        .pipe(gulp.dest('dist/'))
});

gulp.task('minify-html', function() {
    return gulp.src('site/**/*.html')
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/'))
});

gulp.task('useref', function () {
    return gulp.src('site/index.html')
        .pipe($.useref())
        .pipe($.if('*.html', $.inlineSource()))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano({safe: true})))
        .pipe(gulp.dest('dist'));
});

gulp.task('imagemin', function() {
    return gulp.src('site/assets/img/*')
        .pipe($.imagemin({
            rogressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ]
        }))
            .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('rev', function(){
    return gulp.src(['dist/**/*.{css,js,jpg,jpeg,png,svg}'])
        .pipe($.rev())
        .pipe($.revdel())
        .pipe(gulp.dest('dist/'))
        .pipe($.rev.manifest())
        .pipe(gulp.dest('dist/'))
})

gulp.task('revreplace', ['rev'], function(){
    return gulp.src(['dist/index.html', 'dist/app.yaml', 'dist/**/*.css'])
        .pipe($.revReplace({
            manifest: gulp.src('dist/rev-manifest.json'),
            replaceInExtensions: ['.html', '.yaml', '.js', '.css']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('minify', ['minify-js', 'minify-css', 'minify-html']);
gulp.task('build', $.sequence(['minify-js', 'minify-css', 'imagemin'], 'useref', 'revreplace'));
gulp.task('default', $.sequence('clean', 'copy', 'build'));
