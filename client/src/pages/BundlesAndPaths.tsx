import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BookOpen, GraduationCap, Target, Award, ArrowRight, CheckCircle,
  Clock, Users, Star, Sparkles, Package, Layers, TrendingUp,
  Shield, Zap, Crown, ChevronRight, Gift, Percent,
} from "lucide-react";
import { motion } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import { PATH_SERIES_PRICES } from "@shared/pricing";

// Bundle definitions
const bundleData = [
  {
    id: "starter-bundle",
    name: "Starter Bundle",
    nameFr: "Forfait Débutant",
    description: "Perfect for beginners starting their bilingual journey. Includes Path I & II for a solid foundation.",
    descriptionFr: "Parfait pour les débutants commençant leur parcours bilingue. Inclut Path I & II pour une base solide.",
    paths: ["Path I: Foundations", "Path II: Everyday Fluency"],
    pathsFr: ["Path I: Fondations", "Path II: Aisance Quotidienne"],
    levels: "A1 → A2",
    duration: "8 Weeks",
    durationFr: "8 Semaines",
    originalPrice: 1798,
    bundlePrice: 1499,
    savings: 299,
    color: "from-emerald-500 to-teal-600",
    icon: "🌱",
    popular: false,
    features: [
      "2 complete Path Series courses",
      "60 hours structured learning",
      "Certificate for each Path",
      "Community access",
      "Downloadable resources",
    ],
    featuresFr: [
      "2 cours Path Series complets",
      "60 heures d'apprentissage structuré",
      "Certificat pour chaque Path",
      "Accès à la communauté",
      "Ressources téléchargeables",
    ],
  },
  {
    id: "professional-bundle",
    name: "Professional Bundle",
    nameFr: "Forfait Professionnel",
    description: "The most popular choice for public servants. Covers Path I through IV for comprehensive workplace bilingualism.",
    descriptionFr: "Le choix le plus populaire pour les fonctionnaires. Couvre Path I à IV pour un bilinguisme professionnel complet.",
    paths: ["Path I: Foundations", "Path II: Everyday Fluency", "Path III: Operational French", "Path IV: Strategic Expression"],
    pathsFr: ["Path I: Fondations", "Path II: Aisance Quotidienne", "Path III: Français Opérationnel", "Path IV: Expression Stratégique"],
    levels: "A1 → B2",
    duration: "16 Weeks",
    durationFr: "16 Semaines",
    originalPrice: 3596,
    bundlePrice: 2799,
    savings: 797,
    color: "from-[#C65A1E] to-amber-600",
    icon: "🏛️",
    popular: true,
    features: [
      "4 complete Path Series courses",
      "120 hours structured learning",
      "Certificate for each Path",
      "Priority community access",
      "All downloadable resources",
      "SLE preparation materials",
    ],
    featuresFr: [
      "4 cours Path Series complets",
      "120 heures d'apprentissage structuré",
      "Certificat pour chaque Path",
      "Accès prioritaire à la communauté",
      "Toutes les ressources téléchargeables",
      "Matériel de préparation SLE",
    ],
  },
  {
    id: "mastery-bundle",
    name: "Mastery Bundle",
    nameFr: "Forfait Maîtrise",
    description: "The complete journey from beginner to mastery. All 6 Paths for total bilingual excellence and SLE success.",
    descriptionFr: "Le parcours complet du débutant à la maîtrise. Les 6 Paths pour l'excellence bilingue totale et la réussite SLE.",
    paths: ["Path I: Foundations", "Path II: Everyday Fluency", "Path III: Operational French", "Path IV: Strategic Expression", "Path V: Professional Mastery", "Path VI: SLE Accelerator"],
    pathsFr: ["Path I: Fondations", "Path II: Aisance Quotidienne", "Path III: Français Opérationnel", "Path IV: Expression Stratégique", "Path V: Maîtrise Professionnelle", "Path VI: Accélérateur SLE"],
    levels: "A1 → C1+",
    duration: "24 Weeks",
    durationFr: "24 Semaines",
    originalPrice: 5394,
    bundlePrice: 3999,
    savings: 1395,
    color: "from-[#0F3D3E] to-emerald-700",
    icon: "👑",
    popular: false,
    features: [
      "All 6 Path Series courses",
      "180+ hours structured learning",
      "Certificate for each Path",
      "VIP community access",
      "All downloadable resources",
      "Complete SLE preparation",
      "1 free coaching session",
      "Priority support",
    ],
    featuresFr: [
      "Les 6 cours Path Series",
      "180+ heures d'apprentissage structuré",
      "Certificat pour chaque Path",
      "Accès VIP à la communauté",
      "Toutes les ressources téléchargeables",
      "Préparation SLE complète",
      "1 séance de coaching gratuite",
      "Support prioritaire",
    ],
  },
];

// Learning pathway definitions
const learningPathways = [
  {
    id: "sle-fast-track",
    name: "SLE Fast Track",
    nameFr: "Voie Rapide SLE",
    description: "Designed for public servants who need to pass their SLE exams quickly. Focused, intensive preparation.",
    descriptionFr: "Conçu pour les fonctionnaires qui doivent réussir leurs examens SLE rapidement. Préparation ciblée et intensive.",
    targetLevel: "BBB/CBC",
    duration: "12 Weeks",
    durationFr: "12 Semaines",
    courses: ["Path III", "Path IV", "Path VI"],
    icon: Target,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
  },
  {
    id: "career-advancement",
    name: "Career Advancement Path",
    nameFr: "Parcours Avancement de Carrière",
    description: "Build the bilingual skills needed for management positions. From intermediate to professional mastery.",
    descriptionFr: "Développez les compétences bilingues nécessaires pour les postes de gestion. De l'intermédiaire à la maîtrise professionnelle.",
    targetLevel: "B2 → C1",
    duration: "16 Weeks",
    durationFr: "16 Semaines",
    courses: ["Path III", "Path IV", "Path V"],
    icon: TrendingUp,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
  },
  {
    id: "complete-beginner",
    name: "Complete Beginner Journey",
    nameFr: "Parcours Débutant Complet",
    description: "Start from zero and build a strong foundation. Perfect for those new to French or English.",
    descriptionFr: "Commencez de zéro et construisez une base solide. Parfait pour ceux qui débutent en français ou en anglais.",
    targetLevel: "A1 → B1",
    duration: "12 Weeks",
    durationFr: "12 Semaines",
    courses: ["Path I", "Path II", "Path III"],
    icon: BookOpen,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-500",
  },
  {
    id: "executive-bilingualism",
    name: "Executive Bilingualism",
    nameFr: "Bilinguisme Exécutif",
    description: "For senior leaders who need to communicate with authority in both languages. Strategic and nuanced.",
    descriptionFr: "Pour les cadres supérieurs qui doivent communiquer avec autorité dans les deux langues. Stratégique et nuancé.",
    targetLevel: "B2 → C1+",
    duration: "8 Weeks",
    durationFr: "8 Semaines",
    courses: ["Path IV", "Path V"],
    icon: Crown,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-500",
  },
];

export default function BundlesAndPaths() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState("bundles");

  const handleBundlePurchase = (bundleId: string) => {
    if (!isAuthenticated) {
      toast.info(isEn ? "Please log in to purchase" : "Veuillez vous connecter pour acheter");
      window.location.href = getLoginUrl();
      return;
    }
    toast.info(isEn ? "Bundle checkout coming soon!" : "Paiement forfait bientôt disponible!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <EcosystemHeaderGold />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-br from-[#0F3D3E] via-[#145A5B] to-[#0F3D3E]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="container relative z-10 text-center">
            <Badge className="bg-[#C65A1E]/20 text-[#C65A1E] border-[#C65A1E]/30 mb-4">
              <Package className="h-3 w-3 mr-1" />
              {isEn ? "Save Up to 26% with Bundles" : "Économisez Jusqu'à 26% avec les Forfaits"}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ color: "#f8f7f7" }}>
              {isEn ? "Bundles & Learning Paths" : "Forfaits & Parcours d'Apprentissage"}
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto" style={{ color: "#ffffff" }}>
              {isEn
                ? "Choose a curated bundle for maximum savings, or follow a structured learning path designed for your specific career goals."
                : "Choisissez un forfait sélectionné pour des économies maximales, ou suivez un parcours d'apprentissage structuré conçu pour vos objectifs de carrière spécifiques."}
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-10">
                <TabsList className="bg-white shadow-md">
                  <TabsTrigger value="bundles" className="gap-2">
                    <Package className="h-4 w-4" />
                    {isEn ? "Course Bundles" : "Forfaits de Cours"}
                  </TabsTrigger>
                  <TabsTrigger value="paths" className="gap-2">
                    <Layers className="h-4 w-4" />
                    {isEn ? "Learning Paths" : "Parcours d'Apprentissage"}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Bundles Tab */}
              <TabsContent value="bundles">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {bundleData.map((bundle, index) => (
                    <motion.div
                      key={bundle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {bundle.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-[#C65A1E] text-white px-4 py-1 shadow-lg">
                            <Star className="h-3 w-3 mr-1 fill-white" />
                            {isEn ? "Most Popular" : "Le Plus Populaire"}
                          </Badge>
                        </div>
                      )}
                      <Card className={`h-full shadow-xl border-none overflow-hidden ${bundle.popular ? "ring-2 ring-[#C65A1E]" : ""}`}>
                        <div className={`bg-gradient-to-r ${bundle.color} p-6 text-white text-center`}>
                          <span className="text-3xl mb-2 block">{bundle.icon}</span>
                          <h3 className="text-xl font-bold mb-1">
                            {isEn ? bundle.name : bundle.nameFr}
                          </h3>
                          <p className="text-sm text-white/80">{bundle.levels}</p>
                          <div className="mt-3 flex items-center justify-center gap-2">
                            <span className="text-3xl font-bold">${bundle.bundlePrice}</span>
                            <span className="text-lg line-through opacity-60">${bundle.originalPrice}</span>
                          </div>
                          <Badge className="mt-2 bg-white/20 text-white">
                            <Gift className="h-3 w-3 mr-1" />
                            {isEn ? `Save $${bundle.savings}` : `Économisez ${bundle.savings}$`}
                          </Badge>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {isEn ? bundle.duration : bundle.durationFr}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0F3D3E] mb-2">
                              {isEn ? "Included Paths:" : "Paths Inclus:"}
                            </p>
                            <ul className="space-y-1">
                              {(isEn ? bundle.paths : bundle.pathsFr).map((path, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                  {path}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                              {isEn ? "Features" : "Caractéristiques"}
                            </p>
                            <ul className="space-y-1">
                              {(isEn ? bundle.features : bundle.featuresFr).map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Sparkles className="h-3 w-3 text-[#C65A1E] flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Button
                            className={`w-full ${bundle.popular ? "bg-[#C65A1E] hover:bg-[#A84A15]" : "bg-[#0F3D3E] hover:bg-[#0F3D3E]/90"} text-white`}
                            size="lg"
                            onClick={() => handleBundlePurchase(bundle.id)}
                          >
                            {isEn ? "Get This Bundle" : "Obtenir ce Forfait"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Comparison note */}
                <div className="text-center mt-10">
                  <p className="text-sm text-muted-foreground">
                    {isEn
                      ? "All bundles include lifetime access, certificates, and community membership."
                      : "Tous les forfaits incluent un accès à vie, des certificats et l'adhésion à la communauté."}
                  </p>
                  <Link href="/curriculum">
                    <Button variant="link" className="text-[#C65A1E]">
                      {isEn ? "Or purchase individual courses →" : "Ou achetez des cours individuels →"}
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              {/* Learning Paths Tab */}
              <TabsContent value="paths">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#0F3D3E] mb-2">
                      {isEn ? "Structured Learning Paths" : "Parcours d'Apprentissage Structurés"}
                    </h2>
                    <p className="text-muted-foreground">
                      {isEn
                        ? "Follow a curated sequence of courses designed for your specific goals and career stage."
                        : "Suivez une séquence de cours sélectionnée pour vos objectifs spécifiques et votre stade de carrière."}
                    </p>
                  </div>

                  {learningPathways.map((pathway, index) => {
                    const PathIcon = pathway.icon;
                    return (
                      <motion.div
                        key={pathway.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`border ${pathway.color} shadow-sm hover:shadow-md transition-shadow`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${pathway.color}`}>
                                <PathIcon className={`h-6 w-6 ${pathway.iconColor}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="text-lg font-bold text-[#0F3D3E]">
                                    {isEn ? pathway.name : pathway.nameFr}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {pathway.targetLevel}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {isEn ? pathway.description : pathway.descriptionFr}
                                </p>
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {isEn ? pathway.duration : pathway.durationFr}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    {pathway.courses.map((course, i) => (
                                      <span key={i}>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                          {course}
                                        </Badge>
                                        {i < pathway.courses.length - 1 && (
                                          <ChevronRight className="h-3 w-3 text-muted-foreground inline mx-0.5" />
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Link href="/curriculum">
                                <Button variant="outline" size="sm" className="border-[#0F3D3E] text-[#0F3D3E] hover:bg-[#0F3D3E]/5 flex-shrink-0">
                                  {isEn ? "View" : "Voir"}
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Why Bundles CTA */}
        <section className="py-16 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B]">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ color: "#f8f7f7" }}>
              {isEn ? "Not Sure Which to Choose?" : "Pas Sûr de Votre Choix?"}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8" style={{ color: "#ffffff" }}>
              {isEn
                ? "Take our free diagnostic assessment to find the perfect starting point for your bilingual journey."
                : "Passez notre évaluation diagnostique gratuite pour trouver le point de départ parfait pour votre parcours bilingue."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/sle-diagnostic">
                <Button size="lg" className="bg-[#C65A1E] hover:bg-[#A84A15] text-white">
                  {isEn ? "Take Free Assessment" : "Passer l'Évaluation Gratuite"}
                  <Target className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {isEn ? "Talk to an Advisor" : "Parler à un Conseiller"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <EcosystemFooter lang={isEn ? "en" : "fr"} theme="light" activeBrand="rusingacademy" />
    </div>
  );
}
