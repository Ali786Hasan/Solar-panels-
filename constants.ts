import { Product, User } from './types';

export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'সোলার প্যানেল ১', 
    price: 1000, 
    dailyIncome: 100, 
    totalIncome: 10000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://picsum.photos/seed/solar1/400/300'
  },
  { 
    id: 2, 
    name: 'সোলার প্যানেল ২', 
    price: 2000, 
    dailyIncome: 210, 
    totalIncome: 21000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://picsum.photos/seed/solar2/400/300'
  },
  { 
    id: 3, 
    name: 'সোলার প্যানেল ৩', 
    price: 5000, 
    dailyIncome: 550, 
    totalIncome: 55000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://picsum.photos/seed/solar3/400/300'
  },
  { 
    id: 4, 
    name: 'সোলার প্যানেল ৪', 
    price: 10000, 
    dailyIncome: 1200, 
    totalIncome: 120000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://picsum.photos/seed/solar4/400/300'
  },
  { 
    id: 5, 
    name: 'সোলার প্যানেল ৫', 
    price: 20000, 
    dailyIncome: 2600, 
    totalIncome: 260000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://picsum.photos/seed/solar5/400/300'
  },
  { 
    id: 6, 
    name: 'উইন্ড টারবাইন ১', 
    price: 1500, 
    dailyIncome: 160, 
    totalIncome: 16000, 
    validity: 100, 
    category: 'Wind',
    image: 'https://picsum.photos/seed/wind1/400/300'
  },
  { 
    id: 7, 
    name: 'উইন্ড টারবাইন ২', 
    price: 3000, 
    dailyIncome: 380, 
    totalIncome: 38000, 
    validity: 100, 
    category: 'Wind',
    image: 'https://picsum.photos/seed/wind2/400/300'
  },
];

export const INITIAL_USER: User = {
  balance: 0,
  totalIncome: 0,
  uncollectedIncome: 0,
  phone: '01601359646',
  password: 'password123',
  transactionPin: '1234',
  referralCode: '764740',
  teamSize: 0,
  teamIncome: 0,
  vipLevel: 1,
  orders: [],
  rechargeHistory: [],
  withdrawalHistory: [],
  transactions: [],
  notifications: [],
  isAdmin: true 
};