import 'electron';
import 'spectron';

const fs = require('graceful-fs');
const uuid = require('uuid');
const path = require('path');
const { Application } = require('spectron');

const coverage:string[] = [];

const storeCov = (cov:object) => {
  coverage.push(JSON.stringify(cov));
};

interface MochaContext {
  app: any; /*spectron.Application - spectron team is working on this*/
}

export function timeout (ctx:any) {
  ctx.timeout(60000);
}

export function beforeEach (ctx:MochaContext) {
  ctx.app = new Application({
    path: path.resolve('node_modules', '.bin', 'electron'),
    args: [path.resolve('target', 'test', 'dist', 'main.js')]
  });

  return ctx.app.start();
}

export function afterEach (ctx:MochaContext) {
  if (ctx.app && ctx.app.isRunning()) {
    return ctx.app.electron.remote.getGlobal('__coverage__')
    .then(storeCov)
    .then(() => ctx.app.client.execute(function() { return (<any>window).__coverage__; }))
    .then(res => storeCov(res.value))
    .then(() => ctx.app.stop());
  }
}

export function after (ctx:MochaContext) {
  if (coverage.length) {
    coverage.forEach((cov:string) => {
      fs.writeFileSync(path.resolve('target', 'reports', 'coverage', `${uuid.v4()}.json`), cov);
    });
  }
}
