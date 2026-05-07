import React, { useState, useMemo } from 'react';
import { 
  Check, 
  X, 
  Eye, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

// Types
type PhotoStatus = 'pending' | 'approved' | 'rejected';

interface Photo {
  id: string;
  url: string;
  userName: string;
  userId: string;
  timestamp: string;
  status: PhotoStatus;
  title: string;
}

// Dummy Data
const DUMMY_PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop', userName: 'Alex Johnson', userId: 'USR-001', timestamp: '2024-03-20T10:30:00Z', status: 'pending', title: 'Street Parking Violation' },
  { id: '2', url: 'https://images.unsplash.com/photo-1542362567-b055002b91f4?q=80&w=800&auto=format&fit=crop', userName: 'Sarah Miller', userId: 'USR-002', timestamp: '2024-03-20T11:15:00Z', status: 'pending', title: 'Signal Jump Evidence' },
  { id: '3', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', userName: 'Mike Ross', userId: 'USR-003', timestamp: '2024-03-19T14:20:00Z', status: 'approved', title: 'Pothole Report' },
  { id: '4', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop', userName: 'Emily Chen', userId: 'USR-004', timestamp: '2024-03-19T16:45:00Z', status: 'rejected', title: 'Wrong Way Driving' },
  { id: '5', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop', userName: 'David Wilson', userId: 'USR-005', timestamp: '2024-03-18T09:00:00Z', status: 'pending', title: 'Illegal U-Turn' },
  { id: '6', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop', userName: 'Jessica Lee', userId: 'USR-006', timestamp: '2024-03-18T13:30:00Z', status: 'pending', title: 'Blocked Fire Hydrant' },
  { id: '7', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop', userName: 'Chris Evans', userId: 'USR-007', timestamp: '2024-03-17T15:10:00Z', status: 'approved', title: 'Street Light Out' },
  { id: '8', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop', userName: 'Anna Taylor', userId: 'USR-008', timestamp: '2024-03-17T17:55:00Z', status: 'pending', title: 'Graffiti Report' },
];

export default function PhotoModeration() {
  const [photos, setPhotos] = useState<Photo[]>(DUMMY_PHOTOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PhotoStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtering and Sorting
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.userName.toLowerCase().includes(query) || 
        p.title.toLowerCase().includes(query) ||
        p.userId.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [photos, searchQuery, filterStatus, sortBy]);

  // Actions
  const handleStatusUpdate = (id: string, status: PhotoStatus) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleBulkAction = (status: PhotoStatus) => {
    setPhotos(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status } : p));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map(p => p.id));
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Photo Moderation</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Review and manage user-uploaded evidence photos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-border">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-slate-400 hover:text-on-surface"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-slate-400 hover:text-on-surface"
              )}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 md:p-6 rounded-2xl shadow-sm border border-border flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by user, title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-xl border border-border">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-transparent border-none text-sm font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-xl border border-border">
            <ArrowUpDown size={18} className="text-slate-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-sm font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary">{selectedIds.length} items selected</span>
              <button 
                onClick={toggleSelectAll}
                className="text-xs font-black uppercase tracking-widest hover:underline text-primary"
              >
                {selectedIds.length === filteredPhotos.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleBulkAction('approved')}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Check size={14} /> Approve Selected
              </button>
              <button 
                onClick={() => handleBulkAction('rejected')}
                className="px-4 py-2 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/90 transition-colors flex items-center gap-2"
              >
                <X size={14} /> Reject Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      {filteredPhotos.length > 0 ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" 
            : "grid-cols-1"
        )}>
          {filteredPhotos.map((photo) => (
            <PhotoCard 
              key={photo.id}
              photo={photo}
              isSelected={selectedIds.includes(photo.id)}
              onSelect={() => toggleSelect(photo.id)}
              onView={() => setSelectedPhoto(photo)}
              onApprove={() => handleStatusUpdate(photo.id, 'approved')}
              onReject={() => handleStatusUpdate(photo.id, 'rejected')}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-20 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 text-slate-300">
            <AlertCircle size={48} />
          </div>
          <h3 className="text-2xl font-black text-on-surface mb-2">No photos to review</h3>
          <p className="text-slate-500 max-w-xs">Adjust your filters or search query to find what you're looking for.</p>
          <button 
            onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
            className="mt-6 text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Modal View */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal 
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onApprove={() => handleStatusUpdate(selectedPhoto.id, 'approved')}
            onReject={() => handleStatusUpdate(selectedPhoto.id, 'rejected')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
interface PhotoCardProps {
  key?: string | number;
  photo: Photo;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  viewMode: 'grid' | 'list';
}

function PhotoCard({ photo, isSelected, onSelect, onView, onApprove, onReject, viewMode }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (viewMode === 'list') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-surface-container-lowest p-4 rounded-2xl border transition-all flex items-center gap-6 group",
          isSelected ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/20"
        )}
      >
        <div className="flex items-center gap-4">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onSelect}
            className="w-5 h-5 rounded border-border bg-surface-container-low text-primary focus:ring-primary cursor-pointer"
          />
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0 relative cursor-pointer" onClick={onView}>
            {!isLoaded && <div className="absolute inset-0 bg-surface-container-high animate-pulse" />}
            <img 
              src={photo.url} 
              className={cn("w-full h-full object-cover transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")} 
              alt={photo.title} 
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoaded(true)}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-on-surface truncate">{photo.title}</h4>
            <StatusBadge status={photo.status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><User size={12} /> {photo.userName}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(photo.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onApprove}
            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
            title="Approve"
          >
            <Check size={20} />
          </button>
          <button 
            onClick={onReject}
            className="p-2 bg-error/10 text-error rounded-lg hover:bg-error hover:text-white transition-all"
            title="Reject"
          >
            <X size={20} />
          </button>
          <button 
            onClick={onView}
            className="p-2 bg-surface-container-low text-slate-400 rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-all"
            title="View Details"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-surface-container-lowest rounded-2xl border transition-all overflow-hidden group flex flex-col",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/20 shadow-sm hover:shadow-md"
      )}
    >
      {/* Image Preview */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-surface-container-low" onClick={onView}>
        {!isLoaded && <div className="absolute inset-0 bg-surface-container-high animate-pulse" />}
        <img 
          src={photo.url} 
          alt={photo.title} 
          className={cn("w-full h-full object-cover group-hover:scale-110 transition-all duration-500", isLoaded ? "opacity-100" : "opacity-0")}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:scale-110 transition-transform">
            <Eye size={24} />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-5 h-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary cursor-pointer"
          />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={photo.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <h4 className="font-bold text-on-surface truncate mb-1">{photo.title}</h4>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><User size={10} /> {photo.userName}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(photo.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={onApprove}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm"
            >
              <Check size={14} /> Approve
            </button>
            <button 
              onClick={onReject}
              className="flex items-center justify-center gap-2 py-2.5 bg-error text-white rounded-xl text-xs font-bold hover:bg-error/90 active:scale-[0.98] transition-all shadow-sm"
            >
              <X size={14} /> Reject
            </button>
          </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: PhotoStatus }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-error/10 text-error border-error/20"
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md",
      styles[status]
    )}>
      {status}
    </span>
  );
}

function PhotoModal({ photo, onClose, onApprove, onReject }: { 
  photo: Photo, 
  onClose: () => void, 
  onApprove: () => void, 
  onReject: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-surface-container-lowest w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Side */}
        <div className="flex-1 bg-black flex items-center justify-center relative group">
          <img 
            src={photo.url} 
            alt={photo.title} 
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Details Side */}
        <div className="w-full lg:w-[400px] p-8 md:p-12 flex flex-col justify-between bg-surface-container-lowest border-l border-border">
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <StatusBadge status={photo.status} />
                <h2 className="text-3xl font-black text-on-surface mt-4 tracking-tight leading-tight">{photo.title}</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-on-surface transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uploaded By</p>
                  <p className="text-lg font-bold text-on-surface">{photo.userName}</p>
                  <p className="text-xs text-slate-500">{photo.userId}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</p>
                  <p className="text-lg font-bold text-on-surface">{new Date(photo.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <h5 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Moderation Note</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Please ensure the photo clearly shows the violation and the vehicle's license plate if applicable. Check for any sensitive information before approving.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            <button 
              onClick={() => { onApprove(); onClose(); }}
              className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check size={20} /> Approve
            </button>
            <button 
              onClick={() => { onReject(); onClose(); }}
              className="flex items-center justify-center gap-2 py-4 bg-error text-white rounded-2xl font-bold hover:bg-error/90 active:scale-[0.98] transition-all shadow-lg shadow-error/20"
            >
              <X size={20} /> Reject
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
