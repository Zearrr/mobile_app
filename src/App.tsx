import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

// Core pages
import Dashboard from "./pages/core/Dashboard";
import { Login } from "./pages/core/Login";
import NotFound from "./pages/core/NotFound";
import Settings from "./pages/core/Settings";

// Jobs pages
import JobDetail from "./pages/jobs/JobDetail";
import JobEdit from "./pages/jobs/JobEdit";
import Jobs from "./pages/jobs/Jobs";
import NewJob from "./pages/jobs/NewJob";

// Inventory pages
import Parts from "./pages/inventory/Parts";
import StockMovement from "./pages/inventory/StockMovement";

// Sales pages
import POSSale from "./pages/sales/POSSale";
import Pricing from "./pages/sales/Pricing";
import PublicQuote from "./pages/sales/PublicQuote";
import QuoteForm from "./pages/sales/QuoteForm";
import Quotes from "./pages/sales/Quotes";
import SaleDetail from "./pages/sales/SaleDetail";
import SalesHistory from "./pages/sales/SalesHistory";

// Warranty pages
import ClaimEdit from "./pages/warranty/ClaimEdit";
import ClaimEditForm from "./pages/warranty/ClaimEditForm";
import Claims from "./pages/warranty/Claims";
import PublicWarranty from "./pages/warranty/PublicWarranty";
import Warranty from "./pages/warranty/Warranty";
import WarrantyNew from "./pages/warranty/WarrantyNew";

// Finance pages
import Cashbook from "./pages/finance/Cashbook";
import CloseDayPage from "./pages/finance/CloseDay";
import Reports from "./pages/finance/Reports";

// Inventory pages (PO)
import POPage from "./pages/inventory/PO";

// Customer pages
import CustomerHistory from "./pages/customers/CustomerHistory";

// User pages
import UsersPage from "./pages/users/Users";

// Print pages
import JobPrint from "./pages/print/JobPrint";
import ReceiptPrint from "./pages/print/ReceiptPrint";
import SalesReceipt from "./pages/print/SalesReceipt";
import WarrantyPrint from "./pages/print/WarrantyPrint";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/new" element={<NewJob />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="jobs/:id/edit" element={<JobEdit />} />
            <Route path="parts" element={<Parts />} />
            <Route path="inventory/stock" element={<StockMovement />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="cashbook" element={<Cashbook />} />
            <Route path="close-day" element={<CloseDayPage />} />
            <Route path="pos/sale" element={<POSSale />} />
            <Route path="sales/history" element={<SalesHistory />} />
            <Route path="sales/:id" element={<SaleDetail />} />
            <Route path="po" element={<POPage />} />
            <Route path="warranty" element={<Warranty />} />
            <Route path="warranty/new" element={<WarrantyNew />} />
            <Route path="claims" element={<Claims />} />
            <Route path="claims/:id" element={<ClaimEdit />} />
            <Route path="claims/:id/edit" element={<ClaimEditForm />} />
            <Route path="customers" element={<CustomerHistory />} />
            <Route path="customers/:id" element={<CustomerHistory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/:id" element={<QuoteForm />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/print/jobs/:id" element={<JobPrint />} />
          <Route path="/print/receipt/:id" element={<ReceiptPrint />} />
          <Route path="/print/sales/:id" element={<SalesReceipt />} />
          <Route path="/print/warranty/:id" element={<WarrantyPrint />} />
          <Route path="/warranty/:jobId" element={<PublicWarranty />} />
          <Route path="/public/quote/:id" element={<PublicQuote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
