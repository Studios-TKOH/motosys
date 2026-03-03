import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { calculateLateFee } from "../store/slices/paymentsSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  Wrench,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Reports() {
  const motorcycles = useSelector(
    (state: RootState) => state.motorcycles.motorcycles,
  );
  const workOrders = useSelector(
    (state: RootState) => state.workOrders.workOrders,
  );
  const sales = useSelector((state: RootState) => state.sales.sales);
  const accounts = useSelector(
    (state: RootState) => state.payments.accountsReceivable,
  );
  const parts = useSelector((state: RootState) => state.parts.parts);
  const stockBalances: any = useSelector(
    (state: RootState) => (state.parts as any).stockBalances,
  );

  // FIX BUG STOCK: Helper ultra-seguro
  const getAvailableStock = (partId: string) => {
    if (!stockBalances) return 0;
    if (Array.isArray(stockBalances)) {
      const balance = stockBalances.find((sb: any) => sb.partId === partId);
      return balance ? parseFloat(String(balance.quantity)) : 0;
    }
    if (typeof stockBalances === "object") {
      const balance = stockBalances[partId];
      if (balance) return parseFloat(String(balance.quantity ?? balance ?? 0));
    }
    return 0;
  };

  // --- CÁLCULOS GLOBALES ---

  // Stock
  const criticalStock = parts.filter(
    (p) => getAvailableStock(p.id) > 0 && getAvailableStock(p.id) <= p.minStock,
  );
  const outOfStock = parts.filter((p) => getAvailableStock(p.id) <= 0);

  // Cuentas por Cobrar (Deudas)
  const overdueAccounts = accounts.filter((a) => a.status === "OVERDUE");

  // FIX MORA: Calculamos el saldo real incluyendo los S/ 10 por día de retraso
  const totalOverdueDebt = overdueAccounts.reduce((sum, a) => {
    return sum + a.balance + calculateLateFee(a);
  }, 0);

  const pendingAccounts = accounts.filter((a) => a.status === "PENDING");
  const totalPendingDebt = pendingAccounts.reduce(
    (sum, a) => sum + a.balance,
    0,
  );

  // --- DATOS PARA GRÁFICOS ---

  // Distribución de colores
  const colorCounts = motorcycles.reduce(
    (acc, moto) => {
      const color = moto.color || "Sin color";
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const colorData = Object.entries(colorCounts).map(([name, value]) => ({
    name,
    value,
  }));
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
  ];

  // Estados de Órdenes de Trabajo
  const woStatusData = [
    {
      name: "Pendiente",
      value: workOrders.filter((wo) => wo.status === "PENDING").length,
    },
    {
      name: "En Proceso",
      value: workOrders.filter((wo) => wo.status === "IN_PROGRESS").length,
    },
    {
      name: "Terminado",
      value: workOrders.filter((wo) => wo.status === "COMPLETED").length,
    },
    {
      name: "Entregado",
      value: workOrders.filter((wo) => wo.status === "DELIVERED").length,
    },
  ];

  // Ventas de los últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const salesByDay = last7Days.map((date) => {
    const daySales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      return saleDate.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      }),
      ventas: daySales.length,
      monto: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
    };
  });

  const totalVentas7Dias = salesByDay.reduce((sum, day) => sum + day.monto, 0);

  return (
    <div className="space-y-8 pb-24">
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" /> Panel de Reportes
          </h1>
          <p className="text-gray-600 text-xl mt-1">
            Análisis financiero y operativo del taller.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Fecha de corte
          </p>
          <p className="text-xl font-black text-blue-900">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ALERTAS CRÍTICAS (Visualmente Imponentes) */}
      {(criticalStock.length > 0 ||
        outOfStock.length > 0 ||
        overdueAccounts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overdueAccounts.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50/50 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-red-800">
                  <AlertTriangle className="w-6 h-6" /> Dinero en Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-red-600 mb-2">
                  S/ {totalOverdueDebt.toFixed(2)}
                </div>
                <p className="text-red-700 font-bold text-base">
                  En {overdueAccounts.length} deudas vencidas (Incluye Mora).
                </p>
              </CardContent>
            </Card>
          )}

          {outOfStock.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50/50 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-red-800">
                  <Package className="w-6 h-6" /> Agotados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-red-600 mb-2">
                  {outOfStock.length}
                </div>
                <p className="text-red-700 font-bold text-base">
                  Productos con stock 0.
                </p>
              </CardContent>
            </Card>
          )}

          {criticalStock.length > 0 && (
            <Card className="border-2 border-orange-300 bg-orange-50/50 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-orange-800">
                  <AlertTriangle className="w-6 h-6" /> Stock Crítico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-orange-600 mb-2">
                  {criticalStock.length}
                </div>
                <p className="text-orange-700 font-bold text-base">
                  Por debajo del mínimo permitido.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* PESTAÑAS DE ANÁLISIS GIGANTES */}
      <Tabs defaultValue="financiero" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2 bg-gray-200/50 rounded-2xl gap-2">
          <TabsTrigger
            value="financiero"
            className="text-lg py-3 font-bold rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Financiero
          </TabsTrigger>
          <TabsTrigger
            value="workorders"
            className="text-lg py-3 font-bold rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Operaciones
          </TabsTrigger>
          <TabsTrigger
            value="motorcycles"
            className="text-lg py-3 font-bold rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Vehículos
          </TabsTrigger>
          <TabsTrigger
            value="stock"
            className="text-lg py-3 font-bold rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Inventario
          </TabsTrigger>
        </TabsList>

        {/* 1. PESTAÑA FINANCIERA (La más importante para el jefe) */}
        <TabsContent value="financiero" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-green-100 bg-green-50/30">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                  <Banknote className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 uppercase tracking-wider">
                    Ventas 7 Días
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    S/ {totalVentas7Dias.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 bg-blue-50/30">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                  <CreditCard className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                    Por Cobrar (Al día)
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    S/ {totalPendingDebt.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-gray-100 rounded-full text-gray-600">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Ticket Promedio
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    S/{" "}
                    {sales.length > 0
                      ? (
                          sales.reduce((sum, s) => sum + s.totalAmount, 0) /
                          sales.length
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-2xl font-black">
                Evolución de Ingresos (Última Semana)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={salesByDay}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#4b5563", fontWeight: "bold" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `S/${value}`}
                    tick={{ fill: "#4b5563", fontWeight: "bold" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      fontWeight: "bold",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="monto"
                    fill="#10b981"
                    name="Ingresos"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. PESTAÑA OPERACIONES (Órdenes de Trabajo) */}
        <TabsContent value="workorders" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-100 bg-blue-50/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                    Total Órdenes
                  </p>
                  <p className="text-4xl font-black text-gray-900">
                    {workOrders.length}
                  </p>
                </div>
                <Wrench className="w-12 h-12 text-blue-200" />
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-100 bg-orange-50/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-orange-800 uppercase tracking-wider">
                    En Taller (Pend./Proceso)
                  </p>
                  <p className="text-4xl font-black text-gray-900">
                    {
                      workOrders.filter(
                        (wo) =>
                          wo.status === "PENDING" ||
                          wo.status === "IN_PROGRESS",
                      ).length
                    }
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-orange-200" />
              </CardContent>
            </Card>
            <Card className="border-2 border-green-100 bg-green-50/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-green-800 uppercase tracking-wider">
                    Terminadas/Entregadas
                  </p>
                  <p className="text-4xl font-black text-gray-900">
                    {
                      workOrders.filter(
                        (wo) =>
                          wo.status === "COMPLETED" ||
                          wo.status === "DELIVERED",
                      ).length
                    }
                  </p>
                </div>
                <CreditCard className="w-12 h-12 text-green-200" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-2xl font-black">
                Estado de Órdenes Actuales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={woStatusData}
                  layout="vertical"
                  margin={{ left: 40, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "#4b5563", fontWeight: "bold" }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", fontWeight: "bold" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    name="Cantidad"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PESTAÑA VEHÍCULOS */}
        <TabsContent value="motorcycles" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-2 border-purple-100 bg-purple-50/30 flex flex-col justify-center">
              <CardContent className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-purple-800 uppercase tracking-wider">
                  Fidelización
                </p>
                <div className="text-7xl font-black text-purple-600">
                  {motorcycles.length}
                </div>
                <p className="text-lg font-bold text-gray-700">
                  Motos registradas en total
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-2 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-xl font-black text-gray-800">
                  Distribución de Motos por Color
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={colorData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {colorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. PESTAÑA INVENTARIO */}
        <TabsContent value="stock" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Package className="text-blue-600" /> Resumen de Catálogo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-600 text-lg">
                    Tipos de Repuestos:
                  </span>
                  <span className="font-black text-2xl text-gray-900">
                    {parts.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <span className="font-bold text-green-700 text-lg">
                    Stock Saludable:
                  </span>
                  <span className="font-black text-2xl text-green-700">
                    {parts.length - criticalStock.length - outOfStock.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {criticalStock.length > 0 && (
              <Card className="border-2 border-orange-200 shadow-sm">
                <CardHeader className="border-b border-orange-100 bg-orange-50/50">
                  <CardTitle className="text-xl font-black text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Para Comprar Urgente
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {criticalStock.map((part) => (
                      <div
                        key={part.id}
                        className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {part.name}
                          </p>
                          <p className="text-sm font-medium text-gray-500">
                            SKU: {part.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-orange-600">
                            {getAvailableStock(part.id)}
                          </p>
                          <p className="text-xs font-bold text-orange-400 uppercase">
                            Min: {part.minStock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
