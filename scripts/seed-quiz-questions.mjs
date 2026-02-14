/**
 * Seed Quiz Questions for all 21 quiz lessons across 6 Path Series
 * Each quiz will have 5-10 questions appropriate to the CEFR level
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Quiz questions organized by lesson ID
const quizQuestions = {
  // =====================================================
  // PATH I: FSL - Foundations (A1) - Course 1
  // =====================================================
  
  // Lesson 5: Pronunciation Practice Quiz (Module 1)
  5: [
    {
      questionText: "Which French sound is represented by the letter combination 'ou'?",
      questionTextFr: "Quel son français est représenté par la combinaison de lettres 'ou'?",
      questionType: "multiple_choice",
      options: JSON.stringify(["oo (as in 'boot')", "ow (as in 'cow')", "oh (as in 'go')", "uh (as in 'but')"]),
      correctAnswer: "oo (as in 'boot')",
      explanation: "The French 'ou' makes the sound /u/, similar to 'oo' in English 'boot'.",
      explanationFr: "Le 'ou' français fait le son /u/, similaire au 'oo' anglais dans 'boot'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "How is the French 'r' typically pronounced?",
      questionTextFr: "Comment le 'r' français est-il généralement prononcé?",
      questionType: "multiple_choice",
      options: JSON.stringify(["At the back of the throat (uvular)", "With the tip of the tongue (alveolar)", "Silent", "Like the English 'r'"]),
      correctAnswer: "At the back of the throat (uvular)",
      explanation: "The French 'r' is a uvular sound, produced at the back of the throat.",
      explanationFr: "Le 'r' français est un son uvulaire, produit à l'arrière de la gorge.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "In French, final consonants are usually:",
      questionTextFr: "En français, les consonnes finales sont généralement:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Silent", "Pronounced strongly", "Doubled", "Aspirated"]),
      correctAnswer: "Silent",
      explanation: "Most final consonants in French are silent, with exceptions like C, R, F, L (CaReFuL).",
      explanationFr: "La plupart des consonnes finales en français sont muettes, avec des exceptions comme C, R, F, L.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The French nasal sound 'an/en' is similar to:",
      questionTextFr: "Le son nasal français 'an/en' est similaire à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["The 'on' in 'song' (nasalized)", "The 'an' in 'can'", "The 'en' in 'pen'", "The 'un' in 'sun'"]),
      correctAnswer: "The 'on' in 'song' (nasalized)",
      explanation: "French nasal vowels are produced by letting air flow through the nose while pronouncing the vowel.",
      explanationFr: "Les voyelles nasales françaises sont produites en laissant l'air passer par le nez.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The French 'u' sound (as in 'tu') requires:",
      questionTextFr: "Le son 'u' français (comme dans 'tu') nécessite:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Rounded lips with tongue forward", "Flat lips with tongue back", "Open mouth", "Closed teeth"]),
      correctAnswer: "Rounded lips with tongue forward",
      explanation: "The French 'u' /y/ is made by rounding the lips while keeping the tongue forward, like saying 'ee' with rounded lips.",
      explanationFr: "Le 'u' français /y/ se fait en arrondissant les lèvres tout en gardant la langue vers l'avant.",
      points: 15,
      difficulty: "medium"
    }
  ],

  // Lesson 12: Grammar Foundations Quiz (Module 2)
  12: [
    {
      questionText: "What is the correct article for 'table' in French?",
      questionTextFr: "Quel est l'article correct pour 'table' en français?",
      questionType: "multiple_choice",
      options: JSON.stringify(["la table", "le table", "l'table", "les table"]),
      correctAnswer: "la table",
      explanation: "'Table' is feminine in French, so it takes the feminine article 'la'.",
      explanationFr: "'Table' est féminin en français, donc il prend l'article féminin 'la'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "How do you say 'I am' in French?",
      questionTextFr: "Comment dit-on 'I am' en français?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je suis", "J'ai", "Je vais", "Je fais"]),
      correctAnswer: "Je suis",
      explanation: "'Je suis' is the first person singular of the verb 'être' (to be).",
      explanationFr: "'Je suis' est la première personne du singulier du verbe 'être'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "Which verb ending indicates the infinitive form for -ER verbs?",
      questionTextFr: "Quelle terminaison verbale indique la forme infinitive des verbes en -ER?",
      questionType: "multiple_choice",
      options: JSON.stringify(["-er", "-é", "-ez", "-ons"]),
      correctAnswer: "-er",
      explanation: "The infinitive form of -ER verbs ends in '-er' (parler, manger, travailler).",
      explanationFr: "La forme infinitive des verbes en -ER se termine par '-er' (parler, manger, travailler).",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "What is the correct conjugation of 'parler' for 'nous'?",
      questionTextFr: "Quelle est la conjugaison correcte de 'parler' pour 'nous'?",
      questionType: "multiple_choice",
      options: JSON.stringify(["nous parlons", "nous parlez", "nous parlent", "nous parle"]),
      correctAnswer: "nous parlons",
      explanation: "For 'nous', -ER verbs take the ending '-ons': nous parlons.",
      explanationFr: "Pour 'nous', les verbes en -ER prennent la terminaison '-ons': nous parlons.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The plural of 'un livre' is:",
      questionTextFr: "Le pluriel de 'un livre' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["des livres", "les livre", "des livre", "un livres"]),
      correctAnswer: "des livres",
      explanation: "The indefinite plural article is 'des', and most nouns add 's' for plural.",
      explanationFr: "L'article indéfini pluriel est 'des', et la plupart des noms ajoutent 's' au pluriel.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "In French, adjectives generally come:",
      questionTextFr: "En français, les adjectifs viennent généralement:",
      questionType: "multiple_choice",
      options: JSON.stringify(["After the noun", "Before the noun", "At the beginning of the sentence", "At the end of the sentence"]),
      correctAnswer: "After the noun",
      explanation: "Most French adjectives follow the noun, unlike English (une voiture rouge = a red car).",
      explanationFr: "La plupart des adjectifs français suivent le nom, contrairement à l'anglais.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // Lesson 27: Reading Comprehension Quiz (Module 5)
  27: [
    {
      questionText: "What does 'Bonjour, comment allez-vous?' mean?",
      questionTextFr: "Que signifie 'Bonjour, comment allez-vous?' en anglais?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Hello, how are you?", "Goodbye, see you later", "Good evening, where are you?", "Hello, what is your name?"]),
      correctAnswer: "Hello, how are you?",
      explanation: "'Bonjour' means 'hello/good day' and 'comment allez-vous' is the formal way to ask 'how are you'.",
      explanationFr: "'Bonjour' signifie 'hello/good day' et 'comment allez-vous' est la façon formelle de demander 'how are you'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "In a French email, 'Cordialement' is used as:",
      questionTextFr: "Dans un courriel français, 'Cordialement' est utilisé comme:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A closing/sign-off", "A greeting", "A subject line", "An attachment note"]),
      correctAnswer: "A closing/sign-off",
      explanation: "'Cordialement' is a professional email closing, similar to 'Best regards' in English.",
      explanationFr: "'Cordialement' est une formule de clôture professionnelle, similaire à 'Best regards' en anglais.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "What does 'Je travaille au gouvernement fédéral' mean?",
      questionTextFr: "Que signifie 'Je travaille au gouvernement fédéral'?",
      questionType: "multiple_choice",
      options: JSON.stringify(["I work for the federal government", "I travel to the federal building", "I study government policy", "I live near the government"]),
      correctAnswer: "I work for the federal government",
      explanation: "'Je travaille' means 'I work' and 'au gouvernement fédéral' means 'for/at the federal government'.",
      explanationFr: "'Je travaille' signifie 'I work' et 'au gouvernement fédéral' signifie 'for/at the federal government'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The phrase 'Veuillez trouver ci-joint' is commonly used to:",
      questionTextFr: "L'expression 'Veuillez trouver ci-joint' est couramment utilisée pour:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Indicate an attachment", "Request a meeting", "Ask for information", "Confirm receipt"]),
      correctAnswer: "Indicate an attachment",
      explanation: "'Veuillez trouver ci-joint' means 'Please find attached' in formal correspondence.",
      explanationFr: "'Veuillez trouver ci-joint' signifie 'Please find attached' dans la correspondance formelle.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "What is the meaning of 'réunion' in a workplace context?",
      questionTextFr: "Quelle est la signification de 'réunion' dans un contexte professionnel?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Meeting", "Reunion (family)", "Restaurant", "Reception"]),
      correctAnswer: "Meeting",
      explanation: "In a workplace context, 'réunion' refers to a meeting, not a family reunion.",
      explanationFr: "Dans un contexte professionnel, 'réunion' fait référence à une réunion de travail.",
      points: 10,
      difficulty: "easy"
    }
  ],

  // Lesson 29: Comprehensive Practice Test (Module 6)
  29: [
    {
      questionText: "Choose the correct form: 'Elle ___ française.'",
      questionTextFr: "Choisissez la forme correcte: 'Elle ___ française.'",
      questionType: "multiple_choice",
      options: JSON.stringify(["est", "es", "suis", "sont"]),
      correctAnswer: "est",
      explanation: "'Elle' (she) takes the third person singular form 'est' of the verb 'être'.",
      explanationFr: "'Elle' prend la forme de la troisième personne du singulier 'est' du verbe 'être'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "What is the correct translation of 'the office'?",
      questionTextFr: "Quelle est la traduction correcte de 'the office'?",
      questionType: "multiple_choice",
      options: JSON.stringify(["le bureau", "la bureau", "l'office", "les bureaux"]),
      correctAnswer: "le bureau",
      explanation: "'Bureau' is masculine in French, so it takes 'le'. 'Les bureaux' would be 'the offices' (plural).",
      explanationFr: "'Bureau' est masculin en français, donc il prend 'le'. 'Les bureaux' serait 'the offices' (pluriel).",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "How do you ask 'What time is it?' formally in French?",
      questionTextFr: "Comment demander 'What time is it?' formellement en français?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Quelle heure est-il?", "C'est quelle heure?", "Il est temps?", "Quel temps fait-il?"]),
      correctAnswer: "Quelle heure est-il?",
      explanation: "'Quelle heure est-il?' is the formal way to ask for the time.",
      explanationFr: "'Quelle heure est-il?' est la façon formelle de demander l'heure.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "Complete: 'Nous ___ au bureau tous les jours.'",
      questionTextFr: "Complétez: 'Nous ___ au bureau tous les jours.'",
      questionType: "multiple_choice",
      options: JSON.stringify(["allons", "allez", "vais", "va"]),
      correctAnswer: "allons",
      explanation: "'Nous' takes 'allons' - the first person plural of 'aller' (to go).",
      explanationFr: "'Nous' prend 'allons' - la première personne du pluriel de 'aller'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The French word 'courriel' refers to:",
      questionTextFr: "Le mot français 'courriel' fait référence à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Email", "Mail carrier", "Mailbox", "Post office"]),
      correctAnswer: "Email",
      explanation: "'Courriel' is the Canadian French term for email (courrier électronique).",
      explanationFr: "'Courriel' est le terme français canadien pour email (courrier électronique).",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "Which sentence is grammatically correct?",
      questionTextFr: "Quelle phrase est grammaticalement correcte?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je parle français.", "Je parle le français.", "Je parles français.", "Je parlé français."]),
      correctAnswer: "Je parle français.",
      explanation: "Languages don't require an article when used with 'parler'. The correct conjugation is 'parle' for 'je'.",
      explanationFr: "Les langues ne nécessitent pas d'article avec 'parler'. La conjugaison correcte est 'parle' pour 'je'.",
      points: 15,
      difficulty: "medium"
    }
  ],

  // =====================================================
  // PATH II: FSL - Everyday Fluency (A2) - Course 2
  // =====================================================

  // Lesson 41: Vocabulary Building Quiz (Module 8)
  41: [
    {
      questionText: "What is the French term for 'deadline' in a work context?",
      questionTextFr: "Quel est le terme français pour 'deadline' dans un contexte de travail?",
      questionType: "multiple_choice",
      options: JSON.stringify(["l'échéance", "la date", "le délai mort", "la fin"]),
      correctAnswer: "l'échéance",
      explanation: "'L'échéance' is the standard term for deadline in professional French.",
      explanationFr: "'L'échéance' est le terme standard pour deadline en français professionnel.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "How do you say 'to schedule a meeting' in French?",
      questionTextFr: "Comment dit-on 'to schedule a meeting' en français?",
      questionType: "multiple_choice",
      options: JSON.stringify(["planifier une réunion", "faire une réunion", "avoir une réunion", "prendre une réunion"]),
      correctAnswer: "planifier une réunion",
      explanation: "'Planifier' means to schedule/plan, and 'une réunion' is a meeting.",
      explanationFr: "'Planifier' signifie programmer/planifier, et 'une réunion' est une réunion.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The expression 'faire le point' means:",
      questionTextFr: "L'expression 'faire le point' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["To take stock / review the situation", "To make a point", "To score a point", "To point at something"]),
      correctAnswer: "To take stock / review the situation",
      explanation: "'Faire le point' is a common workplace expression meaning to review or assess a situation.",
      explanationFr: "'Faire le point' est une expression courante signifiant évaluer ou examiner une situation.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "What does 'un dossier' typically refer to in an office?",
      questionTextFr: "À quoi 'un dossier' fait-il généralement référence dans un bureau?",
      questionType: "multiple_choice",
      options: JSON.stringify(["A file/folder", "A desk", "A chair", "A computer"]),
      correctAnswer: "A file/folder",
      explanation: "'Un dossier' refers to a file or folder containing documents.",
      explanationFr: "'Un dossier' fait référence à un fichier ou dossier contenant des documents.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The phrase 'prendre en charge' means:",
      questionTextFr: "L'expression 'prendre en charge' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["To take responsibility for / handle", "To take a charge", "To pay for", "To carry something"]),
      correctAnswer: "To take responsibility for / handle",
      explanation: "'Prendre en charge' means to take responsibility for or handle something.",
      explanationFr: "'Prendre en charge' signifie assumer la responsabilité de quelque chose.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // Lesson 46: Listening Comprehension Test (Module 9)
  46: [
    {
      questionText: "In spoken French, 'je ne sais pas' often sounds like:",
      questionTextFr: "En français parlé, 'je ne sais pas' ressemble souvent à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["'chais pas'", "'je sais'", "'ne pas'", "'sais pas je'"]),
      correctAnswer: "'chais pas'",
      explanation: "In casual spoken French, 'je ne sais pas' is often contracted to 'chais pas' or 'j'sais pas'.",
      explanationFr: "En français parlé décontracté, 'je ne sais pas' est souvent contracté en 'chais pas' ou 'j'sais pas'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "What does 'Pardon?' typically mean in conversation?",
      questionTextFr: "Que signifie généralement 'Pardon?' dans une conversation?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Could you repeat that? / Sorry?", "I apologize", "Excuse me (to pass)", "Thank you"]),
      correctAnswer: "Could you repeat that? / Sorry?",
      explanation: "'Pardon?' is commonly used to ask someone to repeat what they said.",
      explanationFr: "'Pardon?' est couramment utilisé pour demander à quelqu'un de répéter.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The liaison in 'les amis' creates what sound?",
      questionTextFr: "La liaison dans 'les amis' crée quel son?",
      questionType: "multiple_choice",
      options: JSON.stringify(["lez-ami", "le-ami", "les-ami", "lay-ami"]),
      correctAnswer: "lez-ami",
      explanation: "The 's' in 'les' links to the vowel in 'amis', creating a /z/ sound.",
      explanationFr: "Le 's' dans 'les' se lie à la voyelle dans 'amis', créant un son /z/.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When someone says 'C'est noté', they mean:",
      questionTextFr: "Quand quelqu'un dit 'C'est noté', il veut dire:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Noted / I've taken note of that", "It's a note", "Write it down", "It's famous"]),
      correctAnswer: "Noted / I've taken note of that",
      explanation: "'C'est noté' is a common acknowledgment meaning 'I've noted that' or 'understood'.",
      explanationFr: "'C'est noté' est une reconnaissance courante signifiant 'j'ai noté' ou 'compris'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The expression 'Ça marche!' means:",
      questionTextFr: "L'expression 'Ça marche!' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["That works! / OK!", "It's walking", "Let's go for a walk", "It's broken"]),
      correctAnswer: "That works! / OK!",
      explanation: "'Ça marche!' is a casual way to say 'OK!' or 'That works!' in French.",
      explanationFr: "'Ça marche!' est une façon décontractée de dire 'OK!' ou 'Ça fonctionne!' en français.",
      points: 10,
      difficulty: "easy"
    }
  ],

  // Lesson 51: Speaking Assessment Prep (Module 10)
  51: [
    {
      questionText: "When introducing yourself professionally, you should say:",
      questionTextFr: "Lorsque vous vous présentez professionnellement, vous devriez dire:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je me présente, je suis...", "Moi c'est...", "Je suis moi...", "Mon nom est..."]),
      correctAnswer: "Je me présente, je suis...",
      explanation: "'Je me présente, je suis...' is the most professional way to introduce yourself.",
      explanationFr: "'Je me présente, je suis...' est la façon la plus professionnelle de se présenter.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "To politely ask for clarification, you can say:",
      questionTextFr: "Pour demander poliment des éclaircissements, vous pouvez dire:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Pourriez-vous préciser?", "Quoi?", "Dis encore", "Parle plus fort"]),
      correctAnswer: "Pourriez-vous préciser?",
      explanation: "'Pourriez-vous préciser?' is a polite way to ask for clarification in professional settings.",
      explanationFr: "'Pourriez-vous préciser?' est une façon polie de demander des précisions en milieu professionnel.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The correct way to express agreement in a meeting is:",
      questionTextFr: "La façon correcte d'exprimer son accord lors d'une réunion est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je suis d'accord", "Je suis accord", "J'accorde", "Je d'accord"]),
      correctAnswer: "Je suis d'accord",
      explanation: "'Je suis d'accord' is the standard expression for 'I agree'.",
      explanationFr: "'Je suis d'accord' est l'expression standard pour 'I agree'.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "To express uncertainty politely, you might say:",
      questionTextFr: "Pour exprimer l'incertitude poliment, vous pourriez dire:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Il me semble que...", "Je sais pas", "Peut-être oui peut-être non", "Bof"]),
      correctAnswer: "Il me semble que...",
      explanation: "'Il me semble que...' is a polite way to express uncertainty or a tentative opinion.",
      explanationFr: "'Il me semble que...' est une façon polie d'exprimer l'incertitude ou une opinion provisoire.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When ending a professional call, you should say:",
      questionTextFr: "Lorsque vous terminez un appel professionnel, vous devriez dire:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je vous remercie, bonne journée", "Bye bye", "Salut", "À plus"]),
      correctAnswer: "Je vous remercie, bonne journée",
      explanation: "'Je vous remercie, bonne journée' is the appropriate professional closing for a phone call.",
      explanationFr: "'Je vous remercie, bonne journée' est la clôture professionnelle appropriée pour un appel téléphonique.",
      points: 10,
      difficulty: "easy"
    }
  ],

  // Lesson 69: Practice Test: Full Simulation (Module 14)
  69: [
    {
      questionText: "Complete the sentence: 'Je voudrais ___ une question.'",
      questionTextFr: "Complétez la phrase: 'Je voudrais ___ une question.'",
      questionType: "multiple_choice",
      options: JSON.stringify(["poser", "demander", "faire", "dire"]),
      correctAnswer: "poser",
      explanation: "In French, you 'pose' a question (poser une question), not 'ask' it directly.",
      explanationFr: "En français, on 'pose' une question, on ne la 'demande' pas directement.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "What is the appropriate response to 'Merci beaucoup'?",
      questionTextFr: "Quelle est la réponse appropriée à 'Merci beaucoup'?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je vous en prie", "Merci aussi", "Oui merci", "De beaucoup"]),
      correctAnswer: "Je vous en prie",
      explanation: "'Je vous en prie' (formal) or 'De rien' (informal) are appropriate responses to thanks.",
      explanationFr: "'Je vous en prie' (formel) ou 'De rien' (informel) sont des réponses appropriées aux remerciements.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The expression 'à la suite de' means:",
      questionTextFr: "L'expression 'à la suite de' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Following / As a result of", "In the suite", "At the end of", "Before"]),
      correctAnswer: "Following / As a result of",
      explanation: "'À la suite de' is a formal expression meaning 'following' or 'as a result of'.",
      explanationFr: "'À la suite de' est une expression formelle signifiant 'suite à' ou 'en conséquence de'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "How do you say 'I would like to confirm' in French?",
      questionTextFr: "Comment dit-on 'I would like to confirm' en français?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je voudrais confirmer", "Je veux confirmer", "Je confirme vouloir", "Je dois confirmer"]),
      correctAnswer: "Je voudrais confirmer",
      explanation: "'Je voudrais' (I would like) is more polite than 'je veux' (I want) in professional contexts.",
      explanationFr: "'Je voudrais' est plus poli que 'je veux' dans les contextes professionnels.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The past tense of 'je fais' (I do) is:",
      questionTextFr: "Le passé composé de 'je fais' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["j'ai fait", "je faisais", "j'ai fais", "je fis"]),
      correctAnswer: "j'ai fait",
      explanation: "'Faire' uses 'avoir' as auxiliary and has irregular past participle 'fait'.",
      explanationFr: "'Faire' utilise 'avoir' comme auxiliaire et a un participe passé irrégulier 'fait'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which sentence correctly uses the future tense?",
      questionTextFr: "Quelle phrase utilise correctement le futur?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je vous enverrai le document demain", "Je vous envoie le document demain", "Je vous envoyais le document demain", "Je vous ai envoyé le document demain"]),
      correctAnswer: "Je vous enverrai le document demain",
      explanation: "'Enverrai' is the future tense of 'envoyer', appropriate for tomorrow's action.",
      explanationFr: "'Enverrai' est le futur de 'envoyer', approprié pour une action de demain.",
      points: 15,
      difficulty: "medium"
    }
  ],

  // =====================================================
  // PATH III: FSL - Operational French (B1/BBB) - Course 3
  // =====================================================

  // Lesson 76: Grammar Enhancement Quiz (Module 15)
  76: [
    {
      questionText: "Which sentence correctly uses the subjunctive?",
      questionTextFr: "Quelle phrase utilise correctement le subjonctif?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Il faut que je finisse ce rapport", "Il faut que je finis ce rapport", "Il faut que je finirai ce rapport", "Il faut que je finissais ce rapport"]),
      correctAnswer: "Il faut que je finisse ce rapport",
      explanation: "'Il faut que' triggers the subjunctive mood. 'Finisse' is the subjunctive of 'finir'.",
      explanationFr: "'Il faut que' déclenche le subjonctif. 'Finisse' est le subjonctif de 'finir'.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "The correct relative pronoun in 'Le document ___ j'ai besoin' is:",
      questionTextFr: "Le pronom relatif correct dans 'Le document ___ j'ai besoin' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["dont", "que", "qui", "où"]),
      correctAnswer: "dont",
      explanation: "'Dont' is used with verbs that take 'de' (avoir besoin de).",
      explanationFr: "'Dont' est utilisé avec les verbes qui prennent 'de' (avoir besoin de).",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "Choose the correct form: 'Si j'avais le temps, je ___ ce projet.'",
      questionTextFr: "Choisissez la forme correcte: 'Si j'avais le temps, je ___ ce projet.'",
      questionType: "multiple_choice",
      options: JSON.stringify(["finirais", "finirai", "finissais", "finis"]),
      correctAnswer: "finirais",
      explanation: "With 'si + imparfait', the main clause uses the conditional (finirais).",
      explanationFr: "Avec 'si + imparfait', la proposition principale utilise le conditionnel (finirais).",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "The passive voice of 'Le directeur a approuvé le budget' is:",
      questionTextFr: "La voix passive de 'Le directeur a approuvé le budget' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Le budget a été approuvé par le directeur", "Le budget est approuvé par le directeur", "Le budget était approuvé par le directeur", "Le budget sera approuvé par le directeur"]),
      correctAnswer: "Le budget a été approuvé par le directeur",
      explanation: "Passive voice uses 'être' + past participle. 'A été' matches the passé composé of the original.",
      explanationFr: "La voix passive utilise 'être' + participe passé. 'A été' correspond au passé composé de l'original.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "Which sentence uses 'en' correctly?",
      questionTextFr: "Quelle phrase utilise 'en' correctement?",
      questionType: "multiple_choice",
      options: JSON.stringify(["J'en ai besoin pour le projet", "J'ai en besoin pour le projet", "J'en besoin pour le projet", "Je besoin en pour le projet"]),
      correctAnswer: "J'en ai besoin pour le projet",
      explanation: "'En' replaces 'de + noun' and comes before the verb.",
      explanationFr: "'En' remplace 'de + nom' et se place avant le verbe.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // Lesson 97: Style Practice Quiz (Module 19)
  97: [
    {
      questionText: "Which is the most formal way to begin a business letter?",
      questionTextFr: "Quelle est la façon la plus formelle de commencer une lettre d'affaires?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Madame, Monsieur,", "Bonjour,", "Salut,", "Cher ami,"]),
      correctAnswer: "Madame, Monsieur,",
      explanation: "'Madame, Monsieur,' is the standard formal opening when the recipient is unknown.",
      explanationFr: "'Madame, Monsieur,' est l'ouverture formelle standard quand le destinataire est inconnu.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The expression 'Je vous prie d'agréer...' is used for:",
      questionTextFr: "L'expression 'Je vous prie d'agréer...' est utilisée pour:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Formal letter closings", "Asking for information", "Making complaints", "Scheduling meetings"]),
      correctAnswer: "Formal letter closings",
      explanation: "This is the beginning of a very formal closing formula in French correspondence.",
      explanationFr: "C'est le début d'une formule de clôture très formelle dans la correspondance française.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which register is appropriate for an email to a colleague you know well?",
      questionTextFr: "Quel registre est approprié pour un courriel à un collègue que vous connaissez bien?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Semi-formal (tu, but professional vocabulary)", "Very formal (vous, elaborate formulas)", "Casual slang", "Academic style"]),
      correctAnswer: "Semi-formal (tu, but professional vocabulary)",
      explanation: "With familiar colleagues, 'tu' is acceptable but maintain professional vocabulary.",
      explanationFr: "Avec des collègues familiers, 'tu' est acceptable mais maintenez un vocabulaire professionnel.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "To soften a request, you should use:",
      questionTextFr: "Pour adoucir une demande, vous devriez utiliser:",
      questionType: "multiple_choice",
      options: JSON.stringify(["The conditional tense", "The imperative", "The future tense", "The past tense"]),
      correctAnswer: "The conditional tense",
      explanation: "The conditional (pourriez-vous, je voudrais) makes requests more polite.",
      explanationFr: "Le conditionnel (pourriez-vous, je voudrais) rend les demandes plus polies.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which phrase is appropriate for acknowledging receipt of a document?",
      questionTextFr: "Quelle phrase est appropriée pour accuser réception d'un document?",
      questionType: "multiple_choice",
      options: JSON.stringify(["J'accuse réception de votre document", "J'ai reçu votre document", "Votre document est arrivé", "Merci pour le document"]),
      correctAnswer: "J'accuse réception de votre document",
      explanation: "'J'accuse réception de' is the formal way to acknowledge receipt in official correspondence.",
      explanationFr: "'J'accuse réception de' est la façon formelle d'accuser réception dans la correspondance officielle.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // Lesson 110: Full Simulation Test (Module 22)
  110: [
    {
      questionText: "In a briefing note, the 'Recommandation' section should:",
      questionTextFr: "Dans une note d'information, la section 'Recommandation' devrait:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Clearly state the proposed action", "Provide background information", "List all stakeholders", "Summarize the budget"]),
      correctAnswer: "Clearly state the proposed action",
      explanation: "The recommendation section should clearly and concisely state what action is being proposed.",
      explanationFr: "La section recommandation doit énoncer clairement et de manière concise l'action proposée.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When presenting options in a memo, you should:",
      questionTextFr: "Lorsque vous présentez des options dans une note de service, vous devriez:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Present pros and cons objectively", "Only show the option you prefer", "Avoid making any recommendation", "Use emotional language"]),
      correctAnswer: "Present pros and cons objectively",
      explanation: "Professional memos should present options objectively with balanced analysis.",
      explanationFr: "Les notes de service professionnelles doivent présenter les options objectivement avec une analyse équilibrée.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The phrase 'compte tenu de' is best translated as:",
      questionTextFr: "L'expression 'compte tenu de' se traduit le mieux par:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Given / Considering", "Counting on", "Taking account", "In the count of"]),
      correctAnswer: "Given / Considering",
      explanation: "'Compte tenu de' means 'given' or 'considering' and introduces a factor to consider.",
      explanationFr: "'Compte tenu de' signifie 'étant donné' ou 'considérant' et introduit un facteur à considérer.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which connector shows contrast in formal writing?",
      questionTextFr: "Quel connecteur montre le contraste dans l'écriture formelle?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Néanmoins", "Donc", "Ainsi", "En effet"]),
      correctAnswer: "Néanmoins",
      explanation: "'Néanmoins' (nevertheless) introduces a contrasting point in formal writing.",
      explanationFr: "'Néanmoins' introduit un point contrastant dans l'écriture formelle.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "A proper 'note de service' should include:",
      questionTextFr: "Une 'note de service' appropriée devrait inclure:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Date, De, À, Objet, Corps du texte", "Only the message body", "Greeting and signature only", "Subject line only"]),
      correctAnswer: "Date, De, À, Objet, Corps du texte",
      explanation: "A memo (note de service) requires standard headers: Date, From (De), To (À), Subject (Objet), and body.",
      explanationFr: "Une note de service nécessite des en-têtes standards: Date, De, À, Objet, et corps du texte.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "When writing for senior management, the tone should be:",
      questionTextFr: "Lorsque vous écrivez pour la haute direction, le ton devrait être:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Concise, factual, and action-oriented", "Casual and friendly", "Highly technical with jargon", "Emotional and persuasive"]),
      correctAnswer: "Concise, factual, and action-oriented",
      explanation: "Senior management prefers brief, fact-based communications with clear action items.",
      explanationFr: "La haute direction préfère des communications brèves, factuelles avec des actions claires.",
      points: 10,
      difficulty: "easy"
    }
  ],

  // =====================================================
  // PATH IV: FSL - Strategic Expression (B2/CBC) - Course 4
  // =====================================================

  // Lesson 116: Advanced Grammar Quiz (Module 23)
  116: [
    {
      questionText: "Which sentence correctly uses the plus-que-parfait?",
      questionTextFr: "Quelle phrase utilise correctement le plus-que-parfait?",
      questionType: "multiple_choice",
      options: JSON.stringify(["J'avais déjà terminé quand il est arrivé", "J'ai déjà terminé quand il est arrivé", "Je terminais quand il est arrivé", "Je terminerai quand il arrivera"]),
      correctAnswer: "J'avais déjà terminé quand il est arrivé",
      explanation: "Plus-que-parfait (had finished) shows an action completed before another past action.",
      explanationFr: "Le plus-que-parfait montre une action complétée avant une autre action passée.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "The correct use of 'lequel' in 'Le projet ___ je travaille' is:",
      questionTextFr: "L'utilisation correcte de 'lequel' dans 'Le projet ___ je travaille' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["sur lequel", "lequel", "auquel", "duquel"]),
      correctAnswer: "sur lequel",
      explanation: "'Travailler sur' requires 'sur lequel' as the relative pronoun.",
      explanationFr: "'Travailler sur' nécessite 'sur lequel' comme pronom relatif.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "Which sentence shows correct agreement in the passé composé with 'avoir'?",
      questionTextFr: "Quelle phrase montre l'accord correct au passé composé avec 'avoir'?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Les documents que j'ai envoyés", "Les documents que j'ai envoyé", "Les documents que j'ai envoyée", "Les documents que j'ai envoyer"]),
      correctAnswer: "Les documents que j'ai envoyés",
      explanation: "With 'avoir', the past participle agrees with the preceding direct object (les documents = masculine plural).",
      explanationFr: "Avec 'avoir', le participe passé s'accorde avec le COD qui précède (les documents = masculin pluriel).",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "The subjunctive is required after:",
      questionTextFr: "Le subjonctif est requis après:",
      questionType: "multiple_choice",
      options: JSON.stringify(["bien que", "parce que", "pendant que", "après que"]),
      correctAnswer: "bien que",
      explanation: "'Bien que' (although) always requires the subjunctive in the following clause.",
      explanationFr: "'Bien que' exige toujours le subjonctif dans la proposition qui suit.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Choose the correct form: 'C'est le meilleur rapport ___ j'aie jamais lu.'",
      questionTextFr: "Choisissez la forme correcte: 'C'est le meilleur rapport ___ j'aie jamais lu.'",
      questionType: "multiple_choice",
      options: JSON.stringify(["que", "qui", "dont", "où"]),
      correctAnswer: "que",
      explanation: "'Que' is the direct object relative pronoun; the superlative triggers subjunctive 'aie'.",
      explanationFr: "'Que' est le pronom relatif COD; le superlatif déclenche le subjonctif 'aie'.",
      points: 15,
      difficulty: "hard"
    }
  ],

  // Lesson 147: Analysis Quiz (Module 29)
  147: [
    {
      questionText: "In policy analysis, 'les enjeux' refers to:",
      questionTextFr: "Dans l'analyse des politiques, 'les enjeux' fait référence à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["The issues/stakes at play", "The budget", "The timeline", "The stakeholders"]),
      correctAnswer: "The issues/stakes at play",
      explanation: "'Les enjeux' refers to the key issues, stakes, or challenges in a policy context.",
      explanationFr: "'Les enjeux' fait référence aux questions clés, aux enjeux ou aux défis dans un contexte politique.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The expression 'dans l'optique de' means:",
      questionTextFr: "L'expression 'dans l'optique de' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["With a view to / In order to", "In the opinion of", "From the perspective of", "In the optical sense"]),
      correctAnswer: "With a view to / In order to",
      explanation: "'Dans l'optique de' introduces a purpose or goal in formal writing.",
      explanationFr: "'Dans l'optique de' introduit un but ou un objectif dans l'écriture formelle.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When presenting a counterargument, you might use:",
      questionTextFr: "Lorsque vous présentez un contre-argument, vous pourriez utiliser:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Certes... mais", "En effet", "Par conséquent", "Ainsi"]),
      correctAnswer: "Certes... mais",
      explanation: "'Certes... mais' (certainly... but) acknowledges a point before presenting a counter.",
      explanationFr: "'Certes... mais' reconnaît un point avant de présenter un contre-argument.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "'Mettre en œuvre' in a policy context means:",
      questionTextFr: "'Mettre en œuvre' dans un contexte politique signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["To implement", "To put in work", "To create art", "To manufacture"]),
      correctAnswer: "To implement",
      explanation: "'Mettre en œuvre' means to implement or put into action (a policy, plan, etc.).",
      explanationFr: "'Mettre en œuvre' signifie implémenter ou mettre en action (une politique, un plan, etc.).",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "A 'note d'information' differs from a 'note de service' in that it:",
      questionTextFr: "Une 'note d'information' diffère d'une 'note de service' en ce qu'elle:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Informs without requiring action", "Requires immediate action", "Is always confidential", "Is sent externally"]),
      correctAnswer: "Informs without requiring action",
      explanation: "A 'note d'information' provides information, while a 'note de service' typically requires action.",
      explanationFr: "Une 'note d'information' fournit des informations, tandis qu'une 'note de service' nécessite généralement une action.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // Lesson 160: Full Practice Examination (Module 32)
  160: [
    {
      questionText: "In a formal presentation, 'Je vous remercie de votre attention' is used:",
      questionTextFr: "Dans une présentation formelle, 'Je vous remercie de votre attention' est utilisé:",
      questionType: "multiple_choice",
      options: JSON.stringify(["At the end, before questions", "At the beginning", "During the main content", "Never in formal settings"]),
      correctAnswer: "At the end, before questions",
      explanation: "This phrase thanks the audience and signals the transition to Q&A.",
      explanationFr: "Cette phrase remercie l'auditoire et signale la transition vers les questions.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The phrase 'il convient de' expresses:",
      questionTextFr: "L'expression 'il convient de' exprime:",
      questionType: "multiple_choice",
      options: JSON.stringify(["It is appropriate/advisable to", "It is convenient to", "It agrees with", "It converts to"]),
      correctAnswer: "It is appropriate/advisable to",
      explanation: "'Il convient de' is a formal way to say something is appropriate or should be done.",
      explanationFr: "'Il convient de' est une façon formelle de dire que quelque chose est approprié ou devrait être fait.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When disagreeing diplomatically, you might say:",
      questionTextFr: "Lorsque vous êtes en désaccord diplomatiquement, vous pourriez dire:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Je comprends votre point de vue, cependant...", "Vous avez tort", "Ce n'est pas vrai", "Je ne suis pas d'accord du tout"]),
      correctAnswer: "Je comprends votre point de vue, cependant...",
      explanation: "Acknowledging the other's view before presenting your own is diplomatic.",
      explanationFr: "Reconnaître le point de vue de l'autre avant de présenter le vôtre est diplomatique.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The correct structure for a recommendation is:",
      questionTextFr: "La structure correcte pour une recommandation est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Il est recommandé de + infinitive", "Il recommande de + infinitive", "On recommande que + indicative", "Recommandation: + noun"]),
      correctAnswer: "Il est recommandé de + infinitive",
      explanation: "'Il est recommandé de' + infinitive is the standard impersonal structure.",
      explanationFr: "'Il est recommandé de' + infinitif est la structure impersonnelle standard.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which phrase introduces a conclusion in formal writing?",
      questionTextFr: "Quelle expression introduit une conclusion dans l'écriture formelle?",
      questionType: "multiple_choice",
      options: JSON.stringify(["En somme", "D'abord", "Ensuite", "Par exemple"]),
      correctAnswer: "En somme",
      explanation: "'En somme' (in sum/to summarize) introduces a conclusion.",
      explanationFr: "'En somme' introduit une conclusion.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "A 'mémoire au Cabinet' is:",
      questionTextFr: "Un 'mémoire au Cabinet' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A Cabinet memorandum for ministerial decision", "A memory exercise", "A cabinet furniture catalog", "A personal memoir"]),
      correctAnswer: "A Cabinet memorandum for ministerial decision",
      explanation: "A 'mémoire au Cabinet' is a formal document submitted to Cabinet for decision-making.",
      explanationFr: "Un 'mémoire au Cabinet' est un document formel soumis au Cabinet pour prise de décision.",
      points: 15,
      difficulty: "hard"
    }
  ],

  // =====================================================
  // PATH V: FSL - Professional Mastery (C1/CCC) - Course 5
  // =====================================================

  // Lesson 166: Expert Grammar Assessment (Module 33)
  166: [
    {
      questionText: "Which sentence correctly uses the past conditional?",
      questionTextFr: "Quelle phrase utilise correctement le conditionnel passé?",
      questionType: "multiple_choice",
      options: JSON.stringify(["J'aurais dû vous informer plus tôt", "J'avais dû vous informer plus tôt", "Je devrais vous informer plus tôt", "J'ai dû vous informer plus tôt"]),
      correctAnswer: "J'aurais dû vous informer plus tôt",
      explanation: "Past conditional (aurais dû) expresses regret about a past action not taken.",
      explanationFr: "Le conditionnel passé (aurais dû) exprime le regret d'une action passée non accomplie.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "The literary past tense (passé simple) of 'il fait' is:",
      questionTextFr: "Le passé simple de 'il fait' est:",
      questionType: "multiple_choice",
      options: JSON.stringify(["il fit", "il faisait", "il a fait", "il fera"]),
      correctAnswer: "il fit",
      explanation: "The passé simple of 'faire' is 'fit' for third person singular.",
      explanationFr: "Le passé simple de 'faire' est 'fit' pour la troisième personne du singulier.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "Choose the correct form: 'Quoi qu'il ___, je maintiendrai ma position.'",
      questionTextFr: "Choisissez la forme correcte: 'Quoi qu'il ___, je maintiendrai ma position.'",
      questionType: "multiple_choice",
      options: JSON.stringify(["dise", "dit", "dira", "disait"]),
      correctAnswer: "dise",
      explanation: "'Quoi que' (whatever) requires the subjunctive.",
      explanationFr: "'Quoi que' exige le subjonctif.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "The expression 'force est de constater' means:",
      questionTextFr: "L'expression 'force est de constater' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["One must acknowledge/admit", "Force is constant", "It is forced to state", "The force states"]),
      correctAnswer: "One must acknowledge/admit",
      explanation: "This formal expression means 'one must acknowledge' or 'it must be noted'.",
      explanationFr: "Cette expression formelle signifie 'on doit reconnaître' ou 'il faut constater'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which construction is correct for reported speech in the past?",
      questionTextFr: "Quelle construction est correcte pour le discours rapporté au passé?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Il a dit qu'il viendrait", "Il a dit qu'il viendra", "Il a dit qu'il vient", "Il a dit qu'il venait"]),
      correctAnswer: "Il a dit qu'il viendrait",
      explanation: "In reported speech with past main verb, future becomes conditional.",
      explanationFr: "Dans le discours rapporté avec un verbe principal au passé, le futur devient conditionnel.",
      points: 15,
      difficulty: "hard"
    }
  ],

  // Lesson 171: Vocabulary Mastery Quiz (Module 34)
  171: [
    {
      questionText: "The term 'un arrêté ministériel' refers to:",
      questionTextFr: "Le terme 'un arrêté ministériel' fait référence à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A ministerial order/decree", "A minister's arrest", "A ministry stop", "A ministerial meeting"]),
      correctAnswer: "A ministerial order/decree",
      explanation: "An 'arrêté ministériel' is an official order or decree issued by a minister.",
      explanationFr: "Un 'arrêté ministériel' est un ordre ou décret officiel émis par un ministre.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "'Faire valoir' in a professional context means:",
      questionTextFr: "'Faire valoir' dans un contexte professionnel signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["To assert/highlight/put forward", "To make valuable", "To validate", "To evaluate"]),
      correctAnswer: "To assert/highlight/put forward",
      explanation: "'Faire valoir' means to assert, highlight, or put forward (an argument, right, etc.).",
      explanationFr: "'Faire valoir' signifie affirmer, mettre en avant (un argument, un droit, etc.).",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The expression 'sous réserve de' means:",
      questionTextFr: "L'expression 'sous réserve de' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Subject to / Pending", "Under reserve", "Reserved for", "Without reservation"]),
      correctAnswer: "Subject to / Pending",
      explanation: "'Sous réserve de' introduces a condition or caveat.",
      explanationFr: "'Sous réserve de' introduit une condition ou une réserve.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "'Un cadre de référence' is best translated as:",
      questionTextFr: "'Un cadre de référence' se traduit le mieux par:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A framework/frame of reference", "A reference frame (physics)", "A reference manager", "A picture frame"]),
      correctAnswer: "A framework/frame of reference",
      explanation: "In policy/business contexts, 'cadre de référence' means framework or frame of reference.",
      explanationFr: "Dans les contextes politiques/commerciaux, 'cadre de référence' signifie cadre ou référentiel.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The verb 'préconiser' means:",
      questionTextFr: "Le verbe 'préconiser' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["To recommend/advocate", "To precondition", "To preconceive", "To predict"]),
      correctAnswer: "To recommend/advocate",
      explanation: "'Préconiser' means to recommend or advocate for something.",
      explanationFr: "'Préconiser' signifie recommander ou plaider pour quelque chose.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // Lesson 209: Full Certification Simulation (Module 42)
  209: [
    {
      questionText: "In a ministerial briefing, 'les considérations' section should include:",
      questionTextFr: "Dans une note ministérielle, la section 'les considérations' devrait inclure:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Key factors influencing the decision", "Personal opinions", "Budget details only", "Staff names"]),
      correctAnswer: "Key factors influencing the decision",
      explanation: "The 'considérations' section presents key factors and context for decision-making.",
      explanationFr: "La section 'considérations' présente les facteurs clés et le contexte pour la prise de décision.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The phrase 'il y a lieu de' expresses:",
      questionTextFr: "L'expression 'il y a lieu de' exprime:",
      questionType: "multiple_choice",
      options: JSON.stringify(["There is reason to / It is appropriate to", "There is a place for", "It is located at", "There is room for"]),
      correctAnswer: "There is reason to / It is appropriate to",
      explanation: "'Il y a lieu de' is a formal way to say something should be done.",
      explanationFr: "'Il y a lieu de' est une façon formelle de dire que quelque chose devrait être fait.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When presenting sensitive information, you should:",
      questionTextFr: "Lorsque vous présentez des informations sensibles, vous devriez:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Use objective language and cite sources", "Express strong personal opinions", "Avoid all details", "Use emotional appeals"]),
      correctAnswer: "Use objective language and cite sources",
      explanation: "Sensitive information requires objective, factual presentation with proper sourcing.",
      explanationFr: "Les informations sensibles nécessitent une présentation objective et factuelle avec des sources appropriées.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "'Aux fins de' is used to express:",
      questionTextFr: "'Aux fins de' est utilisé pour exprimer:",
      questionType: "multiple_choice",
      options: JSON.stringify(["For the purpose of", "At the end of", "Finally", "In the end"]),
      correctAnswer: "For the purpose of",
      explanation: "'Aux fins de' is a formal expression meaning 'for the purpose of'.",
      explanationFr: "'Aux fins de' est une expression formelle signifiant 'dans le but de'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "A 'note de breffage' typically includes all EXCEPT:",
      questionTextFr: "Une 'note de breffage' comprend généralement tout SAUF:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Personal anecdotes", "Issue/Enjeu", "Background/Contexte", "Recommendation"]),
      correctAnswer: "Personal anecdotes",
      explanation: "Briefing notes are formal and factual; personal anecdotes are inappropriate.",
      explanationFr: "Les notes de breffage sont formelles et factuelles; les anecdotes personnelles sont inappropriées.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The expression 'en l'occurrence' means:",
      questionTextFr: "L'expression 'en l'occurrence' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["In this case / As it happens", "In occurrence", "Occasionally", "By chance"]),
      correctAnswer: "In this case / As it happens",
      explanation: "'En l'occurrence' means 'in this case' or 'as it happens' in formal contexts.",
      explanationFr: "'En l'occurrence' signifie 'dans ce cas' ou 'en l'espèce' dans les contextes formels.",
      points: 10,
      difficulty: "medium"
    }
  ],

  // =====================================================
  // PATH VI: FSL - SLE Accelerator - Course 6
  // =====================================================

  // Lesson 215: SLE Overview Quiz (Module 43)
  215: [
    {
      questionText: "The SLE (Second Language Evaluation) tests which three skills?",
      questionTextFr: "L'ELS (Évaluation de langue seconde) teste quelles trois compétences?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Reading, Writing, Oral Interaction", "Reading, Writing, Listening", "Speaking, Listening, Grammar", "Vocabulary, Grammar, Pronunciation"]),
      correctAnswer: "Reading, Writing, Oral Interaction",
      explanation: "The SLE tests Reading Comprehension, Written Expression, and Oral Interaction.",
      explanationFr: "L'ELS teste la compréhension de l'écrit, l'expression écrite et l'interaction orale.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "What does 'CBC' represent in SLE levels?",
      questionTextFr: "Que représente 'CBC' dans les niveaux de l'ELS?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Level C in Reading, Level B in Writing, Level C in Oral", "Canadian Broadcasting Corporation", "Certified Bilingual Candidate", "Complete Bilingual Certification"]),
      correctAnswer: "Level C in Reading, Level B in Writing, Level C in Oral",
      explanation: "CBC indicates the proficiency level achieved in each of the three skills.",
      explanationFr: "CBC indique le niveau de compétence atteint dans chacune des trois compétences.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "Level B in the SLE corresponds approximately to:",
      questionTextFr: "Le niveau B de l'ELS correspond approximativement à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["CEFR B2 (Upper Intermediate)", "CEFR A2 (Elementary)", "CEFR C1 (Advanced)", "CEFR B1 (Intermediate)"]),
      correctAnswer: "CEFR B2 (Upper Intermediate)",
      explanation: "SLE Level B roughly corresponds to CEFR B2 (Upper Intermediate).",
      explanationFr: "Le niveau B de l'ELS correspond approximativement au CEFR B2 (Intermédiaire supérieur).",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The SLE Oral Interaction test format includes:",
      questionTextFr: "Le format du test d'interaction orale de l'ELS comprend:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A conversation with an evaluator on workplace topics", "A written essay", "Multiple choice questions only", "A group discussion"]),
      correctAnswer: "A conversation with an evaluator on workplace topics",
      explanation: "The oral test is a one-on-one conversation covering workplace scenarios.",
      explanationFr: "Le test oral est une conversation individuelle couvrant des scénarios de travail.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "SLE results are valid for:",
      questionTextFr: "Les résultats de l'ELS sont valides pour:",
      questionType: "multiple_choice",
      options: JSON.stringify(["5 years (with some exceptions)", "1 year", "Lifetime", "10 years"]),
      correctAnswer: "5 years (with some exceptions)",
      explanation: "SLE results are generally valid for 5 years, though policies may vary.",
      explanationFr: "Les résultats de l'ELS sont généralement valides pour 5 ans, bien que les politiques puissent varier.",
      points: 10,
      difficulty: "easy"
    }
  ],

  // Lesson 238: Level B Practice Exam (Module 47)
  238: [
    {
      questionText: "In an SLE reading passage about policy, 'les retombées' likely refers to:",
      questionTextFr: "Dans un passage de lecture ELS sur la politique, 'les retombées' fait probablement référence à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["The impacts/consequences", "The fallout (nuclear)", "The returns", "The rebounds"]),
      correctAnswer: "The impacts/consequences",
      explanation: "'Les retombées' in policy contexts means impacts, consequences, or outcomes.",
      explanationFr: "'Les retombées' dans les contextes politiques signifie impacts, conséquences ou résultats.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "Which connector indicates a consequence in formal writing?",
      questionTextFr: "Quel connecteur indique une conséquence dans l'écriture formelle?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Par conséquent", "Cependant", "D'ailleurs", "En revanche"]),
      correctAnswer: "Par conséquent",
      explanation: "'Par conséquent' (consequently) introduces a result or consequence.",
      explanationFr: "'Par conséquent' introduit un résultat ou une conséquence.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "In SLE writing, 'nuancer son propos' means:",
      questionTextFr: "Dans l'écriture ELS, 'nuancer son propos' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["To qualify/moderate one's statement", "To change the subject", "To add numbers", "To summarize"]),
      correctAnswer: "To qualify/moderate one's statement",
      explanation: "'Nuancer' means to add nuance, qualify, or moderate a statement.",
      explanationFr: "'Nuancer' signifie ajouter de la nuance, qualifier ou modérer une déclaration.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The phrase 'il s'avère que' introduces:",
      questionTextFr: "L'expression 'il s'avère que' introduit:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A fact or finding", "An opinion", "A question", "A hypothesis"]),
      correctAnswer: "A fact or finding",
      explanation: "'Il s'avère que' (it turns out that) introduces a verified fact or finding.",
      explanationFr: "'Il s'avère que' introduit un fait vérifié ou une constatation.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "For SLE Level B writing, you should demonstrate:",
      questionTextFr: "Pour l'écriture de niveau B de l'ELS, vous devriez démontrer:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Clear organization and varied sentence structures", "Only simple sentences", "Informal language", "Minimal vocabulary"]),
      correctAnswer: "Clear organization and varied sentence structures",
      explanation: "Level B requires clear organization, varied structures, and appropriate register.",
      explanationFr: "Le niveau B exige une organisation claire, des structures variées et un registre approprié.",
      points: 10,
      difficulty: "easy"
    }
  ],

  // Lesson 243: Level C Practice Exam (Module 48)
  243: [
    {
      questionText: "At Level C, you should be able to:",
      questionTextFr: "Au niveau C, vous devriez être capable de:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Discuss complex topics with precision and nuance", "Introduce yourself", "Order food at a restaurant", "Read simple instructions"]),
      correctAnswer: "Discuss complex topics with precision and nuance",
      explanation: "Level C requires handling complex, abstract topics with precision.",
      explanationFr: "Le niveau C exige de traiter des sujets complexes et abstraits avec précision.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "The expression 'à plus forte raison' means:",
      questionTextFr: "L'expression 'à plus forte raison' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["All the more so / Even more reason", "For a stronger reason", "With more force", "Reasonably strong"]),
      correctAnswer: "All the more so / Even more reason",
      explanation: "'À plus forte raison' emphasizes that something applies even more strongly.",
      explanationFr: "'À plus forte raison' souligne que quelque chose s'applique encore plus fortement.",
      points: 10,
      difficulty: "hard"
    },
    {
      questionText: "In Level C oral, you should be able to:",
      questionTextFr: "À l'oral de niveau C, vous devriez être capable de:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Defend a position and respond to counterarguments", "Give basic personal information", "Describe your daily routine", "Ask for directions"]),
      correctAnswer: "Defend a position and respond to counterarguments",
      explanation: "Level C oral requires argumentation, defending positions, and handling challenges.",
      explanationFr: "L'oral de niveau C exige l'argumentation, la défense de positions et la gestion des objections.",
      points: 10,
      difficulty: "easy"
    },
    {
      questionText: "Which sentence demonstrates Level C complexity?",
      questionTextFr: "Quelle phrase démontre la complexité du niveau C?",
      questionType: "multiple_choice",
      options: JSON.stringify(["Bien que cette approche présente des avantages indéniables, force est de constater qu'elle comporte également des risques non négligeables.", "J'aime mon travail.", "Le rapport est sur la table.", "Nous avons une réunion demain."]),
      correctAnswer: "Bien que cette approche présente des avantages indéniables, force est de constater qu'elle comporte également des risques non négligeables.",
      explanation: "This sentence shows complex structure, nuanced vocabulary, and formal register.",
      explanationFr: "Cette phrase montre une structure complexe, un vocabulaire nuancé et un registre formel.",
      points: 15,
      difficulty: "hard"
    },
    {
      questionText: "'Quitte à' in a sentence like 'Quitte à prendre des risques, autant...' means:",
      questionTextFr: "'Quitte à' dans une phrase comme 'Quitte à prendre des risques, autant...' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Even if it means / At the risk of", "Quit taking", "Leave for", "Stop at"]),
      correctAnswer: "Even if it means / At the risk of",
      explanation: "'Quitte à' introduces a concession or accepted risk.",
      explanationFr: "'Quitte à' introduit une concession ou un risque accepté.",
      points: 15,
      difficulty: "hard"
    }
  ],

  // Lesson 250: Mock Reading Exam (Module 50)
  250: [
    {
      questionText: "In SLE reading, 'le cas échéant' means:",
      questionTextFr: "Dans la lecture ELS, 'le cas échéant' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["If applicable / Where appropriate", "In case of emergency", "The falling case", "If it happens"]),
      correctAnswer: "If applicable / Where appropriate",
      explanation: "'Le cas échéant' is a formal expression meaning 'if applicable' or 'where appropriate'.",
      explanationFr: "'Le cas échéant' est une expression formelle signifiant 'si applicable' ou 'le cas échéant'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "The phrase 'dans la mesure où' introduces:",
      questionTextFr: "L'expression 'dans la mesure où' introduit:",
      questionType: "multiple_choice",
      options: JSON.stringify(["A condition or extent", "A measurement", "A location", "A time frame"]),
      correctAnswer: "A condition or extent",
      explanation: "'Dans la mesure où' means 'insofar as' or 'to the extent that'.",
      explanationFr: "'Dans la mesure où' signifie 'dans la mesure où' ou 'pour autant que'.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "When reading a policy document, 'les modalités' refers to:",
      questionTextFr: "Lors de la lecture d'un document de politique, 'les modalités' fait référence à:",
      questionType: "multiple_choice",
      options: JSON.stringify(["The terms/conditions/procedures", "The modes", "The models", "The modifications"]),
      correctAnswer: "The terms/conditions/procedures",
      explanation: "'Les modalités' refers to the terms, conditions, or procedures of implementation.",
      explanationFr: "'Les modalités' fait référence aux termes, conditions ou procédures de mise en œuvre.",
      points: 10,
      difficulty: "medium"
    },
    {
      questionText: "In formal texts, 'nonobstant' means:",
      questionTextFr: "Dans les textes formels, 'nonobstant' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["Notwithstanding / Despite", "Not standing", "Obviously", "Not observing"]),
      correctAnswer: "Notwithstanding / Despite",
      explanation: "'Nonobstant' is a formal/legal term meaning 'notwithstanding' or 'despite'.",
      explanationFr: "'Nonobstant' est un terme formel/juridique signifiant 'nonobstant' ou 'malgré'.",
      points: 10,
      difficulty: "hard"
    },
    {
      questionText: "The expression 'eu égard à' means:",
      questionTextFr: "L'expression 'eu égard à' signifie:",
      questionType: "multiple_choice",
      options: JSON.stringify(["In view of / Considering", "Having regard", "Equal to", "Looking at"]),
      correctAnswer: "In view of / Considering",
      explanation: "'Eu égard à' is a formal expression meaning 'in view of' or 'considering'.",
      explanationFr: "'Eu égard à' est une expression formelle signifiant 'eu égard à' ou 'compte tenu de'.",
      points: 10,
      difficulty: "hard"
    }
  ]
};

async function seedQuizQuestions() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("🎯 Starting quiz questions seeding...\n");
  
  let totalQuestions = 0;
  let totalLessons = 0;
  
  for (const [lessonId, questions] of Object.entries(quizQuestions)) {
    console.log(`📝 Seeding ${questions.length} questions for Lesson ${lessonId}...`);
    
    // Get module and course IDs for this lesson
    const [lessonInfo] = await conn.execute(
      "SELECT moduleId, courseId FROM lessons WHERE id = ?",
      [lessonId]
    );
    
    if (lessonInfo.length === 0) {
      console.log(`   ⚠️ Lesson ${lessonId} not found, skipping...`);
      continue;
    }
    
    const { moduleId, courseId } = lessonInfo[0];
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      await conn.execute(`
        INSERT INTO quiz_questions 
        (lessonId, moduleId, courseId, questionText, questionTextFr, questionType, options, correctAnswer, explanation, explanationFr, points, difficulty, orderIndex, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        lessonId,
        moduleId,
        courseId,
        q.questionText,
        q.questionTextFr || null,
        q.questionType,
        q.options,
        q.correctAnswer,
        q.explanation || null,
        q.explanationFr || null,
        q.points || 10,
        q.difficulty || 'medium',
        i + 1
      ]);
      
      totalQuestions++;
    }
    
    totalLessons++;
    console.log(`   ✅ Done!`);
  }
  
  console.log(`\n🎉 Seeding complete!`);
  console.log(`   📊 Total questions created: ${totalQuestions}`);
  console.log(`   📚 Total lessons with quizzes: ${totalLessons}`);
  
  await conn.end();
}

seedQuizQuestions().catch(console.error);
