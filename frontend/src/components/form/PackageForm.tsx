import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const packageSchema = z.object({
  name: z.string().min(2, "Nama paket diperlukan"),
  price: z.number().min(1, "Harga harus lebih besar dari 0"),
  description: z.string().optional(),
  commissionRate: z
    .number()
    .min(0, "Tingkat komisi minimal 0")
    .max(100, "Tingkat komisi maksimal 100"),
  defaultTokenAmount: z.number().min(1, "Token minimal 1"),
});

export type PackageFormValues = z.infer<typeof packageSchema>;

interface Props {
  defaultValues?: Partial<PackageFormValues>;
  onSubmit: (values: PackageFormValues) => void;
  loading?: boolean;
}

export default function PackageForm({
  defaultValues,
  onSubmit,
  loading,
}: Props) {
  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      defaultTokenAmount: 1,
      ...defaultValues,
      // Ensure commissionRate is always an integer
      commissionRate: defaultValues?.commissionRate 
        ? Math.round(Number(defaultValues.commissionRate))
        : 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Paket</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama paket" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultTokenAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Token</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan deskripsi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commissionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tingkat Komisi (%)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Masukkan persentase (0-100)"
                  {...field}
                  value={field.value === 0 ? "" : field.value?.toString() || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      field.onChange(0);
                      return;
                    }
                    
                    // Only allow numbers, comma, and dot
                    const sanitizedValue = value.replace(/[^0-9.,]/g, '');
                    
                    // Normalize input: replace comma with dot for decimal parsing
                    const normalizedValue = sanitizedValue.replace(',', '.');
                    
                    // Parse as float first, then round to integer for percentage
                    const floatValue = parseFloat(normalizedValue);
                    const numValue = isNaN(floatValue) ? 0 : Math.round(floatValue);
                    
                    // Ensure value is within valid range (0-100)
                    const clampedValue = Math.max(0, Math.min(100, numValue));
                    field.onChange(clampedValue);
                  }}
                  onBlur={() => {
                    // Ensure display shows clean integer format when user leaves the field
                    if (field.value && field.value > 0) {
                      // This will trigger a re-render with clean integer display
                      field.onChange(field.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
