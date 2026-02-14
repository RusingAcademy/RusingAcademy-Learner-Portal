import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { MapPin, Clock, Users, Heart, Zap, Globe } from "lucide-react";

const translations = {
  en: {
    title: "Careers at Lingueefy",
    subtitle: "Join our mission to help Canadian public servants succeed",
    intro: {
      title: "Build the Future of Language Learning",
      description: "At Lingueefy, we're revolutionizing how federal public servants prepare for their SLE exams. We're a small, passionate team backed by Rusinga International Consulting Ltd., and we're looking for talented individuals who share our vision."
    },
    values: {
      title: "Our Values",
      items: [
        {
          icon: "heart",
          title: "Impact-Driven",
          description: "Every feature we build helps real people advance their careers in public service."
        },
        {
          icon: "users",
          title: "Bilingual First",
          description: "We practice what we preach — our team operates seamlessly in both English and French."
        },
        {
          icon: "zap",
          title: "Innovation",
          description: "We combine human expertise with AI to create learning experiences that actually work."
        },
        {
          icon: "globe",
          title: "Accessibility",
          description: "We build for everyone, ensuring our platform is inclusive and accessible to all."
        }
      ]
    },
    benefits: {
      title: "Why Join Us",
      items: [
        "Remote-first culture with flexible hours",
        "Competitive compensation",
        "Health and wellness benefits",
        "Professional development budget",
        "Work that makes a real difference",
        "Collaborative, supportive team environment"
      ]
    },
    positions: {
      title: "Open Positions",
      noPositions: "No open positions at the moment",
      checkBack: "We're always looking for talented individuals. Check back soon or send us your resume.",
      jobs: [
        {
          title: "Senior Full-Stack Developer",
          type: "Full-time",
          location: "Remote (Canada)",
          description: "Help us build and scale our marketplace platform using React, Node.js, and modern cloud technologies.",
          requirements: ["5+ years experience", "React/TypeScript", "Node.js", "PostgreSQL", "Bilingual (EN/FR) preferred"]
        },
        {
          title: "SLE Content Specialist",
          type: "Contract",
          location: "Remote (Canada)",
          description: "Create engaging practice materials and exam simulations aligned with Treasury Board SLE standards.",
          requirements: ["SLE Level C certified", "Teaching experience", "Content creation skills", "Federal workplace knowledge"]
        },
        {
          title: "Customer Success Manager",
          type: "Full-time",
          location: "Remote (Canada)",
          description: "Support our coaches and learners to ensure they have the best possible experience on Lingueefy.",
          requirements: ["3+ years customer success", "Excellent communication", "Bilingual (EN/FR) required", "EdTech experience a plus"]
        }
      ]
    },
    apply: {
      title: "Interested in Joining?",
      description: "Send your resume and a brief introduction to our team. We'd love to hear from you!",
      email: "careers@rusingacademy.ca",
      button: "Apply Now"
    }
  },
  fr: {
    title: "Carrières chez Lingueefy",
    subtitle: "Joignez-vous à notre mission d'aider les fonctionnaires canadiens à réussir",
    intro: {
      title: "Construisez l'avenir de l'apprentissage des langues",
      description: "Chez Lingueefy, nous révolutionnons la façon dont les fonctionnaires fédéraux se préparent à leurs examens ELS. Nous sommes une petite équipe passionnée soutenue par Rusinga International Consulting Ltd., et nous recherchons des personnes talentueuses qui partagent notre vision."
    },
    values: {
      title: "Nos valeurs",
      items: [
        {
          icon: "heart",
          title: "Axé sur l'impact",
          description: "Chaque fonctionnalité que nous créons aide de vraies personnes à faire avancer leur carrière dans la fonction publique."
        },
        {
          icon: "users",
          title: "Bilingue d'abord",
          description: "Nous pratiquons ce que nous prêchons — notre équipe fonctionne parfaitement en anglais et en français."
        },
        {
          icon: "zap",
          title: "Innovation",
          description: "Nous combinons l'expertise humaine avec l'IA pour créer des expériences d'apprentissage qui fonctionnent vraiment."
        },
        {
          icon: "globe",
          title: "Accessibilité",
          description: "Nous construisons pour tous, en veillant à ce que notre plateforme soit inclusive et accessible à tous."
        }
      ]
    },
    benefits: {
      title: "Pourquoi nous rejoindre",
      items: [
        "Culture axée sur le télétravail avec horaires flexibles",
        "Rémunération compétitive",
        "Avantages santé et bien-être",
        "Budget de développement professionnel",
        "Un travail qui fait une vraie différence",
        "Environnement d'équipe collaboratif et solidaire"
      ]
    },
    positions: {
      title: "Postes ouverts",
      noPositions: "Aucun poste ouvert pour le moment",
      checkBack: "Nous sommes toujours à la recherche de personnes talentueuses. Revenez bientôt ou envoyez-nous votre CV.",
      jobs: [
        {
          title: "Développeur Full-Stack Senior",
          type: "Temps plein",
          location: "Télétravail (Canada)",
          description: "Aidez-nous à construire et à faire évoluer notre plateforme de marché en utilisant React, Node.js et les technologies cloud modernes.",
          requirements: ["5+ ans d'expérience", "React/TypeScript", "Node.js", "PostgreSQL", "Bilingue (EN/FR) préféré"]
        },
        {
          title: "Spécialiste de contenu ELS",
          type: "Contrat",
          location: "Télétravail (Canada)",
          description: "Créez du matériel de pratique engageant et des simulations d'examens alignés sur les normes ELS du Conseil du Trésor.",
          requirements: ["Certifié niveau C ELS", "Expérience d'enseignement", "Compétences en création de contenu", "Connaissance du milieu fédéral"]
        },
        {
          title: "Gestionnaire de la réussite client",
          type: "Temps plein",
          location: "Télétravail (Canada)",
          description: "Soutenez nos coachs et apprenants pour leur assurer la meilleure expérience possible sur Lingueefy.",
          requirements: ["3+ ans en réussite client", "Excellente communication", "Bilingue (EN/FR) requis", "Expérience EdTech un atout"]
        }
      ]
    },
    apply: {
      title: "Intéressé à vous joindre à nous?",
      description: "Envoyez votre CV et une brève présentation à notre équipe. Nous serions ravis de vous entendre!",
      email: "careers@rusingacademy.ca",
      button: "Postuler maintenant"
    }
  }
};

const iconMap = {
  heart: Heart,
  users: Users,
  zap: Zap,
  globe: Globe
};

export default function Careers() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      
      <main className="flex-1" id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
        </section>
        
        {/* Intro */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {t.intro.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.intro.description}
            </p>
          </div>
        </section>
        
        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              {t.values.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.values.items.map((value, index) => {
                const Icon = iconMap[value.icon as keyof typeof iconMap];
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Benefits */}
        <section className="py-16">
          <div className="container max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              {t.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {t.benefits.items.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" aria-hidden="true" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Open Positions */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              {t.positions.title}
            </h2>
            
            {t.positions.jobs.length > 0 ? (
              <div className="space-y-6">
                {t.positions.jobs.map((job, index) => (
                  <div 
                    key={index}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" aria-hidden="true" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`mailto:${t.apply.email}?subject=Application: ${job.title}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 whitespace-nowrap"
                      >
                        {t.apply.button}
                      </a>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, reqIndex) => (
                        <span 
                          key={reqIndex}
                          className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-2">{t.positions.noPositions}</p>
                <p className="text-muted-foreground">{t.positions.checkBack}</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Apply CTA */}
        <section className="py-16">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t.apply.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t.apply.description}
            </p>
            <a
              href={`mailto:${t.apply.email}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t.apply.email}
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
