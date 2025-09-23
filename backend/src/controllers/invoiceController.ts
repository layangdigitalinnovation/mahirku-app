import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import User from "../models/User";
import Package from "../models/Package";
import Voucher from "../models/Voucher";

// Ambil semua invoice
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.findAll({
      include: [User, Package, Voucher],
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices", error });
  }
};

// Ambil invoice by ID
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [User, Package, Voucher],
    });

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoice", error });
  }
};

// Update invoice
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    await invoice.update(req.body);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: "Failed to update invoice", error });
  }
};

// Hapus invoice
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    await invoice.destroy();
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete invoice", error });
  }
};

export const getInvoiceByUserId = async (req: Request, res: Response) => {

    // Cek apakah userId ada di request params
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
    }

  try {
    const invoices = await Invoice.findAll({
      where: { userId },
      include: [User, Package, Voucher],
    });
    if (!invoices.length) {
      res.status(404).json({ message: "No invoices found for this user" });
    }
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices", error });
  }
}
