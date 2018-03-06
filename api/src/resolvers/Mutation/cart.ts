import { GraphQLError } from 'graphql';
import { Context } from '../../utils';

export default {
  async createCart(parent, args, ctx: Context, info) {
    return ctx.db.mutation.createCart(
      {
        data: {},
      },
      info,
    );
  },
  async addProductToCart(parent, args, ctx: Context, info) {
    const {quantity = 1, cartId, productId} = args;
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

    const cart = await ctx.db.query.cart({
      where: {
        id: args.cartId,
      },
    }, fragment);

    const cartProduct = cart.products.find(({product}) => product.id === productId);

    if (cartProduct) {
      await ctx.db.mutation.updateCartProduct({
        data: {
          quantity: quantity + cartProduct.quantity,
        },
        where: {
          id: cartProduct.id,
        },
      });

    } else {
      await ctx.db.mutation.createCartProduct({
        data: {
          quantity,
          product: {
            connect: {
              id: productId,
            },
          },
          cart: {
            connect: {
              id: cartId,
            },
          },
        },
      });
    }

    return ctx.db.query.cart({where: {id: cartId}}, info);
  },
};
