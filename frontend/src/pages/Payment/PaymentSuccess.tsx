import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    setInvoiceId(searchParams.get("invoiceId"));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-800 mt-4">
          Pembayaran Berhasil 🎉
        </h1>
        <p className="text-gray-600 mt-2">
          Terima kasih telah melakukan pembayaran. Token Anda akan segera ditambahkan ke akun.
        </p>

        {invoiceId && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mt-4 text-sm">
            ID Invoice: <span className="font-semibold">{invoiceId}</span>
          </div>
        )}

        <Link
          to="/"
          className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
