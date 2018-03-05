import { Context } from '../../utils';

export const cart = {
  async createCart(parent, args, ctx: Context, info) {
    return ctx.db.mutation.createCart(
      {
        data: {},
      },
      info,
    );
  },
};
