import * as request from 'supertest';
import { Cart } from './generated/prisma';
import server from './server';

const {
  PRISMA_DEBUG,
  PRISMA_ENDPOINT,
  PRISMA_SECRET,
} = process.env;

let app;
beforeAll(async () => {
  app = await server({
    PRISMA_ENDPOINT,
    PRISMA_SECRET,
    PRISMA_DEBUG: false,
  }).start({port: 4010});
});
afterAll(() => app.close());

it('query.products()', async () => {
  const query = `
    query {
      products {
        id
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
});

it('mutation.createCart', async () => {
  const query = `
    mutation {
      createCart {
        id
        products {
          quantity
          product {
            id
            name
            brand { name }
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

  expect(Array.isArray(cart.products)).toBeTruthy();
});
