import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Brain, 
  AlertCircle, 
  MapPin, 
  Clock, 
  FlipHorizontal, 
  Zap, 
  Image as ImageIcon,
  Send,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import Webcam from 'react-webcam';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType, serverTimestamp, storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const VIOLATION_TYPES = [
  'Illegal Parking',
  'Pothole',
  'Illegal Dumping',
  'Damaged Infrastructure',
  'Encroachment',
  'Street Light Out',
  'Other'
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

export default function ReportViolation() {
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [violationType, setViolationType] = useState(VIOLATION_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(pos);
          setMarkerPosition(pos);
        },
        () => {
          console.log("Error getting geolocation, using default center.");
        }
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreviewUrl(imageSrc);
      setIsCameraOpen(false);
      
      // Convert base64 to File object
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
        });
    }
  }, [webcamRef]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to submit a report.');
      return;
    }

    if (!selectedFile) {
      alert('Please select or capture an image to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `reports/${user.uid}/${Date.now()}_${selectedFile.name}`);
      const uploadResult = await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. Save report to Firestore
      const reportData = {
        reporterUid: user.uid,
        reporterName: profile?.displayName || user.displayName || 'Anonymous',
        type: violationType,
        location: `Lat: ${markerPosition.lat.toFixed(4)}, Lng: ${markerPosition.lng.toFixed(4)}`,
        coordinates: markerPosition,
        severity,
        status: 'submitted',
        imageUrl: downloadUrl,
        notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'reports'), reportData);
      alert('Report submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">New Violation Report</h2>
        <p className="text-slate-500 dark:text-slate-400">Use your camera to document the incident. AI will assist with details.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Camera Interface */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden relative shadow-sm h-[500px] flex items-center justify-center group border border-border">
            {isCameraOpen ? (
              <div className="relative w-full h-full">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "environment" }}
                  disablePictureInPicture={true}
                  forceScreenshotSourceSize={false}
                  imageSmoothing={true}
                  mirrored={false}
                  onUserMedia={() => {}}
                  onUserMediaError={() => {}}
                  onScreenshot={() => {}}
                  screenshotQuality={1}
                />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                  <button 
                    onClick={() => setIsCameraOpen(false)}
                    className="w-14 h-14 bg-on-surface/20 backdrop-blur-md text-on-surface rounded-full flex items-center justify-center hover:bg-on-surface/30 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <button 
                    onClick={capture}
                    className="w-20 h-20 bg-surface-container-lowest border-8 border-primary/20 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                  >
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white">
                      <Camera size={32} />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img 
                  alt="Camera Preview" 
                  className="w-full h-full object-cover" 
                  src={previewUrl || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1000&auto=format&fit=crop"}
                  referrerPolicy="no-referrer"
                />
                
                {/* Delete Button */}
                {previewUrl && (
                  <button 
                    onClick={handleRemoveFile}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-error shadow-lg hover:bg-white transition-all z-20"
                  >
                    <X size={20} />
                  </button>
                )}
                
                {/* Camera Overlays */}
                {!previewUrl && (
                  <div className="absolute inset-0 bg-black/5 flex flex-col justify-between p-8 pointer-events-none">
                    <div className="flex justify-between">
                      <div className="bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> LIVE FEED
                      </div>
                      <div className="bg-black/20 backdrop-blur-md text-white p-2 rounded-full pointer-events-auto cursor-pointer hover:bg-black/40 transition-colors">
                        <FlipHorizontal size={20} />
                      </div>
                    </div>
                    
                    {/* Reticle */}
                    <div className="self-center w-64 h-64 border-2 border-white/30 rounded-[3rem] flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/50 rounded-full"></div>
                    </div>
                    <div></div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-container-lowest/10 backdrop-blur-xl p-3 rounded-full border border-surface-container-lowest/20">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 bg-surface-container-lowest text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <ImageIcon size={24} />
                  </button>
                  <button 
                    onClick={() => {
                      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                        nativeCameraInputRef.current?.click();
                      } else {
                        setIsCameraOpen(true);
                      }
                    }}
                    className="w-20 h-20 bg-surface-container-lowest border-8 border-primary/20 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                  >
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white">
                      <Camera size={32} />
                    </div>
                  </button>
                  <button className="w-14 h-14 bg-surface-container-lowest text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                    <Zap size={24} />
                  </button>
                </div>
              </>
            )}
          </div>

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={nativeCameraInputRef}
            onChange={handleFileChange}
          />

          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-4 bg-surface-container-lowest text-on-surface font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm border border-border hover:bg-surface-container-low transition-colors"
            >
              <Upload size={20} />
              Upload from Gallery
            </button>
            <button 
              onClick={() => {
                // On mobile, redirect to native camera. On desktop, open in-app webcam.
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  nativeCameraInputRef.current?.click();
                } else {
                  if (isCameraOpen) {
                    capture();
                  } else {
                    setIsCameraOpen(true);
                  }
                }
              }}
              className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity"
            >
              <Camera size={20} />
              {isCameraOpen ? 'Take Photo' : 'Capture Now'}
            </button>
          </div>
        </div>

        {/* Recognition & Form Panel */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* AI Identification */}
          <div className="bg-surface-container-low p-6 rounded-[2.5rem] border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">Report Details</h3>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">Violation Type</label>
                <div className="relative">
                  <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={18} />
                  <select 
                    className="w-full pl-11 pr-10 py-4 bg-surface-container-lowest border border-border rounded-2xl font-bold text-on-surface appearance-none focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={violationType}
                    onChange={(e) => setViolationType(e.target.value)}
                  >
                    {VIOLATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">Latitude</label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-4 bg-surface-container-lowest border border-border rounded-2xl font-bold text-on-surface text-sm" 
                      readOnly 
                      value={markerPosition.lat.toFixed(6)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-1">Longitude</label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-4 bg-surface-container-lowest border border-border rounded-2xl font-bold text-on-surface text-sm" 
                      readOnly 
                      value={markerPosition.lng.toFixed(6)} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Severity Assessment</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSeverity('low')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                      severity === 'low' ? "bg-emerald-500 text-white shadow-md" : "bg-surface-container-lowest text-slate-400 dark:text-slate-500 border border-border"
                    )}
                  >
                    LOW
                  </button>
                  <button 
                    onClick={() => setSeverity('medium')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                      severity === 'medium' ? "bg-amber-500 text-white shadow-md" : "bg-surface-container-lowest text-slate-400 dark:text-slate-500 border border-border"
                    )}
                  >
                    MEDIUM
                  </button>
                  <button 
                    onClick={() => setSeverity('high')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                      severity === 'high' ? "bg-error text-white shadow-md" : "bg-surface-container-lowest text-slate-400 dark:text-slate-500 border border-border"
                    )}
                  >
                    HIGH
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm border border-border">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Additional Notes</label>
            <textarea 
              className="w-full p-4 bg-surface-container-low border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium outline-none transition-all text-on-surface" 
              placeholder="Provide any extra context here... e.g. license plate or blocked access" 
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Final Submission Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="py-4 rounded-2xl font-bold text-on-surface border border-border hover:bg-surface-container-low transition-colors">
              Preview Report
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "py-4 rounded-2xl font-bold text-white civic-gradient shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send size={18} />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          {/* Map Context Card */}
          <div className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-sm border border-border">
            {loadError ? (
              <div className="w-full h-full bg-error/5 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="text-error mb-2" size={32} />
                <p className="text-error font-bold text-sm">Map Load Error</p>
                <p className="text-xs text-error/70 mt-1">
                  The Google Maps API project is not authorized. Please ensure "Maps JavaScript API" is enabled in your Google Cloud Console.
                </p>
              </div>
            ) : isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                onClick={onMapClick}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: [
                    {
                      "elementType": "geometry",
                      "stylers": [{ "color": "var(--color-surface-container-lowest)" }]
                    },
                    {
                      "elementType": "labels.text.fill",
                      "stylers": [{ "color": "var(--color-on-surface)" }]
                    },
                    {
                      "elementType": "labels.text.stroke",
                      "stylers": [{ "color": "var(--color-surface-container-lowest)" }]
                    }
                  ]
                }}
              >
                <Marker position={markerPosition} />
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                <p className="text-slate-400 dark:text-slate-500 font-bold">Loading Map...</p>
              </div>
            )}
            {!loadError && (
              <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-4 py-2 rounded-full text-primary shadow-lg text-xs font-bold flex items-center gap-2 pointer-events-none border border-border">
                <MapPin size={16} /> Click to set precise location
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
