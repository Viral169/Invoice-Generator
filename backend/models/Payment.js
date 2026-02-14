import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;