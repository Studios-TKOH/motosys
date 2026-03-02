import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Package, Plus, AlertTriangle, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export default function Kardex() {
  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances = useSelector((state: RootState) => state.parts.stockBalances);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParts = parts.filter((part) => {
    const query = searchQuery.toLowerCase();
    return (
      part.name.toLowerCase().includes(query) ||
      part.sku.toLowerCase().includes(query) ||
      part.description?.toLowerCase().includes(query)
    );
  });

  const criticalStock = filteredParts.filter(p => (stockBalances[p.id] || 0) <= p.minStock);
  const outOfStock = filteredParts.filter(p => (stockBalances[p.id] || 0) === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KARDEX - Inventario</h1>
          <p className="text-gray-600 mt-1">{parts.length} productos registrados</p>
        </div>
        <Link to="/kardex/new-movement">
          <Button size="lg" className="h-12">
            <Plus className="w-5 h-5 mr-2" />
            Movimiento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Productos</CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{parts.length}</div>
            <p className="text-sm text-gray-500 mt-1">En catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stock Crítico</CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{criticalStock.length}</div>
            <p className="text-sm text-gray-500 mt-1">Bajo mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sin Stock</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{outOfStock.length}</div>
            <p className="text-sm text-gray-500 mt-1">Agotados</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar por nombre, SKU, descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {filteredParts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No hay productos en el inventario</h3>
          <p className="text-gray-500 mb-4">Agrega productos para comenzar</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredParts.map((part) => {
            const stock = stockBalances[part.id] || 0;
            const isCritical = stock <= part.minStock;
            const isOutOfStock = stock === 0;

            return (
              <Card key={part.id} className={isOutOfStock ? 'border-red-300 bg-red-50' : isCritical ? 'border-orange-300 bg-orange-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{part.name}</h3>
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="text-lg px-3 py-1">
                            SIN STOCK
                          </Badge>
                        ) : isCritical ? (
                          <Badge variant="outline" className="text-lg px-3 py-1 border-orange-400 text-orange-700">
                            CRÍTICO
                          </Badge>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">SKU</p>
                          <p className="font-mono font-medium">{part.sku}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Precio Unit.</p>
                          <p className="font-medium">S/ {part.unitPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Stock Actual</p>
                          <p className={`font-bold text-2xl ${isOutOfStock ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-green-600'}`}>
                            {stock}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Stock Mínimo</p>
                          <p className="font-medium">{part.minStock}</p>
                        </div>
                      </div>
                      {part.description && (
                        <p className="text-gray-600 mt-2">{part.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
