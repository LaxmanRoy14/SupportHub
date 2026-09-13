import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyOtpPage } from "./pages/VerifyOtpPage";
import { CreateTicketPage } from "./pages/CreateTicketPage";
import { HomePage, FaqPage, CustomerCarePage, CustomerDashboard, TicketListPage, TicketDetail, AgentHomePage, AgentPersonalDashboard, AuthenticatedFaqPage, AgentFaqPage, AvailabilityPage } from "./pages/PortalPages";

const customer = (element) => <ProtectedRoute allowedRoles={["CUSTOMER"]}>{element}</ProtectedRoute>;
const agent = (element) => <ProtectedRoute allowedRoles={["AGENT"]}>{element}</ProtectedRoute>;

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/verify-otp" element={<VerifyOtpPage />} /><Route path="/faq" element={<FaqPage />} />
    <Route path="/customer" element={customer(<CustomerDashboard />)} /><Route path="/customer/tickets" element={customer(<TicketListPage />)} /><Route path="/customer/tickets/open" element={customer(<TicketListPage fixedStatus="OPEN" />)} /><Route path="/customer/tickets/closed" element={customer(<TicketListPage fixedStatus="RESOLVED" />)} /><Route path="/customer/tickets/new" element={customer(<CreateTicketPage />)} /><Route path="/customer/tickets/:id" element={customer(<TicketDetail />)} /><Route path="/customer/care" element={customer(<CustomerCarePage />)} /><Route path="/customer/faq" element={customer(<AuthenticatedFaqPage />)} />
    <Route path="/agent" element={agent(<AgentHomePage />)} /><Route path="/agent/tickets" element={agent(<TicketListPage agent />)} /><Route path="/agent/tickets/open" element={agent(<TicketListPage agent fixedStatus="OPEN" />)} /><Route path="/agent/tickets/pending" element={agent(<TicketListPage agent fixedStatus="PENDING" />)} /><Route path="/agent/tickets/closed" element={agent(<TicketListPage agent fixedStatus="RESOLVED" />)} /><Route path="/agent/queue" element={agent(<TicketListPage agent />)} /><Route path="/agent/tickets/:id" element={agent(<TicketDetail agent />)} /><Route path="/agent/performance" element={agent(<AgentPersonalDashboard performance />)} /><Route path="/agent/availability" element={agent(<AvailabilityPage />)} /><Route path="/agent/faq" element={agent(<AgentFaqPage />)} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
