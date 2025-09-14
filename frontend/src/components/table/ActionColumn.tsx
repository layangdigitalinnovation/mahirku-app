import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

type Action = {
  label: string;
  onClick?: (values?: any) => void;
  variant?: "default" | "destructive";
  confirm?: boolean;
  description?: string;
  icon?: React.ReactNode;
  formSchema?: z.ZodType<any, any>; // jika ada → render form
  defaultValues?: Record<string, any>;
};

interface ActionColumnProps {
  actions: Action[];
}

export default function ActionColumn({ actions }: ActionColumnProps) {
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  const [formAction, setFormAction] = useState<Action | null>(null);

  const form = useForm<any>({
    resolver: formAction?.formSchema
      ? zodResolver(formAction.formSchema)
      : undefined,
    defaultValues: formAction?.defaultValues || {},
  });

  // reset setiap kali ganti formAction
  useEffect(() => {
    if (formAction) {
      form.reset(formAction.defaultValues || {});
    }
  }, [formAction, form]);

  const handleFormSubmit = form.handleSubmit(
    (values) => {
      formAction?.onClick?.(values);
      setFormAction(null);
      form.reset();
    },
    (errors) => {
      console.log("errors", errors);
      console.log("Values", form.getValues());
    }
  );

  return (
    <>
      <div className="flex items-center gap-1">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              action.variant === "destructive"
                ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => {
              if (action.formSchema) {
                setFormAction(action);
              } else if (action.confirm) {
                setConfirmAction(action);
              } else {
                action.onClick?.();
              }
            }}
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmAction(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                confirmAction?.onClick?.();
                setConfirmAction(null);
              }}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog */}
      <Dialog open={!!formAction} onOpenChange={() => setFormAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formAction?.label}</DialogTitle>
            <DialogDescription>{formAction?.description}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="tokenAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Token</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan jumlah token"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukkan jumlah token yang ingin ditambahkan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
