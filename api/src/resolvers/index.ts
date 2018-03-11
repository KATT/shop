import { extractFragmentReplacements } from 'prisma-binding';
import { Order, OrderRow } from '../generated/prisma';
import { APIOrder, UpdateOrderRowResponse } from '../schema';
import { Context } from '../utils';
import Mutation from './Mutation';
import Query from './Query';

export const resolvers = {
  Query,
  Mutation,

  OrderRow: {
    total: {
      fragment: 'fragment OrderRowFragment on OrderRow { quantity, product { price } }',
      resolve: (source: OrderRow, args, context, info) => {
        return source.quantity * source.product.price;
      },
    },
  },
  Order: {
    subTotal: {
      fragment: 'fragment OrderFragment on Order { rows { quantity, product { price } } }',
      resolve: (source: Order, args, context, info): number => {
        return source.rows.reduce((total, product) => (
          total + product.quantity * product.product.price
        ), 0);
      },
    },
  },
  UpdateOrderRowResponse: {
    order: {
      resolve: async ({orderId}, args, ctx: Context, info) => {
        return ctx.db.query.order({
          where: {
            id: orderId,
          },
        }, info);
      },
    },
    row: {
      resolve: async ({rowId}, args, ctx: Context, info) => {
        return ctx.db.query.orderRow({
          where: {
            id: rowId,
          },
        }, info);
      },
    },
  },
};

export const fragmentReplacements = extractFragmentReplacements(resolvers);
