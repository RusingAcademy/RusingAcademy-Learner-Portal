import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Settings,
  Percent,
  TrendingDown,
  Shield,
  Users,
  Gift,
  Save,
  RefreshCw,
} from "lucide-react";

export default function AdminCommission() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const { language } = useLanguage();

  // Auth Guard
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-foundation)]"></div>
      </div>
    );
  }
  if (!user) return null;
  const [isSaving, setIsSaving] = useState(false);

  // Commission tier state
  const [tiers, setTiers] = useState([
    { id: 1, name: "Trial Sessions", minHours: 0, maxHours: 0, commissionRate: 0, isTrial: true },
    { id: 2, name: "Verified SLE Coach", minHours: 0, maxHours: null, commissionRate: 15, isVerified: true },
    { id: 3, name: "Standard (0-10 hrs)", minHours: 0, maxHours: 10, commissionRate: 26 },
    { id: 4, name: "Standard (10-30 hrs)", minHours: 10, maxHours: 30, commissionRate: 22 },
    { id: 5, name: "Standard (30-60 hrs)", minHours: 30, maxHours: 60, commissionRate: 19 },
    { id: 6, name: "Standard (60-100 hrs)", minHours: 60, maxHours: 100, commissionRate: 17 },
    { id: 7, name: "Standard (100+ hrs)", minHours: 100, maxHours: null, commissionRate: 15 },
  ]);

  const [referralDiscount, setReferralDiscount] = useState(21); // 26% - 21% = 5% commission for referrals
  const [referralEnabled, setReferralEnabled] = useState(true);

  const labels = {
    en: {
      title: "Commission Settings",
      subtitle: "Configure platform commission rates and referral bonuses",
      tiersTitle: "Commission Tiers",
      tiersDescription: "Set commission rates based on coach type and volume",
      tierName: "Tier Name",
      minHours: "Min Hours",
      maxHours: "Max Hours",
      rate: "Commission %",
      actions: "Actions",
      referralTitle: "Referral Program",
      referralDescription: "Configure commission discounts for coach referrals",
      referralEnabled: "Enable Referral Program",
      referralDiscount: "Commission Discount for Referrals",
      referralHelp: "Coaches who bring their own learners via referral link get this discount off their commission rate",
      save: "Save Changes",
      saving: "Saving...",
      saved: "Commission settings saved successfully",
      summaryTitle: "Commission Summary",
      trialNote: "Trial sessions: 0% commission (coach keeps 100%)",
      verifiedNote: "Verified SLE coaches: 15% flat commission",
      standardNote: "Standard coaches: 26% → 15% (decreases with volume)",
      referralNote: "Referral bookings: Additional discount applied",
    },
    fr: {
      title: "Paramètres de commission",
      subtitle: "Configurez les taux de commission de la plateforme et les bonus de parrainage",
      tiersTitle: "Niveaux de commission",
      tiersDescription: "Définissez les taux de commission en fonction du type de coach et du volume",
      tierName: "Nom du niveau",
      minHours: "Heures min",
      maxHours: "Heures max",
      rate: "Commission %",
      actions: "Actions",
      referralTitle: "Programme de parrainage",
      referralDescription: "Configurez les réductions de commission pour les parrainages de coachs",
      referralEnabled: "Activer le programme de parrainage",
      referralDiscount: "Réduction de commission pour les parrainages",
      referralHelp: "Les coachs qui amènent leurs propres apprenants via un lien de parrainage obtiennent cette réduction sur leur taux de commission",
      save: "Enregistrer les modifications",
      saving: "Enregistrement...",
      saved: "Paramètres de commission enregistrés avec succès",
      summaryTitle: "Résumé des commissions",
      trialNote: "Sessions d'essai : 0% de commission (le coach garde 100%)",
      verifiedNote: "Coachs ELS vérifiés : 15% de commission fixe",
      standardNote: "Coachs standard : 26% → 15% (diminue avec le volume)",
      referralNote: "Réservations par parrainage : Réduction supplémentaire appliquée",
    },
  };

  const l = labels[language];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(l.saved);
    setIsSaving(false);
  };

  const updateTierRate = (id: number, rate: number) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, commissionRate: rate } : t));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            {l.title}
          </h1>
          <p className="text-muted-foreground">{l.subtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trial</p>
                  <p className="text-xl font-bold text-emerald-600">0%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified SLE</p>
                  <p className="text-xl font-bold text-primary">15%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standard Start</p>
                  <p className="text-xl font-bold">26%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standard Min</p>
                  <p className="text-xl font-bold text-amber-600">15%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Tiers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              {l.tiersTitle}
            </CardTitle>
            <CardDescription>{l.tiersDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{l.tierName}</TableHead>
                  <TableHead>{l.minHours}</TableHead>
                  <TableHead>{l.maxHours}</TableHead>
                  <TableHead>{l.rate}</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>{tier.minHours}</TableCell>
                    <TableCell>{tier.maxHours ?? "∞"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tier.commissionRate}
                          onChange={(e) => updateTierRate(tier.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                          min={0}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tier.isTrial && (
                        <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>
                      )}
                      {tier.isVerified && (
                        <Badge className="bg-primary/10 text-primary">Verified</Badge>
                      )}
                      {!tier.isTrial && !tier.isVerified && (
                        <Badge variant="secondary">Standard</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {l.referralTitle}
            </CardTitle>
            <CardDescription>{l.referralDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{l.referralEnabled}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === "en" 
                    ? "Allow coaches to earn reduced commission on referred learners"
                    : "Permettre aux coachs de gagner une commission réduite sur les apprenants parrainés"}
                </p>
              </div>
              <Switch
                checked={referralEnabled}
                onCheckedChange={setReferralEnabled}
              />
            </div>

            {referralEnabled && (
              <div className="space-y-2">
                <Label>{l.referralDiscount}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={referralDiscount}
                    onChange={(e) => setReferralDiscount(parseInt(e.target.value) || 0)}
                    className="w-24"
                    min={0}
                    max={26}
                  />
                  <span className="text-muted-foreground">% discount</span>
                </div>
                <p className="text-sm text-muted-foreground">{l.referralHelp}</p>
                <div className="p-4 bg-muted rounded-lg mt-4">
                  <p className="text-sm">
                    <strong>Example:</strong> Standard coach at 26% commission with {referralDiscount}% referral discount = {26 - referralDiscount}% commission on referred bookings
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{l.summaryTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                {l.trialNote}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {l.verifiedNote}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                {l.standardNote}
              </li>
              {referralEnabled && (
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#C65A1E]" />
                  {l.referralNote}
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {l.saving}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {l.save}
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
