import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Link as LinkIcon,
  Copy,
  Mail,
  Share2,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function ReferralDashboard() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  
  const referralQuery = trpc.learner.getReferralStats.useQuery();
  const invitationsQuery = trpc.learner.getReferralInvitations.useQuery();
  
  const sendInviteMutation = trpc.learner.sendReferralInvite.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Invitation sent!" : "Invitation envoyée!");
      invitationsQuery.refetch();
      setIsInviteOpen(false);
      setInviteEmail("");
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });
  
  const copyReferralLink = () => {
    const link = referralQuery.data?.referralLink || "";
    navigator.clipboard.writeText(link);
    toast.success(isEn ? "Link copied to clipboard!" : "Lien copié dans le presse-papiers!");
  };
  
  const shareOnSocial = (platform: string) => {
    const link = referralQuery.data?.referralLink || "";
    const text = isEn 
      ? "Join me on Lingueefy and master your SLE exam! Use my referral link:"
      : "Rejoignez-moi sur Lingueefy et maîtrisez votre examen ELS! Utilisez mon lien de parrainage:";
    
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
        break;
    }
    window.open(url, "_blank", "width=600,height=400");
  };
  
  const stats = referralQuery.data || {
    referralCode: "",
    referralLink: "",
    totalInvites: 0,
    pendingInvites: 0,
    registeredInvites: 0,
    convertedInvites: 0,
    totalPointsEarned: 0,
    conversionRate: 0,
  };
  
  const invitations = invitationsQuery.data || [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{isEn ? "Pending" : "En attente"}</Badge>;
      case "clicked":
        return <Badge variant="secondary"><LinkIcon className="h-3 w-3 mr-1" />{isEn ? "Clicked" : "Cliqué"}</Badge>;
      case "registered":
        return <Badge className="bg-blue-500"><UserPlus className="h-3 w-3 mr-1" />{isEn ? "Registered" : "Inscrit"}</Badge>;
      case "converted":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{isEn ? "Converted" : "Converti"}</Badge>;
      case "expired":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{isEn ? "Expired" : "Expiré"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (referralQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            {isEn ? "Your Referral Link" : "Votre lien de parrainage"}
          </CardTitle>
          <CardDescription>
            {isEn 
              ? "Share this link with friends and earn rewards when they sign up!"
              : "Partagez ce lien avec vos amis et gagnez des récompenses quand ils s'inscrivent!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={stats.referralLink}
              readOnly
              className="font-mono text-sm bg-background"
            />
            <Button onClick={copyReferralLink}>
              <Copy className="h-4 w-4 mr-2" />
              {isEn ? "Copy" : "Copier"}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => shareOnSocial("twitter")}>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={() => shareOnSocial("facebook")}>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={() => shareOnSocial("linkedin")}>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </Button>
            
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {isEn ? "Invite by Email" : "Inviter par email"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEn ? "Send Invitation" : "Envoyer une invitation"}</DialogTitle>
                  <DialogDescription>
                    {isEn 
                      ? "Enter your friend's email to send them a personalized invitation"
                      : "Entrez l'email de votre ami pour lui envoyer une invitation personnalisée"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{isEn ? "Email Address" : "Adresse email"}</Label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                    />
                  </div>
                  <Button 
                    onClick={() => sendInviteMutation.mutate({ email: inviteEmail })}
                    disabled={!inviteEmail || sendInviteMutation.isPending}
                    className="w-full"
                  >
                    {sendInviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isEn ? "Send Invitation" : "Envoyer l'invitation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalInvites}</p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Total Invites" : "Invitations totales"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingInvites}</p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Pending" : "En attente"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.convertedInvites}</p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Converted" : "Convertis"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E7F2F2] rounded-lg">
                <Gift className="h-5 w-5 text-[#0F3D3E]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPointsEarned}</p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Points Earned" : "Points gagnés"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isEn ? "Conversion Rate" : "Taux de conversion"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{isEn ? "Invites → Conversions" : "Invitations → Conversions"}</span>
              <span className="font-medium">{stats.conversionRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.conversionRate} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {isEn 
                ? `${stats.convertedInvites} out of ${stats.totalInvites} invites converted to paying customers`
                : `${stats.convertedInvites} sur ${stats.totalInvites} invitations converties en clients payants`}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Rewards Info */}
      <Card className="bg-gradient-to-br from-[#FFF8F3] to-[#FFF8F3] border-[#FFE4D6]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Gift className="h-5 w-5" />
            {isEn ? "Referral Rewards" : "Récompenses de parrainage"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">
                {isEn ? "You Get" : "Vous recevez"}
              </h4>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "500 points when friend signs up" : "500 points quand un ami s'inscrit"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "1000 points when friend books first session" : "1000 points quand un ami réserve sa première session"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "5% commission on friend's purchases (first year)" : "5% de commission sur les achats de l'ami (première année)"}
                </li>
              </ul>
            </div>
            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">
                {isEn ? "Your Friend Gets" : "Votre ami reçoit"}
              </h4>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "250 bonus points on signup" : "250 points bonus à l'inscription"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "10% off first session" : "10% de réduction sur la première session"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "Free trial session" : "Session d'essai gratuite"}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Invitations History */}
      <Card>
        <CardHeader>
          <CardTitle>{isEn ? "Invitation History" : "Historique des invitations"}</CardTitle>
          <CardDescription>
            {isEn 
              ? "Track the status of all your referral invitations"
              : "Suivez le statut de toutes vos invitations de parrainage"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitationsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isEn ? "No invitations sent yet" : "Aucune invitation envoyée"}</p>
              <p className="text-sm mt-2">
                {isEn 
                  ? "Share your referral link to start earning rewards!"
                  : "Partagez votre lien de parrainage pour commencer à gagner des récompenses!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isEn ? "Email" : "Email"}</TableHead>
                    <TableHead>{isEn ? "Method" : "Méthode"}</TableHead>
                    <TableHead>{isEn ? "Status" : "Statut"}</TableHead>
                    <TableHead>{isEn ? "Points Earned" : "Points gagnés"}</TableHead>
                    <TableHead>{isEn ? "Date" : "Date"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        {inv.inviteeEmail || (
                          <span className="text-muted-foreground italic">
                            {isEn ? "Link share" : "Partage de lien"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {inv.inviteMethod === "email" && <Mail className="h-3 w-3 mr-1" />}
                          {inv.inviteMethod === "link" && <LinkIcon className="h-3 w-3 mr-1" />}
                          {inv.inviteMethod === "social" && <Share2 className="h-3 w-3 mr-1" />}
                          {inv.inviteMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell>
                        {inv.referrerRewardPoints > 0 ? (
                          <span className="text-green-600 font-medium">
                            +{inv.referrerRewardPoints}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
