import { useForm, SubmitHandler } from "react-hook-form";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Gunakan coerce.number() agar string "1", "2" dari Select otomatis jadi number
const userSchema = z.object({
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    fullname: z.string().min(2, "Nama lengkap minimal 2 karakter"),
    phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
    address: z.string().min(5, "Alamat minimal 5 karakter"),
    password: z.string().optional(),
    roleId: z.coerce.number().min(1, "Role harus dipilih"),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface Props {
    defaultValues?: Partial<UserFormValues>;
    onSubmit: (values: UserFormValues) => void;
    loading?: boolean;
    isEdit?: boolean;
}

export default function UserForm({
    defaultValues,
    onSubmit,
    loading,
    isEdit = false,
}: Props) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema) as any,
        defaultValues: {
            username: "",
            email: "",
            fullname: "",
            phoneNumber: "",
            address: "",
            password: "",
            roleId: 3, // Default User
            ...defaultValues,
        },
    });

    const handleSubmit: SubmitHandler<UserFormValues> = (values) => {
        // Jika edit dan password kosong, hapus field password agar tidak terupdate
        if (isEdit && !values.password) {
            const { password, ...rest } = values;
            onSubmit(rest as UserFormValues);
        } else {
            // Jika create dan password kosong, validasi manual (opsional, karena di backend biasanya required)
            if (!isEdit && !values.password) {
                form.setError("password", { message: "Password diperlukan" });
                return;
            }
            onSubmit(values);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fullname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
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
                                    <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} />
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
                                <FormLabel>Nomor Telepon</FormLabel>
                                <FormControl>
                                    <Input placeholder="08123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Alamat</FormLabel>
                            <FormControl>
                                <Input placeholder="Jl. Contoh No. 123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="roleId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value?.toString()}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Super Admin</SelectItem>
                                        <SelectItem value="2">Affiliator</SelectItem>
                                        <SelectItem value="3">User</SelectItem>
                                        <SelectItem value="4">Mitra</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password {isEdit && "(Kosongkan jika tidak diubah)"}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder={isEdit ? "********" : "Masukkan password"}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
