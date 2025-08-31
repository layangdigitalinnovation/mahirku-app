// utils/paymentUtils.ts

interface DummyInvoice {
  invoiceId: number;
  amount: number;
  tokenAmount: number;
  invoice_url: string;
  status: 'PENDING' | 'PAID';
  userId: number;
  voucherCode?: string;
}

const dummyInvoices: DummyInvoice[] = [];

interface CreateInvoiceOptions {
  invoiceId: number;
  userId: number;
  tokenAmount: number;
  voucherCode?: string;
}

export function createInvoiceDummy({ invoiceId, userId, tokenAmount, voucherCode }: CreateInvoiceOptions): DummyInvoice {
  const pricePerToken = 10000;
  const totalAmount = tokenAmount * pricePerToken;

  const invoice: DummyInvoice = {
    invoiceId,
    amount: totalAmount,
    tokenAmount,
    invoice_url: `https://dummy-payment.com/pay/${invoiceId}`, // URL tetap bisa pakai ID
    status: 'PENDING',
    userId,
    voucherCode,
  };

  dummyInvoices.push(invoice);

  return invoice;
}

export function simulatePaymentCallback(invoiceId: number): boolean {
  const invoice = dummyInvoices.find(inv => inv.invoiceId === invoiceId);
  if (!invoice) return false;

  invoice.status = 'PAID';
  return true;
}

export function getInvoiceById(invoiceId: number): DummyInvoice | undefined {
  return dummyInvoices.find(inv => inv.invoiceId === invoiceId);
}