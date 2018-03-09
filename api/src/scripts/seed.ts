// tslint:disable:no-console

import { readFileSync } from 'fs';
import * as _ from 'lodash';
import * as ProgressBar from 'progress';
import { BrandCreateInput } from '../schema';
import { Prisma, Product, ProductCreateInput } from './../generated/prisma';
/*
1. Goto http://www.teefury.com/collections/cats-collection
2. Write:

```js
copy([...document.querySelectorAll('.item')].map((node) => {
  return {
    thumbnail: node.querySelector('.thumbnail').src.replace(/^http(s)?:/, ''),
    slug: node.querySelector('[itemprop=url]').href.match('/([^\/]+)$')[1],
    name: node.querySelector('[itemprop=name]').innerText,
    brand: {
      url: node.querySelector('[itemprop=brand]').href,
      name: node.querySelector('[itemprop=brand]').innerText,
      slug: node.querySelector('[itemprop=brand]').href.match('/([^\/]+)$')[1],
    },
    price: parseInt(node.querySelector('[itemprop=price]').innerText) * 1000
  }
}));
```
*/

const prisma = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
  secret: process.env.PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
  debug: false, // log all GraphQL queries & mutations
});

let bar: ProgressBar;

async function main() {
  const seed: Product[] = JSON.parse(readFileSync(`${__dirname}/seed.json`, 'utf8'));

  const existingProducts = await prisma.query.products({});
  if (existingProducts.length) {
    throw new Error('There are already products in the db.');
  }

  const brands: BrandCreateInput[]  = _(seed)
    .map(({ brand }) => brand)
    .uniqBy(({ slug }) => slug)
    .valueOf();

  const products: ProductCreateInput[] = seed.map((product) => {
    const input: ProductCreateInput = {
      ..._.pick(product, ['name', 'price', 'slug', 'thumbnail']),
      brand: {
        connect: {
          slug: product.brand.slug,
        },
      },
    };
    return input;
  });

  bar = new ProgressBar('  seeding database [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: brands.length + products.length,
  });

  for (const data of brands) {
    await prisma.mutation.createBrand({
      data,
    });
    bar.tick();
  }

  for (const data of products) {
    await prisma.mutation.createProduct({
      data,
    });
    bar.tick();
  }
  console.log('\n');
}

main().then(() => {
  console.log('🎉  Seed successful');
  process.exit(0);
}).catch(e => {
  console.error(e);
  console.error('\n❌  Seed failed. See above.');
  process.exit(1);
});
