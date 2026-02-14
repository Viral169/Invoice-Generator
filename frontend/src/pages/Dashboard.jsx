import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, IndianRupee, TrendingUp, Clock, CheckCircle, Plus, Archive, Search, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/invoices';

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/all`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "API endpoint not found" : "Failed to fetch invoices");
      }
      const data = await response.json();
      setInvoices(data.invoices || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Error fetching invoices", err);
      setError(err.message || "An unexpected error occurred. Please check if the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());

    if (filter === 'ALL') return matchSearch && !inv.isArchived;
    if (filter === 'DRAFT') return matchSearch && inv.status === 'DRAFT' && !inv.isArchived;
    if (filter === 'PAID') return matchSearch && inv.status === 'PAID' && !inv.isArchived;
    if (filter === 'ARCHIVED') return matchSearch && inv.isArchived;
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-md border border-red-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Invoices</h1>
            <p className="text-slate-400 text-sm mt-1">Manage and track all your invoices</p>
          </div>
          <Link
            to="/create"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> New Invoice
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText size={15} className="text-blue-500" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalInvoices || 0}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={15} className="text-indigo-500" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <IndianRupee size={15} className="text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Paid</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">₹{(stats.totalPaid || 0).toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock size={15} className="text-orange-500" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{(stats.totalDue || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'DRAFT', 'PAID', 'ARCHIVED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">No invoices found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((inv) => (
                <Link
                  to={`/invoices/${inv._id}`}
                  key={inv._id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                          {inv.invoiceNumber}
                        </p>
                        {inv.isArchived && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full">
                            <Archive size={10} /> Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{inv.customerName} • {new Date(inv.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">₹{inv.total?.toLocaleString()}</p>
                      {inv.balanceDue > 0 && (
                        <p className="text-[10px] text-orange-500 font-medium">Due: ₹{inv.balanceDue?.toLocaleString()}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                        : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                    }`}>
                      {inv.status === 'PAID' ? <CheckCircle size={11} /> : <Clock size={11} />}
                      {inv.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
