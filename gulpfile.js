const path = require(`path`);
const gulp = require(`gulp`);
const gts = require(`gulp-typescript`);
const gsourcemaps = require(`gulp-sourcemaps`);
const gtd = require(`gulp-typedoc`);
const gpug = require(`gulp-pug`);
const gconcat = require(`gulp-concat`);
const gsass = require(`gulp-sass`);
const gsrc = require(`gulp-add-src`);
const gistanbul = require(`gulp-istanbul`);
const greport = require(`gulp-istanbul-report`);
const gremap = require(`remap-istanbul/lib/gulpRemapIstanbul`);
const gmocha = require(`gulp-mocha`);
const gtslint = require(`gulp-tslint`);
const gfunc = require(`gulp-function`).forEach;
const runSequence = require(`run-sequence`);
const isparta = require(`isparta`);
const combine = require(`istanbul-combine`);
const fsx = require(`fs-extra`);
const del = require(`del`);

// Read package.json contents for use in tasks
const pkg = require(`./package.json`);

// Read arguments to gulp tasks
const argv = require(`yargs`)
.boolean(`skipCoverage`)
.boolean(`skipLint`)
.argv;

// --------------------------------------------------------------------[ BUILD ]

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
    gulp.series(`build:scripts`, `build:html`, `build:styles`, `build:fonts`),
    () => {}
);

// ---------------------------------------------------------------------[ TEST ]

/**
 * Compile the specs - this needs to be done as the specs are written
 * in TypeScript.
 */
gulp.task(`test:build`, () => {
    return gulp.src([`src/test/specs/*.ts`])
    .pipe(gts({
        noImplicitAny: true,
        target: `es6`,
        jsx: `react`,
        module: `commonjs`
    }))
    .js.pipe(gulp.dest(`target/test/specs`));
});

/**
 * Copy the built distribution over to a testing directory. This is
 * necessary because the sourcemaps remapping for istanbul cannot handle
 * the js sourcemap being in the same file as the ts remap - however
 * it can follow the paths; it otherwise has no effect on the tests
 */
gulp.task(`test:copy`, () => {
    return gulp.src([`target/dist/**/*`])
    .pipe(gulp.dest(`target/test/dist`));
});

/**
 * Run the compiled spec files
 */
gulp.task(`test:run`, () => {
    return gulp.src([`target/test/specs/*.spec.js`], {read:false})
    .pipe(gmocha({
        timeout: 0
    }));
});

// ----------------------------------------------------------------[ TEST:LINT ]

/**
 * Perform linting on source code
*/
gulp.task(`test:lint`, () => {
    return gulp.src([`src/main/ts/*.ts`])
    .pipe(gtslint({
        formatter: `stylish`
    }))
    .pipe(gtslint.report({
        emitError: false
    }));
});

// ---------------------------------------------------------------[ TEST:COVER ]

/**
*/
gulp.task(`test:cover:instrument`, () => {
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
 * Manually create certain target directories as some of the gulp tasks
 * will not work unless they already exist.
 */
gulp.task('test:cover:targets', (done) => {
    fsx.mkdirsSync('target/reports/coverage');
    done();
});

/**
 * combine coverage reports for all tests that have been run.
 */
gulp.task(`test:cover:combine`, (done) => {
    combine.sync({
        dir: `target/reports/coverage`,
        pattern: `target/reports/coverage/*.json`, /* todo: should this target specific json file patterns in case of unclean environment? */
        print: `detail`,
        reporters: {
            json: { file: `coverage-combined.json` }
        }
    });
    done();
});

/**
 * remap the coverage reports back to their original source files and generate
 * reports based on that.
 */
gulp.task(`test:cover:remap`, () => {
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
gulp.task(`test:cover:html`, () => {
    return gulp.src([`target/reports/coverage/coverage-remap.json`])
    .pipe(greport({
        reporters: [{
            name: `html`,
            dir: `target/reports/coverage/html`
        }]
    }));
});

/**
*/
gulp.task(`test:cover:run`, gulp.series(
    `test:cover:targets`, `test:cover:instrument`, `test:run`, `test:cover:combine`, `test:cover:remap`, `test:cover:html`
));


/**
 * Run the tests on the compiled specs
 */
gulp.task(`test`, gulp.series(
    `build`,
    ...[argv.skipLint ? [] : `test:lint`],
    `test:copy`,
    `test:build`,
    argv.skipCoverage ? `test:run` : `test:cover:run`
));

// --------------------------------------------------------------------[ UTILS ]

/**
 * Clean output directories
*/
gulp.task(`clean`, () => {
    return del([`target`]);
});

/**
 * Generate the documentation
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

