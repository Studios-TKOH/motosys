import { Link, useLocation } from 'react-router';
import { Home, Bike, Wrench, ShoppingCart, DollarSign, Package, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/motorcycles', label: 'Motos', icon: Bike },
  { path: '/work-orders', label: 'Mantenimientos', icon: Wrench },
  { path: '/sales', label: 'Ventas', icon: ShoppingCart },
  { path: '/payments', label: 'Pagos', icon: DollarSign },
  { path: '/kardex', label: 'KARDEX', icon: Package },
  { path: '/reports', label: 'Reportes', icon: BarChart3 },
  { path: '/settings', label: 'Config', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="font-bold text-2xl text-blue-600">Taller Motos</h1>
        <p className="text-sm text-gray-500 mt-1">Sistema de Gestión</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
