import gql from 'graphql-tag';
import {Component} from 'react';
import { NextJSPageContext, NextJSPageProps} from './NextJSPage';
import withData, { getComponentDisplayName } from './withData';

import { graphql } from 'react-apollo';

const cartFragment = gql`
  fragment CartFields on Cart {
    id
    products {
      quantity
      product {
        id
        name
        brand { name }
      }
    }
  }
`;

const getCart = gql`
  query getCart($id: String!) {
    ...CartFields
  }
  ${cartFragment}
`;

const createCart = gql`
  mutation createCart {
    createCart {
      ...CartFields
    }
  }
  ${cartFragment}
`;

export interface Cart {
  id: string;
}

export interface WithCartProps extends NextJSPageProps {
  cart: Cart;
}

export interface WithCartContext extends NextJSPageContext {
  cart: Cart;
}

export default (ComposedComponent: any) => {
  class WithCart extends Component {
    public static displayName = `;WithCart(${getComponentDisplayName(ComposedComponent)})`;
    public static async getInitialProps(ctx: NextJSPageContext): Promise<WithCartProps> {
      const { apollo } = ctx;

      let cart;
      // 🚧 TODO:
      // 1. cartId = readFromCookie()
      // 2. getCartByID(cartId)
      // 3. if (!cartExists) -> createCart

      const res:any = await apollo.mutate({
        mutation: createCart,
        variables: {},
      });
      cart = res.createCart;

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {
      };
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps({
          ...ctx,
          cart,
        });
      }

      return {
        cart,
        ...composedInitialProps,
      };
    }

    public render() {
      return <ComposedComponent {...this.props} />;
    }

  }
  return withData(WithCart);
};
