import * as request from 'supertest';
import { Cart, Product } from './generated/prisma';
import server from './server';

const {
  PRISMA_DEBUG,
  PRISMA_ENDPOINT,
  PRISMA_SECRET,
} = process.env;

let app;

async function getProducts(): Promise<Product[]> {
  const query = `
    query {
      products {
        id
        name
      }
    }
  `;

  const variables = {};
  const {body} = await request(app)
    .post('/')
    .send({
      query,
      variables,
    });
  expect(body).not.toHaveProperty('errors');
  expect(body).toHaveProperty('data');

  expect(Array.isArray(body.data.products)).toBeTruthy();

  return body.data.products;
}

beforeAll(async () => {
  app = await server({
    PRISMA_ENDPOINT,
    PRISMA_SECRET,
    PRISMA_DEBUG: false,
  }).start({port: 4010});
});
afterAll(() => app.close());

it('query.products()', async () => {
  const products = await getProducts();
});

async function createCart(): Promise<Cart> {
  const query = `
    mutation {
      createCart {
        id
        products {
          quantity
          product {
            id
            name
          }
        }
      }
    }
  `;

  const variables = {};
  const {body} = await request(app)
    .post('/')
    .send({
      query,
      variables,
    });
  expect(body).not.toHaveProperty('errors');
  expect(body).toHaveProperty('data');

  const cart: Cart = body.data.createCart;
  return cart;
}

it('mutation.createCart', async () => {
  const cart = await createCart();

  expect(Array.isArray(cart.products)).toBeTruthy();
});

class GraphQLError extends Error {
  public errors: any[];
}

async function addProductToCart(variables = {}): Promise<Cart> {
  const query = `
    mutation ($cartId: String! $productId: String! $quantity: Int) {
      addProductToCart (cartId: $cartId productId: $productId quantity: $quantity) {
        id
        products {
          quantity
          product {
            id
            name
          }
        }
      }
    }
  `;

  const {body} = await request(app)
    .post('/')
    .send({
      query,
      variables,
    });
  if (body.errors) {
    const err = new GraphQLError();
    err.errors = body.errors;
    throw err;
  }
  expect(body).toHaveProperty('data');

  const cart: Cart = body.data.addProductToCart;
  return cart;
}

describe('mutation.addProductToCart', () => {
  let products: Product[];

  beforeAll(async () => {
    products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it('is possible to add a product to cart', async () => {
    const cart = await createCart();

    const [product] = products;
    const cartAfter = await addProductToCart({
      cartId: cart.id,
      productId: product.id,
    });

    expect(cartAfter.id).toEqual(cart.id);
    expect(cartAfter.products).toHaveLength(1);

    expect(cartAfter.products[0].quantity).toEqual(1);
    expect(cartAfter.products[0].product.id).toEqual(product.id);
    expect(cartAfter.products[0].product.name).toEqual(product.name);
  });

  it('when adding same product several times, it increases quantity', async () => {
    const cart = await createCart();

    const [product] = products;
    const opts = {
      cartId: cart.id,
      productId: product.id,
    };
    await addProductToCart(opts);
    await addProductToCart(opts);
    await addProductToCart(opts);
    await addProductToCart(opts);

    const cartAfter = await addProductToCart(opts);

    expect(cartAfter.products).toHaveLength(1);

    expect(cartAfter.products[0].quantity).toEqual(5);
    expect(cartAfter.products[0].product.id).toEqual(product.id);
    expect(cartAfter.products[0].product.name).toEqual(product.name);
  });

  it('works to add different products', async () => {
    expect(products.length).toBeGreaterThan(1);

    const cart = await createCart();

    const [firstProduct, secondProduct] = products;

    await addProductToCart({
      cartId: cart.id,
      productId: firstProduct.id,
    });
    const cartAfter = await addProductToCart({
      cartId: cart.id,
      productId: secondProduct.id,
    });

    expect(cartAfter.products).toHaveLength(2);

    expect(cartAfter.products[0].quantity).toEqual(1);
    expect(cartAfter.products[0].product.id).toEqual(firstProduct.id);
    expect(cartAfter.products[0].product.name).toEqual(firstProduct.name);

    expect(cartAfter.products[1].quantity).toEqual(1);
    expect(cartAfter.products[1].product.id).toEqual(secondProduct.id);
    expect(cartAfter.products[1].product.name).toEqual(secondProduct.name);
  });

  it('works to add several of the same product in one query', async () => {
    const cart = await createCart();

    const [product] = products;
    const quantity = 20;

    const cartAfter = await addProductToCart({
      cartId: cart.id,
      productId: product.id,
      quantity,
    });

    expect(cartAfter.id).toEqual(cart.id);
    expect(cartAfter.products).toHaveLength(1);

    expect(cartAfter.products[0].quantity).toEqual(quantity);
    expect(cartAfter.products[0].product.id).toEqual(product.id);
    expect(cartAfter.products[0].product.name).toEqual(product.name);
  });

  it('errors when supplying invalid quantity', async () => {
    const cart = await createCart();

    const [product] = products;
    const quantity = 0;

    let err: GraphQLError;

    try {
      await addProductToCart({
        cartId: cart.id,
        productId: product.id,
        quantity,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(Error);

    expect(err.errors[0].message).toBe('quantity must be greater than 0');
  });
});
