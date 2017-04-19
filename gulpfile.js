const gulp = require(`gulp`);
const gclean = require(`gulp-clean`);
const gts = require(`gulp-typescript`);
const gtd = require(`gulp-typedoc`);
const gpug = require(`gulp-pug`);

const pkg = require(`./package.json`);

/**
*/
gulp.task(`build#scripts`, () => {
    const tsp = gts.createProject(`tsconfig.json`);
    return tsp.src()
    .pipe(tsp())
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
gulp.task(`build#electron`, () => {
    console.log(`building electron...`);
});

/**
*/
gulp.task(`build`, [`scripts`, `html`, `electron`].map(t => `build#${t}`), () => {
    console.log(`building...?`);
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
        target: `es5`,
        includeDeclarations: true,
        excludeExternals: true,

        out: `./target/docs`,
        json: `./target/docs/defs.json`,

        name: pkg.name,
        ignoreCompilerErrors: false,
        version: true
    }));
});
