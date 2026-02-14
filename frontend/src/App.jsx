import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvoiceDetails from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;