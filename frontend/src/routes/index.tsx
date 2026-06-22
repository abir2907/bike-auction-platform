import { createBrowserRouter } from 'react-router-dom';
import { AppBootstrap } from '@/components/layout/AppBootstrap';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthLayout } from '@/components/layout/AuthLayout';

import HomePage from '@/pages/Home';
import ListingsPage from '@/pages/Listings';
import VehicleDetailPage from '@/pages/VehicleDetail';
import AuctionsPage from '@/pages/Auctions';
import AuctionDetailPage from '@/pages/AuctionDetail';
import AboutPage from '@/pages/About';
import ContactPage from '@/pages/Contact';
import { PrivacyPage, TermsPage } from '@/pages/Legal';
import NotFoundPage from '@/pages/NotFound';

import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';
import ResetPasswordPage from '@/pages/auth/ResetPassword';

import DashboardOverview from '@/pages/dashboard/Overview';
import MyListings from '@/pages/dashboard/MyListings';
import ListingForm from '@/pages/dashboard/ListingForm';
import MyBids from '@/pages/dashboard/MyBids';
import SavedVehicles from '@/pages/dashboard/SavedVehicles';
import MyInquiries from '@/pages/dashboard/MyInquiries';
import Profile from '@/pages/dashboard/Profile';

import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminVehicles from '@/pages/admin/Vehicles';
import AdminInquiries from '@/pages/admin/Inquiries';
import AdminCms from '@/pages/admin/Cms';

export const router = createBrowserRouter([
  {
    element: <AppBootstrap />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'buy', element: <ListingsPage /> },
          { path: 'buy/:slug', element: <VehicleDetailPage /> },
          { path: 'auctions', element: <AuctionsPage /> },
          { path: 'auctions/:id', element: <AuctionDetailPage /> },
          { path: 'about', element: <AboutPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'terms', element: <TermsPage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'dashboard', element: <DashboardOverview /> },
              { path: 'dashboard/listings', element: <MyListings /> },
              { path: 'dashboard/listings/new', element: <ListingForm /> },
              { path: 'dashboard/listings/:id/edit', element: <ListingForm /> },
              { path: 'dashboard/bids', element: <MyBids /> },
              { path: 'dashboard/saved', element: <SavedVehicles /> },
              { path: 'dashboard/inquiries', element: <MyInquiries /> },
              { path: 'dashboard/profile', element: <Profile /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute adminOnly />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin', element: <AdminDashboard /> },
              { path: 'admin/users', element: <AdminUsers /> },
              { path: 'admin/vehicles', element: <AdminVehicles /> },
              { path: 'admin/inquiries', element: <AdminInquiries /> },
              { path: 'admin/cms', element: <AdminCms /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
