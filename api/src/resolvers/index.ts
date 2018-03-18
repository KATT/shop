import {
  API,
  getOrderTotals,
  getOrderTotalsFragment,
  Prisma,
} from '@katt/shop-lib';
import { extractFragmentReplacements } from 'prisma-binding';
import { Context } from '../utils';
import Mutation from './Mutation';
import Query from './Query';

export interface UpdateOrderRowResponseSource {
  orderId: string;
  rowId?: string;
}

export const resolvers = {
  Query,
  Mutation,

  OrderRow: {
    total: {
      fragment:
        'fragment OrderRowFragment on OrderRow { quantity, product { price } }',
      resolve: (source: Prisma.OrderRow, args, context, info) => {
        return source.quantity * source.product.price;
      },
    },
  },
  Order: {
    subTotal: {
      fragment: getOrderTotalsFragment('subTotal'),
      resolve: (source: Prisma.Order, args, context, info): number => {
        return getOrderTotals(source).subTotal;
      },
    },
    discountsTotal: {
      fragment: getOrderTotalsFragment('discountsTotal'),
      resolve: (source: Prisma.Order, args, context, info): number => {
        return getOrderTotals(source).discountsTotal;
      },
    },
    total: {
      fragment: getOrderTotalsFragment('total'),
      resolve: (source: Prisma.Order, args, context, info): number => {
        return getOrderTotals(source).total;
      },
    },
  },
  UpdateOrderRowResponse: {
    order: {
      resolve: async (
        { orderId }: UpdateOrderRowResponseSource,
        args,
        ctx: Context,
        info,
      ) => {
        return ctx.db.query.order(
          {
            where: {
              id: orderId,
            },
          },
          info,
        );
      },
    },
    row: {
      resolve: async (
        { rowId }: UpdateOrderRowResponseSource,
        args,
        ctx: Context,
        info,
      ) => {
        return ctx.db.query.orderRow(
          {
            where: {
              id: rowId,
            },
          },
          info,
        );
      },
    },
  },
};

export const fragmentReplacements = extractFragmentReplacements(resolvers);
