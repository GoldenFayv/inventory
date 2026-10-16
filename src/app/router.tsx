import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import AppLayout from "../components/layout/AppLayout";

// Replace these placeholders with your existing page components.
import DashboardPage from "../features/dashboard/DashboardPage";
import RegisterPage from "../features/auth/RegistrationPage";
import CreateStorePage from "../features/stores/CreateStorePage";
import StoreRequiredRoute from "../components/auth/StoreRequiredRoute";
import ProductsPage from "../features/products/ProductsPage";
import CreateProductPage from "../features/products/CreateProductPage";
import EditProductPage from "../features/products/EditProductPage";
import CheckoutPage from "../features/sales/CheckoutPage";
import SalesHistoryPage from "../features/sales/SalesHistoryPage";
import SaleDetailsPage from "../features/sales/SaleDetailsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/create-store",
        element: <CreateStorePage />,
      },
      {
        element: <StoreRequiredRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: "/",
                element: <DashboardPage />,
              },
              { path: "/products", element: <ProductsPage /> },
              { path: "/products/new", element: <CreateProductPage /> },
              {
                path: "/products/:productId/edit",
                element: <EditProductPage />,
              },
              { path: "/sales", element: <SalesHistoryPage /> },
              { path: "/sales/:id", element: <SaleDetailsPage /> },
              {
                path: "/sales/new",
                element: <CheckoutPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
