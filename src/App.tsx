import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Cashbook from "./pages/Cashbook";
import CloseDayPage from "./pages/CloseDay";
import Customers from "./pages/Customers";
import GRPage from "./pages/GR";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import { Login } from "./pages/Login";
import NewJob from "./pages/NewJob";
import NotFound from "./pages/NotFound";
import POPage from "./pages/PO";
import POSSale from "./pages/POSSale";
import Parts from "./pages/Parts";
import Pricing from "./pages/Pricing";
import PublicQuote from "./pages/PublicQuote";
import PublicWarranty from "./pages/PublicWarranty";
import QuoteForm from "./pages/QuoteForm";
import Quotes from "./pages/Quotes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Suppliers from "./pages/Suppliers";
import UsersPage from "./pages/Users";
import JobPrint from "./pages/print/JobPrint";
import ReceiptPrint from "./pages/print/ReceiptPrint";
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
            <Route index element={<Index />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/new" element={<NewJob />} />
            <Route path="customers" element={<Customers />} />
            <Route path="parts" element={<Parts />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="cashbook" element={<Cashbook />} />
            <Route path="close-day" element={<CloseDayPage />} />
            <Route path="pos/sale" element={<POSSale />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="po" element={<POPage />} />
            <Route path="gr" element={<GRPage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/:id" element={<QuoteForm />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/print/jobs/:id" element={<JobPrint />} />
          <Route path="/print/receipt/:id" element={<ReceiptPrint />} />
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
