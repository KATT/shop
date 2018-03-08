import {NightwatchBrowser} from 'nightwatch';

export = {
  before(client: NightwatchBrowser) {
    client
      .url(client.launch_url)
      .waitForElementVisible('body', 1000);
  },

  ProductList(client: NightwatchBrowser) {
    client
      .assert.containsText('body', 'Neko Bus');
  },

  ToggleCheckout(client: NightwatchBrowser) {
    client
      .assert.elementNotPresent('.Checkout')
      .click('#checkout-link')
      .waitForElementVisible('.Checkout', 1000)
      .click('#checkout-link')
      .waitForElementNotPresent('.Checkout', 1000);
  },

  after(client: NightwatchBrowser) {
    client.end();
  },
};
