export interface Product {
  id: number;
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  validity: number;
  category: 'Solar' | 'Wind';
  image?: string;
}

export interface User {
  balance: number;
  totalIncome: number;
  phone: string;
  password?: string;
  referralCode: string;
  teamSize: number;
  orders: Order[];
  rechargeHistory: RechargeRecord[];
  withdrawalHistory: WithdrawalRecord[];
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  productId: number;
  purchaseDate: string;
  status: 'Active' | 'Completed';
}

export interface RechargeRecord {
  id: string;
  userPhone: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Success' | 'Failed';
  trxId: string;
}

export interface WithdrawalRecord {
  id: string;
  userPhone: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  holderName: string;
  date: string;
  status: 'Pending' | 'Success' | 'Failed';
}

export type Page = 'home' | 'order' | 'team' | 'mine' | 'deposit' | 'recharge_select' | 'recharge_history' | 'support' | 'admin' | 'withdrawal' | 'withdrawal_history' | 'help' | 'settings';