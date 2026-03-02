import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Bike, Package, X } from 'lucide-react';
import { playBeep, vibrate } from '../lib/scanner';

interface ScanResolveModalProps {
  open: boolean;
  scanResult: any;
  onResolve: (type: 'MOTORCYCLE' | 'PRODUCT') => void;
  onCancel: () => void;
}

export default function ScanResolveModal({ open, scanResult, onResolve, onCancel }: ScanResolveModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (open) {
      setCountdown(5);
      setCancelled(false);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!cancelled) {
              onResolve('MOTORCYCLE'); // Default to motorcycle
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open]);

  const handleCancel = () => {
    setCancelled(true);
    playBeep(false);
    vibrate([100, 50, 100]);
    onCancel();
  };

  const handleResolve = (type: 'MOTORCYCLE' | 'PRODUCT') => {
    setCancelled(true);
    playBeep(true);
    vibrate(200);
    onResolve(type);
  };

  if (!open) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl p-0">
        <div className="bg-yellow-50 border-4 border-yellow-400 p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-800">
            ¿Qué tipo de código es?
          </h2>
          
          <div className="text-center mb-8">
            <p className="text-6xl font-bold text-yellow-600 mb-2">{countdown}</p>
            <p className="text-xl text-gray-600">
              Por defecto: MOTO
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              size="lg"
              onClick={() => handleResolve('MOTORCYCLE')}
              className="h-32 text-2xl bg-blue-600 hover:bg-blue-700"
            >
              <Bike className="w-12 h-12 mr-4" />
              ES MOTO
            </Button>
            
            <Button
              size="lg"
              onClick={() => handleResolve('PRODUCT')}
              className="h-32 text-2xl bg-green-600 hover:bg-green-700"
            >
              <Package className="w-12 h-12 mr-4" />
              ES PRODUCTO
            </Button>
          </div>

          <Button
            size="lg"
            variant="destructive"
            onClick={handleCancel}
            className="w-full h-16 text-xl"
          >
            <X className="w-6 h-6 mr-2" />
            CANCELAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
