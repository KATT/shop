// 🚧 TODO: Find a way to autogenerate this

export * from './generated/prisma';

import {Order, OrderRow} from './generated/prisma';

export interface APIOrderRow extends OrderRow {
  total: number;
  order: APIOrder;
}

export interface APIOrder extends Order {
  subTotal: number;
  rows: APIOrderRow[];
}

export interface UpdateOrderRowResponse {
  order: APIOrder;
  row?: APIOrderRow;
}

export interface UpdateOrderRowVariables {
  id: string;
  quantity?: number;
}

export interface AddProductToOrderVariables {
  orderId: string;
  productId: string;
  quantity?: number;
}
