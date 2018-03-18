import { Context } from '../../utils';

export default {
  order(parent, args, ctx: Context, info) {
    return ctx.db.query.order({where: {
      id: args.id,
    }}, info);
  },
};
