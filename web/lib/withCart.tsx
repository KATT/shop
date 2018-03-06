import gql from 'graphql-tag';
import {Component} from 'react';
import { NextJSPageContext, NextJSPageProps} from './NextJSPage';
import { Cart } from './prisma';
import withData, { getComponentDisplayName } from './withData';

const createCart = gql`
  mutation createCart {
    createCart {
      id
    }
  }
`;

export interface WithCartProps extends NextJSPageProps {
  cartId: string;
}

export interface WithCartContext extends NextJSPageContext {
  cartId: string;
}
let cartId;

export default (ComposedComponent: any) => {
  class WithCart extends Component {
    public static displayName = `WithCart(${getComponentDisplayName(ComposedComponent)})`;
    public static async getInitialProps(ctx: NextJSPageContext): Promise<WithCartProps> {
      const { apollo } = ctx;

      // 🚧 TODO:
      // 1. cartId = readFromCookie()
      // 2. getCartByID(cartId)
      // 3. if (!cartExists) -> createCart
      if (ctx.isBrowser) {
        cartId = (window as any).__NEXT_DATA__.props.cartId;
      }
      if (!cartId) {
        const res: any = await apollo.mutate({
          mutation: createCart,
          variables: {},
        });
        cartId = res.data.createCart.id;
      }

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {
      };
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps({
          ...ctx,
          cartId,
        });
      }

      return {
        cartId,
        ...composedInitialProps,
      };
    }

    public render() {
      return <ComposedComponent {...this.props} />;
    }

  }
  return withData(WithCart);
};
