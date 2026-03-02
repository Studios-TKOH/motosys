import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Dashboard from "./pages/Dashboard";
import Motorcycles from "./pages/Motorcycles";
import MotorcycleDetail from "./pages/MotorcycleDetail";
import NewMotorcycle from "./pages/NewMotorcycle";
import WorkOrders from "./pages/WorkOrders";
import NewWorkOrder from "./pages/NewWorkOrder";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import Sales from "./pages/Sales";
import NewSale from "./pages/NewSale";
import SaleDetail from "./pages/SaleDetail"; // <-- IMPORTAMOS EL DETALLE DE VENTA
import Payments from "./pages/Payments";
import Kardex from "./pages/Kardex";
import NewInventoryMovement from "./pages/NewInventoryMovement";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "motorcycles", Component: Motorcycles },
      { path: "motorcycles/new", Component: NewMotorcycle },
      { path: "motorcycles/:id", Component: MotorcycleDetail },
      { path: "work-orders", Component: WorkOrders },
      { path: "work-orders/new", Component: NewWorkOrder },
      { path: "work-orders/:id", Component: WorkOrderDetail },
      { path: "sales", Component: Sales },
      { path: "sales/new", Component: NewSale },
      { path: "sales/:id", Component: SaleDetail },
      { path: "payments", Component: Payments },
      { path: "kardex", Component: Kardex },
      { path: "kardex/new-movement", Component: NewInventoryMovement },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
      { path: "*", Component: NotFound },
    ],
  },
]);
