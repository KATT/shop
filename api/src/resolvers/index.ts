import { extractFragmentReplacements } from 'prisma-binding';
import { OrderRow } from '../generated/prisma';
import { AuthPayload } from './AuthPayload';
import { auth } from './Mutation/auth';
import order from './Mutation/order';
import { post } from './Mutation/post';
import { Query } from './Query';

export const resolvers = {
  Query,
  Mutation: {
    ...auth,
    ...post,
    ...order,
  },
  AuthPayload,
  OrderRow: {
    total: {
      fragment: 'fragment OrderRowFragment on OrderRow { quantity, product { price } }',
      resolve: (source: OrderRow, args, context, info) => {
        return source.quantity * source.product.price;
      },
    },
  },
};

export const fragmentReplacements = extractFragmentReplacements(resolvers);
