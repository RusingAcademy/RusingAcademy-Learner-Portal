/**
 * Hub.tsx - Page principale du Hub Ecosystem
 * 
 * Cette page intègre les 14 sections du composant EcosystemHub
 * tout en préservant le Header (via EcosystemLayout) et le Footer institutionnel.
 * 
 * Structure:
 * - Header: géré par EcosystemLayout (EcosystemHeaderGold + HubSubHeader)
 * - Body: EcosystemHubContent (14 sections du package de passation)
 * - Footer: FooterInstitutional
 */

import EcosystemHubContent from "./EcosystemHubSections";
import FooterInstitutional from "@/components/FooterInstitutional";
import SEO from "@/components/SEO";

export default function Hub() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="RusingAcademy Learning Ecosystem - Hub"
        description="Choose your path to bilingual excellence. SLE-focused learning, expert coaching, and premium media for Canadian public servants. Powered by Rusinga International Consulting Ltd."
        canonical="https://www.rusingacademy.ca"
      />
      
      {/* Main Content - 14 sections from EcosystemHub */}
      <EcosystemHubContent />
      
      {/* Footer Institutionnel */}
      <FooterInstitutional />
    </div>
  );
}
