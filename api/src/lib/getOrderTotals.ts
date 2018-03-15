import * as Prisma from '../generated/prisma';
import * as API from '../schema';

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

export interface OrderRowTotals {
  total: number;
}
export interface OrderTotals {
  discountsTotal: number;
  subTotal: number;
  total: number;
  rows: OrderRowTotals[];
}

export function getOrderTotals(
  order: Partial<API.Order | Prisma.Order>,
): OrderTotals {
  const orderRows = order.rows as Prisma.OrderRow[];

  const rows: OrderRowTotals[] = orderRows.map(row => ({
    total: row.quantity * row.product.price,
  }));

  const subTotal = rows.reduce((sum, row) => sum + row.total, 0);

  const discountsTotal = order.discountCodes.reduce((sum, { type, amount }) => {
    let ret = sum;
    if (type === 'Percentage') {
      ret += subTotal * (amount / 100);
    }

    return ret;
  }, 0);

  const total = Math.max(subTotal - discountsTotal, 0);

  return {
    rows,
    subTotal,
    discountsTotal,
    total,
  };
}

export default getOrderTotals;

export function getOrderWithTotals(
  order: Partial<API.Order>,
): Partial<API.Order> {
  const totals = getOrderTotals(order);

  return {
    ...order,
    ...totals,
    rows: order.rows.map((row, index) => ({
      ...row,
      ...totals.rows[index],
    })),
  };
}
