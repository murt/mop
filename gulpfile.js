const path = require(`path`);
const gulp = require(`gulp`);
const gclean = require(`gulp-clean`);
const gts = require(`gulp-typescript`);
const gsourcemaps = require(`gulp-sourcemaps`);
const gtd = require(`gulp-typedoc`);
const gpug = require(`gulp-pug`);
const gconcat = require(`gulp-concat`);
const gsass = require(`gulp-sass`);
const gsrc = require(`gulp-add-src`);
const gmocha = require(`gulp-mocha`);
const gistanbul = require(`gulp-istanbul`);
const greport = require(`gulp-istanbul-report`);
const gremap = require(`remap-istanbul/lib/gulpRemapIstanbul`);
const gtslint = require(`gulp-tslint`);
const runSequence = require(`run-sequence`);
const isparta = require(`isparta`);
const combine = require(`istanbul-combine`);
const fsx = require(`fs-extra`);

const pkg = require(`./package.json`);

/**
 * Compile TypeScript.
 */
gulp.task(`build:scripts`, () => {
    const tsp = gts.createProject(`tsconfig.json`);
    return tsp.src()
    .pipe(gsourcemaps.init())
    .pipe(tsp())
    .once("error", function () {
        this.once("finish", () => process.exit(1));
    })
    .js.pipe(gsourcemaps.write())
    .pipe(gulp.dest(`target/dist`));
});

/**
 * Compile Pug templates.
 */
gulp.task(`build:html`, () => {
    return gulp.src([`src/main/pug/*.pug`])
    .pipe(gpug({}))
    .pipe(gulp.dest(`target/dist`));
});

/**
 * Compile SASS templates and concatenate any third-party frameworks.
 */
gulp.task(`build:styles`, () => {
    return gulp.src([`src/main/sass/style.sass`])
    .pipe(gsass().on(`error`, gsass.logError))
    .pipe(gsrc.prepend(`node_modules/bulma/css/bulma.css`))
    .pipe(gconcat(`style.css`))
    .pipe(gulp.dest(`target/dist`));
});

/**
 * Copy fonts over.
 */
gulp.task(`build:fonts`, () => {
    return gulp.src([`src/main/font/*.*`])
    .pipe(gulp.dest(`target/dist/fonts`));
});

/**
*/
gulp.task(
    `build`,
    [`scripts`, `html`, `styles`, `fonts`].map(t => `build:${t}`),
    () => {}
);

/**
 * Compile the specs - this needs to be done as the specs are written
 * in TypeScript.
 */
gulp.task(`test:specs`, () => {
    return gulp.src([`src/test/specs/*.ts`])
    .pipe(gts())
    .js.pipe(gulp.dest(`target/test/specs`));
});

/**
 * Run the tests on the compiled specs
 */
gulp.task(`test`, [`build`, `test:specs`], () => {
    return gulp.src([`target/test/specs/*.spec.js`], {read:false})
    .pipe(gmocha());
});

/**
 * Instrument the compiled
 */
gulp.task(`cover:instrument`, () => {
    return gulp.src([`target/dist/*.js`])
    .pipe(gsourcemaps.init())
    .pipe(gistanbul({
        includeUntested: true,
        coverageVariable: `__coverage__`
    }))
    .pipe(gsourcemaps.write())
    .pipe(gulp.dest(`target/test/dist`))
});

/**
*/
gulp.task(`cover:test`, [`test:specs`], () => {
    return gulp.src([`target/test/specs/*.spec.js`], {read:false})
    .pipe(gmocha());
});

/**
 * Combine coverage reports for all tests that have been run.
 */
gulp.task(`cover:combine`, () => {
    combine.sync({
        dir: `target/reports/coverage`,
        pattern: `target/reports/coverage/*.json`, /* TODO: Should this target specific JSON file patterns in case of unclean environment? */
        print: `detail`,
        reporters: {
            json: { file: `coverage-combined.json` }
        }
    });
});

/**
 * Remap the coverage reports back to their original source files and generate
 * reports based on that.
 */
gulp.task(`cover:remap`, () => {
    return gulp.src([`target/reports/coverage/coverage-combined.json`])
    .pipe(gremap({
        basePath: path.resolve(`src`, `main`, `ts`),
        fail: true,
        reports: {
            text: '',
            json: 'target/reports/coverage/coverage-remap.json',
            lcovonly: 'target/reports/coverage/lcov.info'
        }
    }));
});

/**
 * Generate the html report manually in a task - this is primarily done
 * as the remap-istanbul task fails to generate the html report
 * correctly. Note that this is a relatively tentative solution
 */
gulp.task(`cover:html`, () => {
    return gulp.src([`target/reports/coverage/coverage-remap.json`])
    .pipe(greport({
        reporters: [{
            name: `html`,
            dir: `target/reports/coverage/html`
        }]
    }));
});

/**
 * Manually create certain target directories as some of the gulp tasks
 * will not work unless they already exist.
 */
gulp.task('targets', () => {
    fsx.mkdirsSync('target/reports/coverage');
});

/**
*/
gulp.task(`cover`, function (done) {
    runSequence(`targets`, `cover:instrument`, `cover:test`, `cover:combine`, `cover:remap`, `cover:html`, done);
});

/**
*/
gulp.task(`clean`, () => {
    return gulp.src([`target`], {read: false}).pipe(gclean());
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

/**
*/
gulp.task(`lint`, () => {
    return gulp.src([`src/main/ts/*.ts`])
    .pipe(gtslint({
        formatter: `stylish`
    }))
    .pipe(gtslint.report({
        emitError: false
    }));
});
