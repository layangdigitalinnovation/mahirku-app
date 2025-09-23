import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { deleteInvoice, getInvoiceById, getInvoiceByUserId, getInvoices, updateInvoice } from "../controllers/invoiceController";
import { checkRole } from "../middlewares/roleMiddleware";


const router = Router();

// 🔹 route khusus user login harus didefinisikan dulu
router.get("/user", authMiddleware, getInvoiceByUserId);  // GET invoice by userId

router.get("/", authMiddleware, checkRole(1), getInvoices);          // GET semua invoice
router.delete("/:id", authMiddleware, checkRole(1), deleteInvoice);  // DELETE invoice
router.get("/:id",  getInvoiceById);    // GET invoice by ID

export default router;
