import 'electron';
import 'spectron';

const path = require(`path`);
const { Application } = require(`spectron`);

interface MochaContext {
  app: any; /*spectron.Application - spectron team is working on this*/
}

export function setup (ctx:MochaContext) {
    ctx.app = new Application({
        path: path.resolve(`node_modules`, `.bin`, `electron`),
        args: [path.resolve(`target`, `test`, `dist`, `main.js`)]
    });
    return ctx.app.start();
}

export function teardown (ctx:MochaContext) {
    if (ctx.app && ctx.app.isRunning()) {
        return ctx.app.stop();
    }
}
