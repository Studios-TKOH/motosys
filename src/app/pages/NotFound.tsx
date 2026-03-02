import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-12 text-center max-w-md">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 mb-6">
          La página que buscas no existe o ha sido movida
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Button>
        </Link>
      </Card>
    </div>
  );
}
