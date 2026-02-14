import { useLanguage } from "@/contexts/LanguageContext";
import { Linkedin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Expert {
  name: string;
  title: string;
  titleFr: string;
  company: string;
  bio: string;
  bioFr: string;
  image: string;
  linkedIn: string;
}

const experts: Expert[] = [
  {
    name: "Steven Barholere",
    title: "Visionary Founder & CEO",
    titleFr: "Fondateur visionnaire et PDG",
    company: "RusingAcademy",
    bio: "With over 15 years in adult training, Steven is a Government of Canada–certified specialist in bilingual education. He creates innovative learning solutions that help public servants succeed in official language evaluations. As a visionary leader, he transforms language training into practical tools for career growth.",
    bioFr: "Avec plus de 15 ans de formation pour adultes, Steven est un spécialiste certifié par le gouvernement du Canada en éducation bilingue. Il crée des solutions d'apprentissage innovantes qui aident les fonctionnaires à réussir leurs évaluations linguistiques officielles.",
    image: "/images/coaches/steven-barholere.jpg",
    linkedIn: "https://www.linkedin.com/in/stevenbarholere/",
  },
  {
    name: "Sue-Anne Richer",
    title: "Chief Learning Officer",
    titleFr: "Directrice de l'apprentissage",
    company: "RusingAcademy",
    bio: "Sue-Anne is an expert in designing educational programs tailored to government language evaluations. She guides professionals in mastering French through clear learning pathways and exam preparation. Her strength lies in making complex learning feel structured and achievable.",
    bioFr: "Sue-Anne est experte dans la conception de programmes éducatifs adaptés aux évaluations linguistiques gouvernementales. Elle guide les professionnels dans la maîtrise du français grâce à des parcours d'apprentissage clairs et une préparation aux examens.",
    image: "/images/coaches/sue-anne-richer.jpg",
    linkedIn: "https://www.linkedin.com/in/sue-anne-richer/",
  },
  {
    name: "Preciosa Baganha",
    title: "Chief People Officer",
    titleFr: "Directrice des ressources humaines",
    company: "Lingueefy",
    bio: "Preciosa specializes in bilingual talent development and career growth within the public sector. She matches learners with the right coaches and ensures a high-quality learning journey. Her work helps organizations and individuals build strong, bilingual teams.",
    bioFr: "Preciosa se spécialise dans le développement des talents bilingues et la croissance de carrière dans le secteur public. Elle jumelle les apprenants avec les bons coachs et assure un parcours d'apprentissage de haute qualité.",
    image: "/images/coaches/preciosa-baganha.jpg",
    linkedIn: "https://www.linkedin.com/in/preciosa-baganha/",
  },
  {
    name: "Erika Seguin",
    title: "Chief Bilingualism Campaigner",
    titleFr: "Directrice de la campagne pour le bilinguisme",
    company: "Barholex Media",
    bio: "Erika is a performance coach with a background in public service, education, psychology, and acting. She helps professionals overcome anxiety and perform with confidence in high-stakes settings like language tests, using science-based and stage-informed strategies.",
    bioFr: "Erika est une coach de performance avec une expérience dans la fonction publique, l'éducation, la psychologie et le théâtre. Elle aide les professionnels à surmonter l'anxiété et à performer avec confiance dans des situations à enjeux élevés.",
    image: "/images/coaches/erika-seguin.jpg",
    linkedIn: "https://www.linkedin.com/in/erika-seguin/",
  },
];

export default function MeetOurExperts() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 font-serif italic">
            {language === 'fr' ? 'Rencontrez nos experts' : 'Meet our experts'}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Une équipe d\'experts passionnés dédiés à votre réussite dans la fonction publique canadienne'
              : 'A team of passionate experts dedicated to your success in the Canadian public service'}
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experts.map((expert, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100"
            >
              {/* Photo with metallic frame effect */}
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* Metallic corner pins */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-inner z-10" />
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-inner z-10" />
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-inner z-10" />
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-inner z-10" />
                
                {/* Photo */}
                <img 
                  loading="lazy" src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Info Card */}
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-slate-900 mb-1 font-serif">
                  {expert.name}
                </h3>
                <p className="text-teal-600 font-medium text-sm mb-1">
                  {language === 'fr' ? expert.titleFr : expert.title}
                </p>
                <p className="text-slate-500 text-xs mb-4">
                  {expert.company}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-4">
                  {language === 'fr' ? expert.bioFr : expert.bio}
                </p>
                
                {/* LinkedIn Button */}
                <a 
                  href={expert.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white text-sm font-medium rounded-full hover:bg-[#006097] transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
