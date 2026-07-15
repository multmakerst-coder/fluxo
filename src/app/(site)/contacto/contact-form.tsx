"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

const contactSchema = z.object({
  name: z.string().min(2, "Indica o teu nome completo."),
  email: z.string().email("Introduz um email válido."),
  subject: z.string().min(1, "Escolhe um assunto."),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const SUBJECTS = [
  { value: "vendas", label: "Vendas" },
  { value: "suporte", label: "Suporte técnico" },
  { value: "parcerias", label: "Parcerias" },
  { value: "outro", label: "Outro assunto" },
];

export function ContactForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("Mensagem enviada com sucesso! A nossa equipa entra em contacto em breve.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" placeholder="O teu nome" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="tu@empresa.pt" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">Assunto</Label>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="subject" className="w-full">
                <SelectValue placeholder="Escolhe um assunto" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          placeholder="Como podemos ajudar?"
          className="min-h-32"
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="h-11 gap-2 rounded-xl">
        {isSubmitting ? "A enviar…" : "Enviar mensagem"}
        <Send className="h-4 w-4" strokeWidth={1.75} />
      </Button>
    </form>
  );
}
