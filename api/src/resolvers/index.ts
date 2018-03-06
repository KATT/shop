import { AuthPayload } from './AuthPayload';
import { auth } from './Mutation/auth';
import order from './Mutation/order';
import { post } from './Mutation/post';
import { Query } from './Query';

export default {
  Query,
  Mutation: {
    ...auth,
    ...post,
    ...order,
  },
  AuthPayload,
};
