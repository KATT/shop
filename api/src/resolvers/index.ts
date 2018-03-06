import { AuthPayload } from './AuthPayload';
import { auth } from './Mutation/auth';
import cart from './Mutation/cart';
import { post } from './Mutation/post';
import { Query } from './Query';

export default {
  Query,
  Mutation: {
    ...auth,
    ...post,
    ...cart,
  },
  AuthPayload,
};
