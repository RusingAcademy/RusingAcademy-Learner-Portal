import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReferralDashboard from "@/components/ReferralDashboard";
import { Users } from "lucide-react";

export default function LearnerReferrals() {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              {isEn ? "Referral Program" : "Programme de parrainage"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isEn 
              ? "Invite friends and earn rewards when they join Lingueefy"
              : "Invitez des amis et gagnez des récompenses quand ils rejoignent Lingueefy"}
          </p>
        </div>
        
        {/* Referral Dashboard */}
        <ReferralDashboard />
      </main>
      
      <Footer />
    </div>
  );
}
