import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
// import { getReferralId } from "@/utils/referral"; // Tidak diperlukan lagi karena backend menggunakan cookie
import { AuthLayout } from "@/layouts/AuthLayout";

const formSchema = z
  .object({
    fullname: z.string().min(2, "Nama lengkap wajib diisi"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    phoneNumber: z.string().min(8, "Nomor HP tidak valid"),
    address: z.string().min(5, "Alamat wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
    bankAccountName: z.string().min(2, "Nama rekening bank wajib diisi"),
    bankAccountNumber: z.string().min(8, "Nomor rekening bank tidak valid"),
    bankName: z.string().min(2, "Nama bank wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi dan konfirmasi tidak cocok",
    path: ["confirmPassword"],
  });

type AffiliatorRegisterForm = z.infer<typeof formSchema>;

export const AffiliatorRegister: React.FC = () => {
  const { affiliatorRegister: registerAffiliator } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<AffiliatorRegisterForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      username: "",
      phoneNumber: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankName: "",
    },
  });

  const onSubmit = async (values: AffiliatorRegisterForm) => {
    setError("");
    try {
      // Tidak perlu ambil referrerId karena backend akan ambil dari cookie
      await registerAffiliator(values.email, values.password, {
        username: values.username,
        fullname: values.fullname,
        address: values.address,
        phoneNumber: values.phoneNumber,
        bankAccountName: values.bankAccountName,
        bankAccountNumber: values.bankAccountNumber,
        bankName: values.bankName,
      });

      // AuthProvider akan otomatis redirect ke dashboard yang sesuai
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  return (
    <AuthLayout title="Daftar Akun Affiliator">
      <div className="relative w-full max-w-xl p-2 bg-white/80">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username unik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. HP</FormLabel>
                  <FormControl>
                    <Input placeholder="08xxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="anda@contoh.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password with toggle */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Sandi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password with toggle */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Sandi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="******"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((prev) => !prev)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Akun Bank</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Nama lengkap"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Akun Bank</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Nomor akun bank"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="text" placeholder="Nama bank" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="sm:col-span-2 mt-2"
              disabled={form.formState.isSubmitting}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {form.formState.isSubmitting
                ? "Mendaftarkan..."
                : "Daftar Sekarang"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
