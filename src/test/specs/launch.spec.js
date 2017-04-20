const chai = require(`chai`);
const { expect } = chai;

const utils = require(`./utils`);

describe(`mop#launch`, function () {
    this.timeout(60000);

    beforeEach(function () {
        return utils.setup(this);
    });

    afterEach(function () {
        return utils.teardown(this);
    });

    it(`shows an initial window`, function () {
        return this.app.client.getWindowCount()
        .then(count => expect(count).to.equal(1));
    });
});
