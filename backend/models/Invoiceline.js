import mongoose from "mongoose";

const InvoiceLineSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
});

const InvoiceLine = mongoose.model('InvoiceLine', InvoiceLineSchema);
export { InvoiceLineSchema };
export default InvoiceLine;