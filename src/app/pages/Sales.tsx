import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { useSalesData } from "../hooks/useSalesData";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ShoppingCart,
  Plus,
  FileText,
  Search,
  Users,
  Calendar,
} from "lucide-react";
import { Input } from "../components/ui/input";

export default function Sales() {
  const { sales, loading } = useSalesData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;

    const lowerTerm = searchTerm.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.number.toLowerCase().includes(lowerTerm) ||
        sale.customerName.toLowerCase().includes(lowerTerm) ||
        sale.status.toLowerCase().includes(lowerTerm),
    );
  }, [sales, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-xl font-medium text-slate-500 animate-pulse">
          Cargando historial de ventas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* HEADER Y ACCIONES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Ventas
          </h1>
          <p className="text-lg text-slate-500 mt-1 font-medium">
            {sales.length} registros en total
          </p>
        </div>
        <Link to="/sales/new">
          <Button
            size="lg"
            className="h-14 px-6 bg-green-600 hover:bg-green-700 text-lg font-bold shadow-sm"
          >
            <Plus className="w-6 h-6 mr-2" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar por cliente, número (Ej. V-000001) o estado..."
          className="pl-12 h-14 text-lg border-slate-300 shadow-sm rounded-xl focus-visible:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ESTADO VACÍO */}
      {sales.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-slate-300 bg-slate-50">
          <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-slate-300" />
          <h3 className="text-2xl font-bold text-slate-700 mb-2">
            No hay ventas registradas
          </h3>
          <p className="text-lg text-slate-500 mb-6">
            Comienza registrando una nueva venta en el sistema.
          </p>
          <Link to="/sales/new">
            <Button
              size="lg"
              className="h-12 bg-green-600 hover:bg-green-700 font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Venta
            </Button>
          </Link>
        </Card>
      ) : filteredSales.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-lg font-medium">
          No se encontraron ventas que coincidan con "{searchTerm}".
        </div>
      ) : (
        /* LISTA DE VENTAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSales.map((sale) => {
            // Lógica de colores según el estado
            const isPaid = sale.status === "PAID";
            const isPartial = sale.status === "PARTIAL";

            return (
              <Card
                key={sale.id}
                className="hover:shadow-md transition-shadow border-slate-200"
              >
                <CardContent className="p-6">
                  {/* CABECERA TARJETA */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-2xl font-black text-slate-800">
                        {sale.number}
                      </p>
                      {sale.type && (
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500"
                        >
                          {sale.type}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      className={`text-sm font-bold px-3 py-1 ${
                        isPaid
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : isPartial
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                      variant="secondary"
                    >
                      {isPaid
                        ? "PAGADO"
                        : isPartial
                          ? "PAGO PARCIAL"
                          : "PENDIENTE"}
                    </Badge>
                  </div>

                  {/* CUERPO TARJETA */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-5 h-5 text-slate-400 shrink-0" />
                      <span
                        className="font-bold truncate"
                        title={sale.customerName}
                      >
                        {sale.customerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <span className="text-slate-500 font-medium">Total:</span>
                      <span className="font-black text-xl text-slate-800">
                        S/ {sale.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {!isPaid && (
                      <div className="flex items-center justify-between px-3 text-sm">
                        <span className="text-slate-500 font-medium">
                          Falta Pagar:
                        </span>
                        <span className="font-bold text-red-600">
                          S/{" "}
                          {(sale.totalAmount - (sale.paidAmount || 0)).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 font-medium">
                      <Calendar className="w-4 h-4" />
                      {new Intl.DateTimeFormat("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(sale.createdAt)}
                    </div>
                  </div>

                  {/* BOTÓN DE ACCIÓN */}
                  <Link to={`/sales/${sale.id}`} className="block w-full mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full font-bold text-slate-700 border-slate-300 hover:bg-slate-50"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Ver Nota de Venta
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
