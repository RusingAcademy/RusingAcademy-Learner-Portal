import { useLanguage } from "@/contexts/LanguageContext";
import { Quote, Linkedin, ExternalLink } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  roleEn: string;
  organization: string;
  quote: string;
  quoteEn: string;
  image: string;
  linkedIn?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Mithula Naik",
    role: "Directrice de la croissance et de l'expérience client",
    roleEn: "Director of Growth and Client Experience",
    organization: "Canadian Digital Service",
    quote: "Si vous cherchez à apprendre de quelqu'un qui peut vous aider à atteindre votre plein potentiel en français, Steven est cette personne. J'ai travaillé avec Steven pendant plus d'un an, et il a joué un rôle essentiel dans le développement de mes compétences linguistiques en français.",
    quoteEn: "If you're looking to learn from someone who can help you reach your full potential in French, Steven is that person. I've worked with Steven for over a year now, and he played an integral role in helping me develop my French language skills. His compassion and understanding perfectly complement his vast theoretical and practical knowledge. Je parle beaucoup mieux le français grâce aux conseils de Steven, et n'importe qui aurait de la chance d'apprendre avec lui.",
    image: "/assets/testimonials/MithulaNaik.png",
    linkedIn: "https://www.linkedin.com/in/mithulanaik/",
  },
  {
    name: "Jena Cameron",
    role: "Gestionnaire, Programme de financement des petites entreprises du Canada",
    roleEn: "Manager, Canada Small Business Financing Program",
    organization: "Innovation, Science and Economic Development Canada",
    quote: "Parmi les dizaines de professeurs de langue que j'ai eus au fil des ans, je classerais Steven parmi les meilleurs. Il est sympathique et engageant, organisé et encourageant. Il m'a aidé à cibler les lacunes dans mes connaissances et m'a fourni un chemin clair.",
    quoteEn: "Among the dozens of language teachers I have had over the years, I would rank Steven among the best. He is personable and engaging, organized and encouraging. Critically, he helped me target gaps in my knowledge and provided a clear path and study resources to help me achieve my goals. Steven has a strong teaching background and communicates concepts clearly. On an institutional level, Steven developed and implemented a new language program in our Branch. There had been nothing in place and he left it well organized so that a new teacher could step in and take over seamlessly.",
    image: "/assets/testimonials/JenaCameron.png",
    linkedIn: "https://www.linkedin.com/in/jena-cameron-b0626470/?locale=en_US",
  },
  {
    name: "Edith Bramwell",
    role: "Présidente",
    roleEn: "Chairperson",
    organization: "Federal Public Sector Labour Relations and Employment Board",
    quote: "Excellente instruction en français langue seconde. Une approche patiente, réfléchie et personnalisée qui mène à une amélioration durable et plus de confiance. Hautement recommandé.",
    quoteEn: "Excellent French as a second language instruction. A patient, thoughtful and personalized approach that leads to lasting improvement and increased confidence. Highly recommended.",
    image: "/assets/testimonials/EdithBramwell.png",
    linkedIn: "https://www.linkedin.com/in/edith-bramwell-980746147/",
  },
  {
    name: "Scott Cantin",
    role: "Directeur exécutif, Réseau de la fierté de la fonction publique",
    roleEn: "Executive Director, Public Service Pride Network",
    organization: "Government of Canada",
    quote: "J'ai eu une consultation avec Steven avant un examen de langue seconde requis par mon travail. Steven est un excellent coach et conseiller. Il m'a donné des commentaires exploitables pendant la session et dans un rapport de suivi.",
    quoteEn: "I had a consultation with Steven in advance of a second language exam required by my work. Steven is an excellent coach and advisor and provided actionable feedback both during the session and in a follow-up report. Steven is highly knowledgeable in second language coaching and instruction, clear, helpful, and offers excellent advice. I highly recommend him for your language learning needs.",
    image: "/assets/testimonials/ScottCantin.png",
    linkedIn: "https://www.linkedin.com/in/2099hcj80j/",
  },
];

export default function TrustedByPublicServants() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-serif italic">
            {language === 'fr' ? 'La confiance des fonctionnaires' : 'Trusted by Public Servants'}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Découvrez les histoires de réussite de nos étudiants dans la fonction publique canadienne'
              : 'Discover the success stories of our students in the Canadian public service'}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center shadow-lg">
                <Quote className="h-5 w-5 text-white" fill="white" />
              </div>

              {/* Profile Image */}
              <div className="flex justify-center mb-6 pt-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden ring-4 ring-white shadow-lg">
                    <img 
                      loading="lazy" src={testimonial.image} 
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="h-full w-full bg-slate-400 flex items-center justify-center"><span class="text-3xl font-bold text-white">${testimonial.name.split(' ').map(n => n[0]).join('')}</span></div>`;
                      }}
                    />
                  </div>
                  {/* LinkedIn Badge */}
                  {testimonial.linkedIn && (
                    <a 
                      href={testimonial.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#0077B5] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      aria-label={`${testimonial.name} LinkedIn`}
                    >
                      <Linkedin className="h-4 w-4 text-white" />
                    </a>
                  )}
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-slate-600 text-sm leading-relaxed mb-6 italic min-h-[120px]">
                "{language === 'fr' ? testimonial.quote : testimonial.quoteEn}"
              </blockquote>

              {/* Author Info */}
              <div className="text-center border-t border-slate-100 pt-4">
                <p className="font-bold text-slate-900">{testimonial.name}</p>
                <p className="text-xs text-teal-600 font-medium mt-1">
                  {language === 'fr' ? testimonial.role : testimonial.roleEn}
                </p>
                <p className="text-xs text-slate-500 mt-1">{testimonial.organization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
