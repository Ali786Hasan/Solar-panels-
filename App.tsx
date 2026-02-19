import React, { useState, useRef, useEffect } from 'react';
import { Home, ClipboardList, Users, User as UserIcon, Wallet, ArrowRight, Copy, Check, Info, Download, LogOut, RefreshCcw, Landmark, Headphones, ChevronRight, X, Send, PlusCircle, ShieldAlert, TrendingUp, Settings, Trash2, CheckCircle2, XCircle, CreditCard, History, HelpCircle, BookOpen, MessageCircle, AlertCircle, Lock, Phone, UserRoundPen, Edit3, Plus, Search, Eye, ChevronDown, Share2, Image as ImageIcon } from 'lucide-react';
import { Page, User, Product, Order, RechargeRecord, WithdrawalRecord } from './types';
import { PRODUCTS, INITIAL_USER } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [activeCategory, setActiveCategory] = useState<'Solar' | 'Wind'>('Solar');
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  
  // Simulated Global State for Admin
  const [allRecharges, setAllRecharges] = useState<RechargeRecord[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [platformProducts, setPlatformProducts] = useState<Product[]>(PRODUCTS);
  const [totalPlatformUsers, setTotalPlatformUsers] = useState(1240);

  const navigate = (page: Page) => setCurrentPage(page);

  const buyProduct = (product: Product) => {
    if (user.balance >= product.price) {
      setUser(prev => ({
        ...prev,
        balance: prev.balance - product.price,
        orders: [...prev.orders, { id: Math.random().toString(36).substr(2, 9), productId: product.id, purchaseDate: new Date().toISOString(), status: 'Active' }]
      }));
      alert(`আপনি সফলভাবে ${product.name} ক্রয় করেছেন!`);
    } else {
      alert('অপর্যাপ্ত ব্যালেন্স। দয়া করে রিচার্জ করুন।');
      setCurrentPage('recharge_select');
    }
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
    alert('পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। যাচাইয়ের পর ব্যালেন্স যোগ করা হবে।');
    setCurrentPage('recharge_history');
  };

  const handleWithdrawalSubmit = (withdrawal: Omit<WithdrawalRecord, 'id' | 'userPhone' | 'date' | 'status'>) => {
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
    if (recharge && status === 'Success' && recharge.userPhone === user.phone) {
        setUser(prev => ({ ...prev, balance: prev.balance + recharge.amount }));
    }
    alert(`Status updated to ${status}`);
  };

  const updateWithdrawalStatus = (id: string, status: 'Success' | 'Failed') => {
    setAllWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    const withdrawal = allWithdrawals.find(w => w.id === id);
    if (withdrawal && status === 'Failed' && withdrawal.userPhone === user.phone) {
        setUser(prev => ({ ...prev, balance: prev.balance + withdrawal.amount }));
    }
    alert(`Withdrawal marked as ${status}`);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto bg-slate-950 shadow-2xl relative">
      {!['deposit', 'recharge_select', 'support', 'admin', 'withdrawal', 'withdrawal_history', 'help', 'settings'].includes(currentPage) && (
        <header className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-xl italic shadow-lg shadow-orange-500/20">S</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SolarGrowth</h1>
              <p className="text-xs text-slate-400">ব্যালেন্স: ৳ {user.balance}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {user.isAdmin && (
                <button onClick={() => navigate('admin')} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <ShieldAlert size={20} />
                </button>
            )}
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold">SG</div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto">
        {currentPage === 'home' && <HomePage user={user} activeCategory={activeCategory} setActiveCategory={setActiveCategory} buyProduct={buyProduct} onRecharge={() => navigate('recharge_select')} products={platformProducts} />}
        {currentPage === 'order' && <OrderPage user={user} products={platformProducts} />}
        {currentPage === 'team' && <TeamPage user={user} />}
        {currentPage === 'mine' && <MinePage user={user} navigate={navigate} />}
        {currentPage === 'recharge_select' && <RechargeSelectPage onSelect={(amt) => { setRechargeAmount(amt); navigate('deposit'); }} goBack={() => navigate('home')} />}
        {currentPage === 'deposit' && <DepositPage amount={rechargeAmount} onSubmit={handleDepositSubmit} goBack={() => navigate('recharge_select')} />}
        {currentPage === 'recharge_history' && <RechargeHistoryPage history={user.rechargeHistory} goBack={() => navigate('mine')} />}
        {currentPage === 'withdrawal' && <WithdrawalPage balance={user.balance} onSubmit={handleWithdrawalSubmit} goBack={() => navigate('mine')} />}
        {currentPage === 'withdrawal_history' && <WithdrawalHistoryPage history={user.withdrawalHistory} goBack={() => navigate('mine')} />}
        {currentPage === 'support' && <SupportPage goBack={() => navigate('mine')} />}
        {currentPage === 'help' && <HelpPage goBack={() => navigate('mine')} navigate={navigate} />}
        {currentPage === 'settings' && <SettingsPage user={user} onUpdate={updateProfile} goBack={() => navigate('mine')} />}
        {currentPage === 'admin' && (
            <AdminPanel 
                allRecharges={allRecharges} 
                allWithdrawals={allWithdrawals}
                products={platformProducts} 
                totalUsers={totalPlatformUsers}
                updateRecharge={updateRechargeStatus}
                updateWithdrawal={updateWithdrawalStatus}
                setProducts={setPlatformProducts}
                goBack={() => navigate('mine')} 
            />
        )}
      </main>

      {!['deposit', 'recharge_select', 'support', 'admin', 'withdrawal', 'withdrawal_history', 'help', 'settings'].includes(currentPage) && (
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

const HomePage: React.FC<{ user: User, activeCategory: 'Solar' | 'Wind', setActiveCategory: (c: 'Solar' | 'Wind') => void, buyProduct: (p: Product) => void, onRecharge: () => void, products: Product[] }> = ({ user, activeCategory, setActiveCategory, buyProduct, onRecharge, products }) => (
  <div className="animate-fadeIn">
    <div className="m-4 rounded-xl overflow-hidden relative h-48 bg-slate-800 shadow-2xl border border-slate-700 group">
      <img src="https://images.unsplash.com/photo-1509391366360-fe5bb58485bb?auto=format&fit=crop&q=80&w=800" alt="Banner" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
      <div className="absolute bottom-4 left-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">Solar Growth Mining</h2>
        <p className="text-sm text-slate-300 font-medium">সবুজ শক্তিতে বিনিয়োগ করুন, ভবিষ্যৎ গড়ুন!</p>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-4 px-4 py-4">
      <ActionIcon icon={<RefreshCcw className="text-orange-400" />} label="রিচার্জ" onClick={onRecharge} />
      <ActionIcon icon={<Wallet className="text-red-400" />} label="উত্তোলন" />
      <ActionIcon icon={<ClipboardList className="text-blue-400" />} label="টাস্ক" />
      <ActionIcon icon={<RefreshCcw className="text-green-400" />} label="স্পিন" />
    </div>
    <div className="flex px-4 gap-4 mb-4">
      <button onClick={() => setActiveCategory('Solar')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeCategory === 'Solar' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Solar</button>
      <button onClick={() => setActiveCategory('Wind')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeCategory === 'Wind' ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Wind</button>
    </div>
    <div className="px-4 pb-4 space-y-4">
      {products.filter(p => p.category === activeCategory).map(product => (
        <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-orange-500/30">
          <div className="h-32 w-full relative overflow-hidden">
             <img src={product.image || 'https://images.unsplash.com/photo-1509391366360-fe5bb58485bb?auto=format&fit=crop&q=80&w=400'} alt={product.name} className="w-full h-full object-cover opacity-80" />
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
                <img src={product?.image} className="w-full h-full object-cover opacity-70" alt="Prod" />
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
  
  // Generating a fake invite link based on current origin
  const inviteLink = `${window.location.origin}/register?ref=${user.referralCode}`;

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
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">টিম সদস্য</p>
            <p className="text-lg font-bold">{user.teamSize}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">টিম ইনকাম</p>
            <p className="text-lg font-bold text-orange-500">৳ 0</p>
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

const MinePage: React.FC<{ user: User, navigate: (p: Page) => void }> = ({ user, navigate }) => (
  <div className="p-4 space-y-6 animate-fadeIn">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
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
            <p className="text-lg font-bold text-orange-500">৳ {user.balance}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
            <p className="text-xs text-slate-500">মোট আয়</p>
            <p className="text-lg font-bold">৳ {user.totalIncome}</p>
        </div>
      </div>
    </div>
    <div className="bg-slate-900 rounded-2xl divide-y divide-slate-800 border border-slate-800 overflow-hidden shadow-lg">
        <ListItem icon={<Wallet size={18} className="text-green-500"/>} label="উত্তোলন" onClick={() => navigate('withdrawal')} />
        <ListItem icon={<History size={18} className="text-blue-500"/>} label="উত্তোলন ইতিহাস" onClick={() => navigate('withdrawal_history')} />
        <ListItem icon={<RefreshCcw size={18} className="text-orange-500"/>} label="রিচার্জ ইতিহাস" onClick={() => navigate('recharge_history')} />
        <ListItem icon={<HelpCircle size={18} className="text-purple-500"/>} label="সাহায্য কেন্দ্র" onClick={() => navigate('help')} />
        <ListItem icon={<Headphones size={18} className="text-red-500"/>} label="সাপোর্ট" onClick={() => navigate('support')} />
    </div>
    <button className="w-full bg-slate-900 py-4 text-red-500 font-bold rounded-2xl border border-slate-800 active:bg-slate-800 transition-colors shadow-lg">Log Out</button>
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
    return (
        <div className="p-4 space-y-6 animate-fadeIn">
            <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Settings</h2></header>
            <div className="bg-slate-900 p-6 rounded-2xl space-y-6 border border-slate-800 shadow-xl">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase ml-1">Change Password</label>
                  <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-orange-500" placeholder="New Password"/>
                </div>
                <button onClick={() => onUpdate({ password: pwd })} className="w-full bg-orange-600 py-3 rounded-lg font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-transform">Update Profile</button>
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
            <div className="flex justify-between items-center text-sm"><span>বিকেশ পার্সোনাল:</span> <span className="font-mono font-bold">01719359646</span> <button className="p-1 bg-slate-800 rounded active:bg-slate-700 transition-colors shadow-sm"><Copy size={12}/></button></div>
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

const WithdrawalPage: React.FC<{ balance: number, onSubmit: (w: any) => void, goBack: () => void }> = ({ balance, onSubmit, goBack }) => {
    const [amt, setAmt] = useState(0);
    const [acc, setAcc] = useState('');
    return (
      <div className="p-4 space-y-6 animate-fadeIn">
        <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Withdraw Funds</h2></header>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Available Balance</p>
            <p className="text-3xl font-bold text-green-500">৳ {balance}</p>
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
          </div>
          <button onClick={() => onSubmit({ amount: amt, accountNumber: acc, bankName: 'Mobile Banking', holderName: 'User' })} className="w-full bg-green-600 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 active:scale-95 transition-transform">Request Withdrawal</button>
        </div>
      </div>
    );
};

const WithdrawalHistoryPage: React.FC<{ history: WithdrawalRecord[], goBack: () => void }> = ({ history, goBack }) => (
    <div className="p-4 space-y-6 animate-fadeIn">
      <header className="flex items-center gap-4"><button onClick={goBack} className="p-2 bg-slate-900 rounded-lg"><ChevronRight className="rotate-180"/></button><h2 className="font-bold text-lg">Withdrawal History</h2></header>
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center p-12 text-slate-600 italic bg-slate-900 rounded-2xl border border-slate-800">No history available</div>
        ) : (
          history.map(w => (
            <div key={w.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
              <div><p className="font-bold">৳ {w.amount}</p><p className="text-[10px] text-slate-500">{w.accountNumber}</p></div>
              <span className={`text-xs px-2 py-1 rounded font-bold ${w.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>{w.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
);

// Expanded AdminPanel Component
const AdminPanel: React.FC<{ 
  allRecharges: RechargeRecord[], 
  allWithdrawals: WithdrawalRecord[], 
  products: Product[], 
  totalUsers: number, 
  updateRecharge: (id: string, s: 'Success' | 'Failed') => void, 
  updateWithdrawal: (id: string, s: 'Success' | 'Failed') => void, 
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>, 
  goBack: () => void 
}> = ({ allRecharges, allWithdrawals, products, totalUsers, updateRecharge, updateWithdrawal, setProducts, goBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'recharges' | 'withdrawals' | 'users'>('dashboard');
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  const mockUsers = [
    { phone: '+88 01719359646', balance: 310, team: 12, joined: '2024-01-12' },
    { phone: '+88 01823456789', balance: 1500, team: 4, joined: '2024-03-05' },
    { phone: '+88 01999888777', balance: 5400, team: 21, joined: '2023-11-20' },
    { phone: '+88 01500112233', balance: 0, team: 0, joined: '2024-04-10' },
    { phone: '+88 01333444555', balance: 120, team: 2, joined: '2024-05-15' },
  ];

  const filteredUsers = mockUsers.filter(u => u.phone.includes(userSearchQuery));

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
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-red-500">
          <ShieldAlert size={20} />
          <h2 className="font-bold">System Admin</h2>
        </div>
        <button onClick={goBack} className="p-2 bg-slate-800 rounded-full active:scale-95 transition-transform"><X size={20}/></button>
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
                             <img src={p.image} alt="p" className="w-full h-full object-cover" />
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

        {activeTab === 'recharges'