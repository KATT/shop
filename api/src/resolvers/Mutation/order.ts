import { GraphQLError } from 'graphql';
import { OrderRow } from '../../schema';
import { Context } from '../../utils';

export default {
  async createOrder(parent, args, ctx: Context, info) {
    return ctx.db.mutation.createOrder(
      {
        data: {},
      },
      info,
    );
  },
  async addProductToOrder(parent, args, ctx: Context, info): Promise<OrderRow> {
    const {quantity = 1, orderId, productId} = args;
    if (quantity < 1) {
      throw new GraphQLError('quantity must be greater than 0');
    }
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

    const order = await ctx.db.query.order({
      where: {
        id: args.orderId,
      },
    }, fragment);

    const orderRow = order.rows.find(({product}) => product.id === productId);

    if (orderRow) {
      return ctx.db.mutation.updateOrderRow({
        data: {
          quantity: quantity + orderRow.quantity,
        },
        where: {
          id: orderRow.id,
        },
      }, info);
    }

    return ctx.db.mutation.createOrderRow({
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
    }, info);
  },
};
