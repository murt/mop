const path = require(`path`);
const { Application } = require(`spectron`);

module.exports.setup = (ctx) => {
    ctx.app = new Application({
        path: path.resolve(`node_modules`, `.bin`, `electron`),
        args: [path.resolve(`target`, `dist`, `main.js`)]
    });
    return ctx.app.start();
};

module.exports.teardown = (ctx) => {
    if (ctx.app && ctx.app.isRunning()) {
        return ctx.app.stop();
    }
};
