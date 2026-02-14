import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";

export default function BookingForm() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const labels = {
    en: {
      title: "Schedule Your Session",
      subtitle: "Book your SLE Diagnostic or consultation",
      formTitle: "Booking Information",
      formDescription: "Fill out the form below to schedule your session. We'll confirm within 24 hours.",
      name: "Full Name",
      namePlaceholder: "Enter your full name",
      email: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phone: "Phone Number (Optional)",
      phonePlaceholder: "+1 (613) 555-0123",
      serviceType: "What are you interested in?",
      serviceTypePlaceholder: "Select a service",
      services: {
        diagnostic: "SLE Oral Diagnostic",
        written: "SLE Written Diagnostic",
        coaching: "Coaching Package Inquiry",
        corporate: "Corporate Training Inquiry",
      },
      preferredDate: "Preferred Date (Optional)",
      preferredTime: "Preferred Time (Optional)",
      message: "Additional Information (Optional)",
      messagePlaceholder: "Tell us about your goals or any questions...",
      submit: "Schedule Session",
      submitting: "Scheduling...",
      success: "Session scheduled successfully!",
      error: "Failed to schedule session. Please try again.",
      required: "* Required field",
    },
    fr: {
      title: "Planifier votre séance",
      subtitle: "Réservez votre diagnostic ELS ou consultation",
      formTitle: "Informations de réservation",
      formDescription: "Remplissez le formulaire ci-dessous pour planifier votre séance. Nous confirmerons dans les 24 heures.",
      name: "Nom complet",
      namePlaceholder: "Entrez votre nom complet",
      email: "Adresse courriel",
      emailPlaceholder: "votre.courriel@exemple.com",
      phone: "Numéro de téléphone (Optionnel)",
      phonePlaceholder: "+1 (613) 555-0123",
      serviceType: "Qu'est-ce qui vous intéresse?",
      serviceTypePlaceholder: "Sélectionnez un service",
      services: {
        diagnostic: "Diagnostic ELS oral",
        written: "Diagnostic ELS écrit",
        coaching: "Demande de forfait coaching",
        corporate: "Demande de formation d'entreprise",
      },
      preferredDate: "Date préférée (Optionnel)",
      preferredTime: "Heure préférée (Optionnel)",
      message: "Informations supplémentaires (Optionnel)",
      messagePlaceholder: "Parlez-nous de vos objectifs ou de vos questions...",
      submit: "Planifier la séance",
      submitting: "Planification en cours...",
      success: "Séance planifiée avec succès!",
      error: "Échec de la planification. Veuillez réessayer.",
      required: "* Champ obligatoire",
    },
  };

  const l = labels[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.serviceType) {
      toast.error(language === 'en' ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store booking data (could be sent to backend)
      const bookingData = {
        ...formData,
        timestamp: new Date().toISOString(),
      };
      
      // Log for debugging
      console.log('Booking submitted:', bookingData);
      
      // Show success message
      toast.success(l.success);
      
      // Redirect to confirmation page
      setTimeout(() => {
        window.location.href = '/booking/confirmation';
      }, 500);
      
    } catch (error) {
      toast.error(l.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1">
        <Breadcrumb 
          items={[
            { label: "Booking", labelFr: "Réservation" }
          ]} 
        />

        {/* Hero Section */}
        <section className="py-12 lg:py-16 hero-gradient">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                {l.title}
              </h1>
              <p className="text-lg text-slate-900 dark:text-slate-100">
                {l.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-12 lg:py-16">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{l.formTitle}</CardTitle>
                  <CardDescription>{l.formDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {l.name} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder={l.namePlaceholder}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {l.email} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={l.emailPlaceholder}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {l.phone}
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={l.phonePlaceholder}
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Service Type */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">
                        {l.serviceType} <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.serviceType} onValueChange={handleSelectChange} disabled={isSubmitting}>
                        <SelectTrigger id="serviceType">
                          <SelectValue placeholder={l.serviceTypePlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diagnostic">{l.services.diagnostic}</SelectItem>
                          <SelectItem value="written">{l.services.written}</SelectItem>
                          <SelectItem value="coaching">{l.services.coaching}</SelectItem>
                          <SelectItem value="corporate">{l.services.corporate}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">
                        {l.preferredDate}
                      </Label>
                      <Input
                        id="preferredDate"
                        name="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Preferred Time */}
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">
                        {l.preferredTime}
                      </Label>
                      <Input
                        id="preferredTime"
                        name="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {l.message}
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={l.messagePlaceholder}
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Required Fields Note */}
                    <p className="text-sm text-slate-900 dark:text-slate-100">{l.required}</p>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#FF6A2B] to-[#ff8f5e] text-white border-0 px-8 py-6 text-base font-bold rounded-xl"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? l.submitting : l.submit}
                      <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 grid md:grid-cols-3 gap-4 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'Confirmation within 24h' : 'Confirmation dans 24h'}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'Expert coaches' : 'Coachs experts'}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'Personalized plan' : 'Plan personnalisé'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
