import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";

export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ issueDate: -1 });

        const stats = {
            totalInvoices: invoices.length,
            totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
            totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
            totalDue: invoices.reduce((sum, inv) => sum + inv.balanceDue, 0),
        };

        res.status(200).json({ invoices, stats });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const { customerName, total, dueDate, lines } = req.body;

        if (!customerName || !total || !dueDate || !lines) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Auto-generate invoice number
        const lastInvoice = await Invoice.findOne().sort({ _id: -1 });
        let nextNum = 1;
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
            if (match) nextNum = parseInt(match[1]) + 1;
        }
        const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;

        const invoice = await Invoice.create({
            invoiceNumber,
            customerName,
            total,
            dueDate: new Date(dueDate),
            balanceDue: total,
            lines,
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error("Error creating invoice:", error);

        if (error.code === 11000) {
            return res.status(409).json({ error: "Invoice number already exists" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Invalid data provided" });
        }

        res.status(500).json({ error: "Failed to create invoice" });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const payments = await Payment.find({ invoiceId: invoice._id }).sort({ paymentDate: -1 });

        res.status(200).json({
            _id: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            total: invoice.total,
            amountPaid: invoice.amountPaid,
            balanceDue: invoice.balanceDue,
            isArchived: invoice.isArchived,
            lines: invoice.lines,
            payments,
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid invoice ID" });
        }

        res.status(500).json({ error: "Failed to fetch invoice" });
    }
};

export const addPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" });
        }

        if (amount > invoice.balanceDue) {
            return res.status(400).json({ error: "Amount exceeds balance due. Cannot overpay." });
        }

        if (invoice.status === "PAID") {
            return res.status(400).json({ error: "Invoice is already fully paid" });
        }

        const payment = await Payment.create({
            invoiceId: invoice._id,
            amount,
        });

        invoice.amountPaid += amount;
        invoice.balanceDue -= amount;

        if (invoice.balanceDue <= 0) {
            invoice.balanceDue = 0;
            invoice.status = "PAID";
        }

        await invoice.save();

        res.status(201).json({
            message: "Payment recorded successfully",
            payment,
            invoice: {
                amountPaid: invoice.amountPaid,
                balanceDue: invoice.balanceDue,
                status: invoice.status,
            },
        });
    } catch (error) {
        console.error("Error adding payment:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid invoice ID" });
        }

        res.status(500).json({ error: "Failed to add payment" });
    }
};

export const archiveInvoice = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Invoice ID is required" });
        }

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { isArchived: true },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.status(200).json({ message: "Invoice archived", invoice });
    } catch (error) {
        console.error("Error archiving invoice:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid invoice ID" });
        }

        res.status(500).json({ error: "Failed to archive invoice" });
    }
};

export const restoreInvoice = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Invoice ID is required" });
        }

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { isArchived: false },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.status(200).json({ message: "Invoice restored", invoice });
    } catch (error) {
        console.error("Error restoring invoice:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid invoice ID" });
        }

        res.status(500).json({ error: "Failed to restore invoice" });
    }
};