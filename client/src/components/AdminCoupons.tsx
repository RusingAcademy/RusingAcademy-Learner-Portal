import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ticket,
  Plus,
  Copy,
  Trash2,
  Edit,
  Calendar,
  Users,
  DollarSign,
  Percent,
  Gift,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  descriptionFr: string | null;
  discountType: "percentage" | "fixed_amount" | "free_trial";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  minPurchaseAmount: number | null;
  validFrom: Date;
  validUntil: Date | null;
  applicableTo: "all" | "trial" | "single" | "package";
  newUsersOnly: boolean;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminCoupons() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    descriptionFr: "",
    discountType: "percentage" as "percentage" | "fixed_amount" | "free_trial",
    discountValue: 10,
    maxUses: "",
    maxUsesPerUser: 1,
    minPurchaseAmount: "",
    validUntil: "",
    applicableTo: "all" as "all" | "trial" | "single" | "package",
    newUsersOnly: false,
  });
  
  const couponsQuery = trpc.admin.getCoupons.useQuery();
  const createCouponMutation = trpc.admin.createCoupon.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Coupon created successfully!" : "Coupon créé avec succès!");
      couponsQuery.refetch();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });
  
  const updateCouponMutation = trpc.admin.updateCoupon.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Coupon updated successfully!" : "Coupon mis à jour avec succès!");
      couponsQuery.refetch();
      setEditingCoupon(null);
      resetForm();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });
  
  const toggleCouponMutation = trpc.admin.toggleCoupon.useMutation({
    onSuccess: () => {
      couponsQuery.refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });
  
  const deleteCouponMutation = trpc.admin.deleteCoupon.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Coupon deleted!" : "Coupon supprimé!");
      couponsQuery.refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });
  
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      descriptionFr: "",
      discountType: "percentage",
      discountValue: 10,
      maxUses: "",
      maxUsesPerUser: 1,
      minPurchaseAmount: "",
      validUntil: "",
      applicableTo: "all",
      newUsersOnly: false,
    });
  };
  
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };
  
  const handleSubmit = () => {
    const data = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || null,
      descriptionFr: formData.descriptionFr || null,
      discountType: formData.discountType,
      discountValue: formData.discountType === "percentage" 
        ? formData.discountValue 
        : formData.discountValue * 100, // Convert to cents
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      maxUsesPerUser: formData.maxUsesPerUser,
      minPurchaseAmount: formData.minPurchaseAmount ? parseInt(formData.minPurchaseAmount) * 100 : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
      applicableTo: formData.applicableTo,
      newUsersOnly: formData.newUsersOnly,
    };
    
    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, ...data });
    } else {
      createCouponMutation.mutate(data);
    }
  };
  
  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      descriptionFr: coupon.descriptionFr || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountType === "percentage" 
        ? coupon.discountValue 
        : coupon.discountValue / 100,
      maxUses: coupon.maxUses?.toString() || "",
      maxUsesPerUser: coupon.maxUsesPerUser,
      minPurchaseAmount: coupon.minPurchaseAmount ? (coupon.minPurchaseAmount / 100).toString() : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split("T")[0] : "",
      applicableTo: coupon.applicableTo,
      newUsersOnly: coupon.newUsersOnly,
    });
  };
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(isEn ? "Code copied!" : "Code copié!");
  };
  
  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%`;
    } else if (coupon.discountType === "fixed_amount") {
      return `$${(coupon.discountValue / 100).toFixed(2)}`;
    } else {
      return isEn ? "Free Trial" : "Essai gratuit";
    }
  };
  
  const coupons = couponsQuery.data || [];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {isEn ? "Promo Coupons" : "Coupons promotionnels"}
            </CardTitle>
            <CardDescription>
              {isEn 
                ? "Create and manage promotional discount codes"
                : "Créer et gérer les codes de réduction promotionnels"}
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen || !!editingCoupon} onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setEditingCoupon(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {isEn ? "Create Coupon" : "Créer un coupon"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon 
                    ? (isEn ? "Edit Coupon" : "Modifier le coupon")
                    : (isEn ? "Create New Coupon" : "Créer un nouveau coupon")}
                </DialogTitle>
                <DialogDescription>
                  {isEn 
                    ? "Configure the promotional coupon settings"
                    : "Configurer les paramètres du coupon promotionnel"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Code */}
                <div className="space-y-2">
                  <Label>{isEn ? "Coupon Code" : "Code du coupon"}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="SUMMER2026"
                      className="font-mono"
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      {isEn ? "Generate" : "Générer"}
                    </Button>
                  </div>
                </div>
                
                {/* Name */}
                <div className="space-y-2">
                  <Label>{isEn ? "Name" : "Nom"}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={isEn ? "Summer Sale 2026" : "Soldes d'été 2026"}
                  />
                </div>
                
                {/* Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isEn ? "Description (EN)" : "Description (EN)"}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Get 20% off your first session"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isEn ? "Description (FR)" : "Description (FR)"}</Label>
                    <Textarea
                      value={formData.descriptionFr}
                      onChange={(e) => setFormData(prev => ({ ...prev, descriptionFr: e.target.value }))}
                      placeholder="Obtenez 20% de réduction sur votre première session"
                      rows={2}
                    />
                  </div>
                </div>
                
                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isEn ? "Discount Type" : "Type de réduction"}</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: "percentage" | "fixed_amount" | "free_trial") => 
                        setFormData(prev => ({ ...prev, discountType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <span className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            {isEn ? "Percentage" : "Pourcentage"}
                          </span>
                        </SelectItem>
                        <SelectItem value="fixed_amount">
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {isEn ? "Fixed Amount" : "Montant fixe"}
                          </span>
                        </SelectItem>
                        <SelectItem value="free_trial">
                          <span className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            {isEn ? "Free Trial" : "Essai gratuit"}
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.discountType !== "free_trial" && (
                    <div className="space-y-2">
                      <Label>
                        {formData.discountType === "percentage" 
                          ? (isEn ? "Discount (%)" : "Réduction (%)")
                          : (isEn ? "Discount ($)" : "Réduction ($)")}
                      </Label>
                      <Input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseInt(e.target.value) || 0 }))}
                        min={0}
                        max={formData.discountType === "percentage" ? 100 : undefined}
                      />
                    </div>
                  )}
                </div>
                
                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isEn ? "Max Total Uses" : "Utilisations max totales"}</Label>
                    <Input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                      placeholder={isEn ? "Unlimited" : "Illimité"}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isEn ? "Max Uses Per User" : "Utilisations max par utilisateur"}</Label>
                    <Input
                      type="number"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxUsesPerUser: parseInt(e.target.value) || 1 }))}
                      min={1}
                    />
                  </div>
                </div>
                
                {/* Min Purchase & Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isEn ? "Min Purchase ($)" : "Achat min ($)"}</Label>
                    <Input
                      type="number"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minPurchaseAmount: e.target.value }))}
                      placeholder={isEn ? "No minimum" : "Pas de minimum"}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isEn ? "Valid Until" : "Valide jusqu'au"}</Label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Applicable To */}
                <div className="space-y-2">
                  <Label>{isEn ? "Applicable To" : "Applicable à"}</Label>
                  <Select
                    value={formData.applicableTo}
                    onValueChange={(value: "all" | "trial" | "single" | "package") => 
                      setFormData(prev => ({ ...prev, applicableTo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isEn ? "All Sessions" : "Toutes les sessions"}</SelectItem>
                      <SelectItem value="trial">{isEn ? "Trial Sessions Only" : "Sessions d'essai uniquement"}</SelectItem>
                      <SelectItem value="single">{isEn ? "Single Sessions Only" : "Sessions individuelles uniquement"}</SelectItem>
                      <SelectItem value="package">{isEn ? "Packages Only" : "Forfaits uniquement"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* New Users Only */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{isEn ? "New Users Only" : "Nouveaux utilisateurs uniquement"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isEn 
                        ? "Only users who haven't made a purchase can use this coupon"
                        : "Seuls les utilisateurs n'ayant pas encore effectué d'achat peuvent utiliser ce coupon"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.newUsersOnly}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newUsersOnly: checked }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCoupon(null);
                  resetForm();
                }}>
                  {isEn ? "Cancel" : "Annuler"}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.code || !formData.name || createCouponMutation.isPending || updateCouponMutation.isPending}
                >
                  {(createCouponMutation.isPending || updateCouponMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCoupon 
                    ? (isEn ? "Update Coupon" : "Mettre à jour")
                    : (isEn ? "Create Coupon" : "Créer le coupon")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {couponsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isEn ? "No coupons created yet" : "Aucun coupon créé"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isEn ? "Code" : "Code"}</TableHead>
                  <TableHead>{isEn ? "Name" : "Nom"}</TableHead>
                  <TableHead>{isEn ? "Discount" : "Réduction"}</TableHead>
                  <TableHead>{isEn ? "Usage" : "Utilisation"}</TableHead>
                  <TableHead>{isEn ? "Valid Until" : "Valide jusqu'au"}</TableHead>
                  <TableHead>{isEn ? "Status" : "Statut"}</TableHead>
                  <TableHead className="text-right">{isEn ? "Actions" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* @ts-ignore - TS2345: auto-suppressed during TS cleanup */}
                {coupons.map((coupon: Coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{coupon.name}</p>
                        {coupon.newUsersOnly && (
                          <Badge variant="outline" className="mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            {isEn ? "New users" : "Nouveaux"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatDiscount(coupon)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {coupon.usedCount} / {coupon.maxUses || "∞"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {coupon.validUntil ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {isEn ? "No expiry" : "Sans expiration"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> {isEn ? "Active" : "Actif"}</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> {isEn ? "Inactive" : "Inactif"}</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCouponMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                        >
                          {coupon.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm(isEn ? "Delete this coupon?" : "Supprimer ce coupon?")) {
                              deleteCouponMutation.mutate({ id: coupon.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
