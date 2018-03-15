import { Order, OrderRow } from './generated/api';

export * from './generated/api';
export { Order as APIOrder, OrderRow as APIOrderRow };

export interface UpdateOrderRowVariables {
  id: string;
  quantity?: number;
}

export interface AddProductToOrderVariables {
  orderId: string;
  productId: string;
  quantity?: number;
}

export interface AddDiscountCodeToOrderVariables {
  orderId: string;
  code: string;
}
