import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AdminLayout from './components/layout/AdminLayout/AdminLayout';
import Login from './modules/auth/Login/Login';
import DashboardModule from './modules/dashboard/DashboardModule';
import LeadManagementModule from './modules/leads/LeadManagementModule';
import PortfolioProjectModule from './modules/projects/PortfolioProjectModule';
import SiteExpensesModule from './modules/expenses/SiteExpensesModule';
import MaterialPurchaseModule from './modules/purchases/MaterialPurchaseModule';
import MaterialPurchaseListModule from './modules/material_purchase_list/MaterialPurchaseListModule';
import ClientPaymentsModule from './modules/payments/ClientPaymentsModule';
import AppointmentsModule from './modules/appointments/AppointmentsModule';
import UserMasterModule from './modules/user_master/UserMasterModule';
import AdminMasterModule from './modules/admin_master/AdminMasterModule';
import ContactEnquiryModule from './modules/contact_enquiry/ContactEnquiryModule';
import CreateSiteModule from './modules/create_site/CreateSiteModule';
import NewSiteModule from './modules/new_site/NewSiteModule';
import AdditionalBillingModule from './modules/additional_billing/AdditionalBillingModule';
import PaymentBreakupModule from './modules/payment_breakup/PaymentBreakupModule';
import MonthlyBillingModule from './modules/monthly_billing/MonthlyBillingModule';
import SettingsModule from './modules/settings/SettingsModule';
import SplashLoader from './components/common/SplashLoader/SplashLoader';
import './App.css';

function MainRouter() {
  const { isAuthenticated, activeTab, isSplashLoading, handleSplashComplete } = useApp();

  if (isSplashLoading) {
    return <SplashLoader onComplete={handleSplashComplete} />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'lead_management':
        return <LeadManagementModule />;
      case 'project_showcase':
        return <PortfolioProjectModule />;
      case 'new_site':
        return <NewSiteModule />;
      case 'create_site':
        return <CreateSiteModule />;
      case 'additional_billing':
        return <AdditionalBillingModule />;
      case 'payment_breakup':
        return <PaymentBreakupModule />;
      case 'site_expenses':
        return <SiteExpensesModule />;
      case 'material_purchase':
        return <MaterialPurchaseModule />;
      case 'material_purchase_list':
        return <MaterialPurchaseListModule />;
      case 'client_payments':
        return <ClientPaymentsModule />;
      case 'renovation_appointments':
        return <AppointmentsModule />;
      case 'contact_enquiry':
        return <ContactEnquiryModule />;
      case 'user_master':
        return <UserMasterModule />;
      case 'monthly_billing':
        return <MonthlyBillingModule />;
      case 'admin_master':
        return <AdminMasterModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <AdminLayout>
      {renderActiveModule()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
