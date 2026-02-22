import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, FileText, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    customerName: "",
    dueDate: "",
  });
  const [lines, setLines] = useState([
    { description: "", quantity: 1, unitPrice: 0, lineTotal: 0 },
  ]);

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      updated[index].lineTotal =
        Number(updated[index].quantity) * Number(updated[index].unitPrice);
    }
    setLines(updated);
  };

  const addLine = () => {
    setLines([
      ...lines,
      { description: "", quantity: 1, unitPrice: 0, lineTotal: 0 },
    ]);
  };

  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const total = lines.reduce((sum, l) => sum + (l.lineTotal || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.customerName || !form.dueDate) {
      setError("Please fill all fields");
      return;
    }
    if (
      lines.some((l) => !l.description || l.quantity <= 0 || l.unitPrice <= 0)
    ) {
      setError(
        "Please fill all line items properly (quantity and unit price must be greater than 0)"
      );
      return;
    }
    if (total <= 0) {
      setError("Total amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total,
          lines,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const data = await response.json();
      navigate(`/invoices/${data._id}`);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Create Invoice
              </h1>
              <p className="text-xs text-slate-400">
                Invoice number will be auto-generated
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle
                size={18}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-red-700">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Line Items
                </h2>
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 mb-2">
                <span className="col-span-5 text-[10px] font-semibold text-slate-400 uppercase">
                  Description
                </span>
                <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase">
                  Qty
                </span>
                <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase">
                  Unit Price (₹)
                </span>
                <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase text-right">
                  Line Total
                </span>
                <span className="col-span-1"></span>
              </div>

              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="col-span-12 md:col-span-5">
                      <input
                        type="text"
                        placeholder="Service or product description"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(i, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(i, "quantity", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(i, "unitPrice", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right">
                      <p className="py-2 text-sm font-bold text-slate-700">
                        ₹{(line.lineTotal || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-1 text-right">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Amount
                </span>
                <p className="text-2xl font-bold text-slate-800">
                  ₹{total.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-6 py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create Invoice"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
