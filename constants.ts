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
    image: 'https://images.unsplash.com/photo-1509391366360-fe5bb58485bb?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 2, 
    name: 'সোলার প্যানেল ২', 
    price: 2000, 
    dailyIncome: 210, 
    totalIncome: 21000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 3, 
    name: 'সোলার প্যানেল ৩', 
    price: 5000, 
    dailyIncome: 550, 
    totalIncome: 55000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 4, 
    name: 'সোলার প্যানেল ৪', 
    price: 10000, 
    dailyIncome: 1200, 
    totalIncome: 120000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1548337138-e87d889cc98b?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 5, 
    name: 'সোলার প্যানেল ৫', 
    price: 20000, 
    dailyIncome: 2600, 
    totalIncome: 260000, 
    validity: 100, 
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 6, 
    name: 'উইন্ড টারবাইন ১', 
    price: 1500, 
    dailyIncome: 160, 
    totalIncome: 16000, 
    validity: 100, 
    category: 'Wind',
    image: 'https://images.unsplash.com/photo-1466611653911-95282fc3656b?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 7, 
    name: 'উইন্ড টারবাইন ২', 
    price: 3000, 
    dailyIncome: 380, 
    totalIncome: 38000, 
    validity: 100, 
    category: 'Wind',
    image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=400'
  },
];

export const INITIAL_USER: User = {
  balance: 310,
  totalIncome: 0,
  phone: '+88 01719359646',
  password: 'password123',
  referralCode: '764740',
  teamSize: 12,
  orders: [],
  rechargeHistory: [],
  withdrawalHistory: [],
  isAdmin: true 
};