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
import SettingsPage from "../features/settings/SettingsPage";
import RolesPage from "../features/settings/RolePage";
import SubscriptionPlansPage from "../features/subscriptions/pages/SubscriptionPlansPage";
import SubscriptionRequiredRoute from "../components/auth/SubscriptionRequiredRoute";
import StaffPage from "../features/settings/StaffPage";
import StorePage from "../features/settings/StorePage";
import ProfilePage from "../features/settings/ProfilePage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import {
  CreateSalesReturnPage,
  SalesReturnDetailsPage,
  SalesReturnsPage,
} from "../features/sales-returns";
import EmailVerificationPage from "../features/auth/EmailVerificationPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/email/verify",
    element: <EmailVerificationPage />,
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
            path: "/subscription",
            element: <SubscriptionPlansPage />,
          },
          {
            element: <SubscriptionRequiredRoute />,
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
                  {
                    path: "/sales/returns",
                    element: <SalesReturnsPage />,
                  },
                  {
                    path: "/sales/returns/:returnId",
                    element: <SalesReturnDetailsPage />,
                  },
                  {
                    path: "/sales/:invoiceId/returns/new",
                    element: <CreateSalesReturnPage />,
                  },
                  {
                    path: "/settings",
                    element: <SettingsPage />,
                  },
                  {
                    path: "/settings/roles",
                    element: <RolesPage />,
                  },
                  {
                    path: "/settings/staff",
                    element: <StaffPage />,
                  },
                  {
                    path: "/settings/store",
                    element: <StorePage />,
                  },
                  {
                    path: "/settings/profile",
                    element: <ProfilePage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
