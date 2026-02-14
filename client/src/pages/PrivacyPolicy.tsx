import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Globe, FileText } from 'lucide-react';
import RusingAcademyLogo from '../components/RusingAcademyLogo';

const content = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy is important to us',
    lastUpdated: 'Last updated: January 10, 2026',
    backToHome: 'Back to Home',
    sections: [
      {
        icon: Shield,
        title: 'Introduction',
        content: `Rusinga International Consulting Ltd. ("we", "our", or "us") operates the RusingAcademy ecosystem, including Lingueefy and Barholex Media platforms. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our websites and use our services.

We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this policy or our practices with regards to your personal information, please contact us.`
      },
      {
        icon: Database,
        title: 'Information We Collect',
        content: `We collect information that you voluntarily provide to us when you register on our platforms, express interest in obtaining information about us or our products and services, participate in activities on our platforms, or otherwise contact us.

**Personal Information:** Name, email address, phone number, mailing address, professional credentials, and payment information.

**Usage Data:** Browser type, operating system, pages visited, time spent on pages, and other diagnostic data.

**Communication Data:** Records of correspondence when you contact us, including support requests and feedback.`
      },
      {
        icon: Eye,
        title: 'How We Use Your Information',
        content: `We use the information we collect for various purposes, including:

• To provide, operate, and maintain our services
• To improve, personalize, and expand our services
• To understand and analyze how you use our services
• To develop new products, services, features, and functionality
• To communicate with you about updates, offers, and promotional materials
• To process transactions and send related information
• To send administrative information, such as policy changes
• To find and prevent fraud and protect our legal rights`
      },
      {
        icon: Lock,
        title: 'Data Security',
        content: `We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. These measures include:

• Encryption of data in transit using SSL/TLS protocols
• Secure data storage with access controls
• Regular security assessments and updates
• Employee training on data protection practices

However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.`
      },
      {
        icon: Globe,
        title: 'Data Storage and Transfer',
        content: `Your information may be transferred to and maintained on computers located outside of your province, country, or other governmental jurisdiction where data protection laws may differ from those of your jurisdiction.

We primarily use cloud infrastructure services located in North America to store and process your data. By using our services, you consent to the transfer of your information to these facilities.

For users in Canada, we comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation.`
      },
      {
        icon: UserCheck,
        title: 'Your Privacy Rights',
        content: `Depending on your location, you may have certain rights regarding your personal information:

**Access:** You can request copies of your personal data.

**Rectification:** You can request that we correct any information you believe is inaccurate or complete information you believe is incomplete.

**Erasure:** You can request that we erase your personal data under certain conditions.

**Restrict Processing:** You can request that we restrict the processing of your personal data under certain conditions.

**Data Portability:** You can request that we transfer the data we have collected to another organization or directly to you.

To exercise any of these rights, please contact us using the information provided below.`
      },
      {
        icon: FileText,
        title: 'Cookies and Tracking',
        content: `We use cookies and similar tracking technologies to track activity on our platforms and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.

**Essential Cookies:** Required for the operation of our platforms.

**Analytics Cookies:** Help us understand how visitors interact with our platforms.

**Preference Cookies:** Remember your settings and preferences.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our services.`
      },
      {
        icon: Mail,
        title: 'Contact Us',
        content: `If you have questions or comments about this Privacy Policy, or if you wish to exercise your privacy rights, please contact us:

**Rusinga International Consulting Ltd.**
Email: privacy@rusingacademy.ca
Website: www.rusingacademy.ca

We will respond to your request within 30 days.`
      }
    ],
    footer: {
      copyright: '© 2026 Rusinga International Consulting Ltd. All rights reserved.',
      links: {
        terms: 'Terms of Service',
        cookies: 'Cookie Policy',
        accessibility: 'Accessibility'
      }
    }
  },
  fr: {
    title: 'Politique de confidentialité',
    subtitle: 'Votre vie privée est importante pour nous',
    lastUpdated: 'Dernière mise à jour : 10 janvier 2026',
    backToHome: 'Retour à l\'accueil',
    sections: [
      {
        icon: Shield,
        title: 'Introduction',
        content: `Rusinga International Consulting Ltd. (« nous », « notre » ou « nos ») exploite l'écosystème RusingAcademy, y compris les plateformes Lingueefy et Barholex Media. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez nos sites Web et utilisez nos services.

Nous nous engageons à protéger vos informations personnelles et votre droit à la vie privée. Si vous avez des questions ou des préoccupations concernant cette politique ou nos pratiques concernant vos informations personnelles, veuillez nous contacter.`
      },
      {
        icon: Database,
        title: 'Informations que nous collectons',
        content: `Nous collectons les informations que vous nous fournissez volontairement lorsque vous vous inscrivez sur nos plateformes, exprimez votre intérêt à obtenir des informations sur nous ou nos produits et services, participez à des activités sur nos plateformes, ou nous contactez autrement.

**Informations personnelles :** Nom, adresse courriel, numéro de téléphone, adresse postale, références professionnelles et informations de paiement.

**Données d'utilisation :** Type de navigateur, système d'exploitation, pages visitées, temps passé sur les pages et autres données de diagnostic.

**Données de communication :** Enregistrements de correspondance lorsque vous nous contactez, y compris les demandes d'assistance et les commentaires.`
      },
      {
        icon: Eye,
        title: 'Comment nous utilisons vos informations',
        content: `Nous utilisons les informations que nous collectons à diverses fins, notamment :

• Pour fournir, exploiter et maintenir nos services
• Pour améliorer, personnaliser et développer nos services
• Pour comprendre et analyser comment vous utilisez nos services
• Pour développer de nouveaux produits, services, fonctionnalités et fonctions
• Pour communiquer avec vous concernant les mises à jour, offres et documents promotionnels
• Pour traiter les transactions et envoyer les informations connexes
• Pour envoyer des informations administratives, telles que les changements de politique
• Pour détecter et prévenir la fraude et protéger nos droits légaux`
      },
      {
        icon: Lock,
        title: 'Sécurité des données',
        content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées conçues pour protéger la sécurité de toutes les informations personnelles que nous traitons. Ces mesures comprennent :

• Chiffrement des données en transit à l'aide des protocoles SSL/TLS
• Stockage sécurisé des données avec contrôles d'accès
• Évaluations et mises à jour régulières de la sécurité
• Formation des employés sur les pratiques de protection des données

Cependant, veuillez noter qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est sécurisée à 100 %. Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos informations personnelles, nous ne pouvons garantir leur sécurité absolue.`
      },
      {
        icon: Globe,
        title: 'Stockage et transfert des données',
        content: `Vos informations peuvent être transférées et conservées sur des ordinateurs situés en dehors de votre province, pays ou autre juridiction gouvernementale où les lois sur la protection des données peuvent différer de celles de votre juridiction.

Nous utilisons principalement des services d'infrastructure cloud situés en Amérique du Nord pour stocker et traiter vos données. En utilisant nos services, vous consentez au transfert de vos informations vers ces installations.

Pour les utilisateurs au Canada, nous nous conformons à la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) et à la législation provinciale applicable en matière de protection de la vie privée.`
      },
      {
        icon: UserCheck,
        title: 'Vos droits en matière de confidentialité',
        content: `Selon votre emplacement, vous pouvez avoir certains droits concernant vos informations personnelles :

**Accès :** Vous pouvez demander des copies de vos données personnelles.

**Rectification :** Vous pouvez demander que nous corrigions toute information que vous estimez inexacte ou que nous complétions les informations que vous estimez incomplètes.

**Effacement :** Vous pouvez demander que nous effacions vos données personnelles sous certaines conditions.

**Limitation du traitement :** Vous pouvez demander que nous limitions le traitement de vos données personnelles sous certaines conditions.

**Portabilité des données :** Vous pouvez demander que nous transférions les données que nous avons collectées à une autre organisation ou directement à vous.

Pour exercer l'un de ces droits, veuillez nous contacter en utilisant les informations fournies ci-dessous.`
      },
      {
        icon: FileText,
        title: 'Cookies et suivi',
        content: `Nous utilisons des cookies et des technologies de suivi similaires pour suivre l'activité sur nos plateformes et stocker certaines informations. Les cookies sont des fichiers contenant une petite quantité de données qui peuvent inclure un identifiant unique anonyme.

**Cookies essentiels :** Requis pour le fonctionnement de nos plateformes.

**Cookies analytiques :** Nous aident à comprendre comment les visiteurs interagissent avec nos plateformes.

**Cookies de préférence :** Mémorisent vos paramètres et préférences.

Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour indiquer quand un cookie est envoyé. Cependant, si vous n'acceptez pas les cookies, vous ne pourrez peut-être pas utiliser certaines parties de nos services.`
      },
      {
        icon: Mail,
        title: 'Nous contacter',
        content: `Si vous avez des questions ou des commentaires concernant cette politique de confidentialité, ou si vous souhaitez exercer vos droits en matière de confidentialité, veuillez nous contacter :

**Rusinga International Consulting Ltd.**
Courriel : privacy@rusingacademy.ca
Site Web : www.rusingacademy.ca

Nous répondrons à votre demande dans les 30 jours.`
      }
    ],
    footer: {
      copyright: '© 2026 Rusinga International Consulting Ltd. Tous droits réservés.',
      links: {
        terms: 'Conditions d\'utilisation',
        cookies: 'Politique des cookies',
        accessibility: 'Accessibilité'
      }
    }
  }
};

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <RusingAcademyLogo className="w-10 h-10" />
              <span className="text-white font-semibold text-lg hidden sm:block">RusingAcademy</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    lang === 'en' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('fr')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    lang === 'fr' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
                  }`}
                >
                  FR
                </button>
              </div>
              
              <Link
                to="/"
                className="text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                {t.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-2">
              {t.subtitle}
            </p>
            <p className="text-sm text-white/80">
              {t.lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <div className="space-y-8">
            {t.sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                        {section.title}
                      </h2>
                      <div className="text-white/70 leading-relaxed whitespace-pre-line prose prose-invert prose-sm max-w-none">
                        {section.content.split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className="mb-4 last:mb-0">
                            {paragraph.split('**').map((part, partIndex) => 
                              partIndex % 2 === 1 ? (
                                <strong key={partIndex} className="text-white font-semibold">{part}</strong>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm text-center sm:text-left">
              {t.footer.copyright}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-white/80 hover:text-white text-sm transition-colors">
                {t.footer.links.terms}
              </Link>
              <Link to="/cookies" className="text-white/80 hover:text-white text-sm transition-colors">
                {t.footer.links.cookies}
              </Link>
              <Link to="/accessibility" className="text-white/80 hover:text-white text-sm transition-colors">
                {t.footer.links.accessibility}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
