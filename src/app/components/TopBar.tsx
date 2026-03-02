import { useState } from 'react';
import { Search, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ScannerModal from './ScannerModal';

export default function TopBar() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Global search functionality
    console.log('Search:', searchQuery);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar moto, cliente, OT, venta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </form>
          
          <Button
            size="lg"
            onClick={() => setScannerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Escanear
          </Button>
        </div>
      </header>

      <ScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </>
  );
}
