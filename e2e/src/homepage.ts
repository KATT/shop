import {NightwatchAPI} from 'nightwatch';

export = {
  HomePage(client: NightwatchAPI) {
    client
      .url('http://localhost:5000')
      .waitForElementVisible('body', 1000)
      .assert.containsText('body', 'Air Max', 'Contains any "Air Max" product');
  },

  after(client: NightwatchAPI) {
    client.end();
  },
};
