import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, FileText, CreditCard, Package, Calendar, User, Archive, RotateCcw, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/invoices';

const InvoiceDetails = () => {    
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const fetchInvoice = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/${id}`);
      if (response.status === 404) {
        setError("Invoice not found");
        setInvoice(null);
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      console.error("Error fetching invoice", err);
      setError(err.message || "Failed to load invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  // Add Payment
  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    const amt = Number(paymentAmount);

    if (!amt || amt <= 0) {
      setPaymentError("Amount must be greater than 0");
      return;
    }
    if (amt > invoice.balanceDue) {
      setPaymentError(`Cannot overpay! Balance due is ₹${invoice.balanceDue?.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment failed");
      }

      setShowModal(false);
      setPaymentAmount("");
      fetchInvoice();
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Archive / Restore
  const handleArchiveToggle = async () => {
    const endpoint = invoice.isArchived ? "restore" : "archive";
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice._id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${endpoint} invoice`);
      }
      fetchInvoice();
    } catch (err) {
      console.error(err);
      alert(err.message || `Failed to ${endpoint} invoice`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-md border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Error Loading Invoice</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-1">Invoice Not Found</h2>
          <p className="text-slate-400 text-sm">The invoice you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const paidPercent = invoice.total > 0 ? Math.round((invoice.amountPaid / invoice.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            {/* Left: Invoice info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {invoice.invoiceNumber}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <User size={14} className="text-slate-400" />
                  <span className="text-slate-500 text-sm">{invoice.customerName}</span>
                </div>
              </div>
            </div>

            {/* Right: Status + Dates + Actions */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {invoice.isArchived && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                    <Archive size={12} /> Archived
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                  invoice.status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                }`}>
                  {invoice.status === 'PAID'
                    ? <CheckCircle size={13} />
                    : <Clock size={13} />
                  }
                  {invoice.status}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={handleArchiveToggle}
                className="mt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {invoice.isArchived ? <RotateCcw size={12} /> : <Archive size={12} />}
                {invoice.isArchived ? "Restore" : "Archive"}
              </button>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Payment Progress</span>
              <span>{paidPercent}% paid</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${paidPercent}%`,
                  background: paidPercent === 100
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800">₹{invoice.total?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Amount Paid</p>
            <p className="text-2xl font-bold text-emerald-600">₹{invoice.amountPaid?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-medium text-orange-500 uppercase tracking-wider mb-1">Balance Due</p>
            <p className="text-2xl font-bold text-orange-600">₹{invoice.balanceDue?.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-800">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Qty</th>
                  <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines?.map((item, index) => (
                  <tr key={item._id || index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 text-sm text-slate-700 font-medium">{item.description}</td>
                    <td className="py-3.5 text-sm text-slate-500 text-center">{item.quantity}</td>
                    <td className="py-3.5 text-sm text-slate-500 text-right">₹{item.unitPrice?.toLocaleString()}</td>
                    <td className="py-3.5 text-sm text-slate-800 font-semibold text-right">₹{item.lineTotal?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-800">Payments</h3>
              {invoice.payments?.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                  {invoice.payments.length}
                </span>
              )}
            </div>
            {invoice.status !== 'PAID' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all duration-200 cursor-pointer"
              >
                + Add Payment
              </button>
            )}
          </div>

          {!invoice.payments || invoice.payments.length === 0 ? (
            <p className="text-slate-300 text-sm italic py-4 text-center">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {invoice.payments.map((pay, index) => (
                <div key={pay._id || index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Payment #{index + 1}</p>
                      <p className="text-xs text-slate-400">{new Date(pay.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">+ ₹{pay.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <CreditCard size={18} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
                <p className="text-xs text-slate-400">Balance: ₹{invoice.balanceDue?.toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold transition-all"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={invoice.balanceDue}
                  min="1"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPaymentAmount(''); }}
                  className="flex-1 px-4 py-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;