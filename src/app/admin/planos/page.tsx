"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { toastSaved } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { PLANS, type PlanSlug } from "@/lib/plans";
import { createClient } from "@/lib/supabase/client";
import type { DiscountType } from "./_data";

interface PlanRow {
  id: string;
  slug: PlanSlug;
  name: string;
  price_monthly: number | null;
  price_yearly: number | null;
  contact_limit: number | null;
  channel_limit: number | null;
  flow_limit: number | null;
  features: string[];
  is_custom_price: boolean;
}

interface CouponRow {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  valid_until: string | null;
  max_redemptions: number | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatLimit(n: number | null, unit: string) {
  return n === null ? "Ilimitados" : `${n} ${unit}`;
}

const emptyCouponForm = { code: "", discountType: "percentagem" as DiscountType, discountValue: "", maxUses: "", validUntil: "" };

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null);
  const [planForm, setPlanForm] = useState({ priceMonthly: "", priceYearly: "", contacts: "", channels: "", flows: "", features: "" });

  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);

  async function loadPlans() {
    const supabase = createClient();
    const { data, error } = await supabase.from("plans").select("*").order("price_monthly", { ascending: true, nullsFirst: false });
    if (!error && data) setPlans(data as PlanRow[]);
    setLoadingPlans(false);
  }

  async function loadCoupons() {
    const supabase = createClient();
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (!error && data) setCoupons(data as CouponRow[]);
    setLoadingCoupons(false);
  }

  useEffect(() => {
    (async () => {
      await Promise.all([loadPlans(), loadCoupons()]);
    })();
  }, []);

  function openEditPlan(plan: PlanRow) {
    setEditingPlan(plan);
    setPlanForm({
      priceMonthly: plan.price_monthly === null ? "" : String(plan.price_monthly),
      priceYearly: plan.price_yearly === null ? "" : String(plan.price_yearly),
      contacts: plan.contact_limit === null ? "" : String(plan.contact_limit),
      channels: plan.channel_limit === null ? "" : String(plan.channel_limit),
      flows: plan.flow_limit === null ? "" : String(plan.flow_limit),
      features: plan.features.join("\n"),
    });
    setPlanDialogOpen(true);
  }

  async function savePlan() {
    if (!editingPlan) return;
    const supabase = createClient();

    const update = {
      price_monthly: editingPlan.is_custom_price ? null : Number(planForm.priceMonthly) || 0,
      price_yearly: editingPlan.is_custom_price ? null : Number(planForm.priceYearly) || 0,
      contact_limit: planForm.contacts.trim() === "" ? null : Number(planForm.contacts),
      channel_limit: planForm.channels.trim() === "" ? null : Number(planForm.channels),
      flow_limit: planForm.flows.trim() === "" ? null : Number(planForm.flows),
      features: planForm.features.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    const { data, error } = await supabase.from("plans").update(update).eq("id", editingPlan.id).select("*").single();

    if (error || !data) {
      toast.error("Não foi possível guardar o plano");
      return;
    }

    setPlans((prev) => prev.map((p) => (p.id === data.id ? (data as PlanRow) : p)));
    toastSaved(`Plano ${editingPlan.name} atualizado`);
    setPlanDialogOpen(false);
  }

  async function createCoupon() {
    if (!couponForm.code.trim() || !couponForm.discountValue || !couponForm.maxUses || !couponForm.validUntil) return;
    const supabase = createClient();

    const insert = {
      code: couponForm.code.trim().toUpperCase(),
      percent_off: couponForm.discountType === "percentagem" ? Number(couponForm.discountValue) : null,
      amount_off: couponForm.discountType === "valor" ? Number(couponForm.discountValue) : null,
      max_redemptions: Number(couponForm.maxUses),
      valid_until: new Date(couponForm.validUntil).toISOString(),
    };

    const { data, error } = await supabase.from("coupons").insert(insert).select("*").single();

    if (error || !data) {
      toast.error("Não foi possível criar o cupão (código já existe?)");
      return;
    }

    setCoupons((prev) => [data as CouponRow, ...prev]);
    toastSaved(`Cupão ${insert.code} criado`);
    setCouponForm(emptyCouponForm);
    setCouponDialogOpen(false);
  }

  async function removeCoupon(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível remover o cupão");
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cupão removido");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Planos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gere os planos e os cupões de desconto da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loadingPlans ? (
          <p className="text-sm text-muted-foreground">A carregar planos...</p>
        ) : (
          plans.map((plan) => {
            const staticMeta = PLANS.find((p) => p.slug === plan.slug);
            return (
              <Card key={plan.id} className={cn(staticMeta?.highlighted && "ring-2 ring-primary")}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {staticMeta?.highlighted && <Badge className="border-0 bg-primary/10 text-primary">Popular</Badge>}
                  </div>
                  {staticMeta?.tagline && <CardDescription>{staticMeta.tagline}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-3xl font-semibold">
                    {plan.is_custom_price ? "Personalizado" : plan.price_monthly === 0 ? "Grátis" : `€${plan.price_monthly}`}
                    {!plan.is_custom_price && plan.price_monthly !== 0 && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
                  </p>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Contactos</span><span className="font-medium">{formatLimit(plan.contact_limit, "contactos")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Canais</span><span className="font-medium">{formatLimit(plan.channel_limit, "canais")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fluxos</span><span className="font-medium">{formatLimit(plan.flow_limit, "fluxos")}</span></div>
                  </div>
                  <ul className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-muted-foreground">
                        <Check className="h-3.5 w-3.5 shrink-0 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" onClick={() => openEditPlan(plan)}>
                    <Pencil className="h-4 w-4" /> Editar limites e preço
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano {editingPlan?.name}</DialogTitle>
            <DialogDescription>Ajusta o preço, os limites e as funcionalidades deste plano.</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
            {!editingPlan?.is_custom_price && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plan-price-monthly">Preço mensal (€)</Label>
                  <Input id="plan-price-monthly" type="number" min={0} value={planForm.priceMonthly} onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plan-price-yearly">Preço anual (€)</Label>
                  <Input id="plan-price-yearly" type="number" min={0} value={planForm.priceYearly} onChange={(e) => setPlanForm({ ...planForm, priceYearly: e.target.value })} />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-contacts">Limite de contactos (vazio = ilimitado)</Label>
              <Input id="plan-contacts" type="number" min={0} value={planForm.contacts} onChange={(e) => setPlanForm({ ...planForm, contacts: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-channels">Nº de canais incluídos (vazio = ilimitado)</Label>
              <Input id="plan-channels" type="number" min={0} value={planForm.channels} onChange={(e) => setPlanForm({ ...planForm, channels: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-flows">Limite de fluxos (vazio = ilimitado)</Label>
              <Input id="plan-flows" type="number" min={0} value={planForm.flows} onChange={(e) => setPlanForm({ ...planForm, flows: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-features">Funcionalidades incluídas (uma por linha)</Label>
              <Textarea id="plan-features" rows={5} value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancelar</Button>
            <Button onClick={savePlan}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Cupões de desconto</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
              <DialogTrigger render={<Button><Plus className="h-4 w-4" /> Novo cupão</Button>} />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo cupão de desconto</DialogTitle>
                  <DialogDescription>Define o código e as condições do cupão.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="coupon-code">Código</Label>
                    <Input id="coupon-code" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} placeholder="Ex: VERAO2026" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Tipo de desconto</Label>
                      <Select value={couponForm.discountType} onValueChange={(v) => setCouponForm({ ...couponForm, discountType: (v ?? "percentagem") as DiscountType })}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentagem">Percentagem (%)</SelectItem>
                          <SelectItem value="valor">Valor fixo (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="coupon-value">{couponForm.discountType === "percentagem" ? "Percentagem" : "Valor (€)"}</Label>
                      <Input id="coupon-value" type="number" min={0} value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="coupon-max">Nº máximo de usos</Label>
                      <Input id="coupon-max" type="number" min={1} value={couponForm.maxUses} onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="coupon-valid">Válido até</Label>
                      <Input id="coupon-valid" type="date" value={couponForm.validUntil} onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCouponDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={createCoupon}>Criar cupão</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Limite de usos</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCoupons ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">A carregar cupões...</TableCell>
                  </TableRow>
                ) : coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Ainda não existem cupões.</TableCell>
                  </TableRow>
                ) : (
                  coupons.map((c) => {
                    const expired = c.valid_until ? new Date(c.valid_until) < new Date() : false;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm font-medium">{c.code}</TableCell>
                        <TableCell className="text-sm">{c.percent_off ? `${c.percent_off}%` : `€${c.amount_off}`}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.max_redemptions ?? "Ilimitado"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.valid_until ? formatDate(c.valid_until) : "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant="outline" className={cn("border-0", expired ? "bg-muted text-muted-foreground" : "bg-success/10 text-success")}>
                              {expired ? "Expirado" : "Ativo"}
                            </Badge>
                            <Button variant="ghost" size="icon-sm" onClick={() => removeCoupon(c.id)} aria-label="Remover cupão">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
