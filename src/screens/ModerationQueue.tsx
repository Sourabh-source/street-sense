import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Clock, 
  ZoomIn, 
  Sparkles, 
  AlertCircle,
  ChevronDown,
  History,
  FileText,
  DollarSign,
  Bell
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { cn } from '@/src/lib/utils';
import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

export default function ModerationQueue() {
  const { user, profile, loading: authLoading } = useFirebase();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminComment, setAdminComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineViolationType, setFineViolationType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      if (reportsData.length > 0 && !selectedReportId) {
        setSelectedReportId(reportsData[0].id);
      }
      setLoading(false);
    }, (error) => {
      console.error('Moderation Queue Subscription Error:', error);
      handleFirestoreError(error, OperationType.LIST, 'reports');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleUpdateStatus = async (status: 'verified' | 'rejected' | 'fined') => {
    if (!selectedReport) return;
    
    setIsProcessing(true);
    try {
      const reportRef = doc(db, 'reports', selectedReport.id);
      const updateData: any = {
        status,
        adminComment,
        updatedAt: serverTimestamp()
      };

      if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason;
      }

      if (status === 'fined') {
        updateData.fineAmount = Number(fineAmount);
        updateData.fineViolationType = fineViolationType;
      }

      await updateDoc(reportRef, updateData);

      if (status === 'verified') {
        const userRef = doc(db, 'users', selectedReport.reporterUid);
        await updateDoc(userRef, { sensePoints: increment(50) });
      }

      if (status === 'fined') {
        const userRef = doc(db, 'users', selectedReport.reporterUid);
        await updateDoc(userRef, { sensePoints: increment(-Number(fineAmount)) });
      }

      setAdminComment('');
      setRejectionReason('');
      setFineAmount('');
      setFineViolationType('');
      
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${selectedReport?.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingCount = reports.filter(r => r.status === 'submitted').length;

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-700">
      <div className="max-w-[1600px] mx-auto px-10 py-8 space-y-10">
        
        {/* Fake Header to match Image */}
        <div className="flex items-center justify-between gap-10">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search report ID, location, or user..." 
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.2rem] shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-sm placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-8">
            <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <Bell size={24} className="text-slate-500" />
              <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-error rounded-full border-[3px] border-white"></div>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="text-right">
                <p className="text-base font-black text-slate-800 leading-none">Admin Verifier</p>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.1em]">Badge #SS-8821</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-100 shadow-sm">
                 <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Title & Status */}
        <div className="space-y-2">
          <h1 className="text-[42px] font-black tracking-tight text-[#1e2330]">Moderation Queue</h1>
          <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-[#dfe8ff] text-[#4263eb] rounded-full flex items-center gap-2">
               <span className="text-[11px] font-black uppercase tracking-widest leading-none">{pendingCount || 12} PENDING REPORTS</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">
               <span>Last Sync: 2m ago</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Incoming Queue Side */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-[#1e2330]">Incoming Queue</h3>
              <button className="text-[11px] font-black text-[#4263eb] uppercase tracking-widest hover:opacity-70">Sort by Urgency</button>
            </div>
            
            <div className="space-y-5">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={cn(
                    "bg-white p-6 rounded-[2rem] border-[3px] transition-all cursor-pointer",
                    selectedReportId === report.id 
                      ? "border-[#4263eb] shadow-xl shadow-[#4263eb]/10 ring-8 ring-[#4263eb]/5" 
                      : "border-transparent bg-[#f1f3f9]/50 hover:border-slate-200 opacity-80 hover:opacity-100"
                  )}
                >
                   <div className="flex gap-5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner shrink-0">
                        <img src={report.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                         <div className="flex justify-between items-start">
                            <span className={cn("text-[11px] font-black tracking-wider", selectedReportId === report.id ? "text-[#4263eb]" : "text-slate-500")}>
                              #RPT-{report.id.slice(0, 4).toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                         </div>
                         <h4 className={cn("text-base font-black truncate", selectedReportId === report.id ? "text-[#1e2330]" : "text-slate-400")}>{report.type}</h4>
                         <p className="text-[11px] text-slate-400 font-bold truncate">{report.location}</p>
                         <div className="flex items-center gap-2 mt-2">
                            <div className={cn("w-2 h-2 rounded-full", report.severity === 'high' ? "bg-error" : report.severity === 'medium' ? "bg-amber-500" : "bg-emerald-500")}></div>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", report.severity === 'high' ? "text-error" : report.severity === 'medium' ? "text-amber-500" : "text-emerald-500")}>
                              {report.severity?.toUpperCase() || 'CRITICAL'}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold">No reports pending</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Review Section */}
          <div className="lg:col-span-9 space-y-10">
            {selectedReport ? (
              <>
                {/* Review Bento */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-[#f8f9fc] px-10 py-7 flex justify-between items-center border-b border-slate-100">
                    <div>
                      <h3 className="text-2xl font-black text-[#1e2330]">Evidence Review: #RPT-{selectedReport.id.slice(0, 8).toUpperCase()}</h3>
                      <p className="text-xs text-slate-400 font-bold tracking-tight mt-1">Review photos carefully before taking action</p>
                    </div>
                    <div className="px-5 py-2.5 bg-[#e7f5ff] text-[#1971c2] rounded-2xl border border-[#a5d8ff] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
                      <Sparkles size={16} />
                      AI Verified: 98.2%
                    </div>
                  </div>

                  <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Photo Comparison */}
                    <div className="md:col-span-8 space-y-6">
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">PRIMARY PHOTO</p>
                      <div className="relative aspect-[16/10] bg-slate-100 rounded-[2.5rem] overflow-hidden group border border-slate-100 shadow-inner">
                        <img src={selectedReport.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button className="absolute bottom-6 right-6 p-4 bg-white/90 shadow-2xl rounded-2xl text-[#4263eb] hover:bg-white transition-all hover:scale-110 active:scale-95">
                          <ZoomIn size={24} />
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-3xl border-[4px] border-[#4263eb] overflow-hidden shadow-xl shadow-[#4263eb]/20">
                          <img src={selectedReport.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        {/* Mock thumbnails or additional evidence if available */}
                        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative shadow-lg">
                          <img src="https://images.unsplash.com/photo-1542362567-b051c63b975b?q=80&w=200" className="w-full h-full object-cover opacity-50 grayscale" />
                        </div>
                        <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center p-5 shadow-lg">
                           <img src="https://images.unsplash.com/photo-1542385151-efd9ec93716e?q=80&w=200" className="w-full h-full object-contain opacity-80" />
                        </div>
                      </div>
                    </div>

                    {/* Verification Side */}
                    <div className="md:col-span-4 space-y-12 pt-4">
                      <div className="space-y-5">
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">LOCATION VALIDATION</p>
                        <div className="aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 relative shadow-inner">
                          {isLoaded ? (
                            <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={{ 
                                lat: selectedReport.coordinates?.lat || selectedReport.coordinates?.latitude || 12.9716, 
                                lng: selectedReport.coordinates?.lng || selectedReport.coordinates?.longitude || 77.5946 
                              }}
                              zoom={15}
                              options={{ disableDefaultUI: true }}
                            >
                              <Marker position={{ 
                                lat: selectedReport.coordinates?.lat || selectedReport.coordinates?.latitude || 12.9716, 
                                lng: selectedReport.coordinates?.lng || selectedReport.coordinates?.longitude || 77.5946 
                              }} />
                            </GoogleMap>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-30">
                              <MapPin size={48} className="text-slate-400" />
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Awaiting Map Data</p>
                            </div>
                          )}
                        </div>
                        <div className="text-center px-1">
                          <p className="text-[11px] font-mono font-black text-slate-400 tracking-tighter">
                            {(selectedReport.coordinates?.lat || 0).toFixed(4)}° N, {(selectedReport.coordinates?.lng || 0).toFixed(4)}° W
                          </p>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide opacity-80 mt-1">{selectedReport.location}</p>
                        </div>
                      </div>

                      <div className="bg-[#f8f9fc] p-6 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm">
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">REPORTER DETAILS</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#1e2330] flex items-center justify-center p-[3px]">
                             <div className="w-full h-full rounded-full bg-[#495057] flex items-center justify-center text-white font-black text-sm">
                               {selectedReport.reporterName?.charAt(0) || 'U'}
                             </div>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{selectedReport.reporterName || 'User'}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tight opacity-90">Trust Score: 94%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decision Bento */}
                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-12">
                     <div className="p-3 bg-[#f8f9fc] rounded-2xl">
                        <FileText size={28} className="text-[#4263eb]" />
                     </div>
                     <h3 className="text-3xl font-black text-[#1e2330] tracking-tight">Final Decision</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Approve */}
                    <div className="space-y-6">
                       <button 
                        onClick={() => handleUpdateStatus('verified')}
                        disabled={isProcessing}
                        className="w-full group bg-[#1c7ed6] py-10 rounded-[2rem] shadow-2xl shadow-[#1c7ed6]/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex flex-col items-center justify-center gap-4 disabled:opacity-50"
                       >
                          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                             <CheckCircle2 className="text-white font-black" size={32} />
                          </div>
                          <span className="text-lg font-black text-white">Approve Report</span>
                       </button>
                       <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-80">Escalate to field team</p>
                    </div>

                    {/* Reject */}
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <button 
                            onClick={() => handleUpdateStatus('rejected')}
                            disabled={isProcessing}
                            className="w-full group bg-[#f1f3f5] py-10 rounded-[2rem] border-2 border-transparent transition-all hover:bg-slate-200 hover:border-slate-300 flex flex-col items-center justify-center gap-4 disabled:opacity-50"
                          >
                             <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <XCircle className="text-slate-600" size={32} />
                             </div>
                             <span className="text-lg font-black text-slate-600">Reject Case</span>
                          </button>
                          <div className="relative group">
                            <select 
                              className="w-full px-6 py-4 bg-[#f8f9fc] border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase text-slate-400 appearance-none outline-none focus:border-[#1c7ed6]/30 focus:text-slate-700 transition-all"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            >
                              <option value="">Select Rejection Reason</option>
                              <option value="blurry">Image Unclear</option>
                              <option value="missing">Location Mismatch</option>
                              <option value="duplicate">Duplicate Entry</option>
                              <option value="wrong_category">Incorrect Category</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#1c7ed6]" />
                          </div>
                       </div>
                    </div>

                    {/* Fine */}
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <button 
                            onClick={() => handleUpdateStatus('fined')}
                            disabled={isProcessing}
                            className="w-full group bg-[#fff5f5] border-2 border-[#ffc9c9] py-10 rounded-[2rem] shadow-xl shadow-error/5 transition-all hover:bg-[#ffe3e3] flex flex-col items-center justify-center gap-4 disabled:opacity-50"
                          >
                             <div className="w-14 h-14 rounded-full bg-[#fa5252]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertTriangle className="text-[#fa5252]" size={32} />
                             </div>
                             <span className="text-lg font-black text-[#fa5252]">Fine User</span>
                          </button>
                          <div className="flex gap-3">
                             <div className="relative flex-[0.8]">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#fa5252]/60" size={14} />
                                <input 
                                  type="text" 
                                  className="w-full pl-10 pr-4 py-4 bg-[#fff5f5] border-2 border-[#ffc9c9] rounded-2xl text-[11px] font-black text-[#fa5252] placeholder:text-[#fa5252]/30 outline-none focus:border-[#fa5252]" 
                                  placeholder="Fine Amount"
                                  value={fineAmount}
                                  onChange={(e) => setFineAmount(e.target.value)}
                                />
                             </div>
                             <div className="relative flex-1">
                                <select 
                                  className="w-full px-5 py-4 bg-[#fff5f5] border-2 border-[#ffc9c9] rounded-2xl text-[11px] font-black text-[#fa5252] appearance-none outline-none focus:border-[#fa5252]"
                                  value={fineViolationType}
                                  onChange={(e) => setFineViolationType(e.target.value)}
                                >
                                   <option value="">Violation Type</option>
                                   <option value="spam">Aggressive Spam</option>
                                   <option value="fake">Fake Report</option>
                                   <option value="privacy">Privacy Violation</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#fa5252]/40 pointer-events-none" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-14 space-y-4">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">INTERNAL ADMIN NOTES</p>
                    <textarea 
                      className="w-full p-8 bg-[#f8f9fc] border-2 border-slate-100 rounded-[2.5rem] min-h-[160px] text-lg font-medium text-slate-700 outline-none focus:border-[#1c7ed6]/20 focus:ring-[12px] focus:ring-[#1c7ed6]/5 transition-all placeholder:text-slate-200"
                      placeholder="Summarize your findings or reasons for disciplinary action..."
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                    />
                  </div>
                </div>

                {/* Audit Bento */}
                <div className="bg-[#f1f3f9] rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <History className="text-[#4263eb]" size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-[#1e2330]">Audit Trail</h3>
                   </div>
                   
                   <div className="space-y-12 relative px-4">
                      <div className="absolute left-[31px] top-6 bottom-6 w-[3px] bg-slate-200 rounded-full"></div>
                      
                      {/* Step 1 */}
                      <div className="flex gap-10 items-start relative z-10">
                         <div className="w-9 h-9 rounded-full bg-[#1c7ed6] flex items-center justify-center border-[6px] border-white shadow-md shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                         </div>
                         <div className="space-y-2">
                            <p className="text-lg font-black text-slate-800 leading-none">Report Initialized</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.05em]">
                              {selectedReport.createdAt?.toDate ? new Date(selectedReport.createdAt.toDate()).toLocaleString() : 'Just now'} • Source: Mobile App
                            </p>
                         </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-10 items-start relative z-10">
                         <div className="w-9 h-9 rounded-full bg-[#1c7ed6] flex items-center justify-center border-[6px] border-white shadow-md shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                         </div>
                         <div className="space-y-2">
                            <p className="text-lg font-black text-slate-800 leading-none">AI Processing Complete</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.05em]">Confidence: 98%</p>
                         </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-10 items-start relative z-10">
                         <div className={cn("w-9 h-9 rounded-full border-[6px] border-white shadow-md shrink-0 mt-0.5", selectedReport.status === 'submitted' ? "bg-slate-200" : "bg-[#1c7ed6]")}>
                            {selectedReport.status !== 'submitted' && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-[10px]"></div>}
                         </div>
                         <div className="space-y-2">
                            <p className={cn("text-lg font-black leading-none", selectedReport.status === 'submitted' ? "text-slate-500" : "text-slate-800")}>
                               {selectedReport.status === 'submitted' ? "Awaiting Moderator Action" : "Moderation Complete"}
                            </p>
                            <p className="text-xs font-black text-[#4263eb] uppercase tracking-[0.2em] mt-1">
                               {selectedReport.status === 'submitted' ? "CURRENT STEP" : selectedReport.status.toUpperCase()}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-300">
                 <FileText size={80} className="opacity-20 mb-4" />
                 <p className="font-black uppercase tracking-widest">Select a report to begin review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
