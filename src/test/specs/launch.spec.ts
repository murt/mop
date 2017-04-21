import 'mocha';
const chai = require('chai');
const { expect } = chai;

const utils = require('./utils');

describe('mop#launch', function () {
  utils.timeout(this);

  after(function () {
    return utils.after(this);
  });

  beforeEach(function () {
    return utils.beforeEach(this);
  });

  afterEach(function () {
    return utils.afterEach(this);
  });

  it('shows an initial window', function () {
    return this.app.client.waitUntilWindowLoaded()
    .getWindowCount().then(function(count:number) { expect(count).to.be.at.least(1) })
  });

});
