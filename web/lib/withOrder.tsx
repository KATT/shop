import gql from 'graphql-tag';
import {Component} from 'react';
import { NextJSPageContext, NextJSPageProps} from './NextJSPage';
import { Order } from './prisma';
import withData, { getComponentDisplayName } from './withData';

const createOrder = gql`
  mutation createOrder {
    createOrder {
      id
    }
  }
`;

export interface WithOrderProps extends NextJSPageProps {
  orderId: string;
}

export interface WithOrderContext extends NextJSPageContext {
  orderId: string;
}
let orderId;

export default (ComposedComponent: any) => {
  class WithOrder extends Component {
    public static displayName = `WithOrder(${getComponentDisplayName(ComposedComponent)})`;
    public static async getInitialProps(ctx: NextJSPageContext): Promise<WithOrderProps> {
      const { apollo } = ctx;

      // 🚧 TODO:
      // 1. orderId = readFromCookie()
      // 2. getOrderByID(orderId)
      // 3. if (!orderExists) -> createOrder
      if (ctx.isBrowser) {
        orderId = (window as any).__NEXT_DATA__.props.orderId;
      }
      if (!orderId) {
        const res: any = await apollo.mutate({
          mutation: createOrder,
          variables: {},
        });
        orderId = res.data.createOrder.id;
      }

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {
      };
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps({
          ...ctx,
          orderId,
        });
      }

      return {
        orderId,
        ...composedInitialProps,
      };
    }

    public render() {
      return <ComposedComponent {...this.props} />;
    }

  }
  return withData(WithOrder);
};
