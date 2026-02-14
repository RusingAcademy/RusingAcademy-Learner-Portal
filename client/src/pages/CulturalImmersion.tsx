import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CulturalTopic {
  id: string;
  title: string;
  titleFr: string;
  category: string;
  description: string;
  descriptionFr: string;
  content: string;
  contentFr: string;
  icon: string;
  difficulty: string;
}

const CULTURAL_TOPICS: CulturalTopic[] = [
  {
    id: "bilingualism-canada",
    title: "Bilingualism in Canada",
    titleFr: "Le bilinguisme au Canada",
    category: "Government",
    description: "Understanding Canada's official bilingualism policy",
    descriptionFr: "Comprendre la politique de bilinguisme officiel du Canada",
    content: "Canada's Official Languages Act, first enacted in 1969 and revised in 1988, establishes English and French as the official languages of the federal government. This means that all federal institutions must provide services in both languages. The Commissioner of Official Languages oversees compliance. For public servants, this means understanding language rights, designated bilingual positions, and the importance of linguistic duality in the workplace.",
    contentFr: "La Loi sur les langues officielles du Canada, adoptée en 1969 et révisée en 1988, établit l'anglais et le français comme langues officielles du gouvernement fédéral. Cela signifie que toutes les institutions fédérales doivent offrir des services dans les deux langues. Le Commissaire aux langues officielles supervise la conformité. Pour les fonctionnaires, cela implique de comprendre les droits linguistiques, les postes bilingues désignés et l'importance de la dualité linguistique en milieu de travail.",
    icon: "🇨🇦",
    difficulty: "B1",
  },
  {
    id: "quebec-culture",
    title: "Québec Culture & Heritage",
    titleFr: "Culture et patrimoine du Québec",
    category: "Culture",
    description: "Exploring the rich cultural heritage of French-speaking Québec",
    descriptionFr: "Explorer le riche patrimoine culturel du Québec francophone",
    content: "Québec's culture is deeply rooted in its French heritage, with unique traditions in music (chansonnier tradition), cuisine (poutine, tourtière, sugar shack), festivals (Carnaval de Québec, Festival d'été), and arts. The Quiet Revolution of the 1960s transformed Québec society, leading to modernization while preserving French language and culture. Understanding Québécois expressions and cultural references is essential for effective communication in bilingual workplaces.",
    contentFr: "La culture du Québec est profondément enracinée dans son héritage français, avec des traditions uniques en musique (tradition chansonnière), cuisine (poutine, tourtière, cabane à sucre), festivals (Carnaval de Québec, Festival d'été) et arts. La Révolution tranquille des années 1960 a transformé la société québécoise, menant à la modernisation tout en préservant la langue et la culture françaises.",
    icon: "⚜️",
    difficulty: "B1",
  },
  {
    id: "francophone-communities",
    title: "Francophone Communities Outside Québec",
    titleFr: "Communautés francophones hors Québec",
    category: "Society",
    description: "Discovering vibrant French-speaking communities across Canada",
    descriptionFr: "Découvrir les communautés francophones dynamiques à travers le Canada",
    content: "Francophone communities thrive across Canada: the Acadians in New Brunswick and Nova Scotia, Franco-Ontarians in Ontario, Franco-Manitobans, Fransaskois in Saskatchewan, and others. Each community has its own history, dialect variations, and cultural traditions. The Canadian government supports these communities through programs like the Action Plan for Official Languages. Understanding this diversity enriches cross-cultural communication skills.",
    contentFr: "Les communautés francophones prospèrent à travers le Canada : les Acadiens au Nouveau-Brunswick et en Nouvelle-Écosse, les Franco-Ontariens en Ontario, les Franco-Manitobains, les Fransaskois en Saskatchewan, et d'autres. Chaque communauté a sa propre histoire, ses variations dialectales et ses traditions culturelles.",
    icon: "🗺️",
    difficulty: "B2",
  },
  {
    id: "workplace-etiquette",
    title: "Bilingual Workplace Etiquette",
    titleFr: "Étiquette en milieu de travail bilingue",
    category: "Professional",
    description: "Navigating language choice and cultural sensitivity at work",
    descriptionFr: "Naviguer le choix de langue et la sensibilité culturelle au travail",
    content: "In a bilingual federal workplace, language choice matters. Best practices include: greeting colleagues in their preferred language, offering to switch languages when needed, using both languages in meetings with mixed groups, and respecting the right to work in one's official language of choice. Understanding these nuances builds stronger professional relationships and demonstrates respect for Canada's linguistic duality.",
    contentFr: "Dans un milieu de travail fédéral bilingue, le choix de la langue est important. Les meilleures pratiques incluent : saluer les collègues dans leur langue préférée, offrir de changer de langue au besoin, utiliser les deux langues lors de réunions mixtes, et respecter le droit de travailler dans la langue officielle de son choix.",
    icon: "💼",
    difficulty: "B1",
  },
  {
    id: "french-media",
    title: "French-Language Media in Canada",
    titleFr: "Médias francophones au Canada",
    category: "Media",
    description: "Exploring French-language media for immersive learning",
    descriptionFr: "Explorer les médias francophones pour un apprentissage immersif",
    content: "Immersing yourself in French-language media is one of the most effective ways to improve fluency. Key resources include: Radio-Canada/CBC (news and entertainment), TV5 Monde, TOU.TV (streaming), Le Devoir and La Presse (newspapers), Balado Québec (podcasts), and ONF/NFB (documentaries). Regular exposure to authentic French content helps develop natural comprehension and cultural awareness.",
    contentFr: "S'immerger dans les médias francophones est l'un des moyens les plus efficaces d'améliorer sa maîtrise. Les ressources clés incluent : Radio-Canada/CBC, TV5 Monde, TOU.TV, Le Devoir et La Presse, Balado Québec, et l'ONF. L'exposition régulière au contenu français authentique aide à développer la compréhension naturelle et la conscience culturelle.",
    icon: "📺",
    difficulty: "A2",
  },
  {
    id: "canadian-french-expressions",
    title: "Canadian French Expressions",
    titleFr: "Expressions du français canadien",
    category: "Language",
    description: "Essential Québécois and Canadian French expressions",
    descriptionFr: "Expressions essentielles du français québécois et canadien",
    content: "Canadian French has many unique expressions: 'C'est correct' (it's fine), 'Pantoute' (not at all), 'Magasiner' (to shop), 'Char' (car), 'Dépanneur' (convenience store), 'Blonde/Chum' (girlfriend/boyfriend), 'Avoir du fun' (to have fun), 'Être tanné' (to be fed up). Understanding these expressions is crucial for natural communication in Canadian French-speaking environments, especially in informal workplace conversations.",
    contentFr: "Le français canadien possède de nombreuses expressions uniques : « C'est correct », « Pantoute » (pas du tout), « Magasiner » (faire du shopping), « Char » (voiture), « Dépanneur » (petit magasin), « Blonde/Chum » (petite amie/petit ami), « Avoir du fun » (s'amuser), « Être tanné » (en avoir assez).",
    icon: "💬",
    difficulty: "B1",
  },
];

export default function CulturalImmersion() {
  const { t, lang } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<CulturalTopic | null>(null);
  const [activeTab, setActiveTab] = useState("topics");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(CULTURAL_TOPICS.map(t => t.category)))];
  const filtered = filterCategory === "all"
    ? CULTURAL_TOPICS
    : CULTURAL_TOPICS.filter(t => t.category === filterCategory);

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cultural Immersion</h1>
        <p className="text-muted-foreground mt-1">
          Deepen your understanding of Canadian Francophone culture and bilingual workplace dynamics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="topics">Topics ({CULTURAL_TOPICS.length})</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          {selectedTopic ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setSelectedTopic(null)}>← Back to Topics</Button>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedTopic.icon}</span>
                    <div>
                      <CardTitle className="text-xl">
                        {lang === "fr" ? selectedTopic.titleFr : selectedTopic.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lang === "fr" ? selectedTopic.descriptionFr : selectedTopic.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedTopic.category}</Badge>
                    <Badge variant="outline">{selectedTopic.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">English</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedTopic.content}</p>
                  </div>
                  <hr />
                  <div>
                    <h3 className="font-semibold mb-2">Français</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedTopic.contentFr}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={filterCategory === cat ? "default" : "outline"}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat === "all" ? "All" : cat}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(topic => (
                  <Card
                    key={topic.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{topic.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {lang === "fr" ? topic.titleFr : topic.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {lang === "fr" ? topic.descriptionFr : topic.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{topic.category}</Badge>
                        <Badge variant="outline">{topic.difficulty}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Radio-Canada", desc: "National French-language broadcaster", url: "https://ici.radio-canada.ca", icon: "📻" },
              { title: "TOU.TV", desc: "French streaming platform", url: "https://ici.tou.tv", icon: "📺" },
              { title: "La Presse", desc: "Major French-language newspaper", url: "https://www.lapresse.ca", icon: "📰" },
              { title: "Le Devoir", desc: "Independent French newspaper", url: "https://www.ledevoir.com", icon: "📰" },
              { title: "ONF / NFB", desc: "National Film Board documentaries", url: "https://www.onf.ca", icon: "🎬" },
              { title: "Balado Québec", desc: "French-language podcasts", url: "https://baladoquebec.ca", icon: "🎙️" },
            ].map(resource => (
              <Card key={resource.title} className="hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{resource.icon}</span>
                    <div>
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">{resource.desc}</p>
                    </div>
                  </div>
                  <Button variant="link" className="mt-2 p-0 h-auto" onClick={() => window.open(resource.url, "_blank")}>
                    Visit →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
