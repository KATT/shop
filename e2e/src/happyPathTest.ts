import {NightwatchBrowser} from 'nightwatch';

// Not sure if this is the right way to share props..
const firstProductSelector = '[itemType="http://schema.org/Product"]:first-child';

const priceSelector = '[itemProp="price"]';
const nameSelector = '[itemProp="name"]';

let productName: string;

export = {
  before(client: NightwatchBrowser) {
    client
      .url(client.launch_url)
      .waitForElementVisible('body', 1000);
  },

  AddItemToCart(client: NightwatchBrowser) {
    client.getText(`${firstProductSelector} ${nameSelector}`, ({value}) => {
      productName = value;
    });
    client.click(`${firstProductSelector} button`);
  },

  GoToCheckout(client: NightwatchBrowser) {
    client
      .assert.elementNotPresent('.Checkout')
      .click('header a[href="/checkout"]')
      .waitForElementVisible('.Checkout', 1000);
  },

  VerifyItemInCart(client: NightwatchBrowser) {
    client.verify.containsText('.Checkout', productName);
  },

  after(client: NightwatchBrowser) {
    client.end();
  },
};
