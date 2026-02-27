import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ClipboardList, Users, User as UserIcon, Wallet, ArrowRight, Copy, Check, Info, Download, LogOut, RefreshCcw, Landmark, Headphones, ChevronRight, X, Send, PlusCircle, ShieldAlert, TrendingUp, Settings, Trash2, CheckCircle2, XCircle, CreditCard, History, HelpCircle, BookOpen, MessageCircle, AlertCircle, Lock, Phone, UserRoundPen, Edit3, Plus, Search, Eye, ChevronDown, Share2, Image as ImageIcon, Bell, Zap, Diamond, Coins } from 'lucide-react';
import { Page, User, Product, Order, RechargeRecord, WithdrawalRecord, Notification, TransactionRecord } from './types';
import { PRODUCTS, INITIAL_USER } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Solar' | 'Wind'>('Solar');
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  
  // Simulated Global State
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sg_users');
    return saved ? JSON.parse(saved) : [INITIAL_USER];
  });
  const [allRecharges, setAllRecharges] = useState<RechargeRecord[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [platformProducts, setPlatformProducts] = useState<Product[]>(PRODUCTS);
  const [showToast, setShowToast] = useState<Notification | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Mining Simulation Effect
  useEffect(() => {
    if (!isAuthenticated || user.orders.length === 0) return;

    const interval = setInterval(() => {
      const totalDailyIncome = user.orders.reduce((acc, order) => {
        const product = platformProducts.find(p => p.id === order.productId);
        return acc + (product?.dailyIncome || 0);
      }, 0);

      // Income per second (simulation)
      const incomePerSecond = totalDailyIncome / (24 * 60 * 60);
      setUser(prev => ({
        ...prev,
        uncollectedIncome: (prev.uncollectedIncome || 0) + incomePerSecond
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user.orders, platformProducts]);

  // VIP Level Update Effect
  useEffect(() => {
    if (!isAuthenticated) return;
    const totalInvested = user.orders.reduce((acc, order) => {
      const product = platformProducts.find(p => p.id === order.productId);
      return acc + (product?.price || 0);
    }, 0);

    let newVip = 1;
    if (totalInvested >= 50000) newVip = 5;
    else if (totalInvested >= 20000) newVip = 4;
    else if (totalInvested >= 10000) newVip = 3;
    else if (totalInvested >= 5000) newVip = 2;

    if (newVip !== user.vipLevel) {
      setUser(prev => ({ ...prev, vipLevel: newVip }));
      addNotification('VIP Level Up!', `অভিনন্দন! আপনি VIP ${newVip} লেভেলে উন্নীত হয়েছেন।`, 'system');
    }
  }, [user.orders, platformProducts, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('sg_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    const savedSession = localStorage.getItem('sg_session');
    if (savedSession) {
      const sessionUser = JSON.parse(savedSession);
      const freshUser = allUsers.find(u => u.phone === sessionUser.phone);
      if (freshUser) {
        setUser(freshUser);
        setIsAuthenticated(true);
        setCurrentPage('home');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('sg_session', JSON.stringify(user));
      // Only update allUsers if the user data actually changed to avoid loops
      setAllUsers(prev => {
        const existing = prev.find(u => u.phone === user.phone);
        if (existing && JSON.stringify(existing) === JSON.stringify(user)) return prev;
        return prev.map(u => u.phone === user.phone ? user : u);
      });
    } else {
      localStorage.removeItem('sg_session');
    }
  }, [isAuthenticated, user]);

  // Sync back from allUsers to user (for referrals or admin edits)
  useEffect(() => {
    if (isAuthenticated) {
      const freshData = allUsers.find(u => u.phone === user.phone);
      if (freshData && JSON.stringify(freshData) !== JSON.stringify(user)) {
        setUser(freshData);
      }
    }
  }, [allUsers, isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !isAuthenticated) {
      setCurrentPage('register');
    }
  }, [isAuthenticated]);

  const navigate = (page: Page) => setCurrentPage(page);

  const addNotification = (title: string, message: string, type: 'recharge' | 'withdrawal' | 'system', targetPhone?: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    };
    
    if (targetPhone) {
        setAllUsers(prev => prev.map(u => u.phone === targetPhone ? { ...u, notifications: [newNotif, ...(u.notifications || [])] } : u));
        if (targetPhone === user.phone) {
            setUser(prev => ({ ...prev, notifications: [newNotif, ...(prev.notifications || [])] }));
            setShowToast(newNotif);
            setTimeout(() => setShowToast(null), 5000);
        }
    } else {
        setUser(prev => ({ ...prev, notifications: [newNotif, ...(prev.notifications || [])] }));
        setShowToast(newNotif);
        setTimeout(() => setShowToast(null), 5000);
    }
  };

  const handleLogin = (phone: string, pass: string) => {
    const normalizedInput = phone.replace(/[^0-9]/g, '');
    const foundUser = allUsers.find(u => {
      const normalizedUserPhone = u.phone.replace(/[^0-9]/g, '');
      return (normalizedUserPhone === normalizedInput || normalizedUserPhone.endsWith(normalizedInput)) && u.password === pass;
    });
    
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      setCurrentPage('home');
    } else {
      alert('ভুল ফোন নম্বর বা পাসওয়ার্ড!');
    }
  };

  const addTransaction = (type: TransactionRecord['type'], amount: number, description: string, status: TransactionRecord['status'] = 'Success', targetPhone?: string) => {
    const newTx: TransactionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      date: new Date().toISOString(),
      status,
      description
    };

    if (targetPhone) {
      setAllUsers(prev => prev.map(u => u.phone === targetPhone ? { ...u, transactions: [newTx, ...(u.transactions || [])] } : u));
      if (targetPhone === user.phone) {
        setUser(prev => ({ ...prev, transactions: [newTx, ...(prev.transactions || [])] }));
      }
    } else {
      setUser(prev => ({ ...prev, transactions: [newTx, ...(prev.transactions || [])] }));
    }
  };

  const collectIncome = () => {
    if (user.uncollectedIncome <= 0) return;
    const amount = Math.floor(user.uncollectedIncome * 100) / 100;
    setUser(prev => ({
      ...prev,
      balance: prev.balance + amount,
      totalIncome: prev.totalIncome + amount,
      uncollectedIncome: 0
    }));
    addTransaction('Income', amount, 'Mining income collected');
    alert(`৳ ${amount} আপনার ব্যালেন্সে যোগ করা হয়েছে!`);
  };

  const handleRegister = (phone: string, pass: string, ref: string) => {
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    
    if (!ref) {
      alert('রেজিস্ট্রেশন করতে রেফারেল কোড প্রয়োজন!');
      return;
    }

    const referrer = allUsers.find(u => u.referralCode === ref);
    if (!referrer) {
      alert('ভুল রেফারেল কোড! সঠিক কোড ব্যবহার করুন।');
      return;
    }

    if (allUsers.find(u => u.phone.replace(/[^0-9]/g, '') === normalizedPhone)) {
      alert('এই নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!');
      return;
    }

    const newUser: User = {
      ...INITIAL_USER,
      phone: normalizedPhone,
      password: pass,
      balance: 0,
      totalIncome: 0,
      uncollectedIncome: 0,
      referralCode: Math.floor(100000 + Math.random() * 900000).toString(),
      referredBy: ref,
      teamSize: 0,
      vipLevel: 1,
      orders: [],
      rechargeHistory: [],
      withdrawalHistory: [],
      transactions: [],
      notifications: [],
      isAdmin: false
    };

    // Combined Referral and New User Logic
    setAllUsers(prev => {
      const updatedReferrer = prev.map(u => u.referralCode === ref ? { 
        ...u, 
        teamSize: u.teamSize + 1,
        balance: u.balance + 20,
        transactions: [{
          id: Math.random().toString(36).substr(2, 9),
          type: 'Bonus',
          amount: 20,
          date: new Date().toISOString(),
          status: 'Success',
          description: `Referral bonus for ${normalizedPhone}`
        }, ...(u.transactions || [])]
      } : u);
      return [...updatedReferrer, newUser];
    });

    setUser(newUser);
    setIsAuthenticated(true);
    setCurrentPage('home');
    
    // Trigger App Download Prompt
    setTimeout(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);

      if (deferredPrompt) {
        if (confirm('অ্যাকাউন্ট তৈরি সফল! ভালো অভিজ্ঞতার জন্য আমাদের অ্যাপটি ডাউনলোড করুন। আপনি কি এখন ডাউনলোড করতে চান?')) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            }
            setDeferredPrompt(null);
          });
        }
      } else {
        if (isIos) {
          alert('অ্যাকাউন্ট তৈরি সফল! অ্যাপটি ডাউনলোড করতে: ব্রাউজারের "Share" বাটনে ক্লিক করে "Add to Home Screen" সিলেক্ট করুন।');
        } else if (isAndroid) {
          alert('অ্যাকাউন্ট তৈরি সফল! অ্যাপটি ডাউনলোড করতে: ব্রাউজারের ৩-ডট মেনু থেকে "Install App" বা "Add to Home Screen" সিলেক্ট করুন।');
        } else {
          alert('অ্যাকাউন্ট তৈরি সফল! ভালো অভিজ্ঞতার জন্য আমাদের অ্যাপটি আপনার হোম স্ক্রিনে যুক্ত করে নিন।');
        }
      }
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const buyProduct = (product: Product) => {
    if (user.balance >= product.price) {
      setUser(prev => ({
        ...prev,
        balance: prev.balance - product.price,
        orders: [...prev.orders, { id: Math.random().toString(36).substr(2, 9), productId: product.id, purchaseDate: new Date().toISOString(), lastCollectionDate: new Date().toISOString(), status: 'Active' }]
      }));
      addTransaction('Purchase', product.price, `Purchased ${product.name}`);
      
      // 3-Level Commission Logic
      if (user.referredBy) {
        setAllUsers(prev => {
          let updatedUsers = [...prev];
          
          // Level 1 (10%)
          const l1 = updatedUsers.find(u => u.referralCode === user.referredBy);
          if (l1) {
            const bonus = product.price * 0.10;
            updatedUsers = updatedUsers.map(u => u.referralCode === l1.referralCode ? {
              ...u,
              balance: u.balance + bonus,
              teamIncome: (u.teamIncome || 0) + bonus,
              transactions: [{
                id: Math.random().toString(36).substr(2, 9),
                type: 'Bonus',
                amount: bonus,
                date: new Date().toISOString(),
                status: 'Success',
                description: `Level 1 Commission from ${user.phone}`
              }, ...(u.transactions || [])]
            } : u);

            // Level 2 (5%)
            if (l1.referredBy) {
              const l2 = updatedUsers.find(u => u.referralCode === l1.referredBy);
              if (l2) {
                const bonus2 = product.price * 0.05;
                updatedUsers = updatedUsers.map(u => u.referralCode === l2.referralCode ? {
                  ...u,
                  balance: u.balance + bonus2,
                  teamIncome: (u.teamIncome || 0) + bonus2,
                  transactions: [{
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'Bonus',
                    amount: bonus2,
                    date: new Date().toISOString(),
                    status: 'Success',
                    description: `Level 2 Commission from ${user.phone}`
                  }, ...(u.transactions || [])]
                } : u);

                // Level 3 (2%)
                if (l2.referredBy) {
                  const l3 = updatedUsers.find(u => u.referralCode === l2.referredBy);
                  if (l3) {
                    const bonus3 = product.price * 0.02;
                    updatedUsers = updatedUsers.map(u => u.referralCode === l3.referralCode ? {
                      ...u,
                      balance: u.balance + bonus3,
                      teamIncome: (u.teamIncome || 0) + bonus3,
                      transactions: [{
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'Bonus',
                        amount: bonus3,
                        date: new Date().toISOString(),
                        status: 'Success',
                        description: `Level 3 Commission from ${user.phone}`
                      }, ...(u.transactions || [])]
                    } : u);
                  }
                }
              }
            }
          }
          return updatedUsers;
        });
      }

      alert(`আপনি সফলভাবে ${product.name} ক্রয় করেছেন!`);
    } else {
      alert('অপর্যাপ্ত ব্যালেন্স। দয়া করে রিচার্জ করুন।');
      setCurrentPage('recharge_select');
    }
  };

  const handleCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckIn === today) {
      alert('আপনি আজ ইতিমধ্যে বোনাস সংগ্রহ করেছেন!');
      return;
    }
    
    const bonus = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // 5-10 Taka
    setUser(prev => ({
      ...prev,
      balance: prev.balance + bonus,
      lastCheckIn: today
    }));
    addTransaction('Bonus', bonus, 'Daily check-in bonus');
    alert(`অভিনন্দন! আপনি ৳ ${bonus} ডেইলি বোনাস পেয়েছেন।`);
  };

  const handleDepositSubmit = (trxId: string) => {
    const newRecord: RechargeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userPhone: user.phone,
      amount: rechargeAmount,
      date: new Date().toISOString(),
      status: 'Pending',
      trxId
    };
    setUser(prev => ({
      ...prev,
      rechargeHistory: [newRecord, ...prev.rechargeHistory]
    }));
    setAllRecharges(prev => [newRecord, ...prev]);
    addTransaction('Recharge', rechargeAmount, 'Recharge request submitted', 'Pending');
    alert('পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। যাচাইয়ের পর ব্যালেন্স যোগ করা হবে।');
    setCurrentPage('recharge_history');
  };

  const handleWithdrawalSubmit = (withdrawal: Omit<WithdrawalRecord, 'id' | 'userPhone' | 'date' | 'status'>) => {
    // Limits & Timing
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 10 || hour >= 20) {
      alert('উত্তোলনের সময়: সকাল ১০টা থেকে রাত ৮টা পর্যন্ত।');
      return;
    }

    if (withdrawal.amount < 300) {
      alert('সর্বনিম্ন উত্তোলন ৩০০ টাকা।');
      return;
    }

    if (user.balance < withdrawal.amount) {
      alert('আপনার ব্যালেন্স পর্যাপ্ত নয়।');
      return;
    }

    const newRecord: WithdrawalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userPhone: user.phone,
      ...withdrawal,
      date: new Date().toISOString(),
      status: 'Pending'
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance - withdrawal.amount,
      withdrawalHistory: [newRecord, ...prev.withdrawalHistory]
    }));
    setAllWithdrawals(prev => [newRecord, ...prev]);
    addTransaction('Withdrawal', withdrawal.amount, 'Withdrawal request submitted', 'Pending');
    alert('উত্তোলন রিকোয়েস্ট সফলভাবে জমা হয়েছে। ২৪ ঘন্টার মধ্যে প্রসেস করা হবে।');
    setCurrentPage('withdrawal_history');
  };

  const updateProfile = (newDetails: Partial<User>) => {
    setUser(prev => ({ ...prev, ...newDetails }));
    alert('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
    setCurrentPage('mine');
  };

  const updateRechargeStatus = (id: string, status: 'Success' | 'Failed') => {
    setAllRecharges(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const recharge = allRecharges.find(r => r.id === id);
    if (recharge) {
        if (status === 'Success') {
            setAllUsers(prev => prev.map(u => u.phone === recharge.userPhone ? { ...u, balance: u.balance + recharge.amount } : u));
            if (recharge.userPhone === user.phone) {
                setUser(prev => ({ ...prev, balance: prev.balance + recharge.amount }));
            }
            addTransaction('Recharge', recharge.amount, 'Recharge approved', 'Success', recharge.userPhone);
            addNotification('রিচার্জ সফল!', `আপনার ৳ ${recharge.amount} রিচার্জ সফলভাবে সম্পন্ন হয়েছে।`, 'recharge', recharge.userPhone);
        } else {
            addTransaction('Recharge', recharge.amount, 'Recharge failed', 'Failed', recharge.userPhone);
            addNotification('রিচার্জ ব্যর্থ!', `আপনার ৳ ${recharge.amount} রিচার্জ রিকোয়েস্টটি বাতিল করা হয়েছে।`, 'recharge', recharge.userPhone);
        }
    }
    alert(`Status updated to ${status}`);
  };

  const updateWithdrawalStatus = (id: string, status: 'Success' | 'Failed') => {
    setAllWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    const withdrawal = allWithdrawals.find(w => w.id === id);
    if (withdrawal) {
        if (status === 'Success') {
            addTransaction('Withdrawal', withdrawal.amount, 'Withdrawal approved', 'Success', withdrawal.userPhone);
            addNotification('উত্তোলন সফল!', `আপনার ৳ ${withdrawal.amount} উত্তোলন সফলভাবে সম্পন্ন হয়েছে।`, 'withdrawal', withdrawal.userPhone);
        } else {
            setAllUsers(prev => prev.map(u => u.phone === withdrawal.userPhone ? { ...u, balance: u.balance + withdrawal.amount } : u));
            if (withdrawal.userPhone === user.phone) {
                setUser(prev => ({ ...prev, balance: prev.balance + withdrawal.amount }));
            }
            addTransaction('Withdrawal', withdrawal.amount, 'Withdrawal failed (Refunded)', 'Failed', withdrawal.userPhone);
            addNotification('উত্তোলন ব্যর্থ!', `আপনার ৳ ${withdrawal.amount} উত্তোলন রিকোয়েস্টটি বাতিল করা হয়েছে। টাকা ব্যালেন্সে ফেরত দেওয়া হয়েছে।`, 'withdrawal', withdrawal.userPhone);
        }
    }
    alert(`Withdrawal marked as ${status}`);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto bg-slate-950 shadow-2xl relative">
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900 border border-orange-500/50 p-4 rounded-2xl shadow-2xl z-[100] animate-slideDown flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-white">{showToast.title}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{showToast.message}</p>
          </div>
          <button onClick={() => setShowToast(null)} className="text-slate-600 hover:text-white"><X size={16}/></button>
        </div>
      )}

      {!['deposit', 'recharge_select', 'support', 'admin', 'withdrawal', 'withdrawal_history', 'help', 'settings', 'spin', 'login', 'register', 'notifications'].includes(currentPage) && (
        <header className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-xl italic shadow-lg shadow-orange-500/20">S</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SolarGrowth</h1>
              <p className="text-xs text-slate-400">ব্যালেন্স: ৳ {user.balance}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('notifications')} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 relative">
                <Bell size={20} className="text-slate-400" />
                {user.notifications?.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-slate-900">{user.notifications.filter(n => !n.read).length}</span>
                )}
            </button>
            {user.isAdmin && (
                <button onClick={() => navigate('admin')} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <ShieldAlert size={20} />
                </button>
            )}
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto">
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} onNavigateRegister={() => navigate('register')} />}
        {currentPage === 'register' && <RegisterPage onRegister={handleRegister} onNavigateLogin={() => navigate('login')} />}
        {currentPage === 'notifications' && <NotificationsPage notifications={user.notifications || []} setUser={setUser} goBack={() => navigate('home')} />}
        {currentPage === 'home' && (
          <HomePage 
            user={user} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            buyProduct={buyProduct} 
            onRecharge={() => navigate('recharge_select')} 
            onWithdraw={() => navigate('withdrawal')}
            onSpin={() => navigate('spin')}
            onCollect={collectIncome}
            onCheckIn={handleCheckIn}
            products={platformProducts} 
          />
        )}
        {currentPage === 'order' && <OrderPage user={user} products={platformProducts} />}
        {currentPage === 'team' && <TeamPage user={user} />}
        {currentPage === 'mine' && <MinePage user={user} navigate={navigate} onLogout={handleLogout} />}
        {currentPage === 'spin' && <SpinPage user={user} setUser={setUser} goBack={() => navigate('home')} />}
        {currentPage === 'recharge_select' && <RechargeSelectPage onSelect={(amt) => { setRechargeAmount(amt); navigate('deposit'); }} goBack={() => navigate('home')} />}
        {currentPage === 'deposit' && <DepositPage amount={rechargeAmount} onSubmit={handleDepositSubmit} goBack={() => navigate('recharge_select')} />}
        {currentPage === 'recharge_history' && <RechargeHistoryPage history={user.rechargeHistory} goBack={() => navigate('mine')} />}
        {currentPage === 'withdrawal' && <WithdrawalPage balance={user.balance} onSubmit={handleWithdrawalSubmit} goBack={() => navigate('mine')} userPin={user.transactionPin} />}
        {currentPage === 'withdrawal_history' && <WithdrawalHistoryPage history={user.transactions || []} goBack={() => navigate('mine')} />}
        {currentPage === 'support' && <SupportPage goBack={() => navigate('mine')} />}
        {currentPage === 'help' && <HelpPage goBack={() => navigate('mine')} navigate={navigate} />}
        {currentPage === 'settings' && <SettingsPage user={user} onUpdate={updateProfile} goBack={() => navigate('mine')} />}
        {currentPage === 'admin' && (
            <AdminPanel 
                allRecharges={allRecharges} 
                allWithdrawals={allWithdrawals}
                products={platformProducts} 
                totalUsers={allUsers.length}
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                updateRecharge={updateRechargeStatus}
                updateWithdrawal={updateWithdrawalStatus}
                setProducts={setPlatformProducts}
                goBack={() => navigate('mine')} 
            />
        )}
      </main>

      {!['deposit', 'recharge_select', 'support', 'admin', 'withdrawal', 'withdrawal_history', 'help', 'settings', 'spin', 'login', 'register'].includes(currentPage) && (
        <nav className="fixed bottom-0 w-full max-w-md bg-slate-900 border-t border-slate-800 flex justify-around items-center py-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavButton icon={<Home size={24} />} label="হোম" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <NavButton icon={<ClipboardList size={24} />} label="অর্ডার" active={currentPage === 'order'} onClick={() => setCurrentPage('order')} />
          <NavButton icon={<Users size={24} />} label="টিম" active={currentPage === 'team'} onClick={() => setCurrentPage('team')} />
          <NavButton icon={<UserIcon size={24} />} label="মাইন" active={currentPage === 'mine'} onClick={() => setCurrentPage('mine')} />
        </nav>
      )}
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-orange-500 scale-110' : 'text-slate-500'}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const HomePage: React.FC<{ user: User, activeCategory: 'Solar' | 'Wind', setActiveCategory: (c: 'Solar' | 'Wind') => void, buyProduct: (p: Product) => void, onRecharge: () => void, onWithdraw: () => void, onSpin: () => void, onCollect: () => void, onCheckIn: () => void, products: Product[] }> = ({ user, activeCategory, setActiveCategory, buyProduct, onRecharge, onWithdraw, onSpin, onCollect, onCheckIn, products }) => (
  <div className="animate-fadeIn relative">
    {/* Telegram Floating Button */}
    <a 
      href="https://t.me/+siT7251eH4AwYWQ1" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-[60] bg-[#229ED9] p-4 rounded-full shadow-2xl shadow-blue-500/40 active:scale-90 transition-transform border-2 border-white/20"
    >
      <Send size={24} className="text-white" />
    </a>

    {/* Mining Stats Card */}
    <div className="m-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-600/10 transition-all"></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">জমানো আয় (Mining)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">৳ {(user.uncollectedIncome || 0).toFixed(4)}</span>
            <Zap size={16} className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="text-right">
            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20 mb-2">
                <Diamond size={10} className="text-yellow-500" />
                <span className="text-[10px] font-bold text-yellow-500">VIP {user.vipLevel || 1}</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase">ব্যালেন্স: ৳ {(user.balance || 0).toFixed(2)}</p>
        </div>
      </div>
      
      <button 
        onClick={onCollect}
        disabled={user.uncollectedIncome < 1}
        className={`mt-6 w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${user.uncollectedIncome >= 1 ? 'bg-orange-600 text-white shadow-orange-600/20 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
      >
        <Coins size={20} />
        ইনকাম সংগ্রহ করুন
      </button>
      <p className="text-[10px] text-center text-slate-600 mt-2 italic">মিনিমাম সংগ্রহ: ৳ ১.০০</p>
    </div>

    <div className="m-4 rounded-xl overflow-hidden relative h-40 bg-slate-800 shadow-2xl border border-slate-800 group">
      <img 
        src="https://picsum.photos/seed/solar-banner/800/400" 
        alt="Banner" 
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
      <div className="absolute bottom-4 left-4">
        <h2 className="text-xl font-bold text-white drop-shadow-lg">Solar Growth Mining</h2>
        <p className="text-xs text-slate-300 font-medium">সবুজ শক্তিতে বিনিয়োগ করুন, ভবিষ্যৎ গড়ুন!</p>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-4 px-4 py-4">
      <ActionIcon icon={<RefreshCcw className="text-orange-400" />} label="রিচার্জ" onClick={onRecharge} />
      <ActionIcon icon={<Wallet className="text-red-400" />} label="উত্তোলন" onClick={onWithdraw} />
      <ActionIcon icon={<CheckCircle2 className="text-blue-400" />} label="চেক-ইন" onClick={onCheckIn} />
      <ActionIcon icon={<RefreshCcw className="text-green-400" />} label="স্পিন" onClick={onSpin} />
    </div>
    <div className="flex px-4 gap-4 mb-4">
      <button onClick={() => setActiveCategory('Solar')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeCategory === 'Solar' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Solar</button>
      <button onClick={() => setActiveCategory('Wind')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeCategory === 'Wind' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Wind</button>
    </div>
    <div className="px-4 pb-4 space-y-4">
      {products.filter(p => p.category === activeCategory).map(product => (
        <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-orange-500/30">
          <div className="h-32 w-full relative overflow-hidden">
             <img 
               src={product.image || 'https://picsum.photos/seed/energy/400/300'} 
               alt={product.name} 
               referrerPolicy="no-referrer"
               className="w-full h-full object-cover opacity-80" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-xs text-slate-400 italic">মেয়াদ: {product.validity} দিন</p>
                </div>
                <div className="text-right">
                    <p className="text-orange-500 font-black text-xl">৳ {product.price}</p>
                    <p className="text-[10px] text-slate-500 uppercase">বিনিয়োগ মূল্য</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <p className="text-slate-500 mb-1 uppercase tracking-tighter">দৈনিক আয়</p>
                    <p className="font-bold text-green-500">৳ {product.dailyIncome}</p>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <p className="text-slate-500 mb-1 uppercase tracking-tighter">মোট সম্ভাব্য আয়</p>
                    <p className="font-bold text-blue-400">৳ {product.totalIncome}</p>
                </div>
            </div>
            <button onClick={() => buyProduct(product)} className="w-full bg-orange-600 py-3 rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20 active:scale-95 transition-all">এখনই কিনুন</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActionIcon: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group text-center">
    <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform shadow-md">{icon}</div>
    <span className="text-[10px] font-medium text-slate-400">{label}</span>
  </button>
);

const OrderPage: React.FC<{ user: User, products: Product[] }> = ({ user, products }) => (
  <div className="p-4 animate-fadeIn space-y-4">
    <h2 className="text-xl font-bold mb-2">আপনার ক্রয়কৃত প্যাকসমূহ</h2>
    {user.orders.length === 0 ? (
      <div className="bg-slate-900 p-12 rounded-2xl text-center border border-slate-800 text-slate-500 italic shadow-xl">
        আপনি এখনো কোনো পণ্য ক্রয় করেননি।
      </div>
    ) : (
      user.orders.map(o => {
        const product = products.find(p => p.id === o.productId);
        return (
          <div key={o.id} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex gap-4 items-center shadow-md">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700">
                <img 
                  src={product?.image || 'https://picsum.photos/seed/order/100/100'} 
                  className="w-full h-full object-cover opacity-70" 
                  alt="Prod" 
                  referrerPolicy="no-referrer"
                />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{product?.name || 'Unknown Product'}</p>
              <p className="text-[10px] text-slate-500">ক্রয়: {new Date(o.purchaseDate).toLocaleDateString()}</p>
              <p className="text-[10px] font-bold text-orange-500">প্রতিদিন আয়: ৳ {product?.dailyIncome}</p>
            </div>
            <div className="text-right">
                <span className="text-green-500 font-bold px-3 py-1 bg-green-500/10 rounded-full text-[10px] border border-green-500/20">{o.status}</span>
            </div>
          </div>
        );
      })
    )}
  </div>
);

const TeamPage: React.FC<{ user: User }> = ({ user }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Generating a invite link
  const getInviteLink = () => {
    const origin = window.location.origin;
    // If we are on a dev URL, we should ideally use the shared URL.
    // But since we can't easily get it, we'll use the current origin and warn the user if it's dev.
    return `${origin}/?ref=${user.referralCode}`;
  };

  const inviteLink = getInviteLink();
  const isDevUrl = window.location.hostname.includes('ais-dev');

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold">আপনার টিম</h2>
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-xs mb-1">আপনার আমন্ত্রণ কোড:</p>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-orange-500 tracking-widest font-mono">{user.referralCode}</p>
              <button 
                onClick={() => copyToClipboard(user.referralCode, 'code')}
                className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-transform text-orange-500"
              >
                {copiedCode ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-xs mb-1">আমন্ত্রণ লিঙ্ক:</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-500 font-mono truncate items-center flex">
                {inviteLink}
              </div>
              <button 
                onClick={() => copyToClipboard(inviteLink, 'link')}
                className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
              >
                {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                {copiedLink ? 'কপি হয়েছে' : 'লিঙ্ক কপি'}
              </button>
            </div>
            {isDevUrl && (
              <p className="text-[10px] text-red-400 mt-2 font-medium animate-pulse">
                ⚠️ আপনি ডেভেলপমেন্ট মোডে আছেন। অন্যদের শেয়ার করার জন্য "Shared App URL" ব্যবহার করুন।
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">টিম সদস্য</p>
            <p className="text-lg font-bold">{user.teamSize}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">টিম ইনকাম</p>
            <p className="text-lg font-bold text-orange-500">৳ {(user.teamIncome || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-500" />
          লেভেল পরিসংখ্যান
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Level 1 (12%)', count: user.teamSize },
            { label: 'Level 2 (5%)', count: 0 },
            { label: 'Level 3 (2%)', count: 0 }
          ].map((lvl, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-sm">{lvl.label}</span>
              <span className="font-bold text-orange-500">{lvl.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MinePage: React.FC<{ user: User, navigate: (p: Page) => void, onLogout: () => void }> = ({ user, navigate, onLogout }) => (
  <div className="p-4 space-y-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* VIP Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-1 rounded-full shadow-lg">
          <Diamond size={12} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">VIP {user.vipLevel || 1}</span>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">{user.phone}</h2>
            <p className="text-xs text-slate-500">রেফারেল ID: {user.referralCode}</p>
          </div>
          <button onClick={() => navigate('settings')} className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-transform"><Settings size={20}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <p className="text-xs text-slate-500">ব্যালেন্স</p>
              <p className="text-lg font-bold text-orange-500">৳ {(user.balance || 0).toFixed(2)}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <p className="text-xs text-slate-500">মোট আয়</p>
              <p className="text-lg font-bold">৳ {(user.totalIncome || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 rounded-2xl divide-y divide-slate-800 border border-slate-800 overflow-hidden shadow-lg">
          <ListItem icon={<Bell size={18} className="text-yellow-500"/>} label="নোটিফিকেশন" onClick={() => navigate('notifications')} />
          <ListItem icon={<History size={18} className="text-blue-500"/>} label="ট্রানজেকশন হিস্ট্রি" onClick={() => navigate('withdrawal_history')} />
          <ListItem icon={<Wallet size={18} className="text-green-500"/>} label="উত্তোলন" onClick={() => navigate('withdrawal')} />
          <ListItem icon={<RefreshCcw size={18} className="text-orange-500"/>} label="রিচার্জ ইতিহাস" onClick={() => navigate('recharge_history')} />
          <ListItem icon={<HelpCircle size={18} className="text-purple-500"/>} label="সাহায্য কেন্দ্র" onClick={() => navigate('help')} />
          <ListItem icon={<Headphones size={18} className="text-red-500"/>} label="সাপোর্ট" onClick={() => navigate('support')} />
          <ListItem icon={<Download size={18} className="text-cyan-500"/>} label="অ্যাপ ডাউনলোড করুন" onClick={() => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isIos = /iphone|ipad|ipod/.test(userAgent);
            const isAndroid = /android/.test(userAgent);
            
            if (isIos) {
              alert('iOS-এ ডাউনলোড করতে: ব্রাউজারের "Share" বাটনে ক্লিক করে "Add to Home Screen" সিলেক্ট করুন।');
            } else if (isAndroid) {
              alert('Android-এ ডাউনলোড করতে: ব্রাউজারের ৩-ডট মেনু থেকে "Install App" বা "Add to Home Screen" সিলেক্ট করুন।');
            } else {
              alert('এটি একটি PWA অ্যাপ। আপনার ব্রাউজারের মেনু থেকে "Install App" সিলেক্ট করুন।');
            }
          }} />
      </div>
    <button onClick={onLogout} className="w-full bg-slate-900 py-4 text-red-500 font-bold rounded-2xl border border-slate-800 active:bg-slate-800 transition-colors shadow-lg">Log Out</button>
  </div>
);

const ListItem: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-800 active:bg-slate-800 transition-colors">
    <div className="flex items-center gap-4">{icon}<span className="text-sm font-medium">{label}</span></div>
    <ChevronRight size={18} className="text-slate-600" />
  </button>
);

const SettingsPage: React.FC<{ user: User, onUpdate: (details: Partial<User>) => void, goBack: () => void }> = ({ user, onUpdate, goBack }) => {
    const [pwd, setPwd] = useState(user.password || '');
    const [pin, setPin] = useState(user.transactionPin || '');
    return (
        <div className="p-4 space-y-6 animate-fadeIn">
            <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Settings</h2></header>
            <div className="bg-slate-900 p-6 rounded-2xl space-y-6 border border-slate-800 shadow-xl">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase ml-1">Change Password</label>
                  <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-orange-500" placeholder="New Password"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase ml-1">Transaction PIN (4 Digits)</label>
                  <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-orange-500" placeholder="New PIN"/>
                </div>
                <button onClick={() => onUpdate({ password: pwd, transactionPin: pin })} className="w-full bg-orange-600 py-3 rounded-lg font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-transform">Update Profile</button>
            </div>
        </div>
    );
};

const HelpPage: React.FC<{ goBack: () => void, navigate: (p: Page) => void }> = ({ goBack, navigate }) => (
    <div className="p-4 space-y-6 animate-fadeIn">
        <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Help Center</h2></header>
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
              <h3 className="font-bold text-orange-500 mb-2">SolarGrowth কি?</h3>
              <p className="text-sm text-slate-400">এটি একটি সোলার মাইনিং প্ল্যাটফর্ম যেখানে আপনি সৌরশক্তি প্রকল্পে বিনিয়োগ করে প্রতিদিন একটি নির্দিষ্ট পরিমাণ আয় করতে পারেন।</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
              <h3 className="font-bold text-orange-500 mb-2">কিভাবে উত্তোলন করবেন?</h3>
              <p className="text-sm text-slate-400">মাইন সেকশন থেকে 'উত্তোলন' বাটনে ক্লিক করে আপনার বিকাশ বা নগদ নম্বর দিয়ে রিকোয়েস্ট করুন। ২৪ ঘন্টার মধ্যে পেমেন্ট পৌঁছে যাবে।</p>
          </div>
        </div>
    </div>
);

const SupportPage: React.FC<{ goBack: () => void }> = ({ goBack }) => {
    const [msg, setMsg] = useState('');
    const handleSend = () => { if(!msg.trim()) return; alert('Message sent!'); setMsg(''); };
    return (
        <div className="p-4 h-[calc(100vh-80px)] flex flex-col animate-fadeIn">
            <header className="flex items-center gap-4 mb-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Live Support</h2></header>
            <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-xl mb-4 border border-slate-800 space-y-4 shadow-inner">
                <p className="bg-slate-800 p-3 rounded-lg rounded-tl-none inline-block text-sm max-w-[80%]">আসসালামু আলাইকুম! SolarGrowth কাস্টমার সার্ভিসে আপনাকে স্বাগতম। আমরা আপনাকে কিভাবে সাহায্য করতে পারি?</p>
            </div>
            <div className="flex gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                <input value={msg} onChange={e => setMsg(e.target.value)} className="flex-1 bg-transparent px-2 py-1 focus:outline-none" placeholder="আপনার প্রশ্নটি লিখুন..."/>
                <button onClick={handleSend} className="bg-orange-600 p-2 rounded-lg active:scale-95 transition-transform shadow-lg shadow-orange-600/20"><Send size={20}/></button>
            </div>
        </div>
    );
};

const RechargeSelectPage: React.FC<{ onSelect: (amt: number) => void, goBack: () => void }> = ({ onSelect, goBack }) => (
    <div className="p-4 space-y-6 animate-fadeIn">
      <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Recharge</h2></header>
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 text-center shadow-xl">
        <p className="text-sm text-slate-400 font-medium">রিচার্জের পরিমাণ নির্বাচন করুন</p>
        <div className="grid grid-cols-2 gap-4">
          {[1000, 2000, 5000, 10000, 20000, 50000].map(amt => (
            <button key={amt} onClick={() => onSelect(amt)} className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-bold hover:border-orange-500 transition-all hover:bg-slate-900 shadow-md">৳ {amt}</button>
          ))}
        </div>
      </div>
    </div>
);

const DepositPage: React.FC<{ amount: number, onSubmit: (trx: string) => void, goBack: () => void }> = ({ amount, onSubmit, goBack }) => {
    const [trx, setTrx] = useState('');
    return (
      <div className="p-4 space-y-6 animate-fadeIn">
        <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Payment Details</h2></header>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Total Payable</p>
            <p className="text-3xl font-bold text-orange-500">৳ {amount}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-sm"><span>বিকেশ পার্সোনাল:</span> <span className="font-mono font-bold">01601359646</span> <button className="p-1 bg-slate-800 rounded active:bg-slate-700 transition-colors shadow-sm"><Copy size={12}/></button></div>
            <div className="text-xs text-slate-500 italic">টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) নিচে দিন।</div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase ml-1">Transaction ID</label>
            <input value={trx} onChange={e => setTrx(e.target.value)} placeholder="e.g. 8N7X2W..." className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-orange-500 font-mono text-center tracking-widest shadow-inner"/>
          </div>
          <button onClick={() => trx.length > 5 ? onSubmit(trx) : alert('TrxID invalid')} className="w-full bg-orange-600 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20 active:scale-95 transition-transform">Confirm Payment</button>
        </div>
      </div>
    );
};

const RechargeHistoryPage: React.FC<{ history: RechargeRecord[], goBack: () => void }> = ({ history, goBack }) => (
    <div className="p-4 space-y-6 animate-fadeIn">
      <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Recharge History</h2></header>
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center p-12 text-slate-600 italic bg-slate-900 rounded-2xl border border-slate-800">No records yet</div>
        ) : (
          history.map(r => (
            <div key={r.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
              <div><p className="font-bold">৳ {r.amount}</p><p className="text-[10px] text-slate-500 font-mono">{r.trxId}</p></div>
              <span className={`text-xs px-2 py-1 rounded font-bold ${r.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>{r.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
);

const WithdrawalPage: React.FC<{ balance: number, onSubmit: (w: any) => void, goBack: () => void, userPin?: string }> = ({ balance, onSubmit, goBack, userPin }) => {
    const [amt, setAmt] = useState(0);
    const [acc, setAcc] = useState('');
    const [pin, setPin] = useState('');
    
    const handleSubmit = () => {
        if (userPin && pin !== userPin) {
            alert('ভুল ট্রানজেকশন পিন!');
            return;
        }
        onSubmit({ amount: amt, accountNumber: acc, bankName: 'Mobile Banking', holderName: 'User' });
    };

    return (
      <div className="p-4 space-y-6 animate-fadeIn">
        <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Withdraw Funds</h2></header>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Available Balance</p>
            <p className="text-3xl font-bold text-green-500">৳ {(balance || 0).toFixed(2)}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase ml-1">Withdraw Amount</label>
              <input type="number" onChange={e => setAmt(Number(e.target.value))} placeholder="min 500" className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-green-500 text-center text-lg font-bold shadow-inner"/>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase ml-1">Account Number (BKash/Nagad)</label>
              <input value={acc} onChange={e => setAcc(e.target.value)} placeholder="017..." className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-green-500 text-center tracking-widest font-bold shadow-inner"/>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase ml-1">Transaction PIN</label>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="****" maxLength={4} className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-green-500 text-center tracking-widest font-bold shadow-inner"/>
            </div>
          </div>
          <button onClick={handleSubmit} className="w-full bg-green-600 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 active:scale-95 transition-transform">Request Withdrawal</button>
        </div>
      </div>
    );
};

const WithdrawalHistoryPage: React.FC<{ history: TransactionRecord[], goBack: () => void }> = ({ history, goBack }) => (
    <div className="p-4 space-y-6 animate-fadeIn">
      <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Transaction History</h2></header>
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center p-12 text-slate-600 italic bg-slate-900 rounded-2xl border border-slate-800">No history available</div>
        ) : (
          history.map(tx => (
            <div key={tx.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Income' ? 'bg-green-500/10 text-green-500' : tx.type === 'Withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {tx.type === 'Income' ? <TrendingUp size={18}/> : tx.type === 'Withdrawal' ? <Wallet size={18}/> : <RefreshCcw size={18}/>}
                  </div>
                  <div>
                      <p className="font-bold text-sm">{tx.type}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                  </div>
              </div>
              <div className="text-right">
                  <p className={`font-bold ${tx.type === 'Withdrawal' || tx.type === 'Purchase' ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.type === 'Withdrawal' || tx.type === 'Purchase' ? '-' : '+'} ৳ {(tx.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-600">{tx.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
);

const SpinPage: React.FC<{ user: User, setUser: React.Dispatch<React.SetStateAction<User>>, goBack: () => void }> = ({ user, setUser, goBack }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(() => {
      setSpinning(false);
      const winAmount = [10, 20, 50, 100, 0][Math.floor(Math.random() * 5)];
      if (winAmount > 0) {
        setUser(prev => ({ ...prev, balance: prev.balance + winAmount }));
        alert(`অভিনন্দন! আপনি ৳ ${winAmount} জিতেছেন!`);
      } else {
        alert('দুঃখিত! আবার চেষ্টা করুন।');
      }
    }, 3000);
  };

  return (
    <div className="p-4 space-y-6 animate-fadeIn text-center">
      <header className="flex items-center gap-4 text-left"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Lucky Spin</h2></header>
      <div className="relative w-64 h-64 mx-auto mt-10">
        <div 
          className="w-full h-full rounded-full border-8 border-slate-800 relative overflow-hidden transition-transform duration-[3000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)`, background: 'conic-gradient(#f97316 0deg 72deg, #1e293b 72deg 144deg, #f97316 144deg 216deg, #1e293b 216deg 288deg, #f97316 288deg 360deg)' }}
        >
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xs" style={{ transform: `rotate(${deg + 36}deg) translateY(-80px)` }}>
              ৳ {[10, 20, 50, 100, 0][i]}
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-4 h-8 bg-red-500 clip-path-triangle z-10"></div>
      </div>
      <button 
        disabled={spinning}
        onClick={startSpin}
        className={`mt-10 px-12 py-4 rounded-2xl font-bold text-xl transition-all ${spinning ? 'bg-slate-800 text-slate-500' : 'bg-orange-600 text-white shadow-xl shadow-orange-600/30 active:scale-95'}`}
      >
        {spinning ? 'ঘুরছে...' : 'স্পিন করুন'}
      </button>
      <p className="text-xs text-slate-500 mt-4">প্রতি স্পিন: ৳ ১০ (বর্তমানে ফ্রি)</p>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (phone: string, pass: string) => void, onNavigateRegister: () => void }> = ({ onLogin, onNavigateRegister }) => {
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center animate-fadeIn">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-orange-600/20 mb-4 rotate-12">
          <Landmark size={40} className="text-white -rotate-12" />
        </div>
        <h1 className="text-3xl font-black text-white">SolarGrowth</h1>
        <p className="text-slate-500 text-sm mt-2">আপনার নিরাপদ বিনিয়োগের বিশ্বস্ত মাধ্যম</p>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">ফোন নম্বর</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-all" 
              placeholder="017XXXXXXXX" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">পাসওয়ার্ড</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-all" 
              placeholder="••••••••" 
            />
          </div>
        </div>
        <button 
          onClick={() => onLogin(phone, pass)} 
          className="w-full bg-orange-600 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
        >
          লগইন করুন
        </button>
        <div className="text-center">
          <button onClick={onNavigateRegister} className="text-sm text-slate-400 hover:text-orange-500 transition-colors">
            অ্যাকাউন্ট নেই? <span className="text-orange-500 font-bold">রেজিস্ট্রেশন করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterPage: React.FC<{ onRegister: (phone: string, pass: string, ref: string) => void, onNavigateLogin: () => void }> = ({ onRegister, onNavigateLogin }) => {
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [ref, setRef] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setRef(refParam);
    }
  }, []);

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-white">নতুন অ্যাকাউন্ট</h1>
        <p className="text-slate-500 text-sm mt-2">SolarGrowth পরিবারে আপনাকে স্বাগতম</p>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">ফোন নম্বর</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-orange-500 transition-all" 
            placeholder="017XXXXXXXX" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">পাসওয়ার্ড</label>
          <input 
            type="password" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-orange-500 transition-all" 
            placeholder="কমপক্ষে ৬ ডিজিট" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">রেফারেল কোড (আবশ্যক)</label>
          <input 
            type="text" 
            value={ref} 
            onChange={e => setRef(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-orange-500 transition-all" 
            placeholder="রেফারেল কোড লিখুন" 
            required
          />
        </div>
        <button 
          onClick={() => onRegister(phone, pass, ref)} 
          className="w-full bg-orange-600 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
        >
          রেজিস্ট্রেশন করুন
        </button>
        <div className="text-center">
          <button onClick={onNavigateLogin} className="text-sm text-slate-400 hover:text-orange-500 transition-colors">
            ইতিমধ্যে অ্যাকাউন্ট আছে? <span className="text-orange-500 font-bold">লগইন করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationsPage: React.FC<{ notifications: Notification[], setUser: React.Dispatch<React.SetStateAction<User>>, goBack: () => void }> = ({ notifications, setUser, goBack }) => {
  useEffect(() => {
    // Mark all as read when entering the page
    setUser(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
    }));
  }, []);

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      <header className="flex items-center gap-4">
        <button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button>
        <h2 className="font-bold text-lg">Notifications</h2>
      </header>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center p-12 text-slate-600 italic bg-slate-900 rounded-2xl border border-slate-800">No notifications yet</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-2xl border ${n.read ? 'bg-slate-900 border-slate-800' : 'bg-slate-800 border-orange-500/30'} shadow-md`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-white">{n.title}</h4>
                <span className="text-[10px] text-slate-500">{new Date(n.date).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Expanded AdminPanel Component
const AdminPanel: React.FC<{ 
  allRecharges: RechargeRecord[], 
  allWithdrawals: WithdrawalRecord[], 
  products: Product[], 
  totalUsers: number, 
  allUsers: User[],
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>,
  updateRecharge: (id: string, s: 'Success' | 'Failed') => void, 
  updateWithdrawal: (id: string, s: 'Success' | 'Failed') => void, 
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>, 
  goBack: () => void 
}> = ({ allRecharges, allWithdrawals, products, totalUsers, allUsers, setAllUsers, updateRecharge, updateWithdrawal, setProducts, goBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'recharges' | 'withdrawals' | 'users'>('dashboard');
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isEditingUser, setIsEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  const filteredUsers = allUsers.filter(u => u.phone.includes(userSearchQuery));

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Product = {
      id: isEditingProduct ? isEditingProduct.id : Math.floor(Math.random() * 10000),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      dailyIncome: Number(formData.get('dailyIncome')),
      totalIncome: Number(formData.get('totalIncome')),
      validity: Number(formData.get('validity')),
      category: formData.get('category') as 'Solar' | 'Wind',
      image: formData.get('image') as string
    };

    if (isEditingProduct) {
      setProducts(prev => prev.map(p => p.id === isEditingProduct.id ? productData : p));
      setIsEditingProduct(null);
    } else {
      setProducts(prev => [...prev, productData]);
      setShowAddModal(false);
    }
    alert('Product saved successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white animate-fadeIn pb-10">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={goBack} className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-transform">
          <ChevronRight className="rotate-180" size={20}/>
        </button>
        <div className="flex items-center gap-2 text-red-500 flex-1">
          <ShieldAlert size={20} />
          <h2 className="font-bold">System Admin</h2>
        </div>
      </header>

      {/* Admin Nav */}
      <div className="flex overflow-x-auto p-4 gap-2 bg-slate-900/50 scrollbar-hide border-b border-slate-800">
        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-800 text-slate-400'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'products' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-800 text-slate-400'}`}>Products</button>
        <button onClick={() => setActiveTab('recharges')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'recharges' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-800 text-slate-400'}`}>Recharges ({allRecharges.filter(r => r.status === 'Pending').length})</button>
        <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'withdrawals' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-800 text-slate-400'}`}>Withdrawals ({allWithdrawals.filter(w => w.status === 'Pending').length})</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-800 text-slate-400'}`}>Users</button>
      </div>

      <div className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-500">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-500">Active Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-500">Total Deposits</p>
                <p className="text-2xl font-bold text-green-500">৳ {allRecharges.reduce((acc, r) => r.status === 'Success' ? acc + r.amount : acc, 0)}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-500">Total Payouts</p>
                <p className="text-2xl font-bold text-red-500">৳ {allWithdrawals.reduce((acc, w) => w.status === 'Success' ? acc + w.amount : acc, 0)}</p>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2"><TrendingUp size={16} className="text-orange-500"/> Growth Stats</h3>
              <div className="h-24 flex items-end gap-1">
                {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-orange-600/20 hover:bg-orange-600 transition-all rounded-t cursor-pointer" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Product Management</h3>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all"><Plus size={16}/> New Product</button>
            </div>
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden transition-all duration-300 shadow-lg">
                  <div 
                    onClick={() => setExpandedProductId(expandedProductId === p.id ? null : p.id)}
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0`}>
                           {p.image ? (
                             <img 
                               src={p.image} 
                               alt="p" 
                               referrerPolicy="no-referrer"
                               className="w-full h-full object-cover" 
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-700"><ImageIcon size={16} /></div>
                           )}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{p.name}</p>
                            <p className="text-[10px] text-slate-500">Price: ৳{p.price} | Daily: ৳{p.dailyIncome}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <button onClick={(e) => { e.stopPropagation(); setIsEditingProduct(p); }} className="p-2 bg-slate-800 rounded-lg text-blue-500 hover:bg-slate-700 transition-colors shadow-sm"><Edit3 size={14}/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} className="p-2 bg-slate-800 rounded-lg text-red-500 hover:bg-slate-700 transition-colors shadow-sm"><Trash2 size={14}/></button>
                        </div>
                        <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${expandedProductId === p.id ? 'rotate-180' : ''}`}/>
                    </div>
                  </div>
                  
                  {expandedProductId === p.id && (
                    <div className="px-4 pb-4 animate-fadeIn">
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Validity Period</p>
                                <p className="text-sm font-bold text-slate-200">{p.validity} Days</p>
                            </div>
                            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Total Potential Income</p>
                                <p className="text-sm font-bold text-orange-500">৳ {p.totalIncome}</p>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recharges' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-bold">Pending Recharges</h3>
            <div className="space-y-3">
              {allRecharges.filter(r => r.status === 'Pending').length === 0 ? (
                <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-800 text-slate-500 italic">No pending recharges</div>
              ) : (
                allRecharges.filter(r => r.status === 'Pending').map(r => (
                  <div key={r.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg text-orange-500">৳ {r.amount}</p>
                        <p className="text-xs text-slate-400">User: {r.userPhone}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">TrxID: {r.trxId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateRecharge(r.id, 'Success')} className="p-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check size={18}/></button>
                        <button onClick={() => updateRecharge(r.id, 'Failed')} className="p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X size={18}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-bold">Pending Withdrawals</h3>
            <div className="space-y-3">
              {allWithdrawals.filter(w => w.status === 'Pending').length === 0 ? (
                <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-800 text-slate-500 italic">No pending withdrawals</div>
              ) : (
                allWithdrawals.filter(w => w.status === 'Pending').map(w => (
                  <div key={w.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg text-green-500">৳ {w.amount}</p>
                        <p className="text-xs text-slate-400">User: {w.userPhone}</p>
                        <p className="text-xs text-slate-300 mt-1">{w.bankName} - {w.accountNumber}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Holder: {w.holderName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateWithdrawal(w.id, 'Success')} className="p-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check size={18}/></button>
                        <button onClick={() => updateWithdrawal(w.id, 'Failed')} className="p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X size={18}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search users by phone..." 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-800 text-slate-500 italic">No users found</div>
              ) : (
                filteredUsers.map((u, i) => (
                  <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
                    <div>
                      <p className="font-bold text-sm">{u.phone}</p>
                      <p className="text-[10px] text-slate-500">VIP: {u.vipLevel} | Team: {u.teamSize}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-bold text-orange-500 text-sm">৳ {u.balance.toFixed(2)}</p>
                      <button 
                        onClick={() => setIsEditingUser(u)}
                        className="text-[10px] bg-slate-800 px-2 py-1 rounded text-blue-400 hover:bg-slate-700 transition-colors"
                      >
                        Edit User
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold">Edit User: {isEditingUser.phone}</h3>
              <button onClick={() => setIsEditingUser(null)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Balance (৳)</label>
                <input 
                  type="number" 
                  value={isEditingUser.balance} 
                  onChange={e => setIsEditingUser({...isEditingUser, balance: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">VIP Level</label>
                <input 
                  type="number" 
                  value={isEditingUser.vipLevel} 
                  onChange={e => setIsEditingUser({...isEditingUser, vipLevel: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Team Size</label>
                <input 
                  type="number" 
                  value={isEditingUser.teamSize} 
                  onChange={e => setIsEditingUser({...isEditingUser, teamSize: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" 
                />
              </div>
              <button 
                onClick={() => {
                  setAllUsers(prev => prev.map(u => u.phone === isEditingUser.phone ? isEditingUser : u));
                  setIsEditingUser(null);
                  alert('User updated successfully!');
                }}
                className="w-full bg-orange-600 py-3 rounded-xl font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all mt-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddModal || isEditingProduct) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold">{isEditingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setShowAddModal(false); setIsEditingProduct(null); }} className="p-1 hover:bg-slate-800 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Product Name</label>
                <input name="name" defaultValue={isEditingProduct?.name} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Price (৳)</label>
                  <input name="price" type="number" defaultValue={isEditingProduct?.price} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Daily Income (৳)</label>
                  <input name="dailyIncome" type="number" defaultValue={isEditingProduct?.dailyIncome} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Validity (Days)</label>
                  <input name="validity" type="number" defaultValue={isEditingProduct?.validity} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Category</label>
                  <select name="category" defaultValue={isEditingProduct?.category || 'Solar'} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500">
                    <option value="Solar">Solar</option>
                    <option value="Wind">Wind</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Total Income (৳)</label>
                <input name="totalIncome" type="number" defaultValue={isEditingProduct?.totalIncome} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Image URL</label>
                <input name="image" defaultValue={isEditingProduct?.image} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-orange-600 py-3 rounded-xl font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all mt-2">
                {isEditingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;