import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Camera, Keyboard } from 'lucide-react';
import { scanResolve, playBeep, vibrate } from '../lib/scanner';
import ScanResolveModal from './ScanResolveModal';

interface ScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess?: (result: any) => void;
}

export default function ScannerModal({ open, onClose, onScanSuccess }: ScannerModalProps) {
  const [useCamera, setUseCamera] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && useCamera) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [open, useCamera]);

  const startCamera = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result, error) => {
          if (result) {
            const code = result.getText();
            await handleScan(code);
          }
        }
      );
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
  };

  const handleScan = async (code: string) => {
    stopCamera();
    
    const result = await scanResolve(code);
    
    if (result.type === 'AMBIGUOUS') {
      setScanResult(result);
      setResolveModalOpen(true);
    } else if (result.type === 'NOT_FOUND') {
      playBeep(false);
      vibrate([100, 100, 100]);
      alert('Código no encontrado: ' + code);
      if (useCamera) {
        setTimeout(() => startCamera(), 1000);
      }
    } else {
      playBeep(true);
      vibrate(200);
      handleSuccess(result);
    }
  };

  const handleSuccess = (result: any) => {
    if (onScanSuccess) {
      onScanSuccess(result);
      onClose();
    } else {
      // Navigate based on type
      if (result.type === 'MOTORCYCLE') {
        navigate(`/motorcycles/${result.motorcycleId}`);
        onClose();
      } else if (result.type === 'PRODUCT') {
        navigate(`/kardex`);
        onClose();
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const handleResolveClose = (resolved: boolean) => {
    setResolveModalOpen(false);
    if (resolved) {
      onClose();
    } else if (useCamera) {
      setTimeout(() => startCamera(), 500);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Escanear Código</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={useCamera ? 'default' : 'outline'}
              onClick={() => setUseCamera(true)}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Cámara
            </Button>
            <Button
              variant={!useCamera ? 'default' : 'outline'}
              onClick={() => setUseCamera(false)}
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual
            </Button>
          </div>

          {useCamera ? (
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none" style={{ margin: '20%' }} />
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="manual-code" className="text-lg">Código Manual</Label>
                <Input
                  id="manual-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="MT-000001 o SKU del producto"
                  className="mt-2 h-14 text-xl"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-14 text-lg">
                Buscar
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {scanResult && (
        <ScanResolveModal
          open={resolveModalOpen}
          scanResult={scanResult}
          onResolve={(type) => {
            if (type === 'MOTORCYCLE') {
              handleSuccess({ type: 'MOTORCYCLE', motorcycleId: scanResult.ambiguousOptions?.motorcycleId });
            } else if (type === 'PRODUCT') {
              handleSuccess({ type: 'PRODUCT', productId: scanResult.ambiguousOptions?.productId });
            }
            handleResolveClose(true);
          }}
          onCancel={() => handleResolveClose(false)}
        />
      )}
    </>
  );
}
