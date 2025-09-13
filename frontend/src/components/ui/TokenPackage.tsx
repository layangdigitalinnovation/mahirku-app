import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TokenPackage } from "@/types";
import { useValidateVoucher } from "@/hooks/useVouchers";
import { usePurchaseToken } from "@/hooks/useTokenTest";
import formatCurrency from "@/utils/formatCurrency";

// Types for API responses
interface VoucherResponse {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  valid: boolean;
}

export default function TokenPackages({
  tokenPackages,
}: {
  tokenPackages: TokenPackage[];
}) {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(
    null
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { mutateAsync: validateVoucher } = useValidateVoucher();
  const {
    mutateAsync: purchaseToken,
    isPending: isPurchasing,
    error: purchaseError,
  } = usePurchaseToken();

  const handleSelectPackage = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setOpen(true);
    setVoucherCode("");
    setVoucherError("");
    setAppliedVoucher(null);
    setPaymentMessage(null);
    setReferralCode("");
    setIsProcessingPayment(false);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Voucher code cannot be empty");
      return;
    }
    if (!selectedPackage) return;

    setIsApplyingVoucher(true);
    setVoucherError("");

    try {
      const result = await validateVoucher(voucherCode);
      if (result?.valid) {
        setAppliedVoucher(result.dataValues);
        setVoucherError("");
      } else {
        setVoucherError("Invalid voucher code");
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherError("Voucher Tidak Ditemukan");
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const handlePurchasePackage = async () => {
    if (!selectedPackage || isProcessingPayment) return;

    setIsProcessingPayment(true);
    setPaymentMessage(null);

    try {
      const purchaseData: any = {
        packageId: selectedPackage.id,
      };

      // Tambahkan voucher code jika ada
      if (appliedVoucher?.code) {
        purchaseData.voucherCode = appliedVoucher.code;
      }

      // Tambahkan referral code jika ada
      if (referralCode.trim()) {
        purchaseData.referralCode = referralCode.trim();
      }

      const result = await purchaseToken(purchaseData);

      if (result) {
        setPaymentMessage("Redirecting you to Xendit for payment...");
        // redirect ke xendit setelah beberapa detik
        setTimeout(() => {
          window.location.href = result.paymentUrl!;
        }, 1500);
      } else {
        setPaymentMessage("Purchase successful! Tokens will be added shortly.");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      setPaymentMessage(
        err instanceof Error ? err.message : "Payment failed. Try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const calculateDiscount = (): number => {
    if (!selectedPackage || !appliedVoucher) return 0;
    const originalPrice = selectedPackage.price;
    if (appliedVoucher.type === "percentage") {
      return Math.floor((originalPrice * appliedVoucher.value) / 100);
    } else if (appliedVoucher.type === "fixed") {
      return appliedVoucher.value;
    }
    return 0;
  };

  const calculateFinalPrice = (): number => {
    if (!selectedPackage) return 0;
    const originalPrice = selectedPackage.price;
    const discount = calculateDiscount();
    return Math.max(originalPrice - discount, 0);
  };

  const formatVoucherDiscount = () => {
    if (!appliedVoucher) return "";
    const { type, value } = appliedVoucher;
    return type === "percentage" ? `${value}% off` : `Rp ${value} off`;
  };

  return (
    <>
      <div className="grid gap-4">
        {tokenPackages?.map((pkg) => (
          <div
            key={pkg.id}
            className="relative p-4 rounded-lg border-2 transition-all hover:shadow-md border-gray-200 bg-white"
          >
            <div className="text-center mb-3">
              <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pkg.price)}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-lg font-semibold text-yellow-600">
                  {pkg.defaultTokenAmount} tokens
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-1 mb-3">
              {pkg.description}
            </div>

            <Button
              onClick={() => handleSelectPackage(pkg)}
              className="w-full"
              size="sm"
            >
              Beli Sekarang
            </Button>
          </div>
        ))}
      </div>

      {/* Dialog Purchase */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beli Paket {selectedPackage?.name}</DialogTitle>
            <DialogDescription>
              Konfirmasi pembelian Anda dan gunakan voucher jika Anda
              memilikinya.
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4">
              {/* Package Details */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Harga Paket:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(selectedPackage.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Jumlah Token:</span>
                  <span className="text-yellow-600 font-semibold">
                    {selectedPackage.defaultTokenAmount}
                  </span>
                </div>
              </div>

              {/* Voucher Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Apakah Anda memiliki kode voucher?
                </label>

                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Masukkan kode voucher"
                    disabled={
                      isApplyingVoucher ||
                      !!appliedVoucher ||
                      isProcessingPayment
                    }
                  />
                  {!appliedVoucher && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyVoucher}
                      disabled={
                        isApplyingVoucher ||
                        !voucherCode.trim() ||
                        isProcessingPayment
                      }
                    >
                      {isApplyingVoucher ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Gunakan"
                      )}
                    </Button>
                  )}
                </div>

                {voucherError && (
                  <p className="text-xs text-red-500">{voucherError}</p>
                )}

                {appliedVoucher && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Voucher Dipakai!
                        </p>
                        <p className="text-xs text-green-600">
                          Code:{" "}
                          <span className="font-mono">
                            {appliedVoucher.code}
                          </span>
                        </p>
                        <p className="text-xs text-green-600">
                          Discount: {formatVoucherDiscount()}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveVoucher}
                        className="text-xs"
                        disabled={isProcessingPayment}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Harga Paket:</span>
                    <span>{formatCurrency(selectedPackage.price)}</span>
                  </div>

                  {appliedVoucher && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}

                  <hr className="my-1" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateFinalPrice())}</span>
                  </div>
                </div>
              </div>

              {/* Payment Feedback */}
              {paymentMessage && (
                <Alert>
                  <AlertTitle>Payment Status</AlertTitle>
                  <AlertDescription>{paymentMessage}</AlertDescription>
                </Alert>
              )}

              {/* Purchase Error */}
              {purchaseError && (
                <Alert variant="destructive">
                  <AlertTitle>Payment Failed</AlertTitle>
                  <AlertDescription>
                    {purchaseError instanceof Error
                      ? purchaseError.message
                      : "Something went wrong."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePurchasePackage}
              disabled={isPurchasing || isProcessingPayment}
            >
              {isPurchasing || isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Bayar ${formatCurrency(calculateFinalPrice())}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
