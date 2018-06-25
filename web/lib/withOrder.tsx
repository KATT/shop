import gql from 'graphql-tag';
import qs from 'querystring';
import { Component } from 'react';
import { GetOrderQueryAST } from '../queries/GetOrderQuery';
import { NextJSPageContext, NextJSPageProps } from './NextJSPage';
import { ID_Output } from './prisma';
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

export function getBrowserCookie(name) {
  // Get name followed by anything except a semicolon
  const cookiestring = RegExp('' + name + '[^;]+').exec(document.cookie);
  // Return everything after the equal sign, or an empty string if the cookie name not found
  return decodeURIComponent(
    !!cookiestring ? cookiestring.toString().replace(/^[^=]+./, '') : '',
  );
}

function getOrderId(ctx: NextJSPageContext): ID_Output {
  if (!ctx.isBrowser) {
    return ctx.req.cookies.orderId;
  }
  return getBrowserCookie('orderId');
}

export function saveOrderId(
  orderId: ID_Output,
  { isBrowser, res }: { isBrowser: boolean; res?: any },
) {
  if (!isBrowser) {
    res.cookie('orderId', orderId);
    return;
  }
  const cookies = {
    ...qs.parse(document.cookie),
    orderId,
  };

  document.cookie = qs.stringify(cookies);
}

/**
 * Tries to read order id from cookie
 * Creates new order if order can't be found or order can't be fetched
 */
export async function getOrCreateOrderId(
  ctx: NextJSPageContext,
): Promise<ID_Output> {
  let orderId = getOrderId(ctx);
  const { apollo } = ctx;

  if (orderId) {
    const getSavedOrderResult: any = await apollo.query({
      query: GetOrderQueryAST,
      variables: {
        id: orderId,
      },
    });
    if (getSavedOrderResult.data.order) {
      saveOrderId(orderId, ctx);
      return orderId;
    }
  }

  const createOrderResult: any = await apollo.mutate({
    mutation: createOrder,
    variables: {},
  });
  orderId = createOrderResult.data.createOrder.id;

  saveOrderId(orderId, ctx);

  return orderId;
}

export default (ComposedComponent: any) => {
  class WithOrder extends Component {
    public static displayName = `WithOrder(${getComponentDisplayName(
      ComposedComponent,
    )})`;
    public static async getInitialProps(
      ctx: NextJSPageContext,
    ): Promise<WithOrderProps> {
      const orderId = await getOrCreateOrderId(ctx);

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps({
          ...ctx,
          orderId,
        });
      }

      // next.js handles adding `url` etc to props
      return {
        orderId,
        ...composedInitialProps,
      } as WithOrderProps;
    }

    public render() {
      return <ComposedComponent {...this.props} />;
    }
  }
  return withData(WithOrder);
};
