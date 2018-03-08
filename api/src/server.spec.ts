import * as request from 'supertest';
import { Order, Product } from './generated/prisma';
import { APIOrderRow } from './schema';
import server from './server';

const {
  PRISMA_DEBUG,
  PRISMA_ENDPOINT,
  PRISMA_SECRET,
} = process.env;

let app;

interface Body {
  data?: any;
  errors?: Error[];
}

async function graphqlRequest({variables, query}): Promise<Body> {
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

  return body;
}

async function getProducts(): Promise<Product[]> {
  const query = `
    query {
      products {
        id
        name
        price
      }
    }
  `;

  const variables = {};
  const body = await graphqlRequest({query, variables});

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

const defaultOrderFragment = `
  id
  rows {
    id
    quantity
    product {
      id
      name
    }
  }
`;
async function createOrder(fragment = defaultOrderFragment): Promise<Order> {
  const query = `
    mutation {
      createOrder {
        ${defaultOrderFragment}
      }
    }
  `;

  const variables = {};
  const body = await graphqlRequest({query, variables});

  const order: Order = body.data.createOrder;
  return order;
}

async function getOrder(id, fragment = defaultOrderFragment): Promise<Order> {
  const query = `
    query {
      order(id: "${id}") {
        ${defaultOrderFragment}
      }
    }
  `;

  const variables = {};
  const body = await graphqlRequest({query, variables});

  expect(typeof body.data.order).toEqual('object');

  return body.data.order;
}

it('mutation.createOrder', async () => {
  const order = await createOrder();

  expect(Array.isArray(order.rows)).toBeTruthy();
});

class GraphQLError extends Error {
  public errors: any[];
}

interface AddProductToOrderVariables {
  orderId: string;
  productId: string;
  quantity?: number;
}

const defaultOrderRowFragment = `
  id
  product {
    id
    name
  }
  total
  quantity
  order {
    ${defaultOrderFragment}
  }
`;
async function addProductToOrder(
  variables: AddProductToOrderVariables,
  fragment = defaultOrderRowFragment,
): Promise<APIOrderRow> {
  const query = `
    mutation ($orderId: String! $productId: String! $quantity: Int) {
      addProductToOrder (orderId: $orderId productId: $productId quantity: $quantity) {
        ${fragment}
      }
    }
  `;

  const body = await graphqlRequest({query, variables});

  const row: APIOrderRow = body.data.addProductToOrder;
  return row;
}

interface UpdateOrderRowVariables {
  id: string;
  quantity?: number;
}
async function updateOrderRow(
  variables: UpdateOrderRowVariables,
  fragment = defaultOrderRowFragment,
): Promise<APIOrderRow> {
  const query = `
    mutation ($id: ID! $quantity: Int) {
      updateOrderRow (id: $id, quantity: $quantity) {
        ${fragment}
      }
    }
  `;

  const body = await graphqlRequest({query, variables});

  const row: APIOrderRow = body.data.updateOrderRow;
  return row;
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
    const orderRow = await addProductToOrder({
      orderId: order.id,
      productId: product.id,
    });

    expect(orderRow.order.id).toEqual(order.id);
    expect(orderRow.order.rows).toHaveLength(1);

    expect(orderRow.quantity).toEqual(1);
    expect(orderRow.product.id).toEqual(product.id);
    expect(orderRow.product.name).toEqual(product.name);
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

    const row = await addProductToOrder(opts);

    expect(row.order.rows).toHaveLength(1);

    expect(row.quantity).toEqual(5);
    expect(row.product.id).toEqual(product.id);
    expect(row.product.name).toEqual(product.name);
  });

  it('when adding same product several times, in parallell, it increases quantity', async () => {
    const order = await createOrder();

    const [product] = products;
    const opts = {
      orderId: order.id,
      productId: product.id,
    };

    await Promise.all(
      Array(9).fill(null).map(() =>
        addProductToOrder(opts),
      ),
    );

    const row = await addProductToOrder(opts);

    expect(row.order.rows).toHaveLength(1);

    expect(row.quantity).toEqual(10);
    expect(row.product.id).toEqual(product.id);
    expect(row.product.name).toEqual(product.name);
  });

  it('works to add different products', async () => {
    expect(products.length).toBeGreaterThan(1);

    const order = await createOrder();

    const [product1, product2] = products;

    const row1 = await addProductToOrder({
      orderId: order.id,
      productId: product1.id,
    });
    const row2 = await addProductToOrder({
      orderId: order.id,
      productId: product2.id,
    });

    expect(row2.order.rows).toHaveLength(2);

    expect(row1.quantity).toEqual(1);
    expect(row1.product.id).toEqual(product1.id);
    expect(row1.product.name).toEqual(product1.name);

    expect(row2.quantity).toEqual(1);
    expect(row2.product.id).toEqual(product2.id);
    expect(row2.product.name).toEqual(product2.name);
  });

  it('works to add several of the same product in one query', async () => {
    const order = await createOrder();

    const [product] = products;
    const quantity = 20;

    const row = await addProductToOrder({
      orderId: order.id,
      productId: product.id,
      quantity,
    });

    expect(row.order.id).toEqual(order.id);
    expect(row.order.rows).toHaveLength(1);

    expect(row.quantity).toEqual(quantity);
    expect(row.product.id).toEqual(product.id);
    expect(row.product.name).toEqual(product.name);
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

describe('query.order', () => {
  let products: Product[];

  beforeAll(async () => {
    products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it('returns the total of each row', async () => {
    const order = await createOrder();

    const [product] = products;
    const quantity = 2;

    expect(product.price).toBeGreaterThan(0);

    const opts = {
      productId: product.id,
      orderId: order.id,
      quantity,
    };
    const fragment =  `total, order { rows { total } }`;
    const row = await addProductToOrder(opts, fragment);

    expect(row.total).toEqual(product.price * quantity);
    expect(row.order.rows[0].total).toEqual(product.price * quantity);
  });

  it('returns the total of the whole order', async () => {
    const order = await createOrder();

    const [product1, product2] = products;

    expect(product1.price).toBeGreaterThan(0);
    expect(product2.price).toBeGreaterThan(0);

    const opts1 = {
      productId: product1.id,
      orderId: order.id,
    };
    const opts2 = {
      productId: product2.id,
      orderId: order.id,
      quantity: 2,
    };
    const fragment =  `order { total }`;

    const row1 = await addProductToOrder(opts1, fragment);
    expect(row1.order.total).toEqual(product1.price);

    const row2 = await addProductToOrder(opts2, fragment);

    expect(row2.order.total).toEqual(product1.price + product2.price * 2);
  });
});

describe('mutation.updateOrderRow', () => {
  let products: Product[];

  beforeAll(async () => {
    products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it('is possible to change quantity', async () => {
    const order = await createOrder();

    const [product1, product2] = products;

    expect(product1.price).toBeGreaterThan(0);

    const opts1 = {
      productId: product1.id,
      orderId: order.id,
    };
    const row1 = await addProductToOrder(opts1);

    const rowAfter = await updateOrderRow({
      id: row1.id,
      quantity: 10,
    });

    expect(rowAfter.quantity).toEqual(10);
    expect(rowAfter.total).toEqual(product1.price * rowAfter.quantity);
  });

  it('changing quantity to 0 removes row', async () => {
    const order = await createOrder();

    const [product1, product2] = products;

    const opts1 = {
      productId: product1.id,
      orderId: order.id,
    };
    const opts2 = {
      productId: product2.id,
      orderId: order.id,
    };
    const row1 = await addProductToOrder(opts1);
    const row2 = await addProductToOrder(opts2);

    await updateOrderRow({
      id: row1.id,
      quantity: 0,
    });

    const orderAfter = await getOrder(order.id);

    expect(orderAfter.rows).toHaveLength(1);
    expect(orderAfter.rows[0].id).toEqual(row2.id);
  });
});
