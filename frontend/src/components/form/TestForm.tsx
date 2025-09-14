import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";

// ✅ Schema untuk validasi
const testFormSchema = z.object({
  fullname: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama Terlalu Panjang"),
  birthdate: z
    .string()
    .regex(
      /^(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})$/,
      "Format tanggal harus DD-MM-YYYY atau YYYY-MM-DD"
    ),
  bloodtype: z.string().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

interface TestFormProps {
  onSubmit: (values: TestFormValues) => void;
  defaultValues?: Partial<TestFormValues>;
}

export function TestForm({ onSubmit, defaultValues }: TestFormProps) {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      fullname: defaultValues?.fullname || "",
      birthdate: defaultValues?.birthdate || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Lahir</FormLabel>
              <FormControl>
                <Input placeholder="DD-MM-YYYY or YYYY-MM-DD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bloodtype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Golongan Darah</FormLabel>
              <FormControl>
                <Input placeholder="A, B, AB, atau O" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size="lg">
          Analisa Sidik Jari Anda
        </Button>
      </form>
    </Form>
  );
}
