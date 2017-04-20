const gulp = require(`gulp`);
const gclean = require(`gulp-clean`);
const gts = require(`gulp-typescript`);
const gtd = require(`gulp-typedoc`);
const gpug = require(`gulp-pug`);
const gconcat = require(`gulp-concat`);
const gsass = require(`gulp-sass`);
const gsrc = require(`gulp-add-src`);
const gmocha = require(`gulp-mocha`);

const pkg = require(`./package.json`);

/**
*/
gulp.task(`build#scripts`, () => {
    const tsp = gts.createProject(`tsconfig.json`);
    return tsp.src()
    .pipe(tsp())
    .once("error", function () {
        this.once("finish", () => process.exit(1));
    })
    .js.pipe(gulp.dest(`target/dist`));
});

/**
*/
gulp.task(`build#html`, () => {
    return gulp.src([`src/main/pug/*.pug`])
    .pipe(gpug({}))
    .pipe(gulp.dest(`target/dist`));
});

/**
*/
gulp.task(`build#styles`, () => {
    return gulp.src([`src/main/sass/style.sass`])
    .pipe(gsass().on(`error`, gsass.logError))
    .pipe(gsrc.prepend(`node_modules/bulma/css/bulma.css`))
    .pipe(gconcat(`style.css`))
    .pipe(gulp.dest(`target/dist`));
});

/**
*/
gulp.task(`build#fonts`, () => {
    return gulp.src([`src/main/font/*.*`])
    .pipe(gulp.dest(`target/dist/fonts`));
});

/**
*/
gulp.task(
    `build`,
    [`scripts`, `html`, `styles`, `fonts`].map(t => `build#${t}`),
    () => {}
);

/**
*/
gulp.task(`test`, [`build`], () => {
    return gulp.src([`src/test/specs/*.spec.js`])
    .pipe(gmocha());
});

/**
*/
gulp.task(`clean`, () => {
    return gulp.src([`target`], {read: false})
    .pipe(gclean());
});

/**
*/
gulp.task(`doc`, () => {
    return gulp.src([`src/main/ts/*.ts`])
    .pipe(gtd({
        module: `commonjs`,
        target: `es6`,
        includeDeclarations: true,
        excludeExternals: true,

        out: `./target/docs`,
        json: `./target/docs/defs.json`,

        name: pkg.name,
        ignoreCompilerErrors: false,
        version: true
    }));
});
