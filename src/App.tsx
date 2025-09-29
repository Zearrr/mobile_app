import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Can } from "./components/Guard";
import { AppLayout } from "./components/layout/AppLayout";

// Staff pages (legacy - replaced by reusing admin pages)

// Admin pages (not available currently) - removed to avoid import error

// Shared pages
import JobPrint from "./pages/admin/JobPrint";
import Login from "./pages/auth/Login";

// Core pages
import Dashboard from "./pages/core/Dashboard";
import NotFound from "./pages/core/NotFound";
import Settings from "./pages/core/Settings";

// Jobs pages (moved to admin)
import JobDetail from "./pages/admin/jobs/JobDetail";
import JobEdit from "./pages/admin/jobs/JobEdit";
import Jobs from "./pages/admin/jobs/Jobs";
import NewJob from "./pages/admin/jobs/NewJob";

// Inventory pages (moved to admin)
import PartDetail from "./pages/admin/inventory/PartDetail";
import PartForm from "./pages/admin/inventory/PartForm";
import Parts from "./pages/admin/inventory/Parts";
import StockMovement from "./pages/admin/inventory/StockMovement";

// Sales pages (moved to admin)
import POSSale from "./pages/admin/sales/POSSale";
import Pricing from "./pages/admin/sales/Pricing";
import PublicQuote from "./pages/admin/sales/PublicQuote";
import QuoteForm from "./pages/admin/sales/QuoteForm";
import Quotes from "./pages/admin/sales/Quotes";
import SaleDetail from "./pages/admin/sales/SaleDetail";
import SalesHistory from "./pages/admin/sales/SalesHistory";

// Warranty pages (moved to admin)
import ClaimEdit from "./pages/admin/ClaimEdit";
import ClaimEditForm from "./pages/admin/ClaimEditForm";
import Claims from "./pages/admin/Claims";
import PublicWarranty from "./pages/admin/PublicWarranty";
import Warranty from "./pages/admin/Warranty";
import WarrantyNew from "./pages/admin/WarrantyNew";

// Finance pages
import Cashbook from "./pages/admin/finance/Cashbook";
import CloseDayPage from "./pages/admin/finance/CloseDay";
import Reports from "./pages/admin/finance/Reports";

// Inventory pages (PO) (moved to admin)
import POPage from "./pages/admin/inventory/PO";

// Customer pages (moved to admin)
import CustomerHistory from "./pages/admin/customers/CustomerHistory";

// User pages
import UsersPage from "./pages/admin/users/Users";

// Print pages (moved to admin)
import ReceiptPrint from "./pages/admin/ReceiptPrint";
import SalesReceipt from "./pages/admin/SalesReceipt";
import WarrantyPrint from "./pages/admin/WarrantyPrint";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Shared routes */}
          <Route path="/shared/auth/login" element={<Login />} />
          <Route path="/shared/print/jobs/:id" element={<JobPrint />} />
          
          {/* Staff routes (staff + owner) - reuse admin pages */}
          <Route path="/staff" element={<AppLayout />}>
            <Route index element={<Can roles={["staff", "owner"]}><Dashboard /></Can>} />
            <Route path="dashboard" element={<Can roles={["staff", "owner"]}><Dashboard /></Can>} />
            {/* Jobs */}
            <Route path="jobs" element={<Can roles={["staff", "owner"]}><Jobs /></Can>} />
            <Route path="jobs/new" element={<Can roles={["staff", "owner"]}><NewJob /></Can>} />
            <Route path="jobs/:id" element={<Can roles={["staff", "owner"]}><JobDetail /></Can>} />
            <Route path="jobs/:id/edit" element={<Can roles={["staff", "owner"]}><JobEdit /></Can>} />
            {/* Inventory */}
            <Route path="inventory/parts" element={<Can roles={["staff", "owner"]}><Parts /></Can>} />
            <Route path="inventory/parts/new" element={<Can roles={["staff", "owner"]}><PartForm /></Can>} />
            <Route path="inventory/parts/:id" element={<Can roles={["staff", "owner"]}><PartDetail /></Can>} />
            <Route path="inventory/parts/:id/edit" element={<Can roles={["staff", "owner"]}><PartForm /></Can>} />
            {/* barcode page removed */}
            <Route path="inventory/stock" element={<Can roles={["staff", "owner"]}><StockMovement /></Can>} />
            {/* Sales */}
            <Route path="sales/pos" element={<Can roles={["staff", "owner"]}><POSSale /></Can>} />
            <Route path="sales/history" element={<Can roles={["staff", "owner"]}><SalesHistory /></Can>} />
            <Route path="sales/:id" element={<Can roles={["staff", "owner"]}><SaleDetail /></Can>} />
            {/* Customers */}
            <Route path="customers" element={<Can roles={["staff", "owner"]}><CustomerHistory /></Can>} />
            <Route path="customers/:id" element={<Can roles={["staff", "owner"]}><CustomerHistory /></Can>} />
            {/* Warranty & Claims */}
            <Route path="warranty" element={<Can roles={["staff", "owner"]}><Warranty /></Can>} />
            <Route path="warranty/new" element={<Can roles={["staff", "owner"]}><WarrantyNew /></Can>} />
            <Route path="claims" element={<Can roles={["staff", "owner"]}><Claims /></Can>} />
            <Route path="claims/:id" element={<Can roles={["staff", "owner"]}><ClaimEdit /></Can>} />
            <Route path="claims/:id/edit" element={<Can roles={["staff", "owner"]}><ClaimEditForm /></Can>} />
          </Route>
          
          {/* Admin routes (owner only) */}
          <Route path="/admin" element={<AppLayout />}>
            <Route path="dashboard" element={<Can roles={["owner"]}><Dashboard /></Can>} />
            <Route path="finance/cashbook" element={<Can roles={["owner"]}><Cashbook /></Can>} />
            <Route path="finance/close-day" element={<Can roles={["owner"]}><CloseDayPage /></Can>} />
            <Route path="finance/reports" element={<Can roles={["owner"]}><Reports /></Can>} />
            <Route path="users" element={<Can roles={["owner"]}><UsersPage /></Can>} />
          </Route>
          
          {/* Legacy routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Can roles={["staff", "owner"]}><Dashboard /></Can>} />
            <Route path="jobs" element={<Can roles={["owner"]}><Jobs /></Can>} />
            <Route path="jobs/new" element={<Can roles={["owner"]}><NewJob /></Can>} />
            <Route path="jobs/:id" element={<Can roles={["owner"]}><JobDetail /></Can>} />
            <Route path="jobs/:id/edit" element={<Can roles={["owner"]}><JobEdit /></Can>} />
            <Route path="parts" element={<Can roles={["owner"]}><Parts /></Can>} />
            <Route path="parts/new" element={<Can roles={["owner"]}><PartForm /></Can>} />
            <Route path="parts/:id" element={<Can roles={["owner"]}><PartDetail /></Can>} />
            <Route path="parts/:id/edit" element={<Can roles={["owner"]}><PartForm /></Can>} />
            {/* barcode page removed */}
            <Route path="inventory/stock" element={<Can roles={["owner"]}><StockMovement /></Can>} />
            <Route path="pricing" element={<Can roles={["owner"]}><Pricing /></Can>} />
            <Route path="settings" element={<Can roles={["staff", "owner"]}><Settings /></Can>} />
            {/* moved to /admin */}
            <Route path="pos/sale" element={<Can roles={["owner"]}><POSSale /></Can>} />
            <Route path="sales/history" element={<Can roles={["owner"]}><SalesHistory /></Can>} />
            <Route path="sales/:id" element={<Can roles={["owner"]}><SaleDetail /></Can>} />
            <Route path="po" element={<Can roles={["owner"]}><POPage /></Can>} />
            <Route path="warranty" element={<Can roles={["staff", "owner"]}><Warranty /></Can>} />
            <Route path="warranty/new" element={<Can roles={["staff", "owner"]}><WarrantyNew /></Can>} />
            <Route path="claims" element={<Can roles={["staff", "owner"]}><Claims /></Can>} />
            <Route path="claims/:id" element={<Can roles={["staff", "owner"]}><ClaimEdit /></Can>} />
            <Route path="claims/:id/edit" element={<Can roles={["staff", "owner"]}><ClaimEditForm /></Can>} />
            <Route path="customers" element={<Can roles={["owner"]}><CustomerHistory /></Can>} />
            <Route path="customers/:id" element={<Can roles={["owner"]}><CustomerHistory /></Can>} />
            <Route path="reports" element={<Can roles={["owner"]}><Reports /></Can>} />
            {/* moved to /admin */}
            <Route path="quotes" element={<Can roles={["owner"]}><Quotes /></Can>} />
            <Route path="quotes/:id" element={<Can roles={["owner"]}><QuoteForm /></Can>} />
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
