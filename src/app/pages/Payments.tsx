import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  calculateLateFee,
  registerPayment,
} from "../store/slices/paymentsSlice";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

export default function Payments() {
  const dispatch = useDispatch<AppDispatch>();
  const accounts = useSelector(
    (state: RootState) => state.payments.accountsReceivable,
  );
  const customers = useSelector(
    (state: RootState) => state.customers.customers,
  );

  const pending = accounts.filter((a) => a.status === "PENDING");
  const overdue = accounts.filter((a) => a.status === "OVERDUE");
  const paid = accounts.filter((a) => a.status === "PAID");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCustomer = (id: string) => customers.find((c) => c.id === id);

  const handleOpenPayment = (account: any) => {
    const lateFee = calculateLateFee(account);
    const totalDebt = account.balance + lateFee;

    setSelectedAccount(account);
    setPaymentAmount(totalDebt.toString());
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedAccount) return;

    const amountToPay = parseFloat(paymentAmount);
    if (isNaN(amountToPay) || amountToPay <= 0) {
      toast.error("Monto inválido", {
        description: "Por favor, ingresa un monto mayor a 0.",
      });
      return;
    }

    const lateFee = calculateLateFee(selectedAccount);
    const totalDebt = selectedAccount.balance + lateFee;

    if (amountToPay > totalDebt) {
      toast.error("Monto excedido", {
        description: `El monto máximo a cobrar es S/ ${totalDebt.toFixed(2)}`,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await dispatch(
        registerPayment({
          accountReceivableId: selectedAccount.id,
          amount: amountToPay,
          method: "CASH",
          notes:
            lateFee > 0
              ? `Incluye cobro de mora por S/ ${lateFee}`
              : "Pago regular",
        }),
      ).unwrap();

      toast.success("Pago registrado con éxito", {
        description: `Se abonó S/ ${amountToPay.toFixed(2)} a la cuenta.`,
      });

      setIsPaymentModalOpen(false);
    } catch (error: any) {
      toast.error("Error al registrar pago", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAccountList = (accs: typeof accounts) => (
    <div className="space-y-4">
      {accs.map((account) => {
        const customer = getCustomer(account.customerId) as any;
        const lateFee = calculateLateFee(account);
        const daysOverdue =
          account.status === "OVERDUE"
            ? Math.floor((Date.now() - account.dueDate) / (1000 * 60 * 60 * 24))
            : 0;

        return (
          <Card
            key={account.id}
            className={`transition-all hover:shadow-md ${account.status === "OVERDUE" ? "border-red-400 bg-red-50/20 shadow-sm" : ""}`}
          >
            {/* FIX: Aseguramos items-center y alineación vertical estricta */}
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xl font-bold text-gray-800">
                    {customer?.fullName ||
                      customer?.name ||
                      "Cliente desconocido"}
                  </p>
                  <Badge
                    variant={
                      account.status === "PAID"
                        ? "default"
                        : account.status === "OVERDUE"
                          ? "destructive"
                          : "secondary"
                    }
                    className="px-3 py-1 text-xs"
                  >
                    {account.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider mb-1">
                      Total Original
                    </p>
                    <p className="font-medium text-base text-gray-700">
                      S/ {account.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider mb-1">
                      Pagado
                    </p>
                    <p className="font-medium text-base text-green-600">
                      S/ {account.paidAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-600 uppercase font-bold text-[10px] tracking-wider mb-1">
                      Saldo Base
                    </p>
                    <p className="font-black text-lg text-blue-700">
                      S/ {account.balance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase font-bold text-[10px] tracking-wider mb-1">
                      Vencimiento
                    </p>
                    <p className="font-medium text-base text-gray-700">
                      {new Date(account.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {account.status === "OVERDUE" && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 font-bold text-sm">
                        Vencido hace {daysOverdue} días
                      </p>
                      {lateFee > 0 && (
                        <p className="text-red-600 text-xs mt-0.5">
                          Mora acumulada:{" "}
                          <span className="font-bold">
                            S/ {lateFee.toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FIX BOTÓN: Añadimos mt-4 en md (pantallas grandes) para empujarlo hacia abajo y alinear con el grid */}
              {account.status !== "PAID" && (
                <div className="w-full md:w-auto flex-shrink-0 md:mt-8">
                  <Button
                    size="lg"
                    className="w-full md:w-auto h-14 px-8 bg-[#00A859] hover:bg-[#008c4a] text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => handleOpenPayment(account)}
                  >
                    <DollarSign className="w-5 h-5 mr-2 opacity-90" />
                    Registrar Pago
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" /> Cuentas por Cobrar
        </h1>
        <p className="text-gray-600 text-lg mt-1">
          Gestiona los saldos pendientes y moras de tus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-blue-50/50">
            <CardTitle className="text-sm font-bold text-blue-800 uppercase tracking-wider">
              Pendientes al día
            </CardTitle>
            <Clock className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-gray-800">
              {pending.length}
            </div>
            <p className="text-lg font-bold text-blue-600 mt-1">
              S/ {pending.reduce((sum, a) => sum + a.balance, 0).toFixed(2)} por
              cobrar
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-red-50">
            <CardTitle className="text-sm font-bold text-red-800 uppercase tracking-wider">
              Vencidos (Con Mora)
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-red-600">
              {overdue.length}
            </div>
            <p className="text-lg font-bold text-red-700 mt-1">
              S/{" "}
              {overdue
                .reduce((sum, a) => sum + a.balance + calculateLateFee(a), 0)
                .toFixed(2)}{" "}
              en riesgo
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-green-50/50">
            <CardTitle className="text-sm font-bold text-green-800 uppercase tracking-wider">
              Pagados
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black text-gray-800">
              {paid.length}
            </div>
            <p className="text-lg font-bold text-green-600 mt-1">
              Completados con éxito
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overdue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-200/50 p-1 rounded-xl">
          <TabsTrigger
            value="overdue"
            className="text-base font-bold rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all data-[state=active]:shadow-md"
          >
            Vencidos ({overdue.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="text-base font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all data-[state=active]:shadow-md"
          >
            Pendientes ({pending.length})
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="text-base font-bold rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all data-[state=active]:shadow-md"
          >
            Pagados ({paid.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-6">
          {overdue.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-400" />
              <h3 className="text-2xl font-bold text-gray-700">
                No hay pagos vencidos
              </h3>
              <p className="text-gray-500 text-lg mt-2">
                ¡Excelente! Todos tus clientes están al día con sus pagos.
              </p>
            </Card>
          ) : (
            renderAccountList(overdue)
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pending.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <Clock className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-700">
                No hay pagos pendientes
              </h3>
            </Card>
          ) : (
            renderAccountList(pending)
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          {paid.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <DollarSign className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-700">
                No hay pagos completados aún
              </h3>
            </Card>
          ) : (
            renderAccountList(paid)
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL DE REGISTRO DE PAGO - DISEÑO CORREGIDO */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          {/* Cabecera del Modal */}
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900">
              Registrar Pago
            </DialogTitle>
          </div>

          {selectedAccount && (
            <div className="p-6 bg-gray-50/50 space-y-6">
              {/* Tarjeta de Resumen de Deuda */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    Saldo Restante:
                  </span>
                  <span className="font-bold text-gray-800">
                    S/ {selectedAccount.balance.toFixed(2)}
                  </span>
                </div>

                {calculateLateFee(selectedAccount) > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-600 font-medium bg-red-50/50 p-2 -mx-2 rounded-md">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Mora por retraso:
                    </span>
                    <span>
                      + S/ {calculateLateFee(selectedAccount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-3 mt-2 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-600">
                    Deuda Total:
                  </span>
                  <span className="text-2xl font-black text-gray-900">
                    S/{" "}
                    {(
                      selectedAccount.balance +
                      calculateLateFee(selectedAccount)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Input Principal */}
              <div className="space-y-3">
                <Label
                  htmlFor="amount"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1"
                >
                  Monto a Abonar (S/)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-xl">S/</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.1"
                    className="h-16 pl-12 text-3xl font-black text-gray-900 border-2 border-gray-300 focus-visible:border-[#00A859] focus-visible:ring-[#00A859] rounded-xl shadow-inner transition-all bg-white"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 text-center font-medium">
                  Puedes registrar un pago parcial o el total de la deuda.
                </p>
              </div>
            </div>
          )}

          {/* FIX: Footer con botones alineados correctamente */}
          <div className="bg-white p-6 border-t border-gray-100 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-14 text-base font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 h-14 text-base font-black bg-[#00A859] hover:bg-[#008c4a] text-white rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Confirmar Pago"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
