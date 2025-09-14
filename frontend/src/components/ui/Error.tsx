import { AlertCircle, RefreshCw, WifiOff, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type ErrorType =
  | "network"
  | "server"
  | "timeout"
  | "forbidden"
  | "notfound"
  | "generic";

interface ErrorFetchProps {
  error?: Error | string;
  errorType?: ErrorType;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ErrorFetch({
  error,
  errorType = "generic",
  onRetry,
  retryText = "Coba Lagi",
  showRetry = true,
  className = "",
  size = "default",
}: ErrorFetchProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Delay untuk UX yang lebih baik
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  // Auto-detect error type dari error message
  const detectErrorType = (error: Error | string): ErrorType => {
    const errorMessage = typeof error === "string" ? error : error.message;
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes("network") || lowerMessage.includes("fetch"))
      return "network";
    if (lowerMessage.includes("timeout")) return "timeout";
    if (lowerMessage.includes("403") || lowerMessage.includes("forbidden"))
      return "forbidden";
    if (lowerMessage.includes("404") || lowerMessage.includes("not found"))
      return "notfound";
    if (lowerMessage.includes("500") || lowerMessage.includes("server"))
      return "server";

    return "generic";
  };

  const actualErrorType = error ? detectErrorType(error) : errorType;

  const errorConfig = {
    network: {
      icon: (
        <WifiOff
          className={`${
            size === "sm"
              ? "h-8 w-8"
              : size === "default"
              ? "h-12 w-12"
              : "h-16 w-16"
          } text-orange-500`}
        />
      ),
      title: "Koneksi Bermasalah",
      message: "Pastikan koneksi internet Anda stabil dan coba lagi.",
      color: "orange",
    },
    server: {
      icon: (
        <Server
          className={`${
            size === "sm"
              ? "h-8 w-8"
              : size === "default"
              ? "h-12 w-12"
              : "h-16 w-16"
          } text-red-500`}
        />
      ),
      title: "Server Bermasalah",
      message: "Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.",
      color: "red",
    },
    timeout: {
      icon: (
        <RefreshCw
          className={`${
            size === "sm"
              ? "h-8 w-8"
              : size === "default"
              ? "h-12 w-12"
              : "h-16 w-16"
          } text-yellow-500`}
        />
      ),
      title: "Permintaan Timeout",
      message: "Permintaan membutuhkan waktu terlalu lama. Silakan coba lagi.",
      color: "yellow",
    },
    forbidden: {
      icon: (
        <AlertCircle
          className={`${
            size === "sm"
              ? "h-8 w-8"
              : size === "default"
              ? "h-12 w-12"
              : "h-16 w-16"
          } text-purple-500`}
        />
      ),
      title: "Akses Ditolak",
      message: "Anda tidak memiliki izin untuk mengakses data ini.",
      color: "purple",
    },
    notfound: {
      icon: (
        <AlertCircle
          className={`${
            size === "sm"
              ? "h-8 w-8"
              : size === "default"
              ? "h-12 w-12"
              : "h-16 w-16"
          } text-blue-500`}
        />
      ),
      title: "Data Tidak Ditemukan",
      message: "Data yang Anda cari tidak ditemukan atau sudah dihapus.",
      color: "blue",
    },
    generic: {
      icon: (
        <AlertCircle
          className={`${
            size === "sm"
              ? "h-8 w-8"
              : size === "default"
              ? "h-12 w-12"
              : "h-16 w-16"
          } text-gray-500`}
        />
      ),
      title: "Terjadi Kesalahan",
      message: "Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
      color: "gray",
    },
  };

  const config = errorConfig[actualErrorType];
  const sizeClasses = {
    sm: "p-4 space-y-3",
    md: "p-6 space-y-4",
    lg: "p-8 space-y-6",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        size === "sm"
          ? sizeClasses.sm
          : size === "lg"
          ? sizeClasses.lg
          : sizeClasses.md
      } ${className}`}
    >
      <div className="flex items-center justify-center mb-2">{config.icon}</div>

      <div className="space-y-2">
        <h3
          className={`font-semibold text-gray-900 ${
            size === "sm"
              ? "text-sm"
              : size === "default"
              ? "text-base"
              : "text-lg"
          }`}
        >
          {config.title}
        </h3>

        <p
          className={`text-gray-600 max-w-md mx-auto ${
            size === "sm"
              ? "text-xs"
              : size === "default"
              ? "text-sm"
              : "text-base"
          }`}
        >
          {config.message}
        </p>

        {/* Show error details in development */}
        {error && process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-red-600 overflow-auto">
              {typeof error === "string" ? error : error.message}
            </pre>
          </details>
        )}
      </div>

      {showRetry && onRetry && (
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          variant="outline"
          size={size}
          className={`mt-4 ${
            config.color === "red"
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : config.color === "orange"
              ? "border-orange-200 text-orange-600 hover:bg-orange-50"
              : config.color === "yellow"
              ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              : config.color === "purple"
              ? "border-purple-200 text-purple-600 hover:bg-purple-50"
              : config.color === "blue"
              ? "border-blue-200 text-blue-600 hover:bg-blue-50"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Mencoba Lagi...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {retryText}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
