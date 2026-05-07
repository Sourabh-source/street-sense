import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  Edit3, 
  EyeOff, 
  Eye,
  Lock, 
  Info, 
  Bolt,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function BankDetails() {
  const { user, profile } = useFirebase();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  
  const [formData, setFormData] = useState({
    legalName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        legalName: profile.legalName || profile.displayName || '',
        accountNumber: profile.accountNumber || '',
        ifscCode: profile.ifscCode || '',
        upiId: profile.upiId || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date()
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight text-on-surface">Bank Details & Rewards</h2>
        <div className="flex items-center gap-6 text-sm">
          <a className="text-primary font-bold border-b-2 border-primary py-1" href="#">Payouts</a>
          <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors py-1" href="#">Earnings Log</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[2rem] p-8 relative overflow-hidden group border border-border shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-secondary font-medium mb-4">
              <Wallet size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Total Balance</span>
            </div>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-black text-on-surface tracking-tighter">
                {profile?.sensePoints?.toLocaleString() || '0'}
              </span>
              <span className="text-xl font-bold text-primary mb-2">SensePoints</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="civic-gradient text-white py-4 px-10 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <ArrowUpRight size={18} />
                Withdraw to Bank
              </button>
              <button className="bg-surface-container-low text-on-surface py-4 px-10 rounded-2xl font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-border">
                <ArrowDownLeft size={18} />
                Redeem Vouchers
              </button>
            </div>
          </div>
          <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:opacity-40 transition-opacity"></div>
        </div>

        <div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between border border-border">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Next Milestone</h3>
              <div className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-lg">GOLD</div>
            </div>
            <div className="w-full bg-surface-container-high h-3 rounded-full mb-4 overflow-hidden">
              <div className="bg-amber-500 h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">2,550 points away from <span className="font-bold text-amber-600">Gold Citizen</span> status.</p>
          </div>
          <div className="mt-8 flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Bolt size={18} fill="currentColor" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Multiplier</div>
                <div className="text-sm font-bold text-on-surface">1.5x Active</div>
              </div>
            </div>
            <Info size={16} className="text-slate-300 dark:text-slate-600 cursor-help" />
          </div>
        </div>
      </div>

      <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-on-surface">Financial Identity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your settlement details are encrypted and stored safely.</p>
            </div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-surface-container-low text-primary font-bold rounded-xl flex items-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <Edit3 size={18} />
              Edit Details
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <EditableDetailField 
            label="Account Holder Name" 
            value={formData.legalName} 
            isEditing={isEditing}
            onChange={(val) => setFormData({...formData, legalName: val})}
          />
          <EditableDetailField 
            label="Account Number" 
            value={formData.accountNumber} 
            isEditing={isEditing}
            isPassword
            showSecret={showAccount}
            onToggleSecret={() => setShowAccount(!showAccount)}
            onChange={(val) => setFormData({...formData, accountNumber: val})}
          />
          <EditableDetailField 
            label="IFSC Code" 
            value={formData.ifscCode} 
            isEditing={isEditing}
            onChange={(val) => setFormData({...formData, ifscCode: val})}
          />
          <EditableDetailField 
            label="UPI ID" 
            value={formData.upiId} 
            isEditing={isEditing}
            onChange={(val) => setFormData({...formData, upiId: val})}
          />
        </div>

        {isEditing && (
          <div className="mt-12 flex flex-col md:flex-row items-center justify-end gap-4 pt-8 border-t border-border">
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 mr-auto mb-4 md:mb-0">
              <Lock size={12} className="text-primary fill-primary" />
              Changes will be synced to your secure profile.
            </p>
            <button 
              onClick={() => {
                setIsEditing(false);
                if (profile) {
                  setFormData({
                    legalName: profile.legalName || profile.displayName || '',
                    accountNumber: profile.accountNumber || '',
                    ifscCode: profile.ifscCode || '',
                    upiId: profile.upiId || ''
                  });
                }
              }}
              className="w-full md:w-auto px-8 py-3 rounded-2xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto px-10 py-3 rounded-2xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Financial Info'}
              {!isSaving && <CheckCircle2 size={18} />}
            </button>
          </div>
        )}
      </section>

      <section className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden border border-border shadow-sm">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-container-low/30">
          <h2 className="text-lg font-bold text-on-surface">Payout History</h2>
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-surface-container-low rounded-xl text-slate-400 dark:text-slate-500 transition-colors">
              <Filter size={20} />
            </button>
            <button className="p-2.5 hover:bg-surface-container-low rounded-xl text-slate-400 dark:text-slate-500 transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Description</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <TransactionRow date="Oct 24, 2023" desc="SensePoints Redemption" amount="+ ₹4,500.00" status="success" />
              <TransactionRow date="Oct 18, 2023" desc="Weekly Reward Payout" amount="+ ₹1,200.00" status="success" />
              <TransactionRow date="Oct 12, 2023" desc="Reporting Bonus - Q3" amount="+ ₹2,100.00" status="pending" />
              <TransactionRow date="Sep 29, 2023" desc="SensePoints Redemption" amount="+ ₹3,000.00" status="success" />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EditableDetailField({ 
  label, 
  value, 
  isEditing, 
  isPassword, 
  showSecret, 
  onToggleSecret,
  onChange 
}: { 
  label: string, 
  value: string, 
  isEditing: boolean, 
  isPassword?: boolean,
  showSecret?: boolean,
  onToggleSecret?: () => void,
  onChange: (val: string) => void
}) {
  const displayValue = isPassword && !showSecret && !isEditing 
    ? '•••• •••• ' + value.slice(-4) 
    : value;

  return (
    <div className="space-y-3">
      <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">{label}</label>
      <div className="relative group">
        <input 
          className={cn(
            "w-full bg-surface-container-low border border-border rounded-2xl px-5 py-4 text-on-surface font-bold transition-all outline-none",
            isEditing ? "focus:ring-2 focus:ring-primary border-primary/20" : "cursor-default group-hover:bg-surface-container-high"
          )} 
          readOnly={!isEditing} 
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
        />
        {isPassword && !isEditing && (
          <button 
            onClick={onToggleSecret}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-300 dark:text-slate-600 hover:text-primary transition-colors"
          >
            {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

function TransactionRow({ date, desc, amount, status }: { date: string, desc: string, amount: string, status: 'success' | 'pending' }) {
  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors group">
      <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 font-medium">{date}</td>
      <td className="px-8 py-6 text-sm font-bold text-on-surface">{desc}</td>
      <td className="px-8 py-6 text-sm font-black text-primary">{amount}</td>
      <td className="px-8 py-6">
        <span className={cn(
          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
          status === 'success' 
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
            : "bg-surface-container-high text-slate-600 dark:text-slate-400 border-border"
        )}>
          {status}
        </span>
      </td>
    </tr>
  );
}
