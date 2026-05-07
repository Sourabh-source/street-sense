import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  UserSearch, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BadgeCheck, 
  CreditCard, 
  Camera, 
  ShieldCheck, 
  CloudUpload,
  Info,
  Check
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function KYC() {
  const { user, profile } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    legalName: '',
    dob: '',
    address: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        legalName: profile.legalName || profile.displayName || '',
        dob: profile.dob || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (isDraft = false) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        ...formData,
        updatedAt: new Date()
      };
      
      if (!isDraft) {
        updateData.kycStatus = 'under_review';
      } else if (!profile?.kycStatus) {
        updateData.kycStatus = 'not_submitted';
      }

      await updateDoc(userRef, updateData);
      alert(isDraft ? 'Draft saved successfully!' : 'Verification submitted! Our team will review it shortly.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const status = profile?.kycStatus || 'not_submitted';

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Alert Banner */}
      {status === 'not_submitted' && (
        <div className="p-5 bg-amber-500/10 text-amber-900 dark:text-amber-200 rounded-2xl flex items-center gap-4 border border-amber-500/20 shadow-sm">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <AlertTriangle className="text-amber-500" size={24} />
          </div>
          <p className="text-sm font-bold">KYC must be verified before reward redemption. Completing this will unlock your earnings.</p>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-5xl font-black tracking-tight text-on-surface mb-3">Identity Verification</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium leading-relaxed">To ensure community trust and secure payouts, we require a one-time verification of your credentials.</p>
      </div>

      {/* KYC Status Tracker */}
      <section className="mb-12 py-10 bg-surface-container-low rounded-[3rem] border border-border overflow-hidden relative">
        <div className="grid grid-cols-4 gap-4 relative max-w-4xl mx-auto px-6">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-[22px] z-0"></div>
          <StatusStep icon={UserSearch} label="Not Submitted" active={status === 'not_submitted'} />
          <StatusStep icon={Clock} label="Under Review" active={status === 'under_review'} completed={status === 'verified'} />
          <StatusStep icon={CheckCircle2} label="Verified" active={status === 'verified'} />
          <StatusStep icon={XCircle} label="Rejected" active={status === 'rejected'} />
        </div>
      </section>

      {/* Verification Bento Module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-[2.5rem] p-10 space-y-10 border border-border shadow-sm">
          <div>
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-on-surface">
              <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40"></div>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Full Legal Name</label>
                <input 
                  className="w-full bg-surface-container-low border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface" 
                  placeholder="As per Govt ID" 
                  type="text" 
                  value={formData.legalName}
                  onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                  disabled={status === 'verified'}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Date of Birth</label>
                <input 
                  className="w-full bg-surface-container-low border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface" 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  disabled={status === 'verified'}
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Residential Address</label>
                <textarea 
                  className="w-full bg-surface-container-low border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface min-h-[120px] resize-none" 
                  placeholder="Street, City, State, ZIP Code" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={status === 'verified'}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-on-surface">
              <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40"></div>
              Identity Documents
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <DocTypeButton icon={BadgeCheck} label="Aadhaar" active />
                <DocTypeButton icon={CreditCard} label="PAN Card" />
                <DocTypeButton icon={CreditCard} label="DL" />
              </div>
              <div className="group relative border-2 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all bg-surface-container-low/50 hover:bg-surface-container-low">
                <div className="p-5 bg-primary/5 text-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <CloudUpload size={48} />
                </div>
                <p className="text-lg font-bold text-on-surface mb-1">Click or drag to upload ID</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">PNG, JPG or PDF up to 5MB</p>
                <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" disabled={status === 'verified'} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Selfie Section */}
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-sm border border-border">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-3 text-on-surface uppercase tracking-widest">
              <Camera className="text-primary" size={20} />
              Liveness Check
            </h3>
            <div className="relative aspect-square rounded-3xl bg-surface-container-low mb-6 overflow-hidden border-4 border-surface-container-lowest shadow-inner">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/60 backdrop-blur-[4px] z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 text-white">
                  <Camera size={32} />
                </div>
                <button 
                  className="bg-white text-on-surface px-8 py-3 rounded-2xl text-xs font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  disabled={status === 'verified'}
                >
                  Open Camera
                </button>
              </div>
              <img 
                alt="Selfie preview" 
                className="w-full h-full object-cover grayscale opacity-50" 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic leading-relaxed px-4">Position your face within the frame and ensure good lighting for AI verification.</p>
          </div>

          {/* Security Badge */}
          <div className="bg-emerald-500/5 rounded-3xl p-8 border border-emerald-500/10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-600 mb-2">Secure Processing</h4>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic">All data is encrypted using AES-256 standards. Redacted after verification.</p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-border">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-on-surface">Submission Guide</h4>
            <ul className="space-y-4">
              <ChecklistItem label="ID is not expired" />
              <ChecklistItem label="Details match Profile" />
              <ChecklistItem label="Clear, unblurred photos" />
            </ul>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between p-8 bg-surface-container-lowest rounded-[2.5rem] shadow-xl border border-border gap-6">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-surface-container-low rounded-2xl text-slate-400 dark:text-slate-500 shadow-inner">
            <Info size={24} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">By clicking submit, you agree to our <a className="underline text-primary hover:text-primary/70 transition-colors" href="#">Citizen Identity Policy</a>.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => handleSubmit(true)}
            disabled={isSaving || status === 'verified'}
            className="flex-1 md:flex-none px-8 py-4 text-sm font-bold text-on-surface hover:bg-surface-container-low rounded-2xl transition-colors border border-border"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSubmit(false)}
            disabled={isSaving || status === 'verified'}
            className="flex-1 md:flex-none px-12 py-4 civic-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? 'Submitting...' : status === 'verified' ? 'Verified ✓' : 'Submit Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusStep({ icon: Icon, label, active, completed }: { icon: any, label: string, active?: boolean, completed?: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center ring-8 ring-surface-container-low transition-all duration-500",
        active ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" : 
        completed ? "bg-emerald-500 text-white" :
        "bg-surface-container-high text-slate-400 dark:text-slate-500"
      )}>
        {completed ? <Check size={20} /> : <Icon size={20} />}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest text-center transition-colors duration-500", 
        active || completed ? "text-primary" : "text-slate-400 dark:text-slate-500"
      )}>
        {label}
      </span>
    </div>
  );
}

function DocTypeButton({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all h-28",
      active 
        ? "border-primary bg-primary/10 text-primary shadow-inner" 
        : "border-border hover:bg-surface-container-low text-slate-400 dark:text-slate-500"
    )}>
      <Icon size={28} className={cn("mb-3", active ? "text-primary" : "text-slate-300 dark:text-slate-600")} />
      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>}
    </button>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-bold">
      <div className="p-1 bg-emerald-500/20 text-emerald-500 rounded-lg">
        <CheckCircle2 size={14} />
      </div>
      {label}
    </li>
  );
}
