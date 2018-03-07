import gql from 'graphql-tag';
import qs from 'querystring';
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

function getOrderId(ctx: NextJSPageContext): string {
  if (!ctx.isBrowser) {
    return ctx.req.cookies.orderId;
  }
  const { orderId } = qs.parse(document.cookie);

  return orderId as string;
}

function saveOrderId(orderId, ctx: NextJSPageContext) {
  if (!ctx.isBrowser) {
    ctx.res.cookie('orderId', orderId);
    return;
  }
  const cookies = {
    ...qs.parse(document.cookie),
    orderId,
  };

  document.cookie = qs.stringify(cookies);

  return cookies;
}

export default (ComposedComponent: any) => {
  class WithOrder extends Component {
    public static displayName = `WithOrder(${getComponentDisplayName(ComposedComponent)})`;
    public static async getInitialProps(ctx: NextJSPageContext): Promise<WithOrderProps> {
      const { apollo, req } = ctx;

      let orderId = getOrderId(ctx);
      if (!orderId) {
        const res: any = await apollo.mutate({
          mutation: createOrder,
          variables: {},
        });
        orderId = res.data.createOrder.id;

        saveOrderId(orderId, ctx);
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
