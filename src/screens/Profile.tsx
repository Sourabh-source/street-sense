import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Star, 
  Calendar, 
  LogOut, 
  Camera,
  Edit2,
  CheckCircle2,
  Save,
  X,
  Phone,
  FileText,
  Check
} from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/src/lib/utils';

// ─── Default avatar catalogue ────────────────────────────────────────────────
// Each avatar is a DiceBear SVG URL (no external auth required).
// Styles: lorelei (illustrated), bottts (robots), pixel-art, fun-emoji, notionists
const DEFAULT_AVATARS = [
  // Lorelei illustrated portraits
  { id: 'lorelei-1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Mia&backgroundColor=b6e3f4',          label: 'Mia' },
  { id: 'lorelei-2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alex&backgroundColor=c0aede',        label: 'Alex' },
  { id: 'lorelei-3', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sam&backgroundColor=ffdfbf',         label: 'Sam' },
  { id: 'lorelei-4', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jordan&backgroundColor=d1f4d1',      label: 'Jordan' },
  { id: 'lorelei-5', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Casey&backgroundColor=ffd5dc',       label: 'Casey' },
  { id: 'lorelei-6', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Riley&backgroundColor=ffe4b5',       label: 'Riley' },
  // Bottts robots
  { id: 'bottts-1',  url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zeta&backgroundColor=b6e3f4',         label: 'Zeta' },
  { id: 'bottts-2',  url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Orion&backgroundColor=c0aede',        label: 'Orion' },
  { id: 'bottts-3',  url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=d1f4d1',         label: 'Nova' },
  // Pixel art
  { id: 'pixel-1',   url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel&backgroundColor=b6e3f4',     label: 'Pixel' },
  { id: 'pixel-2',   url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Byte&backgroundColor=ffd5dc',      label: 'Byte' },
  { id: 'pixel-3',   url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chip&backgroundColor=ffe4b5',      label: 'Chip' },
  // Fun emoji
  { id: 'emoji-1',   url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sunny&backgroundColor=ffdfbf',     label: 'Sunny' },
  { id: 'emoji-2',   url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Breezy&backgroundColor=d1f4d1',    label: 'Breezy' },
  { id: 'emoji-3',   url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Stormy&backgroundColor=c0aede',    label: 'Stormy' },
  // Notionists
  { id: 'notion-1',  url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Civic&backgroundColor=b6e3f4',    label: 'Civic' },
  { id: 'notion-2',  url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Atlas&backgroundColor=ffd5dc',    label: 'Atlas' },
  { id: 'notion-3',  url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Echo&backgroundColor=ffe4b5',     label: 'Echo' },
];

// ─── Avatar Picker Modal ──────────────────────────────────────────────────────
interface AvatarPickerProps {
  currentAvatar: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  saving: boolean;
}

function AvatarPicker({ currentAvatar, onSelect, onClose, saving }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentAvatar);

  const GROUPS = [
    { label: 'Illustrated', ids: ['lorelei-1','lorelei-2','lorelei-3','lorelei-4','lorelei-5','lorelei-6'] },
    { label: 'Robots',      ids: ['bottts-1','bottts-2','bottts-3'] },
    { label: 'Pixel Art',   ids: ['pixel-1','pixel-2','pixel-3'] },
    { label: 'Emoji',       ids: ['emoji-1','emoji-2','emoji-3'] },
    { label: 'Abstract',    ids: ['notion-1','notion-2','notion-3'] },
  ];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-lg bg-surface-container-lowest rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface tracking-tight">Choose Avatar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pick a default or keep your current photo</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high text-slate-400 hover:text-on-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview of selected */}
        <div className="flex flex-col items-center py-4 shrink-0 border-y border-border bg-surface-container-low">
          <div className="relative">
            <img
              src={selected}
              alt="Selected avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow-xl"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
              <Check size={14} className="text-white" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Preview</p>
        </div>

        {/* Avatar grid — scrollable */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{group.label}</p>
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_AVATARS.filter(a => group.ids.includes(a.id)).map((avatar) => {
                  const isActive = selected === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => setSelected(avatar.url)}
                      title={avatar.label}
                      className={cn(
                        "relative rounded-2xl overflow-hidden border-2 transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 aspect-square",
                        isActive ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-transparent"
                      )}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isActive && (
                        <span className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <Check size={14} className="text-primary drop-shadow" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-border flex gap-3 shrink-0 bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-surface-container-low text-on-surface font-bold hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selected)}
            disabled={saving || selected === currentAvatar}
            className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              'Apply Avatar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, profile, loading } = useFirebase();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    phone: '',
    email: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Avatar picker state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const currentAvatarUrl =
    profile?.photoURL ||
    user?.photoURL ||
    'https://api.dicebear.com/7.x/lorelei/svg?seed=default&backgroundColor=b6e3f4';

  // ── Avatar select handler ────────────────────────────────────────────────
  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    setAvatarSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url,
        updatedAt: serverTimestamp(),
      });
      setSaveStatus('success');
      setShowAvatarPicker(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setSaveStatus('error');
      setErrorMessage('Failed to update avatar.');
    } finally {
      setAvatarSaving(false);
    }
  };

  // ── Profile info save ────────────────────────────────────────────────────
  const startEditing = () => {
    setSaveStatus('idle');
    setErrorMessage('');
    setEditData({
      displayName: profile?.displayName || user?.displayName || '',
      phone: profile?.phone || '',
      email: profile?.email || user?.email || '',
      bio: profile?.bio || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    const updatePayload = {
      displayName: editData.displayName,
      phone: editData.phone,
      email: editData.email || user.email || '',
      bio: editData.bio,
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), updatePayload);
      setIsEditing(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {/* Toast */}
      {saveStatus !== 'idle' && (
        <div className={cn(
          "fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-top-10 duration-300",
          saveStatus === 'success' ? "bg-emerald-500 text-white" : "bg-error text-white"
        )}>
          {saveStatus === 'success' ? <CheckCircle2 size={24} /> : <X size={24} />}
          <div>
            <p className="font-bold">{saveStatus === 'success' ? 'Profile Updated!' : 'Update Failed'}</p>
            <p className="text-xs opacity-90">{saveStatus === 'success' ? 'Your changes have been saved.' : (errorMessage || 'Failed to save changes.')}</p>
            {saveStatus === 'error' && (
              <button
                onClick={() => setSaveStatus('idle')}
                className="mt-2 text-[10px] underline uppercase tracking-widest font-black"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Avatar picker modal */}
      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={currentAvatarUrl}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
          saving={avatarSaving}
        />
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">My Profile</h2>
          <p className="text-slate-500 dark:text-slate-400">View and manage your account information.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest text-error font-bold rounded-2xl border border-error/10 hover:bg-error/5 transition-colors shadow-sm"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-border flex flex-col items-center text-center">
            <div className="relative mb-6 group">
              <img
                src={currentAvatarUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-surface-container-lowest shadow-xl object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Camera button — opens avatar picker */}
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Change avatar"
              >
                <Camera size={16} />
              </button>
              {/* Hover overlay hint */}
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                aria-label="Change avatar"
              >
                <span className="text-white text-[10px] font-bold tracking-widest uppercase">Change</span>
              </button>
            </div>
            <h3 className="text-2xl font-bold text-on-surface">{profile?.displayName || user?.displayName || 'Citizen'}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              {profile?.role === 'admin' ? 'Administrator' : 'Civic Contributor'}
            </p>

            {/* Change avatar text link */}
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Change avatar
            </button>

            <div className="mt-6 w-full p-4 bg-surface-container-low rounded-2xl flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">SensePoints</p>
                <p className="text-xl font-black text-primary">{profile?.sensePoints || 0}</p>
              </div>
              <Star className="text-primary fill-primary" size={24} />
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-border space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-on-surface">Account Information</h3>
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  <Edit2 size={20} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-slate-400 hover:bg-surface-container-high rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 text-white bg-primary hover:bg-primary-container rounded-full transition-colors disabled:opacity-50"
                  >
                    <Save size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Name</label>
                    <input
                      type="text"
                      value={editData.displayName}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                      className="w-full p-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full p-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full p-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Bio</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="w-full p-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold min-h-[100px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <InfoItem icon={UserIcon} label="Name" value={profile?.displayName || user?.displayName || 'Not set'} />
                  <InfoItem icon={Phone} label="Phone Number" value={profile?.phone || 'Not set'} />
                  <InfoItem icon={Mail} label="Email" value={profile?.email || user?.email || 'Not set'} />
                  <InfoItem icon={FileText} label="Bio" value={profile?.bio || 'Not set'} />
                  <InfoItem icon={Calendar} label="Member Since" value={profile?.customMemberSince || (profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'Recently')} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-border">
            <h3 className="text-xl font-bold text-on-surface mb-6">Security & Privacy</h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-surface-container-low rounded-2xl text-left font-bold text-on-surface hover:bg-surface-container-high transition-colors flex justify-between items-center">
                Change Password
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Last changed 3 months ago</span>
              </button>
              <button className="w-full p-4 bg-surface-container-low rounded-2xl text-left font-bold text-on-surface hover:bg-surface-container-high transition-colors flex justify-between items-center">
                Two-Factor Authentication
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded uppercase">Enabled</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}
