import { NightwatchBrowser } from 'nightwatch';

export = {
  before(client: NightwatchBrowser) {
    client.url(client.launch_url).waitForElementVisible('body', 10000);
  },

  ProductList(client: NightwatchBrowser) {
    client.assert.containsText('body', 'Neko Bus');
  },

  ToggleCheckout(client: NightwatchBrowser) {
    client.assert
      .elementNotPresent('.Checkout')
      .click('header a[href="/checkout"]')
      .waitForElementVisible('.Checkout', 10000)
      .back()
      .waitForElementNotPresent('.Checkout', 10000);
  },

  after(client: NightwatchBrowser) {
    client.end();
  },
};
