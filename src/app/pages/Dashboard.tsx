import React from "react";
import { Link } from "react-router";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Bike,
  Wrench,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  QrCode,
  Plus,
  Clock,
  Users,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Escanear QR", icon: QrCode, path: "#", bg: "bg-blue-600" },
  {
    label: "Nueva Moto",
    icon: Bike,
    path: "/motorcycles/new",
    bg: "bg-purple-600",
  },
  {
    label: "Nuevo Mant.",
    icon: Wrench,
    path: "/work-orders/new",
    bg: "bg-orange-600",
  },
  {
    label: "Nueva Venta",
    icon: ShoppingCart,
    path: "/sales/new",
    bg: "bg-green-600",
  },
  { label: "Cobrar", icon: DollarSign, path: "/payments", bg: "bg-yellow-600" },
  { label: "KARDEX", icon: Package, path: "/kardex", bg: "bg-indigo-600" },
];

export default function Dashboard() {
  const { stats, loading } = useDashboardData();

  const handleScanClick = () => {
    console.log("Abrir modal de escáner...");
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-xl font-medium text-slate-500 animate-pulse">
          Cargando datos del taller...
        </div>
      </div>
    );
  }

  const {
    totalMotorcycles,
    pendingWorkOrders,
    todaySalesCount,
    todaySalesTotal,
    overdueAccounts,
    overdueTotal,
    criticalStock,
  } = stats;

  const todayFormatted = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Panel de Control
        </h1>
        <p className="text-lg text-slate-500 mt-1 capitalize font-medium">
          {todayFormatted}
        </p>
      </div>

      {/* QUICK ACTIONS (Botones Grandes según requerimiento) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const content = (
            <div
              className={`${action.bg} text-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col items-center justify-center`}
            >
              <Icon className="w-12 h-12 mb-3 opacity-90" />
              <span className="font-bold text-sm md:text-base tracking-wide">
                {action.label}
              </span>
            </div>
          );

          return action.path === "#" ? (
            <div key={action.label} onClick={handleScanClick}>
              {content}
            </div>
          ) : (
            <Link key={action.label} to={action.path} className="block">
              {content}
            </Link>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total Motos
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bike className="w-5 h-5 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800">
              {totalMotorcycles}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Registradas en sistema
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              OT Pendientes
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="w-5 h-5 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800">
              {pendingWorkOrders.length}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              En proceso o espera
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Ventas Hoy
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800">
              {todaySalesCount}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-bold text-green-600">
              S/ {todaySalesTotal.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Deuda + Mora
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-600">
              {overdueAccounts.length}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-bold">
              Total: S/ {overdueTotal.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ALERTAS: Stock y Moras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos Vencidos (Se les da prioridad visual por el dinero) */}
        {overdueAccounts.length > 0 && (
          <Card className="border-red-300 bg-red-50/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-red-100">
              <CardTitle className="flex items-center gap-2 text-red-800 text-xl font-bold">
                <AlertTriangle className="w-6 h-6" />
                Pagos Vencidos ({overdueAccounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
                {overdueAccounts.slice(0, 5).map((account) => (
                  <div
                    key={account.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-red-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-2">
                          <Users size={16} className="text-slate-400" />
                          {account.customerName}
                        </p>
                        <Badge
                          variant="destructive"
                          className="mt-2 text-xs font-bold"
                        >
                          Vencido hace {account.daysOverdue} días
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">
                          S/ {account.balance.toFixed(2)}
                        </p>
                        {account.penaltyAmount > 0 && (
                          <p className="text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded mt-1 inline-block">
                            + S/ {account.penaltyAmount} mora
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {overdueAccounts.length > 5 && (
                <Link to="/payments">
                  <Button
                    variant="outline"
                    className="w-full mt-4 text-red-700 border-red-300 hover:bg-red-100 font-bold"
                  >
                    Ver todos los morosos →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stock Crítico */}
        {criticalStock.length > 0 && (
          <Card className="border-orange-300 bg-orange-50/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-orange-100">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-xl font-bold">
                <Package className="w-6 h-6" />
                ¡NO HAY STOCK! ({criticalStock.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
                {criticalStock.slice(0, 5).map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-orange-200"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{part.name}</p>
                      <p className="text-sm text-slate-500 font-mono mt-1">
                        SKU: {part.sku}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase">
                        Quedan
                      </p>
                      <Badge
                        variant="destructive"
                        className="text-xl px-4 py-1 mt-1 bg-red-600"
                      >
                        {part.currentStock}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {criticalStock.length > 5 && (
                <Link to="/kardex">
                  <Button
                    variant="outline"
                    className="w-full mt-4 text-orange-800 border-orange-300 hover:bg-orange-100 font-bold"
                  >
                    Ir al Kardex →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
