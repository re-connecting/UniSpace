import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import {
  AlertCircle,
  Camera,
  QrCode,
  RefreshCw,
  ScanLine,
  Upload,
  X,
} from 'lucide-react';
import { StudySpace } from '../types/unispace';
import {
  buildRoomWallQrPayload,
  parseRoomWallQrPayload,
} from '../utils/unispaceLogic';
import { OccupancyStatusBadge } from './StatusBadge';

interface RoomQrScannerModalProps {
  open: boolean;
  spaces: StudySpace[];
  onClose: () => void;
  onRoomDetected: (spaceId: string) => void;
}

type ScannerTab = 'camera' | 'stickers';

export function RoomQrScannerModal({
  open,
  spaces,
  onClose,
  onRoomDetected,
}: RoomQrScannerModalProps) {
  const [activeTab, setActiveTab] = useState<ScannerTab>('camera');
  const [cameraStatus, setCameraStatus] = useState<
    'starting' | 'active' | 'error'
  >('starting');
  const [cameraError, setCameraError] = useState('');
  const [scanError, setScanError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [stickerQrUrls, setStickerQrUrls] = useState<Record<string, string>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSpaces = spaces.filter((s) => s.isActive);

  const resolveQrText = (rawText: string): boolean => {
    const matched = parseRoomWallQrPayload(rawText, spaces);
    if (!matched) {
      setScanError(
        `Scanned code "${rawText.slice(0, 60)}" does not match an active UniSpace study room.`
      );
      return false;
    }
    setScanError('');
    onRoomDetected(matched.id);
    return true;
  };

  // Generate real QR sticker images for active campus rooms
  useEffect(() => {
    if (!open || activeTab !== 'stickers') return;
    let cancelled = false;

    Promise.all(
      activeSpaces.map(async (sp) => {
        const url = await QRCode.toDataURL(buildRoomWallQrPayload(sp.id), {
          width: 144,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        return [sp.id, url] as const;
      })
    )
      .then((entries) => {
        if (!cancelled) {
          setStickerQrUrls(Object.fromEntries(entries));
        }
      })
      .catch(() => {
        // Ignore QR sticker generation failures
      });

    return () => {
      cancelled = true;
    };
  }, [open, activeTab, spaces]);

  // Live camera QR detection loop
  useEffect(() => {
    if (!open || activeTab !== 'camera') return;

    let stream: MediaStream | null = null;
    let rafId = 0;
    let stopped = false;

    const stopStream = () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startCamera = async () => {
      setCameraStatus('starting');
      setCameraError('');
      setScanError('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('error');
        setCameraError(
          'Live camera is not supported in this browser. Upload a QR image or select a Wall QR Sticker below.'
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        setCameraStatus('active');

        const scanFrame = () => {
          if (stopped) return;
          const v = videoRef.current;
          const canvas = canvasRef.current;
          if (v && canvas && v.readyState === v.HAVE_ENOUGH_DATA) {
            const width = v.videoWidth;
            const height = v.videoHeight;
            if (width > 0 && height > 0) {
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(v, 0, 0, width, height);
                const imgData = ctx.getImageData(0, 0, width, height);
                const code = jsQR(imgData.data, width, height, {
                  inversionAttempts: 'dontInvert',
                });
                if (code?.data) {
                  if (resolveQrText(code.data)) {
                    stopStream();
                    return;
                  }
                }
              }
            }
          }
          rafId = requestAnimationFrame(scanFrame);
        };

        rafId = requestAnimationFrame(scanFrame);
      } catch {
        if (!stopped) {
          setCameraStatus('error');
          setCameraError(
            'Camera access was unavailable or denied. You can upload a QR image, enter a room ID, or test a Wall QR Sticker.'
          );
        }
      }
    };

    startCamera();
    return stopStream;
  }, [open, activeTab, retryToken]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setScanError('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setScanError('Could not read the uploaded image.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const decoded = jsQR(imageData.data, img.width, img.height);
        if (!decoded?.data) {
          setScanError(
            'No readable QR code was found in that image. Try a clearer photo of the wall QR.'
          );
          return;
        }
        resolveQrText(decoded.data);
      };
      img.onerror = () => setScanError('Unable to load the selected image file.');
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      setScanError('Enter an APU room code (e.g. B-09-03) or Space ID (e.g. SPC-003).');
      return;
    }
    resolveQrText(manualInput);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-qr-scanner-title"
    >
      <div className="liquid-glass-elevated rounded-[28px] max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-900/[0.08] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="room-qr-scanner-title"
                className="font-display text-lg font-bold text-black"
              >
                Scan Room Wall QR
              </h3>
              <p className="text-xs text-black mt-0.5">
                Scan the QR sticker outside any room to book immediately without searching.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close room QR scanner"
            className="p-1.5 rounded-full text-black hover:bg-slate-900/[0.06] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 sm:px-6 pt-4 shrink-0">
          <div
            role="tablist"
            aria-label="QR scanning options"
            className="inline-flex p-1 bg-slate-900/[0.06] rounded-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'camera'}
              onClick={() => {
                setScanError('');
                setActiveTab('camera');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'camera'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black'
              }`}
            >
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Camera & Image</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'stickers'}
              onClick={() => {
                setScanError('');
                setActiveTab('stickers');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'stickers'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Wall QR Stickers</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {scanError && (
            <div
              role="alert"
              className="rounded-2xl bg-[#E53935]/10 px-4 py-3 text-xs text-[#C62828] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{scanError}</span>
            </div>
          )}

          {activeTab === 'camera' ? (
            <>
              {/* Camera Viewfinder */}
              <div className="relative aspect-[16/10] w-full rounded-3xl bg-slate-950 overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    cameraStatus === 'active' ? 'block' : 'hidden'
                  }`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {cameraStatus === 'active' && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="w-44 h-44 rounded-3xl border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                    <span className="mt-3 px-3 py-1 rounded-full bg-black/75 text-white text-[11px] font-medium">
                      Align room wall QR code inside frame
                    </span>
                  </div>
                )}

                {cameraStatus === 'starting' && (
                  <div className="text-center px-6 text-white">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-medium">Starting camera...</p>
                  </div>
                )}

                {cameraStatus === 'error' && (
                  <div className="text-center px-6 py-4 max-w-sm">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-2.5">
                      <Camera className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-white leading-relaxed">
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRetryToken((t) => t + 1)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Upload QR Image & Room ID Shortcut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between gap-2.5">
                  <div>
                    <p className="text-xs font-bold text-black">
                      Scan from QR Image
                    </p>
                    <p className="text-[11px] text-black mt-0.5">
                      Upload a photo or screenshot of a room wall QR code.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Upload QR code image"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/[0.06] text-xs font-semibold text-black hover:bg-slate-900/[0.10] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Upload QR Image</span>
                  </button>
                </div>

                <form
                  onSubmit={handleManualSubmit}
                  className="rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <label
                      htmlFor="qr-manual-room"
                      className="block text-xs font-bold text-black"
                    >
                      Or Enter Room Sticker Code
                    </label>
                    <input
                      id="qr-manual-room"
                      type="text"
                      value={manualInput}
                      onChange={(e) => {
                        setManualInput(e.target.value);
                        setScanError('');
                      }}
                      placeholder="e.g. B-09-03 or SPC-003"
                      className="liquid-input w-full mt-1.5 px-3 py-1.5 rounded-full text-xs text-black placeholder:text-black/45"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-3.5 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0066D6] cursor-pointer"
                  >
                    Open Room Booking
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-black">
                Each APU campus room displays a wall QR sticker outside the entrance (e.g. B-09-03 = Block B, Level 9, Room 03). Select any sticker below to jump straight to its booking sheet:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSpaces.map((sp) => (
                  <div
                    key={sp.id}
                    data-space-id={sp.id}
                    className="rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3 bg-white"
                  >
                    <div className="w-20 h-20 rounded-xl border border-slate-200 p-1 bg-white shrink-0 flex items-center justify-center">
                      {stickerQrUrls[sp.id] ? (
                        <img
                          src={stickerQrUrls[sp.id]}
                          alt={`Wall QR sticker for ${sp.name}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCode className="w-6 h-6 text-black/40" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="text-xs font-bold text-black truncate">
                          {sp.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-black truncate">
                        {sp.building} · {sp.floor}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <OccupancyStatusBadge status={sp.occupancyStatus} compact />
                        <span className="font-mono text-[10px] text-black whitespace-nowrap shrink-0">
                          {sp.id}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          resolveQrText(buildRoomWallQrPayload(sp.id))
                        }
                        className="w-full mt-1.5 px-3 py-1.5 rounded-full bg-[#007AFF] text-white text-[11px] font-semibold hover:bg-[#0066D6] cursor-pointer"
                      >
                        Scan & Book Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
