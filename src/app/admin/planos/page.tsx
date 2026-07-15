"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { PLANS, type Plan } from "@/lib/plans";
import { COUPONS, DEFAULT_TRIAL_DAYS, type Coupon, type DiscountType } from "./_data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const emptyCouponForm = { code: "", discountType: "percentagem" as DiscountType, discountValue: "", maxUses: "", validUntil: "" };

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({ priceMonthly: "", contacts: "", channels: "", flows: "" });

  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);

  const [trialDays, setTrialDays] = useState(String(DEFAULT_TRIAL_DAYS));

  function openEditPlan(plan: Plan) {
    setEditingPlan(plan);
    setPlanForm({
      priceMonthly: plan.priceMonthly === null ? "" : String(plan.priceMonthly),
      contacts: plan.limits.contacts,
      channels: plan.limits.channels,
      flows: plan.limits.flows,
    });
    setPlanDialogOpen(true);
  }

  function savePlan() {
    if (!editingPlan) return;
    setPlans((prev) =>
      prev.map((p) =>
        p.slug === editingPlan.slug
          ? {
              ...p,
              priceMonthly: p.isCustomPrice ? null : Number(planForm.priceMonthly) || 0,
              limits: { contacts: planForm.contacts, channels: planForm.channels, flows: planForm.flows },
            }
          : p,
      ),
    );
    toast.success(`Plano ${editingPlan.name} atualizado`);
    setPlanDialogOpen(false);
  }

  function createCoupon() {
    if (!couponForm.code.trim() || !couponForm.discountValue || !couponForm.maxUses || !couponForm.validUntil) return;
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: couponForm.code.trim().toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      maxUses: Number(couponForm.maxUses),
      usedCount: 0,
      validUntil: new Date(couponForm.validUntil).toISOString(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    toast.success(`Cupão ${newCoupon.code} criado`);
    setCouponForm(emptyCouponForm);
    setCouponDialogOpen(false);
  }

  function removeCoupon(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cupão removido");
  }

  function saveTrialDays() {
    toast.success(`Período de teste gratuito definido para ${trialDays} dias`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Planos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gere os planos, cupões de desconto e períodos de teste gratuito.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.slug} className={cn(plan.highlighted && "ring-2 ring-primary")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlighted && <Badge className="border-0 bg-primary/10 text-primary">Popular</Badge>}
              </div>
              <CardDescription>{plan.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-3xl font-semibold">
                {plan.isCustomPrice ? "Personalizado" : plan.priceMonthly === 0 ? "Grátis" : `€${plan.priceMonthly}`}
                {!plan.isCustomPrice && plan.priceMonthly !== 0 && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
              </p>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Contactos</span><span className="font-medium">{plan.limits.contacts}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Canais</span><span className="font-medium">{plan.limits.channels}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fluxos</span><span className="font-medium">{plan.limits.flows}</span></div>
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
        ))}
      </div>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano {editingPlan?.name}</DialogTitle>
            <DialogDescription>Ajusta o preço e os limites deste plano.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {!editingPlan?.isCustomPrice && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-price">Preço mensal (€)</Label>
                <Input id="plan-price" type="number" min={0} value={planForm.priceMonthly} onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })} />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-contacts">Limite de contactos</Label>
              <Input id="plan-contacts" value={planForm.contacts} onChange={(e) => setPlanForm({ ...planForm, contacts: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-channels">Canais incluídos</Label>
              <Input id="plan-channels" value={planForm.channels} onChange={(e) => setPlanForm({ ...planForm, channels: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-flows">Limite de fluxos</Label>
              <Input id="plan-flows" value={planForm.flows} onChange={(e) => setPlanForm({ ...planForm, flows: e.target.value })} />
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
                  <TableHead>Usos</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => {
                  const expired = new Date(c.validUntil) < new Date("2026-07-15T12:00:00");
                  const exhausted = c.usedCount >= c.maxUses;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm font-medium">{c.code}</TableCell>
                      <TableCell className="text-sm">{c.discountType === "percentagem" ? `${c.discountValue}%` : `€${c.discountValue}`}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.usedCount} / {c.maxUses}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(c.validUntil)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant="outline" className={cn("border-0", expired || exhausted ? "bg-muted text-muted-foreground" : "bg-success/10 text-success")}>
                            {expired ? "Expirado" : exhausted ? "Esgotado" : "Ativo"}
                          </Badge>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeCoupon(c.id)} aria-label="Remover cupão">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Período de teste gratuito</CardTitle>
          <CardDescription>Número de dias de acesso Pro grátis oferecidos a novos clientes.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trial-days">Dias de teste</Label>
            <Input id="trial-days" type="number" min={0} value={trialDays} onChange={(e) => setTrialDays(e.target.value)} className="w-32" />
          </div>
          <Button onClick={saveTrialDays}>Guardar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
