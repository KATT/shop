import { APIOrder, Order } from '../schema';

export const getOrderTotalsFragment = (node: string) => `
  fragment OrderTotalsFragment_${node} on Order {
    discountCodes {
      type
      amount
    }
    rows {
      quantity
      product { price }
    }
  }
`;

export interface OrderTotals {
  discountsTotal: number;
  subTotal: number;
  total: number;
}

export function getOrderTotals(order: Order): APIOrder {
  const rows: any = order.rows.map(row => ({
    ...row,
    total: row.quantity * row.product.price,
  }));

  const subTotal = order.rows.reduce((sum, row) => (
    sum + row.quantity * row.product.price
  ), 0);

  const discountsTotal = order.discountCodes.reduce((sum, {type, amount}) => {
    let ret = sum;
    if (type === 'Percentage') {
      ret += subTotal * (amount / 100);
    }

    return ret;
  }, 0);

  const total = Math.max(subTotal - discountsTotal, 0);

  return {
    ...order,
    rows,
    subTotal,
    discountsTotal,
    total,
  };
}

export default getOrderTotals;
