import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewInventoryMovement() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/kardex')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Movimiento de Inventario</h1>
      </div>
      <Card className="p-8 text-center">
        <p className="text-gray-600">Formulario de movimiento IN/OUT/ADJUST - En construcción</p>
      </Card>
    </div>
  );
}
