import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Button } from "../components/ui/button";
import { ArrowLeft, Printer, ShoppingCart } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ticketRef = useRef<HTMLDivElement>(null);

  const sale: any = useSelector((state: RootState) =>
    state.sales.sales.find((s: any) => s.id === id),
  );

  const motorcycle: any = useSelector((state: RootState) =>
    sale?.motorcycleId
      ? state.motorcycles.motorcycles.find(
          (m: any) => m.id === sale.motorcycleId,
        )
      : undefined,
  );

  const customer: any = useSelector((state: RootState) =>
    sale?.customerId
      ? state.customers.customers.find((c: any) => c.id === sale.customerId)
      : undefined,
  );

  if (!sale) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-500">
          Comprobante no encontrado
        </h2>
        <Button className="mt-4" onClick={() => navigate("/sales")}>
          Volver a Ventas
        </Button>
      </div>
    );
  }

  const balanceDue = sale.totalAmount - sale.paidAmount;
  const isPaid = balanceDue <= 0;

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Nota_Venta_${sale.number}`,
  });

  return (
    <div className="min-h-screen space-y-6 pb-24">
      {/* Botonera Superior */}
      <div className="max-w-md mx-auto flex items-center justify-between mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/sales")}
          className="h-12 w-12 border-gray-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => handlePrint()}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Printer className="w-5 h-5 mr-2" />
          Imprimir Ticket
        </Button>
      </div>

      {/* CONTENEDOR CENTRADOR (Para la vista en pantalla) */}
      <div className="flex justify-center w-full">
        {/* TICKET TÉRMICO REAL (300px ≈ 80mm) 
          El ref={ticketRef} indica que SOLO ESTE DIV será capturado para imprimir.
        */}
        <div
          ref={ticketRef}
          className="bg-white text-black font-mono leading-tight ticket-container"
          style={{
            width: "300px",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          {/* CABECERA */}
          <div className="text-center mb-4">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-black" />
            <h1 className="font-bold text-xl uppercase tracking-wider m-0">
              Motosys Taller
            </h1>
            <h2 className="text-sm uppercase mt-1 m-0">Nota de Venta</h2>
            <p className="font-bold text-lg mt-1 m-0">{sale.number}</p>
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* DATOS GENERALES */}
          <div className="mb-2 space-y-1 text-[13px]">
            <div className="flex justify-between">
              <span className="font-bold">FECHA:</span>
              <span>{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">ESTADO:</span>
              <span>{isPaid ? "PAGADO" : "PENDIENTE"}</span>
            </div>
            {customer && (
              <div className="pt-1">
                <span className="font-bold">CLIENTE:</span>
                <p className="truncate m-0">
                  {customer.fullName || customer.name || "Cliente Gral"}
                </p>
                <p className="m-0">
                  {customer.documentNumber || customer.document || ""}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* DETALLE DE ÍTEMS */}
          <div className="mb-2 text-[12px]">
            <h3 className="font-bold uppercase text-center mb-2 text-[13px]">
              Detalle
            </h3>
            <table
              className="w-full text-left"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="border-b border-black">
                  <th className="pb-1 w-3/4 font-bold">CANT x DESCRIPCIÓN</th>
                  <th className="pb-1 text-right font-bold">TOTAL</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {sale.items &&
                  sale.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="py-2 pr-2">
                        {item.quantity}x {item.description}
                        <br />
                        <span className="text-[11px] text-gray-800">
                          P.U: S/ {item.unitPrice?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="py-2 text-right font-bold">
                        S/ {item.subtotal?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* TOTALES Y SALDOS */}
          <div className="text-right mb-4 space-y-1 text-[13px]">
            <div className="flex justify-between">
              <span>TOTAL:</span>
              <span className="font-bold">
                S/ {sale.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>A CUENTA:</span>
              <span>S/ {sale.paidAmount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-[15px] mt-2 pt-2 border-t border-black">
              <span className="font-bold">SALDO:</span>
              <span className="font-black">
                S/ {balanceDue?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          {/* ZONA DE CÓDIGO QR */}
          {motorcycle && (
            <div className="text-center mb-4 flex flex-col items-center">
              <div className="border-t border-dashed border-black w-full my-2"></div>
              <p className="mb-2 font-bold text-[12px] uppercase">
                Vinculado a:
              </p>

              <div className="p-1">
                <QRCodeSVG
                  value={motorcycle.shopCode || motorcycle.id}
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="text-2xl font-black mt-2 m-0">
                {motorcycle.shopCode || "SIN CÓDIGO"}
              </p>
              <p className="text-[11px] uppercase mt-1 m-0">
                {motorcycle.brand || ""} {motorcycle.model || ""}
              </p>
            </div>
          )}

          {/* PIE DE TICKET (REGLA PDF 13) */}
          <div className="border-t border-dashed border-black my-2"></div>
          <div className="text-center text-[11px] mt-3 space-y-2">
            <p className="uppercase font-bold border-2 border-black p-1 m-0 leading-tight">
              Documento interno, no oficial.
              <br />
              No válido para fines tributarios.
            </p>
            <p className="mt-2 m-0">*** GRACIAS POR SU PREFERENCIA ***</p>
            <p className="text-[9px] m-0">Emitido por MotoSys V1</p>
          </div>
        </div>
      </div>

      {/* Estilos globales para limpieza al imprimir */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto; 
          }
          body {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
}
