import { GraphQLError } from 'graphql';
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
  async addProductToOrder(parent, args, ctx: Context, info) {
    const {quantity = 1, orderId, productId} = args;
    if (quantity < 1) {
      throw new GraphQLError('quantity must be greater than 0');
    }
    const fragment = `
      {
        id
        products {
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

    const orderProduct = order.products.find(({product}) => product.id === productId);

    if (orderProduct) {
      await ctx.db.mutation.updateOrderProduct({
        data: {
          quantity: quantity + orderProduct.quantity,
        },
        where: {
          id: orderProduct.id,
        },
      });

    } else {
      await ctx.db.mutation.createOrderProduct({
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
      });
    }

    return ctx.db.query.order({where: {id: orderId}}, info);
  },
};
