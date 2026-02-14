import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const translations = {
  en: {
    title: "Blog",
    subtitle: "Tips, strategies, and insights for SLE success",
    featured: "Featured",
    readMore: "Read More",
    minRead: "min read",
    categories: {
      all: "All Posts",
      sle: "SLE Tips",
      grammar: "Grammar",
      vocabulary: "Vocabulary",
      speaking: "Speaking",
      success: "Success Stories"
    },
    posts: [
      {
        id: 1,
        title: "5 Strategies to Ace Your SLE Oral Exam",
        excerpt: "Discover proven techniques used by successful candidates to achieve Level C in oral interaction. From managing nervousness to structuring your responses effectively.",
        category: "sle",
        date: "January 5, 2026",
        readTime: 8,
        featured: true,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-oral-exam.jpg"
      },
      {
        id: 2,
        title: "Common French Grammar Mistakes to Avoid",
        excerpt: "Learn about the most frequent grammatical errors English speakers make when learning French, and how to correct them before your SLE exam.",
        category: "grammar",
        date: "January 3, 2026",
        readTime: 6,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-grammar.jpg"
      },
      {
        id: 3,
        title: "Building Vocabulary for Federal Workplace Communication",
        excerpt: "Essential vocabulary and expressions for briefings, meetings, and written communications in the Canadian federal public service.",
        category: "vocabulary",
        date: "December 28, 2025",
        readTime: 7,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-vocabulary.jpg"
      },
      {
        id: 4,
        title: "From BBB to CBC: Marie's Success Story",
        excerpt: "How a policy analyst improved her French proficiency in just 6 months using Lingueefy coaches and SLE AI Companion AI.",
        category: "success",
        date: "December 20, 2025",
        readTime: 5,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-success.jpg"
      },
      {
        id: 5,
        title: "How to Practice Speaking When You're Shy",
        excerpt: "Practical tips for introverts and those who feel anxious about speaking a second language. Build confidence one step at a time.",
        category: "speaking",
        date: "December 15, 2025",
        readTime: 6,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-speaking.jpg"
      },
      {
        id: 6,
        title: "Understanding the SLE Scoring System",
        excerpt: "A complete breakdown of how SLE exams are scored and what evaluators look for at each level. Know exactly what you need to pass.",
        category: "sle",
        date: "December 10, 2025",
        readTime: 10,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-scoring.jpg"
      }
    ],
    subscribe: {
      title: "Subscribe to Our Newsletter",
      description: "Get weekly tips and resources for SLE preparation delivered to your inbox.",
      placeholder: "Enter your email",
      button: "Subscribe",
      privacy: "We respect your privacy. Unsubscribe at any time."
    },
    comingSoon: "Full article coming soon. Subscribe to be notified!"
  },
  fr: {
    title: "Blogue",
    subtitle: "Conseils, stratégies et perspectives pour réussir vos ELS",
    featured: "À la une",
    readMore: "Lire la suite",
    minRead: "min de lecture",
    categories: {
      all: "Tous les articles",
      sle: "Conseils ELS",
      grammar: "Grammaire",
      vocabulary: "Vocabulaire",
      speaking: "Expression orale",
      success: "Histoires de réussite"
    },
    posts: [
      {
        id: 1,
        title: "5 stratégies pour réussir votre examen oral ELS",
        excerpt: "Découvrez les techniques éprouvées utilisées par les candidats qui ont réussi à atteindre le niveau C en interaction orale. De la gestion du stress à la structuration efficace de vos réponses.",
        category: "sle",
        date: "5 janvier 2026",
        readTime: 8,
        featured: true,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-oral-exam.jpg"
      },
      {
        id: 2,
        title: "Erreurs de grammaire française courantes à éviter",
        excerpt: "Découvrez les erreurs grammaticales les plus fréquentes que font les anglophones en apprenant le français, et comment les corriger avant votre examen ELS.",
        category: "grammar",
        date: "3 janvier 2026",
        readTime: 6,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-grammar.jpg"
      },
      {
        id: 3,
        title: "Vocabulaire pour la communication en milieu de travail fédéral",
        excerpt: "Vocabulaire et expressions essentiels pour les séances d'information, les réunions et les communications écrites dans la fonction publique fédérale canadienne.",
        category: "vocabulary",
        date: "28 décembre 2025",
        readTime: 7,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-vocabulary.jpg"
      },
      {
        id: 4,
        title: "De BBB à CBC : L'histoire de réussite de Marie",
        excerpt: "Comment une analyste de politiques a amélioré sa maîtrise du français en seulement 6 mois en utilisant les coachs Lingueefy et SLE AI Companion.",
        category: "success",
        date: "20 décembre 2025",
        readTime: 5,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-success.jpg"
      },
      {
        id: 5,
        title: "Comment pratiquer l'oral quand on est timide",
        excerpt: "Conseils pratiques pour les introvertis et ceux qui se sentent anxieux à l'idée de parler une langue seconde. Développez votre confiance étape par étape.",
        category: "speaking",
        date: "15 décembre 2025",
        readTime: 6,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-speaking.jpg"
      },
      {
        id: 6,
        title: "Comprendre le système de notation ELS",
        excerpt: "Une analyse complète de la façon dont les examens ELS sont notés et ce que les évaluateurs recherchent à chaque niveau. Sachez exactement ce dont vous avez besoin pour réussir.",
        category: "sle",
        date: "10 décembre 2025",
        readTime: 10,
        featured: false,
        image: "https://rusingacademy-cdn.b-cdn.net/images/blog-scoring.jpg"
      }
    ],
    subscribe: {
      title: "Abonnez-vous à notre infolettre",
      description: "Recevez des conseils et des ressources hebdomadaires pour la préparation aux ELS directement dans votre boîte de réception.",
      placeholder: "Entrez votre courriel",
      button: "S'abonner",
      privacy: "Nous respectons votre vie privée. Désabonnez-vous à tout moment."
    },
    comingSoon: "Article complet à venir. Abonnez-vous pour être notifié!"
  }
};

export default function Blog() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const featuredPost = t.posts.find(post => post.featured);
  const regularPosts = t.posts.filter(post => !post.featured);
  
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
        
        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12">
            <div className="container max-w-6xl">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-primary/10 aspect-video md:aspect-auto flex items-center justify-center">
                    <div className="text-6xl">📚</div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit mb-4">
                      {t.featured}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {featuredPost.readTime} {t.minRead}
                      </span>
                    </div>
                    <button
                      onClick={() => alert(t.comingSoon)}
                      className="inline-flex items-center gap-2 text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded w-fit"
                    >
                      {t.readMore}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Blog Grid */}
        <section className="py-12">
          <div className="container max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-primary/5 aspect-video flex items-center justify-center">
                    <div className="text-4xl">
                      {post.category === 'grammar' && '📝'}
                      {post.category === 'vocabulary' && '📖'}
                      {post.category === 'success' && '🏆'}
                      {post.category === 'speaking' && '🎤'}
                      {post.category === 'sle' && '📋'}
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground mb-3">
                      {t.categories[post.category as keyof typeof t.categories]}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {post.readTime} {t.minRead}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter Subscribe */}
        <section className="py-16 bg-primary/5">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t.subscribe.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t.subscribe.description}
            </p>
            <form 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={(e) => { e.preventDefault(); alert(t.comingSoon); }}
            >
              <label htmlFor="email-subscribe" className="sr-only">Email</label>
              <input
                id="email-subscribe"
                type="email"
                placeholder={t.subscribe.placeholder}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t.subscribe.button}
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              {t.subscribe.privacy}
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
