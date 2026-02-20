export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export type PaymentMethod = "bank_transfer" | "midtrans";

export interface CheckoutData {
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
}

export interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: "BCA",
    accountNumber: "1234567890",
    accountName: "PT OrdoZeus Shop",
  },
  {
    bank: "BNI",
    accountNumber: "0987654321",
    accountName: "PT OrdoZeus Shop",
  },
  {
    bank: "Mandiri",
    accountNumber: "1122334455",
    accountName: "PT OrdoZeus Shop",
  },
];
