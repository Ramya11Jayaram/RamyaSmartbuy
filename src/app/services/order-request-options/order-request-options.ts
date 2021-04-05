import { AdUser } from '../approval-users/ad-user';

export class OrderRequestOptions {
  PurchaseCategories: string[];
  Requesters: AdUser[];
  Vendors: string[];
  OrderCurrencies: string[];
  
}
