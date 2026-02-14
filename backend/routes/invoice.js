import express from "express";
import {
    getAllInvoices,
    createInvoice,
    getInvoiceById,
    addPayment,
    archiveInvoice,
    restoreInvoice,
} from "../controllers/Invoice.js";

const router = express.Router();

router.get("/all", getAllInvoices);
router.post("/create-invoice", createInvoice);
router.get("/:id", getInvoiceById);
router.post("/:id/payments", addPayment);
router.post("/archive", archiveInvoice);
router.post("/restore", restoreInvoice);

export default router;