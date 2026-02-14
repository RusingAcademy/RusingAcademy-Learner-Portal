import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  CreditCard,
  Receipt,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function LearnerPayments() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isEn = language === "en";
  
  // Fetch past sessions (which include payment info)
  const { data: pastSessions = [], isLoading } = trpc.learner.pastSessions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const content = {
    en: {
      title: "Payment History",
      subtitle: "View your past payments and invoices",
      noPayments: "No payments yet",
      noPaymentsDesc: "Your payment history will appear here after you book your first session.",
      bookSession: "Book a Session",
      date: "Date",
      description: "Description",
      amount: "Amount",
      status: "Status",
      invoice: "Invoice",
      download: "Download",
      paid: "Paid",
      pending: "Pending",
      refunded: "Refunded",
      failed: "Failed",
      sessionWith: "Session with",
      totalSpent: "Total Spent",
      sessionsBooked: "Sessions Booked",
      lastPayment: "Last Payment",
      loginRequired: "Please sign in to view your payments",
      signIn: "Sign In",
    },
    fr: {
      title: "Historique des paiements",
      subtitle: "Consultez vos paiements et factures passés",
      noPayments: "Aucun paiement",
      noPaymentsDesc: "Votre historique de paiement apparaîtra ici après avoir réservé votre première séance.",
      bookSession: "Réserver une séance",
      date: "Date",
      description: "Description",
      amount: "Montant",
      status: "Statut",
      invoice: "Facture",
      download: "Télécharger",
      paid: "Payé",
      pending: "En attente",
      refunded: "Remboursé",
      failed: "Échoué",
      sessionWith: "Séance avec",
      totalSpent: "Total dépensé",
      sessionsBooked: "Séances réservées",
      lastPayment: "Dernier paiement",
      loginRequired: "Veuillez vous connecter pour voir vos paiements",
      signIn: "Se connecter",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  // Calculate stats
  const totalSpent = pastSessions.reduce((sum: number, s: any) => sum + (s.session?.price || 0), 0);
  const lastPaymentDate = pastSessions.length > 0 
    ? new Date(pastSessions[0]?.session?.createdAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA")
    : "-";
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(isEn ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.paid}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            {t.pending}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-blue-600">
            <RefreshCw className="h-3 w-3 mr-1" />
            {t.refunded}
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t.failed}
          </Badge>
        );
    }
  };
  
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.loginRequired}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  {t.signIn}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {!isInsideAppLayout && <Header />}
      
      <main className="flex-1 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pastSessions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t.noPayments}</h3>
                <p className="text-muted-foreground mb-6">{t.noPaymentsDesc}</p>
                <Link href="/coaches">
                  <Button>{t.bookSession}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                        <p className="text-xs text-muted-foreground">{t.totalSpent}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{pastSessions.length}</p>
                        <p className="text-xs text-muted-foreground">{t.sessionsBooked}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{lastPaymentDate}</p>
                        <p className="text-xs text-muted-foreground">{t.lastPayment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {t.date}
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {t.description}
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                            {t.amount}
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                            {t.status}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastSessions.map((item: any, index: number) => (
                          <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-4 px-4">
                              {formatDate(item.session?.scheduledAt || item.session?.createdAt)}
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">
                                  {t.sessionWith} {item.coachName || "Coach"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.session?.sessionType === "trial" 
                                    ? (isEn ? "Trial Session" : "Séance d'essai")
                                    : (isEn ? "Regular Session" : "Séance régulière")}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-medium">
                              {formatCurrency(item.session?.price || 0)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {getStatusBadge(item.session?.status || "completed")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
