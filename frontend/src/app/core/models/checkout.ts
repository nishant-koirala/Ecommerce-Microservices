/** Shipping address collected in the checkout UI. UI-only — the backend order has no address fields. */
export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
