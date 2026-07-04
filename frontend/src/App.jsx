import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Customers from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import AdminTransactions from "./pages/admin/AdminTransactions";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<Login isAdmin />} />

      {/* Customer */}
      <Route path="/dashboard" element={<ProtectedRoute role="customer"><Dashboard /></ProtectedRoute>} />
      <Route path="/deposit" element={<ProtectedRoute role="customer"><Deposit /></ProtectedRoute>} />
      <Route path="/withdraw" element={<ProtectedRoute role="customer"><Withdraw /></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute role="customer"><Transfer /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute role="customer"><Transactions /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="customer"><Profile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute role="admin"><Customers /></ProtectedRoute>} />
      <Route path="/admin/customers/:id" element={<ProtectedRoute role="admin"><CustomerDetail /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute role="admin"><AdminTransactions /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
