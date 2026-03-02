import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
// Asegúrate de tener una acción similar a registerPayment en tu slice
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

  // Estado para el Modal de Pagos
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCustomer = (id: string) => customers.find((c) => c.id === id);

  // Abrir Modal y calcular la deuda total sugerida
  const handleOpenPayment = (account: any) => {
    const lateFee = calculateLateFee(account);
    const totalDebt = account.balance + lateFee;

    setSelectedAccount(account);
    setPaymentAmount(totalDebt.toString()); // Sugiere el pago completo por defecto
    setIsPaymentModalOpen(true);
  };

  // Procesar el pago
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
      // CORRECCIÓN: Ajustamos el payload para que cumpla con la interfaz del slice
      await dispatch(
        registerPayment({
          accountReceivableId: selectedAccount.id, // Propiedad corregida
          amount: amountToPay,
          method: "CASH", // Propiedad obligatoria añadida
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

  // Función renderizadora de la lista
  const renderAccountList = (accs: typeof accounts) => (
    <div className="space-y-4">
      {accs.map((account) => {
        // CORRECCIÓN: Tipamos customer como 'any' para saltarnos el error de .fullName
        const customer: any = getCustomer(account.customerId);
        const lateFee = calculateLateFee(account);
        const daysOverdue =
          account.status === "OVERDUE"
            ? Math.floor((Date.now() - account.dueDate) / (1000 * 60 * 60 * 24))
            : 0;

        return (
          <Card
            key={account.id}
            className={`transition-all ${account.status === "OVERDUE" ? "border-red-400 bg-red-50/30 shadow-sm" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-4">
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-xs tracking-wider">
                        Total Original
                      </p>
                      <p className="font-medium text-lg">
                        S/ {account.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-xs tracking-wider">
                        Pagado
                      </p>
                      <p className="font-medium text-lg text-green-600">
                        S/ {account.paidAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-xs tracking-wider">
                        Saldo Base
                      </p>
                      <p className="font-bold text-lg text-blue-600">
                        S/ {account.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase font-bold text-xs tracking-wider">
                        Vencimiento
                      </p>
                      <p className="font-medium text-lg">
                        {new Date(account.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* ALERTA DE MORA (REGLA PDF 1) */}
                  {account.status === "OVERDUE" && (
                    <div className="mt-4 p-4 bg-red-100 rounded-lg border-2 border-red-300 flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-bold text-lg">
                          Vencido hace {daysOverdue} días
                        </p>
                        {lateFee > 0 && (
                          <p className="text-red-700 font-medium text-sm mt-1">
                            Se ha aplicado una mora automática de{" "}
                            <span className="font-bold text-lg">
                              S/ {lateFee.toFixed(2)}
                            </span>{" "}
                            (S/ 10 x día).
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTÓN DE COBRO GIGANTE PARA PANTALLAS TÁCTILES */}
                {account.status !== "PAID" && (
                  <Button
                    size="lg"
                    className="h-16 px-8 w-full md:w-auto bg-green-600 hover:bg-green-700 text-lg font-bold shadow-md"
                    onClick={() => handleOpenPayment(account)}
                  >
                    <DollarSign className="w-6 h-6 mr-2" />
                    Registrar Pago
                  </Button>
                )}
              </div>
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

      {/* TARJETAS DE RESUMEN */}
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

      {/* PESTAÑAS DE GESTIÓN */}
      <Tabs defaultValue="overdue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-200/50">
          <TabsTrigger
            value="overdue"
            className="text-base font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"
          >
            Vencidos ({overdue.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="text-base font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            Pendientes ({pending.length})
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="text-base font-bold data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all"
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

      {/* MODAL DE REGISTRO DE PAGO */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">
              Registrar Pago
            </DialogTitle>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-6 py-4">
              <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saldo Restante:</span>
                  <span className="font-bold">
                    S/ {selectedAccount.balance.toFixed(2)}
                  </span>
                </div>

                {calculateLateFee(selectedAccount) > 0 && (
                  <div className="flex justify-between text-sm text-red-600 font-medium">
                    <span>Mora por retraso:</span>
                    <span>
                      + S/ {calculateLateFee(selectedAccount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between text-lg font-black text-gray-900">
                  <span>Deuda Total Actual:</span>
                  <span>
                    S/{" "}
                    {(
                      selectedAccount.balance +
                      calculateLateFee(selectedAccount)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-lg font-bold">
                  Monto a Abonar (S/)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.1"
                  className="h-16 text-3xl font-black text-center"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  autoFocus
                />
                <p className="text-sm text-gray-500 text-center">
                  Puedes registrar un pago parcial o total.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full text-lg"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-14 w-full text-lg font-bold bg-green-600 hover:bg-green-700"
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
