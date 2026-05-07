import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Upload,
  Headset,
  AlertCircle,
  MapPin,
  History,
  Gavel,
  ZoomIn,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { cn } from '@/src/lib/utils';
import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, increment } from 'firebase/firestore';

// NOTE: Auth guarding is handled by <AdminRoute> in App.tsx.
// This component no longer redirects itself — that avoids the
// "flash to /dashboard" race condition that happened when profile
// hadn't loaded yet on first render.

export default function AdminHub() {
  const { loading: authLoading } = useFirebase();
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

  const mapContainerStyle = { width: '100%', height: '100%' };

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
      if (reportsData.length > 0 && !selectedReportId) {
        setSelectedReportId(reportsData[0].id);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const handleUpdateStatus = async (status: 'verified' | 'rejected' | 'info_requested' | 'fined') => {
    if (!selectedReportId || !selectedReport) return;

    setIsProcessing(true);
    try {
      const reportRef = doc(db, 'reports', selectedReportId);
      const updateData: any = { status, adminComment, updatedAt: new Date() };

      if (status === 'rejected') updateData.rejectionReason = rejectionReason;
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
      alert(`Report ${status.replace('_', ' ')} successfully!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${selectedReportId}`);
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

  const pendingReports = reports.filter(r => r.status === 'submitted');

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Moderation Queue</h2>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-widest">
            {pendingReports.length} Pending Reports
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Last Sync: Just now</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Queue */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-on-surface">Incoming Queue</h3>
            <button className="text-sm text-primary font-bold hover:underline">Sort by Urgency</button>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
            {reports.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-border">
                <p className="text-slate-400 dark:text-slate-500 font-medium">No reports found.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} onClick={() => setSelectedReportId(report.id)}>
                  <QueueCard
                    id={`#RPT-${report.id.slice(0, 4).toUpperCase()}`}
                    title={report.type}
                    location={report.location}
                    time={report.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    severity={report.severity}
                    active={selectedReportId === report.id}
                    img={report.imageUrl}
                    status={report.status}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {selectedReport ? (
            <div className="space-y-8">
              {/* Evidence Review */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                <div className="bg-surface-container-high px-8 py-4 flex justify-between items-center border-b border-outline-variant/20">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Evidence Review: #RPT-{selectedReport.id.slice(0, 4).toUpperCase()}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Review photos carefully before taking action</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-bold border border-primary/20 flex items-center">
                    <Sparkles size={14} className="mr-1" />
                    AI Verified: 98.2%
                  </span>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 md:col-span-8">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Primary Photo</p>
                      <div className="aspect-[16/10] bg-surface-container-low rounded-2xl overflow-hidden shadow-inner group relative ring-1 ring-border">
                        <img className="w-full h-full object-cover" src={selectedReport.imageUrl} referrerPolicy="no-referrer" alt="Report evidence" />
                        <button className="absolute bottom-4 right-4 bg-surface-container-low/90 hover:bg-surface-container-low p-3 rounded-full text-primary shadow-xl transition-all">
                          <ZoomIn size={20} />
                        </button>
                      </div>
                      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                        <div className="w-24 h-24 rounded-xl border-2 border-primary overflow-hidden flex-shrink-0 cursor-pointer">
                          <img className="w-full h-full object-cover" src={selectedReport.imageUrl} referrerPolicy="no-referrer" alt="Thumbnail" />
                        </div>
                        <div className="w-24 h-24 rounded-xl border-2 border-transparent hover:border-border overflow-hidden flex-shrink-0 cursor-pointer bg-surface-container-low flex items-center justify-center">
                          <Upload size={20} className="text-slate-300 dark:text-slate-600" />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-4 space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Location Validation</p>
                        <div className="aspect-square bg-surface-container-low rounded-2xl overflow-hidden relative grayscale hover:grayscale-0 transition-all border border-border">
                          {loadError ? (
                            <div className="w-full h-full bg-error/5 flex flex-col items-center justify-center p-4 text-center">
                              <AlertCircle className="text-error mb-2" size={24} />
                              <p className="text-error font-bold text-[10px]">Map Error</p>
                            </div>
                          ) : isLoaded && selectedReport.coordinates ? (
                            <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={{
                                lat: selectedReport.coordinates.lat || selectedReport.coordinates.latitude,
                                lng: selectedReport.coordinates.lng || selectedReport.coordinates.longitude
                              }}
                              zoom={15}
                              options={{
                                disableDefaultUI: true,
                                zoomControl: false,
                                styles: [
                                  { elementType: 'geometry', stylers: [{ color: 'var(--color-surface-container-lowest)' }] },
                                  { elementType: 'labels.text.fill', stylers: [{ color: 'var(--color-on-surface)' }] },
                                  { elementType: 'labels.text.stroke', stylers: [{ color: 'var(--color-surface-container-lowest)' }] }
                                ]
                              }}
                            >
                              <Marker position={{
                                lat: selectedReport.coordinates.lat || selectedReport.coordinates.latitude,
                                lng: selectedReport.coordinates.lng || selectedReport.coordinates.longitude
                              }} />
                            </GoogleMap>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low">
                              <MapPin className="text-primary" size={32} />
                            </div>
                          )}
                          {!loadError && !isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-primary rounded-full animate-pulse border-4 border-surface-container-lowest shadow-xl"></div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {selectedReport.coordinates?.latitude?.toFixed(4)}° N, {selectedReport.coordinates?.longitude?.toFixed(4)}° E
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{selectedReport.location}</p>
                        </div>
                      </div>

                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Reporter Details</p>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface text-[10px] font-bold">
                            {selectedReport.reporterName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{selectedReport.reporterName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Trust Score: 94%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Action Hub */}
              {selectedReport.status === 'submitted' && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                  <h4 className="text-lg font-bold mb-6 flex items-center">
                    <Gavel size={20} className="mr-2 text-primary" />
                    Final Decision
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Approve */}
                    <div className="space-y-4">
                      <button
                        onClick={() => handleUpdateStatus('verified')}
                        disabled={isProcessing}
                        className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center space-y-2 disabled:opacity-50"
                      >
                        <CheckCircle2 size={24} />
                        <span>{isProcessing ? 'Processing...' : 'Approve Report'}</span>
                      </button>
                      <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">Escalate to field team</p>
                    </div>

                    {/* Reject */}
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleUpdateStatus('rejected')}
                          disabled={isProcessing || !rejectionReason}
                          className="w-full py-4 px-6 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-surface-container-highest transition-all flex flex-col items-center justify-center space-y-2 border border-outline-variant/20 disabled:opacity-50"
                        >
                          <XCircle size={24} className="text-slate-600" />
                          <span>Reject Case</span>
                        </button>
                        <select
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg text-[12px] font-medium py-2 px-3 outline-none focus:ring-2 focus:ring-primary"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        >
                          <option value="">Select Rejection Reason</option>
                          <option value="blur">Image Blurry/Unclear</option>
                          <option value="not_violation">Not a Violation</option>
                          <option value="duplicate">Duplicate Submission</option>
                          <option value="outside_jurisdiction">Outside Jurisdiction</option>
                        </select>
                      </div>
                    </div>

                    {/* Fine */}
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleUpdateStatus('fined')}
                          disabled={isProcessing || !fineAmount || !fineViolationType}
                          className="w-full py-4 px-6 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-all flex flex-col items-center justify-center space-y-2 border border-error/20 disabled:opacity-50"
                        >
                          <AlertTriangle size={24} />
                          <span>Fine User</span>
                        </button>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-error">₹</span>
                          <input
                            className="w-full pl-6 pr-3 py-2 bg-error/5 border border-error/20 rounded-lg text-[12px] placeholder:text-error/40 font-bold focus:ring-error focus:ring-1 outline-none"
                            placeholder="Fine Amount"
                            type="number"
                            value={fineAmount}
                            onChange={(e) => setFineAmount(e.target.value)}
                          />
                        </div>
                        <select
                          className="w-full bg-error/5 border border-error/20 rounded-lg text-[12px] font-medium py-2 px-3 outline-none text-error/80"
                          value={fineViolationType}
                          onChange={(e) => setFineViolationType(e.target.value)}
                        >
                          <option value="">Violation Type</option>
                          <option value="spam">Spam Reporting</option>
                          <option value="unwanted_images">Unwanted/Explicit Images</option>
                          <option value="false_report">Malicious False Report</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Internal Admin Notes</label>
                    <textarea
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none p-4 placeholder-slate-400"
                      placeholder="Summarize your findings or reasons for disciplinary action..."
                      rows={3}
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Decision Result */}
              {selectedReport.status !== 'submitted' && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-border">
                    <h4 className="font-bold text-on-surface mb-2">Admin Decision Recorded</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      This report has been marked as <span className="font-bold uppercase">{selectedReport.status}</span>.
                    </p>
                    {selectedReport.rejectionReason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reason: {selectedReport.rejectionReason}</p>
                    )}
                    {selectedReport.fineAmount && (
                      <p className="text-xs text-error mt-1 font-bold">
                        Fine Issued: ₹{selectedReport.fineAmount} ({selectedReport.fineViolationType})
                      </p>
                    )}
                    {selectedReport.adminComment && (
                      <div className="mt-4 p-4 bg-surface-container-lowest rounded-xl border border-border">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Admin Comment:</p>
                        <p className="text-sm text-on-surface italic">"{selectedReport.adminComment}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Trail */}
              <div className="bg-surface-container-high p-8 rounded-2xl border border-border">
                <h4 className="text-lg font-bold mb-6 flex items-center text-on-surface">
                  <History size={20} className="mr-2 text-slate-500 dark:text-slate-400" />
                  Audit Trail
                </h4>
                <div className="space-y-6">
                  <HistoryItem
                    label="Report Initialized"
                    time={selectedReport.createdAt?.toDate().toLocaleString() || 'N/A'}
                    completed
                  />
                  <HistoryItem
                    label="AI Processing Complete"
                    time="Confidence: 98%"
                    completed
                  />
                  <HistoryItem
                    label={selectedReport.status === 'submitted' ? 'Awaiting Moderator Action' : 'Moderator Action Taken'}
                    time={selectedReport.status === 'submitted' ? 'Current Step' : selectedReport.updatedAt?.toDate().toLocaleString() || 'N/A'}
                    completed={selectedReport.status !== 'submitted'}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest p-12 rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center text-center">
              <AlertCircle size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Select a report from the queue to view details</h3>
            </div>
          )}
        </div>
      </div>

      {/* Moderator Guidelines FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-on-surface text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group">
          <Headset size={24} />
          <span className="absolute right-16 bg-on-surface text-white px-3 py-1 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Moderator Guidelines
          </span>
        </button>
      </div>
    </div>
  );
}

function QueueCard({ id, title, location, time, severity, active, img, status }: {
  id: string; title: string; location: string; time: string;
  severity: string; active?: boolean; img: string; status: string;
}) {
  return (
    <div className={cn(
      "p-4 rounded-2xl shadow-sm cursor-pointer transition-all border",
      active
        ? "bg-surface-container-lowest ring-2 ring-primary border-transparent"
        : "bg-surface-container-lowest border-border hover:bg-surface-container-low"
    )}>
      <div className="flex space-x-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
          <img className="w-full h-full object-cover" src={img} referrerPolicy="no-referrer" alt="Report thumbnail" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <p className={cn("text-[10px] font-bold", active ? "text-primary" : "text-slate-400 dark:text-slate-500")}>{id}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{time}</span>
          </div>
          <p className="text-sm font-bold truncate text-on-surface">{title}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate mb-2">
            <MapPin size={10} />
            {location}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={cn("w-2 h-2 rounded-full",
                severity === 'high' ? "bg-error" : severity === 'medium' ? "bg-amber-500" : "bg-emerald-500"
              )}></span>
              <span className={cn("text-[10px] font-bold uppercase",
                severity === 'high' ? "text-error" : severity === 'medium' ? "text-amber-500" : "text-emerald-500"
              )}>{severity}</span>
            </div>
            <span className={cn(
              "px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase",
              status === 'submitted' ? "bg-amber-500/10 text-amber-500" :
              status === 'verified' ? "bg-emerald-500/10 text-emerald-500" :
              "bg-error/10 text-error"
            )}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ label, time, completed }: { label: string; time: string; completed?: boolean }) {
  return (
    <div className="flex space-x-4">
      <div className="flex flex-col items-center">
        <div className={cn("w-2.5 h-2.5 rounded-full", completed ? "bg-primary ring-4 ring-primary/20" : "bg-surface-container-high")}></div>
        <div className={cn("w-0.5 flex-1 my-2", completed ? "bg-primary/20" : "bg-transparent")}></div>
      </div>
      <div className="pb-4">
        <p className={cn("text-xs font-bold", completed ? "text-on-surface" : "text-slate-400 dark:text-slate-500")}>{label}</p>
        <p className={cn("text-[10px]", completed ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500")}>{time}</p>
      </div>
    </div>
  );
}
