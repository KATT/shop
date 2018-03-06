import * as request from 'supertest';
import { Order, Product } from './generated/prisma';
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

async function createOrder(): Promise<Order> {
  const query = `
    mutation {
      createOrder {
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

  const order: Order = body.data.createOrder;
  return order;
}

it('mutation.createOrder', async () => {
  const order = await createOrder();

  expect(Array.isArray(order.products)).toBeTruthy();
});

class GraphQLError extends Error {
  public errors: any[];
}

async function addProductToOrder(variables = {}): Promise<Order> {
  const query = `
    mutation ($orderId: String! $productId: String! $quantity: Int) {
      addProductToOrder (orderId: $orderId productId: $productId quantity: $quantity) {
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

  const order: Order = body.data.addProductToOrder;
  return order;
}

describe('mutation.addProductToOrder', () => {
  let products: Product[];

  beforeAll(async () => {
    products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it('is possible to add a product to order', async () => {
    const order = await createOrder();

    const [product] = products;
    const orderAfter = await addProductToOrder({
      orderId: order.id,
      productId: product.id,
    });

    expect(orderAfter.id).toEqual(order.id);
    expect(orderAfter.products).toHaveLength(1);

    expect(orderAfter.products[0].quantity).toEqual(1);
    expect(orderAfter.products[0].product.id).toEqual(product.id);
    expect(orderAfter.products[0].product.name).toEqual(product.name);
  });

  it('when adding same product several times, it increases quantity', async () => {
    const order = await createOrder();

    const [product] = products;
    const opts = {
      orderId: order.id,
      productId: product.id,
    };
    await addProductToOrder(opts);
    await addProductToOrder(opts);
    await addProductToOrder(opts);
    await addProductToOrder(opts);

    const orderAfter = await addProductToOrder(opts);

    expect(orderAfter.products).toHaveLength(1);

    expect(orderAfter.products[0].quantity).toEqual(5);
    expect(orderAfter.products[0].product.id).toEqual(product.id);
    expect(orderAfter.products[0].product.name).toEqual(product.name);
  });

  it('works to add different products', async () => {
    expect(products.length).toBeGreaterThan(1);

    const order = await createOrder();

    const [firstProduct, secondProduct] = products;

    await addProductToOrder({
      orderId: order.id,
      productId: firstProduct.id,
    });
    const orderAfter = await addProductToOrder({
      orderId: order.id,
      productId: secondProduct.id,
    });

    expect(orderAfter.products).toHaveLength(2);

    expect(orderAfter.products[0].quantity).toEqual(1);
    expect(orderAfter.products[0].product.id).toEqual(firstProduct.id);
    expect(orderAfter.products[0].product.name).toEqual(firstProduct.name);

    expect(orderAfter.products[1].quantity).toEqual(1);
    expect(orderAfter.products[1].product.id).toEqual(secondProduct.id);
    expect(orderAfter.products[1].product.name).toEqual(secondProduct.name);
  });

  it('works to add several of the same product in one query', async () => {
    const order = await createOrder();

    const [product] = products;
    const quantity = 20;

    const orderAfter = await addProductToOrder({
      orderId: order.id,
      productId: product.id,
      quantity,
    });

    expect(orderAfter.id).toEqual(order.id);
    expect(orderAfter.products).toHaveLength(1);

    expect(orderAfter.products[0].quantity).toEqual(quantity);
    expect(orderAfter.products[0].product.id).toEqual(product.id);
    expect(orderAfter.products[0].product.name).toEqual(product.name);
  });

  it('errors when supplying invalid quantity', async () => {
    const order = await createOrder();

    const [product] = products;
    const quantity = 0;

    let err: GraphQLError;

    try {
      await addProductToOrder({
        orderId: order.id,
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
