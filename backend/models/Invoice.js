import mongoose from "mongoose";
import { InvoiceLineSchema } from "./Invoiceline.js";

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'PAID'], default: 'DRAFT' },
    total: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    isArchived: { type: Boolean, default: false },
    lines: [InvoiceLineSchema]
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);
export default Invoice;
