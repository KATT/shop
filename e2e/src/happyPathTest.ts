import {NightwatchBrowser} from 'nightwatch';

// Not sure if this is the right way to share props..
const priceSelector = '[itemProp="price"]';
const nameSelector = '[itemProp="name"]';
const productSelector = '[itemType="http://schema.org/Product"]';

const firstProductSelector =  `${productSelector}:first-child`;

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
      client.assert.equal(typeof productName, 'string');
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
    client.assert.containsText('.Checkout', productName);
  },

  VerifyOnlyItemInCart(client: NightwatchBrowser) {
    client.elements('css selector', `.Checkout ${productSelector}`, result => {
      client.assert.equal(result.value.length, 1, 'Only one OrderRow');

      client.getText('[aria-label^="Quantity:"]', quantityResult => {
        client.assert.equal(quantityResult.value, '1', 'OrderRow.quantity === 1');
      });
    });
  },

  AddTwoRemoveOne(client: NightwatchBrowser) {
    client.click('.Checkout [aria-label^="Add 1"]');
    client.click('.Checkout [aria-label^="Add 1"]');
    client.click('.Checkout [aria-label^="Remove 1"]');

    client.getText('[aria-label^="Quantity:"]', quantityResult => {
      client.assert.equal(quantityResult.value, '2', 'OrderRow.quantity === 2');
    });
  },
};
