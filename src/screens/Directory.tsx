import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Tag, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Filter,
  ShieldCheck,
  User,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType, serverTimestamp } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Person {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
  addedBy: string;
  createdAt: any;
}

export default function Directory() {
  const { user } = useFirebase();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'people'),
      where('addedBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Person[];
      setPeople(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'people');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'people'), {
        ...formData,
        addedBy: user.uid,
        createdAt: serverTimestamp()
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', role: '', phone: '', email: '', notes: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'people');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteDoc(doc(db, 'people', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `people/${id}`);
    }
  };

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">Member Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage names and contact details in your local community network.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 civic-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} />
          Add Member
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, role or email..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-container-low text-on-surface font-bold rounded-2xl border border-border hover:bg-surface-container-high transition-colors">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <motion.div 
              layout
              key={person.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container-lowest p-6 rounded-3xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <User size={30} />
                </div>
                <button 
                  onClick={() => handleDelete(person.id)}
                  className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{person.name}</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
                  <Tag size={12} />
                  {person.role || 'Member'}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone size={16} className="text-primary" />
                    <span className="font-medium">{person.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Mail size={16} className="text-primary" />
                    <span className="font-medium truncate">{person.email || 'No email'}</span>
                  </div>
                </div>

                {person.notes && (
                  <div className="mt-6 p-4 bg-surface-container-low rounded-2xl border border-border text-xs text-slate-500 dark:text-slate-400 italic">
                    "{person.notes}"
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-20 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 text-slate-300">
            <Users size={48} />
          </div>
          <h3 className="text-2xl font-black text-on-surface mb-2">Your directory is empty</h3>
          <p className="text-slate-500 max-w-sm mb-8">Start building your community network by adding your first member record.</p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 civic-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={20} />
            Add First Member
          </button>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-border"
            >
              <div className="p-8 pb-0 flex justify-between items-center text-on-surface">
                <h2 className="text-2xl font-black">Add Community Member</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleAddPerson} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                    <input 
                      required
                      className="w-full bg-surface-container-low border border-border rounded-xl px-4 py-3.5 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-1">Role / Relationship</label>
                      <input 
                        className="w-full bg-surface-container-low border border-border rounded-xl px-4 py-3.5 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="e.g. Neighbor"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-1">Phone Number</label>
                      <input 
                        className="w-full bg-surface-container-low border border-border rounded-xl px-4 py-3.5 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="+91..."
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-surface-container-low border border-border rounded-xl px-4 py-3.5 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-1">Additional Notes</label>
                    <textarea 
                      className="w-full bg-surface-container-low border border-border rounded-xl px-4 py-3.5 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all h-24 resize-none" 
                      placeholder="Add any specific details..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-surface-container-low text-on-surface font-bold rounded-2xl hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 civic-gradient text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
