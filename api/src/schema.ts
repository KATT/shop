// 🚧 TODO: Find a way to autogenerate this

export * from './generated/prisma';

import {Order, OrderRow} from './generated/prisma';

export interface APIOrderRow extends OrderRow {
  total: number;
  order: APIOrder;
}

export interface APIOrder extends Order {
  total: number;
  rows: APIOrderRow[];
}
