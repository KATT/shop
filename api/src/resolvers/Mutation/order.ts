import * as AsyncLock from 'async-lock';
import { GraphQLError } from 'graphql';

import * as Prisma from '../../generated/prisma';
import * as API from '../../schema';

import { Context } from '../../utils';

const lock = new AsyncLock();

export default {
  async createOrder(parent, args, ctx: Context, info) {
    return ctx.db.mutation.createOrder(
      {
        data: {},
      },
      info,
    );
  },
  async addProductToOrder(
    parent,
    args: API.AddProductToOrderVariables,
    ctx: Context,
    info,
  ): Promise<Prisma.OrderRow> {
    const { quantity = 1, orderId, productId } = args;
    if (quantity < 1) {
      throw new GraphQLError('quantity must be greater than 0');
    }

    const key = ['Order', orderId].join('-');
    return lock.acquire(key, async () => {
      const fragment = `
        {
          id
          rows {
            id
            quantity
            product {
              id
            }
          }
        }
      `;

      const order = await ctx.db.query.order(
        {
          where: {
            id: args.orderId,
          },
        },
        fragment,
      );

      const orderRow = order.rows.find(
        ({ product }) => product.id === productId,
      );

      if (orderRow) {
        return ctx.db.mutation.updateOrderRow(
          {
            data: {
              quantity: quantity + orderRow.quantity,
            },
            where: {
              id: orderRow.id,
            },
          },
          info,
        );
      }

      return ctx.db.mutation.createOrderRow(
        {
          data: {
            quantity,
            product: {
              connect: {
                id: productId,
              },
            },
            order: {
              connect: {
                id: orderId,
              },
            },
          },
        },
        info,
      );
    });
  },

  async updateOrderRow(parent, args, ctx: Context, info): Promise<any> {
    if (args.quantity < 0) {
      throw new GraphQLError('quantity must be greater or equal to 0');
    }
    const { id, ...data } = args;

    const fragment = `
      {
        id
        order {
          id
        }
      }
    `;

    const row = await ctx.db.query.orderRow(
      {
        where: {
          id,
        },
      },
      fragment,
    );
    if (!row) {
      throw new Error(`Could not find row id '${id}'`);
    }
    const { order } = row;

    const key = ['Order', order.id].join('-');

    await lock.acquire(key, async () => {
      if (data.quantity === 0) {
        return ctx.db.mutation.deleteOrderRow({
          where: {
            id,
          },
        });
      }
      return ctx.db.mutation.updateOrderRow(
        {
          data,
          where: {
            id,
          },
        },
        info,
      );
    });

    return {
      orderId: order.id,
      rowId: id,
    };
  },

  async addDiscountCodeToOrder(
    parent,
    { code, orderId }: API.AddDiscountCodeToOrderVariables,
    ctx: Context,
    info,
  ): Promise<Prisma.Order> {
    return ctx.db.mutation.updateOrder(
      {
        data: {
          discountCodes: {
            connect: {
              code,
            },
          },
        },
        where: {
          id: orderId,
        },
      },
      info,
    );
  },
};
