// ESL Lesson Content Database — English as a Second Language
// Contains all 96 ESL lessons across 6 Paths with 7-slot structure
// Auto-generated from ESL_Path_COMPLET.zip source files

import type { LessonContent, SlotContent, QuizData } from "./lessonContent";

export const eslLessonContent: Record<string, LessonContent> = {
  "1.1": {
    "hook": {
      title: "The Art of the First Impression",
      content: "**Titre :** The Art of the First Impression\n\nWelcome to Path I: Foundations. In the Canadian professional world, your first impression is critical. How you introduce yourself can set the tone for your entire working relationship. It’s not just about the words you use, but the confidence with which you say them. This first lesson will give you the essential tools to make that first encounter a success.\n\n**Objectif :** By the end of this lesson, you will be able to introduce yourself and others confidently in a professional setting using basic English, including correct subject pronouns and the verb \"to be\"."
    },
    "video": {
      title: "Formal vs. Casual",
      content: "**Titre :** Formal vs. Casual\n\n**(Scene: A modern, bright government office. ANNA, a new employee, is at her desk. Her manager, DAVID, approaches.)**\n\n**NARRATEUR (Voix off, warm and professional) :** This is Anna. It’s her first day at the Department of Innovation. Her manager, David, is about to introduce her to the Deputy Minister. This is a formal situation.\n\n**DAVID :** Anna, I’d like to introduce you to Ms. Tremblay, our Deputy Minister. Ms. Tremblay, this is Anna, our new junior analyst.\n\n**ANNA :** (Stands up, makes eye contact, offers a firm handshake) It’s a pleasure to meet you, Ms. Tremblay.\n\n**MS. TREMBLAY :** It’s a pleasure to meet you too, Anna. Welcome to the team.\n\n**NARRATEUR :** Notice the formal language: \"I’d like to introduce you,\" \"It’s a pleasure to meet you,\" and the use of titles like \"Ms. Tremblay.\"\n\n**(Scene: Later, Anna is at the coffee machine. A colleague, MARK, approaches.)**\n\n**NARRATEUR :** Now, Anna is meeting a colleague, Mark. This is a casual, informal situation.\n\n**MARK :** Hi, I’m Mark. I don’t think we’ve met.\n\n**ANNA :** (Smiles, friendly tone) Hi Mark, I’m Anna. I just started today.\n\n**MARK :** Oh, cool! Welcome. I’m on the communications team. What do you do?\n\n**ANNA :** I’m a junior analyst.\n\n**NARRATEUR :** See the difference? The language is simpler: \"Hi, I’m Mark,\" \"I’m Anna.\" The tone is more relaxed. Mastering both formal and casual introductions is key.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The Building Blocks: Subject Pronouns & \"To Be\"",
      content: "**Titre :** The Building Blocks: Subject Pronouns & \"To Be\"\n\nTo introduce yourself and others, you need two basic tools: subject pronouns and the verb \"to be\".\n\n#### **Pattern 1 → Subject Pronouns**\n\nSubject pronouns replace nouns (like names) to avoid repetition.\n\n*   **I** → (me, myself)\n*   **You** → (the person I am speaking to)\n*   **He** → (a man, e.g., David)\n*   **She** → (a woman, e.g., Anna)\n*   **It** → (a thing, e.g., the computer)\n*   **We** → (a group including me)\n*   **They** → (a group of other people)\n\n#### **Pattern 2 → The Verb \"To Be\"**\n\nThe verb \"to be\" (être) changes depending on the subject pronoun. It is the most important verb in English.\n\n**Affirmative (+)**\n*   I **am**\n*   You **are**\n*   He / She / It **is**\n*   We **are**\n*   They **are**\n\n**Exemple interactif :**\n*Fill in the blank: \"She ___ our new analyst.\"* (Answer: is)\n\n**Negative (-)**\n*   I **am not**\n*   You **are not** (aren't)\n*   He / She / It **is not** (isn't)\n*   We **are not** (aren't)\n*   They **are not** (aren't)\n\n**Exemple interactif :**\n*Fill in the blank: \"They ___ from our department.\"* (Answer: are not / aren't)\n\n**Question (?)**\n*   **Am** I...?\n*   **Are** you...?\n*   **Is** he / she / it...?\n*   **Are** we...?\n*   **Are** they...?\n\n**Exemple interactif :**\n*Unscramble the words: \"your / Is / manager / he ?\"* (Answer: Is he your manager?)"
    },
    "written": {
      title: "Write Your Professional Introduction",
      content: "**Titre :** Write Your Professional Introduction\n\n**Instructions :** Write a short, 3-sentence professional introduction for yourself. Use the grammar and vocabulary from this lesson.\n\n1.  Start with your name.\n2.  State your job title.\n3.  Mention your department or team.\n\n**(Example: My name is [Your Name]. I am a [Your Job Title]. I work in the [Your Department] department.)**"
    },
    "oral": {
      title: "Record Your Introduction",
      content: "**Titre :** Record Your Introduction\n\n**Instructions :** Record yourself reading the introduction you just wrote. Listen to your recording and compare it to the narrator in the video. Pay close attention to the pronunciation of these key sounds for francophones.\n\n**Exercice 1 : The /h/ sound (3 minutes)**\n*   Practice saying \"Hello\" and \"Hi\". The /h/ sound is aspirated in English. It is not silent.\n\n**Exercice 2 : The /θ/ sound (5 minutes)**\n*   Practice saying \"the\", \"this\", \"that\". Your tongue should be between your teeth. It is not a /d/ or /z/ sound."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 1.1: Hello, My Name Is...",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: She ___ our new Deputy Minister.", options: ["am", "is", "are", "be"], answer: "is", feedback: "Correct! We use 'is' with the subject pronouns 'he', 'she', or 'it'." },
          { id: 2, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["I is a junior analyst.", "You is a junior analyst.", "He are a junior analyst.", "I am a junior analyst."], answer: "I am a junior analyst.", feedback: "Correct! The verb 'to be' becomes 'am' with the subject pronoun 'I'." },
          { id: 3, type: "multiple-choice" as const, question: "What is a formal way to greet a superior?", options: ["What's up?", "Hey!", "It's a pleasure to meet you.", "How's it going?"], answer: "It's a pleasure to meet you.", feedback: "Correct! 'It's a pleasure to meet you' is a standard formal greeting in a professional context." },
          { id: 4, type: "multiple-choice" as const, question: "Choose the correct negative form: We ___ in the same team.", options: ["is not", "am not", "are not", "be not"], answer: "are not", feedback: "Correct! We use 'are not' (or 'aren't') with the subject pronoun 'we'." },
          { id: 5, type: "multiple-choice" as const, question: "Which pronoun would you use to talk about your manager, David?", options: ["She", "He", "It", "They"], answer: "He", feedback: "Correct! 'He' is the subject pronoun used for a man." }
        ]
      }
    },
    "coaching": {
      title: "Overcoming the Fear of Speaking",
      content: "**Titre :** Overcoming the Fear of Speaking\n\nIt is completely normal to feel nervous when speaking a new language for the first time. Remember, every expert was once a beginner. Your colleagues will appreciate your effort, not judge your mistakes.\n\n**Pourquoi ?**\n1.  **Effort is valued:** In Canada, trying to speak the language is seen as a sign of respect and professionalism.\n2.  **Clarity over perfection:** The goal is to be understood, not to have a perfect accent.\n\n**Votre nouvelle routine :**\n1.  **Practice in low-stakes situations:** Say \"Hello\" to the security guard or \"Thank you\" to the barista.\n2.  **Prepare one sentence:** Before a meeting, prepare just one sentence you can say. It builds confidence for the next time."
    },
  },
  "1.2": {
    "hook": {
      title: "My Office, My Team",
      content: "**Titre :** My Office, My Team\n\nNow that you can introduce yourself, it’s time to describe your surroundings. Being able to talk about your office and your team is a fundamental skill for everyday conversation at work. This lesson will give you the vocabulary and grammar to do it clearly and correctly.\n\n**Objectif :** By the end of this lesson, you will be able to describe your workspace and introduce your team members using correct articles (a/an/the) and plural nouns."
    },
    "video": {
      title: "A Tour of the Office",
      content: "**Titre :** A Tour of the Office\n\n**(Scene: Anna from Lesson 1.1 is at her desk. Her colleague, Mark, walks over.)**\n\n**NARRATEUR (Voix off, warm and professional) :** It’s Anna’s second day. Her colleague, Mark, is giving her a tour of the office.\n\n**MARK :** Hey Anna, do you have a minute? I can show you around.\n\n**ANNA :** Yes, thank you! That would be great.\n\n**MARK :** (Points) So, this is **a** typical workstation. You have **a** computer, **a** monitor, and **a** phone. **The** computer is new. Over there, that’s **the** printer for our team. We also have **a** meeting room on this floor.\n\n**NARRATEUR :** Listen to how Mark uses \"a\" and \"the\". He says \"a computer\" the first time, because it’s one of many. He says \"the printer\" because it’s a specific printer for their team.\n\n**(They walk down a hallway.)**\n\n**MARK :** And this is our team. There are five **people** on the team. That’s Maria, she’s **an** analyst. And those are the two **coordinators**, John and Sarah.\n\n**ANNA :** It’s nice to meet everyone.\n\n**NARRATEUR :** Mark uses plural nouns like \"people\" and \"coordinators\" to talk about groups. He also says \"an analyst\" because the word \"analyst\" starts with a vowel sound. Understanding these small words makes a big difference.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Describing Your World: Articles & Plurals",
      content: "**Titre :** Describing Your World: Articles & Plurals\n\nTo describe your office and team, you need to master articles and plurals.\n\n#### **Pattern 1 → Articles (a/an/the)**\n\nArticles specify which noun you are talking about.\n\n*   **a / an** (un/une): Use for a general, non-specific noun.\n    *   Use **a** before a consonant sound: **a** desk, **a** manager.\n    *   Use **an** before a vowel sound (a, e, i, o, u): **an** office, **an** analyst, **an** hour.\n*   **the** (le/la/les): Use for a specific noun that you and the listener both know.\n    *   \"This is **a** computer.\" (General)\n    *   \"**The** computer is new.\" (The specific computer we are looking at)\n\n**Exemple interactif :**\n*Fill in the blank: \"I work in ___ big building. ___ building is downtown.\"* (Answer: a, The)\n\n#### **Pattern 2 → Plural Nouns**\n\nPlurals are used for more than one item.\n\n*   **Regular Plurals:** Add **-s** (desk → desks, computer → computers).\n*   **Nouns ending in -s, -sh, -ch, -x, -z:** Add **-es** (box → boxes, boss → bosses).\n*   **Nouns ending in consonant + y:** Change **-y** to **-ies** (policy → policies, agency → agencies).\n*   **Irregular Plurals:** Some common nouns have special plural forms. You must memorize them.\n    *   person → **people**\n    *   child → **children**\n    *   man → **men**\n    *   woman → **women**\n\n**Exemple interactif :**\n*What is the plural of \"policy\"?* (Answer: policies)"
    },
    "written": {
      title: "Describe Your Workspace",
      content: "**Titre :** Describe Your Workspace\n\n**Instructions :** Write 5 sentences describing your office or workspace. Use the vocabulary and grammar from this lesson (articles, plurals, office vocabulary).\n\n**(Example: I have a desk and a computer. The computer is black. There are two monitors on the desk. I also have many pens and three notebooks.)**"
    },
    "oral": {
      title: "Pronunciation: The \"TH\" Sound",
      content: "**Titre :** Pronunciation: The \"TH\" Sound\n\n**Instructions :** The \"th\" sound is the most common pronunciation challenge for francophones. It is essential for clear English. Record yourself practicing these words and sentences.\n\n**Exercice 1 : The Voiceless /θ/ sound (think, thank)** (4 minutes)\n*   Place your tongue between your teeth and blow air. There is no vibration.\n*   Practice: **th**ink, **th**ank you, **th**ree, pa**th**, bo**th**.\n\n**Exercice 2 : The Voiced /ð/ sound (the, this)** (4 minutes)\n*   Place your tongue between your teeth and make a sound with your vocal cords. There is vibration.\n*   Practice: **th**e, **th**is, **th**at, **th**ose, mo**th**er, bro**th**er."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 1.2: My Office, My Team",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the correct article: She is ___ excellent manager.", options: ["a", "an", "the", "(no article)"], answer: "an", feedback: "Correct! We use \"an\" before a word that starts with a vowel sound, like \"excellent\"." },
          { id: 2, type: "multiple-choice" as const, question: "What is the correct plural of \"person\"?", options: ["persons", "peoples", "people", "persones"], answer: "people", feedback: "Correct! \"Person\" has an irregular plural form: \"people\"." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the sentence: I have ___ new policy. ___ policy is very important.", options: ["a / The", "the / A", "an / The", "a / A"], answer: "a / The", feedback: "Correct! We use \"a\" for the first general mention, and \"the\" for the second specific mention." },
          { id: 4, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["There are three boxs on the table.", "There are three boxies on the table.", "There are three boxes on the table.", "There are three box on the table."], answer: "There are three boxes on the table.", feedback: "Correct! For nouns ending in -x, we add -es to make them plural." },
          { id: 5, type: "multiple-choice" as const, question: "Which word has a different \"th\" sound from the others?", options: ["the", "this", "that", "thank you"], answer: "thank you", feedback: "Correct! \"Thank you\" has the voiceless /θ/ sound, while the others have the voiced /ð/ sound." }
        ]
      }
    },
    "coaching": {
      title: "Canadian English vs. British/American",
      content: "**Titre :** Canadian English vs. British/American\n\nYou will hear different English accents in Canada. Don’t worry! Canadian English is a mix of American and British English, but it is very easy to understand.\n\n**Pourquoi ?**\n1.  **Spelling:** We often use British spelling (colo**ur**, cent**re**), but American spelling is also common and accepted.\n2.  **Vocabulary:** We use some unique Canadian words (e.g., \"washroom\" for bathroom, \"toque\" for a winter hat), but mostly North American vocabulary.\n3.  **Pronunciation:** The Canadian accent is very similar to the standard American accent. The famous \"eh?\" is mostly a stereotype.\n\n**Votre nouvelle routine :**\n1.  **Listen actively:** Pay attention to how your Canadian colleagues speak. It’s the best model.\n2.  **Be consistent:** Choose one spelling (e.g., colour) and use it consistently in your writing."
    },
  },
  "1.3": {
    "hook": {
      title: "Numbers, Dates & Time",
      content: "**Titre :** Numbers, Dates & Time\n\nIn the professional world, time is money. Being able to understand and communicate schedules, deadlines, and appointments is not just a convenience—it's a necessity. This lesson will equip you with the language to manage your time and schedule effectively in English.\n\n**Objectif :** By the end of this lesson, you will be able to discuss your daily schedule and arrange meetings using the simple present tense, numbers, dates, and times correctly."
    },
    "video": {
      title: "The Canadian Calendar",
      content: "**Titre :** The Canadian Calendar\n\n**(Scene: A split screen. On the left, a calendar view in Outlook. On the right, Anna is on a Teams call with her colleague, Mark.)**\n\n**NARRATEUR (Voix off, clear and precise) :** In the Canadian public service, scheduling is done in English. It’s important to understand the conventions for dates and times.\n\n**MARK :** Hi Anna. Let’s schedule a meeting to discuss the project. Are you free on **Friday, October 27th**?\n\n**ANNA :** Yes, I am. What time?\n\n**MARK :** How about **two-thirty PM**? That’s **14:30**.\n\n**NARRATEUR :** Notice the date format: **Month, Day, Year**. This is the standard in North America. For time, the 12-hour clock (AM/PM) is common in speech, but the 24-hour clock is often used in writing.\n\n**ANNA :** Two-thirty PM on Friday works for me. Which room?\n\n**MARK :** I’ll book room **305-B**. I start my day early, so I usually send the invitations in the morning.\n\n**NARRATEUR :** Mark uses the **simple present tense** (\"I start my day early,\" \"I usually send\") to talk about his habits and routines. This is a key tense for describing your daily work.\n\n**(Mark creates the meeting in Outlook, showing the date, time, and location clearly.)**\n\n**ANNA :** Perfect. I have it. Thank you!\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Talking About Your Routine: Simple Present",
      content: "**Titre :** Talking About Your Routine: Simple Present\n\nTo talk about schedules, habits, and routines, we use the **Simple Present** tense.\n\n#### **Pattern 1 → Affirmative & Negative**\n\n*   For **I / You / We / They**, use the base verb.\n    *   \"I **start** at 8:30 AM.\"\n    *   \"They **work** from home on Fridays.\"\n*   For **He / She / It**, add **-s** to the verb.\n    *   \"She **starts** at 9:00 AM.\"\n    *   \"He **works** in a different building.\"\n\n*   For negatives, use **don't** (do not) or **doesn't** (does not).\n    *   \"I **don't** work on weekends.\"\n    *   \"She **doesn't** take a long lunch.\"\n\n**Exemple interactif :**\n*Fill in the blank: \"He ___ (work) at the Department of Finance.\"* (Answer: works)\n\n#### **Pattern 2 → Numbers, Dates, and Time**\n\n*   **Numbers:** Be careful with \"teen\" numbers (13, 14, 15) and \"-ty\" numbers (30, 40, 50). The stress is different: thir-**TEEN** vs. **THIR**-ty.\n*   **Dates:** Say: \"Month Day\". Example: \"October 27th\" or \"October twenty-seventh\". Write: October 27, 2026.\n*   **Time:**\n    *   **AM:** morning (midnight to noon)\n    *   **PM:** afternoon/evening (noon to midnight)\n    *   \"Two-thirty PM\" or \"Half past two.\"\n    *   \"A quarter to three\" (2:45).\n\n**Exemple interactif :**\n*How do you say \"15:00\" using the 12-hour clock?* (Answer: 3:00 PM)"
    },
    "written": {
      title: "Your Weekly Schedule",
      content: "**Titre :** Your Weekly Schedule\n\n**Instructions :** Create a simple schedule for your typical work week. Write at least 5 sentences describing your routine using the simple present tense and time expressions.\n\n**(Example: On Mondays, I start work at 8:00 AM. I have a team meeting at 9:30 AM. I take my lunch break at noon. I don't have meetings in the afternoon. I finish work at 4:30 PM.)**"
    },
    "oral": {
      title: "Numbers 1–100 Drill",
      content: "**Titre :** Numbers 1–100 Drill\n\n**Instructions :** Many francophones confuse \"teen\" and \"-ty\" numbers. Record yourself saying these pairs of numbers clearly. Focus on putting the stress in the right place.\n\n**Exercice 1 : Pronunciation Drill (8 minutes)**\n*   13 (thir-**TEEN**) / 30 (**THIR**-ty)\n*   14 (four-**TEEN**) / 40 (**FOR**-ty)\n*   15 (fif-**TEEN**) / 50 (**FIF**-ty)\n*   16 (six-**TEEN**) / 60 (**SIX**-ty)\n*   17 (seven-**TEEN**) / 70 (**SEVEN**-ty)\n*   18 (eigh-**TEEN**) / 80 (**EIGH**-ty)\n*   19 (nine-**TEEN**) / 90 (**NINE**-ty)"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 1.3: Numbers, Dates & Time",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the correct verb form: She ___ her emails every morning.", options: ["check", "checks", "checking", "is check"], answer: "checks", feedback: "Correct! For he/she/it in the simple present, we add -s to the verb." },
          { id: 2, type: "multiple-choice" as const, question: "How do you write \"September 15, 2026\" in the standard Canadian format?", options: ["15/09/2026", "2026-09-15", "September 15, 2026", "15 September 2026"], answer: "September 15, 2026", feedback: "Correct! The standard format in North America is Month Day, Year." },
          { id: 3, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["I no work on Fridays.", "He don't work in this office.", "She doesn't work on the weekend.", "They doesn't work here."], answer: "She doesn't work on the weekend.", feedback: "Correct! The negative form for he/she/it is \"doesn't\" + base verb." },
          { id: 4, type: "multiple-choice" as const, question: "What is another way to say \"13:00\"?", options: ["1:00 AM", "1:00 PM", "13:00 AM", "13:00 PM"], answer: "1:00 PM", feedback: "Correct! 13:00 on the 24-hour clock is 1:00 PM on the 12-hour clock." },
          { id: 5, type: "multiple-choice" as const, question: "Which number has the stress on the first syllable?", options: ["Thirteen", "Fourteen", "Fifty", "Sixteen"], answer: "Fifty", feedback: "Correct! \"Fifty\" (FIF-ty) has the stress on the first syllable, while the \"teen\" numbers have stress on the second syllable." }
        ]
      }
    },
    "coaching": {
      title: "Don’t Translate — Think in English",
      content: "**Titre :** Don’t Translate — Think in English\n\nWhen you learn a new language, it is natural to translate from your first language. However, to become fluent, you must start thinking directly in English. This is one of the most important skills you can develop.\n\n**Pourquoi ?**\n1.  **Speed:** Thinking in English is much faster than translating. It allows for natural conversation.\n2.  **Accuracy:** Direct thinking helps you use English sentence structures naturally, instead of forcing French structures into English.\n\n**Votre nouvelle routine :**\n1.  **Narrate your actions:** As you do simple tasks (make coffee, open a file), say the words in your head in English. \"I am making coffee. I am opening the file.\"\n2.  **Use a monolingual dictionary:** Look up new English words in an English dictionary (like Merriam-Webster) instead of a bilingual one. This forces you to stay in the \"English zone\"."
    },
  },
  "1.4": {
    "hook": {
      title: "Can You Help Me?",
      content: "**Titre :** Can You Help Me?\n\nAsking for help is a sign of strength, not weakness. In a new job or a new language, it is essential for success. This lesson will teach you how to ask for help and directions politely and effectively, ensuring you get the support you need to thrive in your role.\n\n**Objectif :** By the end of this lesson, you will be able to ask for help and directions politely using possessive adjectives and prepositions of place."
    },
    "video": {
      title: "Asking for Help at Work",
      content: "**Titre :** Asking for Help at Work\n\n**(Scene: Anna is at her desk, looking confused by a document. She approaches her colleague, Mark.)**\n\n**NARRATEUR (Voix off, supportive and clear) :** Anna needs help understanding a document. Let’s see how she asks for assistance politely.\n\n**ANNA :** Excuse me, Mark. Could you help me for a minute? I don’t understand this report.\n\n**MARK :** Of course. Let me see. Ah, this is the weekly summary. The key information is **on** the first page.\n\n**NARRATEUR :** Anna uses the polite phrase \"Could you help me?\". Mark uses the preposition \"on\" to describe the location of the information.\n\n**(Scene: Later, Anna needs to find the boardroom. She asks another colleague.)**\n\n**ANNA :** Excuse me, where is the boardroom? **My** meeting is **at** 10:00 AM.\n\n**COLLEAGUE :** It’s **on** this floor. Go down this hallway and it’s the last door **on** the left, **next to** the Director’s office.\n\n**ANNA :** Thank you so much!\n\n**NARRATEUR :** Anna uses the possessive adjective \"my\" to talk about her meeting. The colleague uses prepositions of place like \"on,\" \"down,\" and \"next to\" to give clear directions. Mastering these small words is crucial for communication.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Locating Things: Possessives & Prepositions",
      content: "**Titre :** Locating Things: Possessives & Prepositions\n\nTo ask for and give directions, you need possessive adjectives and prepositions of place.\n\n#### **Pattern 1 → Possessive Adjectives**\n\nPossessive adjectives show who owns something. They come before a noun.\n\n*   **my** (mon/ma/mes)\n*   **your** (ton/ta/tes, votre/vos)\n*   **his** (son/sa/ses - for a man)\n*   **her** (son/sa/ses - for a woman)\n*   **its** (son/sa/ses - for a thing)\n*   **our** (notre/nos)\n*   **their** (leur/leurs)\n\n**Exemple interactif :**\n*Fill in the blank: \"That is ___ (Anna’s) desk.\"* (Answer: her)\n\n#### **Pattern 2 → Prepositions of Place**\n\nPrepositions of place tell you where something is located.\n\n*   **in:** Inside an enclosed space (in the office, in the building)\n*   **on:** On a surface (on the desk, on the wall, on the second floor)\n*   **at:** At a specific point or location (at the reception desk, at the door)\n*   **under:** Below something (under the table)\n*   **next to / beside:** Immediately at the side of something (next to the printer)\n*   **between:** In the space separating two things (between the two offices)\n\n**Exemple interactif :**\n*Choose the correct preposition: \"The coffee machine is ___ the kitchen.\"* (Answer: in)"
    },
    "written": {
      title: "Write a Help Request Email",
      content: "**Titre :** Write a Help Request Email\n\n**Instructions :** You are having a problem with your computer. Write a short, polite email to the IT Support helpdesk (it-support@department.gc.ca) to ask for help. Describe the problem in one simple sentence.\n\n**(Example Subject: Problem with my computer)**\n**(Example Body: Dear IT Support, Could you please help me? My computer is very slow. My office is room 412. Thank you, [Your Name])**"
    },
    "oral": {
      title: "Role-Play: Asking for Directions",
      content: "**Titre :** Role-Play: Asking for Directions\n\n**Instructions :** Record yourself performing both roles in this short dialogue. Focus on using polite intonation when asking for help.\n\n**Person A (You):** \"Excuse me, can you help me? Where is the cafeteria?\"\n**Person B (You):** \"Yes, of course. It’s on the ground floor, next to the main entrance.\"\n**Person A (You):** \"Thank you!\"\n**Person B (You):** \"You’re welcome.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 1.4: Can You Help Me?",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the correct possessive adjective: That is David. This is ___ office.", options: ["her", "his", "its", "my"], answer: "his", feedback: "Correct! We use \"his\" to show possession for a man (David)." },
          { id: 2, type: "multiple-choice" as const, question: "Which preposition is used for a specific floor in a building?", options: ["in", "at", "on", "under"], answer: "on", feedback: "Correct! We say \"on the second floor\", \"on the ground floor\"." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the sentence: The printer is ___ the computer and the scanner.", options: ["between", "on", "at", "under"], answer: "between", feedback: "Correct! \"Between\" is used to describe something in the middle of two other things." },
          { id: 4, type: "multiple-choice" as const, question: "Which is the most polite way to ask for help?", options: ["Help me.", "Can you help me?", "I need help.", "Would you mind helping me?"], answer: "Would you mind helping me?", feedback: "Correct! \"Would you mind...?\" is a very polite and formal way to ask for help." },
          { id: 5, type: "multiple-choice" as const, question: "Complete the sentence: The files are ___ the cabinet.", options: ["on", "at", "in", "next to"], answer: "in", feedback: "Correct! We use \"in\" for enclosed spaces like a cabinet." }
        ]
      }
    },
    "coaching": {
      title: "Building Confidence One Step at a Time",
      content: "**Titre :** Building Confidence One Step at a Time\n\nLearning a language is like building a house. You need to lay a strong foundation, one brick at a time. Each new word, each successful conversation, is a brick in your new house.\n\n**Pourquoi ?**\n1.  **Momentum:** Small, consistent wins build momentum and make the learning process feel less overwhelming.\n2.  **Reinforcement:** Celebrating small achievements reinforces the new knowledge in your brain.\n\n**Votre nouvelle routine :**\n1.  **Acknowledge your daily win:** At the end of each day, think of one thing you did in English, no matter how small (e.g., understood an email, said \"good morning\").\n2.  **Review your progress:** At the end of each week, look back at the lessons you completed. You will be surprised at how much you have learned."
    },
  },
  "2.1": {
    "hook": {
      title: "What Do You Do?",
      content: "**Titre :** What Do You Do?\n\nIn the Canadian public service, your job title and classification are a key part of your professional identity. Being able to ask about and describe your role is essential for networking, understanding team structures, and navigating your career. This lesson will teach you how to talk about jobs and roles with confidence.\n\n**Objectif :** By the end of this lesson, you will be able to ask and answer questions about job roles and responsibilities using correct question forms with \"What,\" \"Who,\" and \"Where.\""
    },
    "video": {
      title: "Government Roles Explained",
      content: "**Titre :** Government Roles Explained\n\n**(Scene: Anna is at a virtual team meeting on MS Teams. The manager, David, is introducing a new team member.)**\n\n**NARRATEUR (Voix off, informative and clear) :** Understanding roles is key to understanding how government works. Let’s learn some common job titles and how to ask about them.\n\n**DAVID :** Team, I’d like to welcome Omar. He’s our new Senior Policy Advisor.\n\n**(Later, Anna has a one-on-one call with Omar to get to know him.)**\n\n**ANNA :** Welcome, Omar! So, **what** do you do, exactly?\n\n**OMAR :** I’m a Senior Policy Advisor. My classification is **EC-06**. I work on the international files.\n\n**ANNA :** Interesting! And **who** is your direct manager?\n\n**OMAR :** I report to David, same as you.\n\n**ANNA :** And **where** do you work from usually? Are you in the office?\n\n**OMAR :** I work from home most days, but I’m in the office on Wednesdays.\n\n**NARRATEUR :** Anna uses key question words: **What** for roles, **Who** for people, and **Where** for location. Omar also mentions his classification, like EC-06. These are codes for different job categories in the government.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Asking Questions: What, Who, Where",
      content: "**Titre :** Asking Questions: What, Who, Where\n\nTo get information, you need to ask the right questions. The structure for these \"Wh-questions\" is different from a simple yes/no question.\n\n#### **Pattern 1 → Question Structure (Wh- + Auxiliary + Subject + Verb)**\n\n**Question Word** + **Auxiliary Verb (do/does)** + **Subject** + **Main Verb**?\n\n*   **What** + **do** + **you** + **do**?\n*   **Where** + **does** + **she** + **work**?\n*   **Who** + **do** + **they** + **report to**?\n\n**Note:** For the verb \"to be,\" you don’t need an auxiliary verb.\n*   **Who** **is** your manager?\n*   **Where** **is** the office?\n\n**Exemple interactif :**\n*Put the words in the correct order: \"work / do / you / where ?\"* (Answer: Where do you work?)\n\n#### **Pattern 2 → Common Government Classifications**\n\nIn the Canadian government, jobs are grouped into classifications. Here are a few common ones:\n\n*   **EC** (Economics and Social Science Services): Policy analysts, researchers.\n*   **AS** (Administrative Services): Administrative assistants, project coordinators.\n*   **PM** (Programme Administration): Program officers, project managers.\n*   **CS** (Computer Systems): IT specialists, developers.\n\nKnowing these helps you understand people’s roles quickly.\n\n**Exemple interactif :**\n*An IT specialist is likely in which classification group?* (Answer: CS)"
    },
    "written": {
      title: "Describe Your Job",
      content: "**Titre :** Describe Your Job\n\n**Instructions :** Write a short paragraph (3-4 sentences) describing your job. Include your job title, your main responsibility, and your department. If you are not currently working, describe a job you would like to have.\n\n**(Example: I am a project coordinator. I work in the PM group. I organize meetings and prepare reports for my team. I work at the Department of Health.)**"
    },
    "oral": {
      title: "Interview a Colleague",
      content: "**Titre :** Interview a Colleague\n\n**Instructions :** Record yourself asking and answering these five questions about a job (you can invent the answers for a fictitious colleague). Focus on the falling intonation at the end of Wh-questions.\n\n1.  What is your name?\n2.  What is your job title?\n3.  What do you do?\n4.  Where do you work?\n5.  Who is your manager?"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 2.1: What Do You Do?",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which question is grammatically correct?", options: ["Where you work?", "What you do?", "Where do you work?", "Who you are?"], answer: "Where do you work?", feedback: "Correct! The structure is Question Word + Auxiliary (do) + Subject (you) + Verb (work)." },
          { id: 2, type: "multiple-choice" as const, question: "The classification \"EC\" usually refers to...", options: ["IT specialists", "Administrative assistants", "Policy analysts", "Project managers"], answer: "Policy analysts", feedback: "Correct! EC stands for Economics and Social Science Services, which includes policy analysts." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the question: ___ does she report to?", options: ["What", "Where", "Who", "When"], answer: "Who", feedback: "Correct! We use \"Who\" to ask about a person." },
          { id: 4, type: "multiple-choice" as const, question: "Choose the correct response: \"What does he do?\"", options: ["He is at his desk.", "He is a manager.", "He is David.", "He do a report."], answer: "He is a manager.", feedback: "Correct! \"What does he do?\" asks for his job or profession." },
          { id: 5, type: "multiple-choice" as const, question: "Which question does NOT need the auxiliary verb \"do\" or \"does\"?", options: ["Where ___ you live?", "What ___ you think?", "Who ___ your director?", "When ___ you start?"], answer: "Who ___ your director?", feedback: "Correct! When we use the verb \"to be\", we don't need an auxiliary. \"Who is your director?\"" }
        ]
      }
    },
    "coaching": {
      title: "Your English Identity",
      content: "**Titre :** Your English Identity\n\nSpeaking a new language can sometimes feel like you are playing a role or not being your true self. It’s important to remember that you are the same professional, with the same skills and expertise. English is just a new tool in your toolkit.\n\n**Pourquoi ?**\n1.  **Authenticity builds trust:** People connect with the real you. Don’t try to be someone else in English.\n2.  **Confidence comes from competence:** Your professional competence is your foundation. Your language skills will catch up.\n\n**Votre nouvelle routine :**\n1.  **Identify your strengths:** Remind yourself of what you are good at in your job. Your value is not just your language skill.\n2.  **Use your own words:** As you learn more vocabulary, start choosing the words that feel most natural to you, not just the ones in the textbook."
    },
  },
  "2.2": {
    "hook": {
      title: "Our Department",
      content: "**Titre :** Our Department\n\nEvery public servant is part of a larger organization with a specific mission. Being able to describe your department—its mandate, size, and structure—is a core professional skill. This lesson will give you the language to present your department clearly and concisely.\n\n**Objectif :** By the end of this lesson, you will be able to describe your department using \"There is/There are\" and demonstrative pronouns (this, that, these, those)."
    },
    "video": {
      title: "How Government Works",
      content: "**Titre :** How Government Works\n\n**(Scene: Anna is at an orientation session for new employees. The presenter is standing in front of a slide showing a simple diagram of the government structure.)**\n\n**NARRATEUR (Voix off, clear and professional) :** The Government of Canada is a large, complex organization. Let’s learn how to describe its basic structure.\n\n**PRESENTER :** Welcome, everyone. The Government of Canada is made up of **departments**, **agencies**, and **Crown corporations**. For example, Health Canada is a department. The Canada Revenue Agency is an agency. **There is** one Prime Minister, and **there are** many ministers.\n\n**NARRATEUR :** The presenter uses \"There is\" for singular nouns (one Prime Minister) and \"There are\" for plural nouns (many ministers). This is a key structure for describing what exists.\n\n**(Scene: Later, Anna is talking to her colleague, Mark.)**\n\n**ANNA :** So, what is the mandate of our department?\n\n**MARK :** Our department is responsible for innovation. **This** is our main office here in Ottawa, but **those** offices over there are for a different department. **These** are our new strategic documents for the year.\n\n**NARRATEUR :** Mark uses demonstratives. **This** for something singular and close. **These** for something plural and close. **That** for something singular and far. **Those** for something plural and far.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Describing What Exists: There is/are & Demonstratives",
      content: "**Titre :** Describing What Exists: There is/are & Demonstratives\n\nTwo simple structures are essential for describing your work environment: \"There is/There are\" and demonstratives.\n\n#### **Pattern 1 → There is / There are**\n\nUse this structure to state that something exists.\n\n*   **There is** (+ a singular noun): Used for one thing.\n    *   \"**There is** a meeting at 3 PM.\"\n    *   \"**There is** a new policy.\"\n*   **There are** (+ a plural noun): Used for more than one thing.\n    *   \"**There are** three new employees.\"\n    *   \"**There are** many departments in the government.\"\n\n**Exemple interactif :**\n*Fill in the blank: \"___ two meeting rooms on this floor.\"* (Answer: There are)\n\n#### **Pattern 2 → Demonstratives (This, That, These, Those)**\n\nUse demonstratives to point out specific things.\n\n| | **Near (ici)** | **Far (là-bas)** |\n|---|---|---|\n| **Singular** | **This** (ce/cet/cette) | **That** (ce/cet/cette... là) |\n| **Plural** | **These** (ces) | **Those** (ces... là) |\n\n*   \"**This** is my desk.\"\n*   \"**That** is the Deputy Minister’s office over there.\"\n*   \"**These** are my files.\"\n*   \"**Those** are the documents you requested.\"\n\n**Exemple interactif :**\n*You are holding one report. What do you say? \"___ is the report.\"* (Answer: This)"
    },
    "written": {
      title: "Present Your Department",
      content: "**Titre :** Present Your Department\n\n**Instructions :** Write a short description of your department (real or fictitious). Use \"There is/There are\" and at least two demonstratives. Include its name, mandate, and number of employees.\n\n**(Example: I work at the Department of Innovation. This is a large department. There are over 5,000 employees. Our mandate is to support new technology. That is our main building across the street.)**"
    },
    "oral": {
      title: "Record a Department Tour",
      content: "**Titre :** Record a Department Tour\n\n**Instructions :** Imagine you are giving a short tour of your office. Record yourself saying these four sentences. Focus on stressing the demonstrative pronouns correctly.\n\n1.  **This** is my computer.\n2.  **That** is the boardroom.\n3.  **These** are the new reports.\n4.  **Those** are the offices for the other team."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]"
    },
    "coaching": {
      title: "Embrace Mistakes",
      content: "**Titre :** Embrace Mistakes\n\nWhen you speak a new language, you will make mistakes. This is not a problem; it is a necessary part of the learning process. The most successful language learners are not afraid to make mistakes.\n\n**Pourquoi ?**\n1.  **Mistakes are data:** Each mistake gives you information about what you need to practice.\n2.  **Communication over perfection:** Most of the time, people will still understand you, even with a small grammar mistake. The goal is to communicate.\n\n**Votre nouvelle routine :**\n1.  **Don’t apologize:** If you make a mistake, just correct yourself and continue. Don’t say \"Sorry for my English.\"\n2.  **Note your mistakes:** If you notice you often make the same mistake, write it down. This awareness is the first step to correcting it."
    },
  },
  "2.3": {
    "hook": {
      title: "Office Supplies & Technology",
      content: "**Titre :** Office Supplies & Technology\n\nModern work is impossible without technology. From sending an email to joining a virtual meeting, your digital toolkit is essential. This lesson will teach you the vocabulary and grammar to give and follow simple instructions related to office technology and supplies.\n\n**Objectif :** By the end of this lesson, you will be able to give and follow simple, step-by-step instructions for common office tasks using imperatives."
    },
    "video": {
      title: "Your Digital Toolkit",
      content: "**Titre :** Your Digital Toolkit\n\n**(Scene: An IT specialist, Ken, is at Anna’s desk, helping her set up her new laptop.)**\n\n**NARRATEUR (Voix off, practical and direct) :** Every new employee needs to learn the digital tools of the workplace. Let’s watch Ken from IT help Anna get started.\n\n**KEN :** Okay, Anna. First, **turn on** your laptop. Then, **connect** to the Wi-Fi network. The password is on this sticker. **Enter** the password and **click** ‘Connect’.\n\n**ANNA :** Okay, I’m connected.\n\n**NARRATEUR :** Ken is using **imperatives**. These are verbs used for commands or instructions. They are simple, direct, and very common in technical support and guides.\n\n**KEN :** Great. Now, **open** Outlook for your email and **open** MS Teams for chat. **Don’t forget** to save your work often. And please, **do not write** your password on a sticky note!\n\n**ANNA :** (Laughs) I won’t. Thank you for your help.\n\n**NARRATEUR :** Ken also uses negative imperatives: \"Don’t forget\" and \"Do not write.\" These tell you what *not* to do. Understanding imperatives is key to following any set of instructions.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Giving Instructions: The Imperative",
      content: "**Titre :** Giving Instructions: The Imperative\n\nTo give instructions, commands, or directions, we use the **imperative** form of the verb. It is the simplest verb form.\n\n#### **Pattern 1 → Affirmative Imperatives**\n\nUse the base form of the verb. The subject \"you\" is implied.\n\n*   \"**Open** the document.\"\n*   \"**Click** on the link.\"\n*   \"**Save** the file.\"\n*   \"**Enter** your password.\"\n\nThis form is direct. To be more polite, you can add \"please.\"\n*   \"**Please open** the document.\"\n*   \"**Click** on the link, **please**.\"\n\n**Exemple interactif :**\n*What is the imperative form of the verb \"to write\"?* (Answer: Write)\n\n#### **Pattern 2 → Negative Imperatives**\n\nTo tell someone *not* to do something, use **Do not** (or the contraction **Don’t**) + the base verb.\n\n*   \"**Do not open** that email.\"\n*   \"**Don’t forget** to log out.\"\n*   \"**Do not share** your password.\"\n\n**Exemple interactif :**\n*Make this instruction negative: \"Click on the advertisement.\"* (Answer: Do not click on the advertisement. / Don’t click on the advertisement.)"
    },
    "written": {
      title: "Write a How-To Guide",
      content: "**Titre :** Write a How-To Guide\n\n**Instructions :** Write 5 simple, step-by-step instructions for a common office task. Use the imperative form. Choose one of the following tasks:\n\n*   How to make coffee\n*   How to book a meeting room in Outlook\n*   How to connect to the office Wi-Fi\n\n**(Example for making coffee: 1. Open the cupboard. 2. Take a coffee pod. 3. Put the pod in the machine. 4. Place your mug on the tray. 5. Press the ‘Start’ button.)**"
    },
    "oral": {
      title: "Explain a Process",
      content: "**Titre :** Explain a Process\n\n**Instructions :** Record yourself explaining a simple computer task step-by-step, as if you are helping a new colleague. Use at least 4 imperative verbs. For example, explain how to create a new folder on the desktop.\n\n**(Example script: \"First, go to the desktop. Then, right-click on the screen. Select ‘New’, then select ‘Folder’. Type the name for the folder and press Enter.\")**"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 2.3: Office Supplies & Technology",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which sentence is a correct imperative?", options: ["You open the door.", "To open the door.", "Open the door.", "Opening the door."], answer: "Open the door.", feedback: "Correct! The imperative is the base form of the verb, like \"Open\"." },
          { id: 2, type: "multiple-choice" as const, question: "How do you make the instruction \"Share your password\" negative?", options: ["No share your password.", "Not share your password.", "Don't share your password.", "You no share your password."], answer: "Don't share your password.", feedback: "Correct! The negative imperative is formed with \"Don't\" or \"Do not\" + the base verb." },
          { id: 3, type: "multiple-choice" as const, question: "Which word is a common piece of office technology?", options: ["Stove", "Headset", "Bed", "Shower"], answer: "Headset", feedback: "Correct! A headset is used for calls and virtual meetings." },
          { id: 4, type: "multiple-choice" as const, question: "To make an imperative more polite, you can add...", options: ["maybe", "now", "please", "fast"], answer: "please", feedback: "Correct! Adding \"please\" softens the command and makes it more polite." },
          { id: 5, type: "multiple-choice" as const, question: "A francophone might confuse the English word \"file\" with the French word \"fil\". This is an example of a...", options: ["synonym", "false friend (faux ami)", "preposition", "conjunction"], answer: "false friend (faux ami)", feedback: "Correct! False friends are words that look similar in two languages but have different meanings." }
        ]
      }
    },
    "coaching": {
      title: "The Power of Repetition",
      content: "**Titre :** The Power of Repetition\n\nWhen you learn new vocabulary, it is easy to forget. The secret to remembering new words is **spaced repetition**. This means reviewing the words at increasing intervals: after one day, then three days, then one week, and so on.\n\n**Pourquoi ?**\n1.  **Brain science:** This method moves information from your short-term memory to your long-term memory.\n2.  **Efficiency:** It is more effective than studying the same list of words for hours.\n\n**Votre nouvelle routine :**\n1.  **Use flashcards:** Use physical or digital flashcards (like Anki or Quizlet) for new vocabulary. Put the English word on one side and the French translation or an image on the other.\n2.  **Review for 5 minutes every day:** Spend just five minutes each morning reviewing your flashcards. It is a small investment with a big return."
    },
  },
  "2.4": {
    "hook": {
      title: "Health & Safety at Work",
      content: "**Titre :** Health & Safety at Work\n\nYour well-being at work is a top priority. Understanding health and safety procedures is not just a requirement—it’s essential for protecting yourself and your colleagues. This lesson covers the fundamental language of workplace safety, from emergency exits to ergonomic workstations.\n\n**Objectif :** By the end of this lesson, you will be able to understand and give basic safety instructions using the modal verbs \"must,\" \"must not,\" and \"have to.\""
    },
    "video": {
      title: "Workplace Safety Basics",
      content: "**Titre :** Workplace Safety Basics\n\n**(Scene: A health and safety officer, Maria, is giving an orientation to a group of new employees, including Anna.)**\n\n**NARRATEUR (Voix off, serious and clear) :** Every employee must know the basic safety rules of the workplace. Let’s listen to Maria, the safety officer.\n\n**MARIA :** Welcome, everyone. Safety is our number one priority. First, emergencies. In case of a fire, you **must** exit the building immediately. You **must not** use the elevator. You **have to** use the stairs and go to the designated assembly point.\n\n**NARRATEUR :** Maria uses \"must\" and \"have to\" for obligations—things that are required. She uses \"must not\" for prohibitions—things that are forbidden.\n\n**MARIA :** Now, for daily safety. You **have to** wear your security badge at all times. For your well-being, you **must** take regular breaks from your computer. Your workstation **must** be ergonomic to prevent injury. If you see a safety hazard, like a water leak, you **must** report it immediately.\n\n**ANNA :** (To a colleague) So, we **have to** report any problem?\n\n**COLLEAGUE :** Yes, absolutely. It’s everyone’s responsibility.\n\n**NARRATEUR :** Understanding these modal verbs—must, must not, have to—is critical for following safety rules and keeping the workplace safe for everyone.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Expressing Obligation: Must / Must Not / Have To",
      content: "**Titre :** Expressing Obligation: Must / Must Not / Have To\n\nTo talk about rules, obligations, and prohibitions, we use modal verbs like \"must\" and \"have to.\"\n\n#### **Pattern 1 → Strong Obligation (Must & Have To)**\n\n**Must** and **have to** both express a strong obligation or necessity. In many cases, they are interchangeable.\n\n*   Structure: Subject + **must** / **have to** + base verb.\n*   \"You **must** wear your badge.\"\n*   \"You **have to** sign in at reception.\"\n\n**Note:** \"Have to\" changes for he/she/it.\n*   \"She **has to** complete her training.\"\n\n#### **Pattern 2 → Prohibition (Must Not)**\n\nTo say something is forbidden or strongly not allowed, use **must not**.\n\n*   Structure: Subject + **must not** + base verb.\n*   \"You **must not** block the fire exit.\"\n*   \"You **must not** share your password.\"\n\n**Contraction:** The contraction for \"must not\" is **mustn't**, but it is less common in formal writing.\n\n**Exemple interactif :**\n*Choose the correct modal: \"You ___ use the elevator during a fire drill.\"* (Answer: must not)\n\n**Don't have to vs. Must not**\n*   **Don't have to:** Means there is no obligation; it is not necessary. (\"You **don't have to** work on Saturday.\")\n*   **Must not:** Means it is prohibited. (\"You **must not** smoke in the building.\")\n\n**Exemple interactif :**\n*Fill in the blank: \"This is a public holiday. You ___ work.\"* (Answer: don't have to)"
    },
    "written": {
      title: "Write Safety Instructions",
      content: "**Titre :** Write Safety Instructions\n\n**Instructions :** Imagine you are the safety officer for your team. Write 5 safety rules for your workplace. Use \"must,\" \"must not,\" and \"have to\" at least once each.\n\n**(Example: 1. You must lock your computer when you leave your desk. 2. You must not leave confidential documents on the printer. 3. You have to report any security incident. 4. You must wear your ID badge. 5. You must not open suspicious emails.)**"
    },
    "oral": {
      title: "Report a Problem",
      content: "**Titre :** Report a Problem\n\n**Instructions :** You see a safety problem in the office (e.g., water on the floor, a broken chair, a blocked fire exit). Record a short voicemail message to the building facilities manager to report it. Describe the problem and its location.\n\n**(Example script: \"Hello, this is [Your Name] from room 613. I am calling to report a safety hazard. There is water on the floor in the kitchen on the 6th floor. Someone must clean it up. Thank you.\")**"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 2.4: Health & Safety at Work",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which sentence expresses a prohibition (something that is forbidden)?", options: ["You have to wear a badge.", "You must not use the elevator in a fire.", "You don't have to come in on weekends.", "You must attend the meeting."], answer: "You must not use the elevator in a fire.", feedback: "Correct! \"Must not\" is used to express a strong prohibition." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: She ___ finish the safety training by Friday.", options: ["have to", "must to", "has to", "musts"], answer: "has to", feedback: "Correct! For he/she/it, the form is \"has to\"." },
          { id: 3, type: "multiple-choice" as const, question: "What does \"You don't have to work tomorrow\" mean?", options: ["It is forbidden to work tomorrow.", "It is not necessary to work tomorrow.", "You have an obligation to work tomorrow.", "You must work tomorrow."], answer: "It is not necessary to work tomorrow.", feedback: "Correct! \"Don't have to\" means there is no obligation." },
          { id: 4, type: "multiple-choice" as const, question: "Choose the correct modal: In case of an emergency, you ___ stay calm.", options: ["must", "must not", "don't have to", "not must"], answer: "must", feedback: "Correct! \"Must\" is used to express a strong obligation or rule." },
          { id: 5, type: "multiple-choice" as const, question: "An ergonomic workstation is designed to...", options: ["be fast.", "be secure.", "prevent injury.", "be quiet."], answer: "prevent injury.", feedback: "Correct! Ergonomics is the science of designing the workplace to be safe and comfortable to prevent injury." }
        ]
      }
    },
    "coaching": {
      title: "Staying Calm Under Pressure",
      content: "**Titre :** Staying Calm Under Pressure\n\nIn an emergency or a stressful situation, your brain wants to revert to your first language. It’s a natural survival instinct. The key to communicating effectively in English under pressure is to use simple, clear language.\n\n**Pourquoi ?**\n1.  **Simplicity is clear:** In a crisis, nobody needs complex sentences. Short, direct instructions are best.\n2.  **Reduces cognitive load:** Trying to use complex grammar when you are stressed is difficult. Keep it simple to reduce mental effort.\n\n**Votre nouvelle routine :**\n1.  **Memorize key phrases:** Learn a few essential emergency phrases by heart (e.g., \"I need help,\" \"Call 911,\" \"Fire exit,\" \"Is everyone okay?\").\n2.  **Practice a calm tone:** When you practice your oral exercises, try to speak slowly and calmly, even if you are just recording yourself. This builds a habit of composure."
    },
  },
  "3.1": {
    "hook": {
      title: "My Typical Day",
      content: "**Titre :** My Typical Day\n\nHow was your day? This is one of the most common questions in any language. Being able to describe your daily routine is fundamental for building relationships with colleagues, managing expectations, and planning your work. This lesson will help you narrate your workday with clarity and confidence.\n\n**Objectif :** By the end of this lesson, you will be able to describe your typical workday in a clear sequence using the simple present tense (affirmative and negative) and common time expressions."
    },
    "video": {
      title: "A Day in the Life of a Public Servant",
      content: "**Titre :** A Day in the Life of a Public Servant\n\n**(Scene: A montage showing a public servant, CHLOE, going through her day. She speaks directly to the camera in a friendly, vlog style.)**\n\n**NARRATEUR (Voix off, engaging and friendly) :** What does a typical day look like for a Canadian public servant? Let’s follow Chloe, a program officer at ESDC.\n\n**CHLOE :** (Sipping coffee at her desk) Good morning! My day starts early. I **get** to the office around 8:00 AM. First, I **check** my emails and I **review** my calendar. I **don't like** surprises!\n\n**(Scene cuts to Chloe in a meeting room with colleagues.)**\n\n**CHLOE :** At 10:00 AM, we **have** our daily team meeting. My manager, he **doesn't attend** this meeting; it’s just for the team. We **discuss** our priorities for the day.\n\n**(Scene cuts to Chloe eating a sandwich at her desk.)**\n\n**CHLOE :** I usually **take** my lunch break at noon. I **don't go** out; I prefer to eat at my desk and read the news.\n\n**(Scene cuts to Chloe on a Teams call.)**\n\n**CHLOE :** In the afternoon, I **work** on my files. I **write** reports and I **answer** emails. Finally, I **leave** the office around 4:30 PM.\n\n**NARRATEUR :** Chloe uses the simple present tense to describe her routine. She uses verbs like \"check,\" \"have,\" and \"work.\" She also uses the negative forms \"don't\" and \"doesn't\" to say what she does not do. This is the language of daily life.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Narrating Your Routine: Simple Present Tense Review",
      content: "**Titre :** Narrating Your Routine: Simple Present Tense Review\n\nAs we learned in Lesson 1.3, the **Simple Present** is the key tense for talking about habits, routines, and facts.\n\n#### **Pattern 1 → Affirmative: I/You/We/They vs. He/She/It**\n\nRemember the rule: for **He/She/It**, add **-s**.\n\n*   I **work** from home.\n*   You **start** at 9 AM.\n*   He **starts** at 8 AM.\n*   She **checks** her email.\n*   We **have** a meeting.\n*   They **leave** at 5 PM.\n\n**Exemple interactif :**\n*Fill in the blank: \"My colleague ___ (prepare) the agenda for the meeting.\"* (Answer: prepares)\n\n#### **Pattern 2 → Negative: Don't vs. Doesn't**\n\nUse **don't** (do not) and **doesn't** (does not) to form the negative.\n\n*   I / You / We / They + **don't** + base verb\n    *   \"I **don't** take a long lunch.\"\n    *   \"They **don't** work on weekends.\"\n*   He / She / It + **doesn't** + base verb\n    *   \"He **doesn't** manage the team.\"\n    *   \"She **doesn't** have meetings on Fridays.\"\n\n**Exemple interactif :**\n*Make this sentence negative: \"He works in my building.\"* (Answer: He doesn't work in my building.)"
    },
    "written": {
      title: "My Workday Routine",
      content: "**Titre :** My Workday Routine\n\n**Instructions :** Write a short paragraph (5-6 sentences) describing your typical workday from start to finish. Use the simple present tense and include at least one negative sentence. Use transition words like \"First,\" \"Then,\" \"After that,\" and \"Finally.\"\n\n**(Example: My workday starts at 8:30 AM. First, I turn on my computer and check my emails. Then, I have a team meeting at 9:00 AM. I don't have a break in the morning. After that, I work on my files until lunch. Finally, I leave the office at 5:00 PM.)**"
    },
    "oral": {
      title: "Tell Me About Your Day",
      content: "**Titre :** Tell Me About Your Day\n\n**Instructions :** Record yourself reading the paragraph you just wrote. Focus on speaking with a natural, flowing rhythm. Pay attention to the pronunciation of the \"-s\" at the end of verbs for \"he/she/it\" (e.g., starts, checks, works)."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 3.1: My Typical Day",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the correct verb form: My manager ___ the meeting at 10 AM.", options: ["start", "starts", "starting", "is start"], answer: "starts", feedback: "Correct! For a third-person singular subject like \"my manager\" (he/she), we add -s to the verb in the simple present." },
          { id: 2, type: "multiple-choice" as const, question: "Which sentence is grammatically correct?", options: ["I no check my email in the evening.", "She don't work on this project.", "He doesn't have any meetings today.", "They doesn't report to the same director."], answer: "He doesn't have any meetings today.", feedback: "Correct! The negative form for \"he\" is \"doesn't\" + the base verb (have)." },
          { id: 3, type: "multiple-choice" as const, question: "Which word is a good transition to talk about the first step in a routine?", options: ["Finally", "First", "But", "So"], answer: "First", feedback: "Correct! \"First\" is used to introduce the beginning of a sequence." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the sentence: We ___ our lunch in the kitchen.", options: ["eats", "eat", "are eat", "eating"], answer: "eat", feedback: "Correct! For the subject \"we\", we use the base form of the verb." },
          { id: 5, type: "multiple-choice" as const, question: "Make this sentence negative: \"They work in our department.\"", options: ["They not work in our department.", "They doesn't work in our department.", "They no work in our department.", "They don't work in our department."], answer: "They don't work in our department.", feedback: "Correct! The negative form for \"they\" is \"don't\" + the base verb." }
        ]
      }
    },
    "coaching": {
      title: "Using Transition Words",
      content: "**Titre :** Using Transition Words\n\nWhen you tell a story or describe a process, transition words are like signposts for your listener. They make your story easy to follow. Using them will make you sound more fluent and organized.\n\n**Pourquoi ?**\n1.  **Clarity:** They create a logical flow (A → B → C).\n2.  **Fluency:** They connect your ideas smoothly, so you don't just list short, disconnected sentences.\n\n**Votre nouvelle routine :**\n1.  **Memorize a simple sequence:** Learn this basic sequence: **First... Then... After that... Finally...**\n2.  **Practice with your own routine:** When you think about your day, practice using these words. \"**First**, I wake up. **Then**, I have coffee. **After that**, I go to work. **Finally**, I come home.\""
    },
  },
  "3.2": {
    "hook": {
      title: "Making Appointments",
      content: "**Titre :** Making Appointments\n\nYour professional life is organized by your calendar. Booking meetings, scheduling calls, and setting deadlines are fundamental tasks. This lesson will teach you the essential prepositions of time so you can manage your schedule with precision and avoid any miscommunication.\n\n**Objectif :** By the end of this lesson, you will be able to schedule appointments and discuss your availability using the prepositions of time \"in,\" \"on,\" and \"at.\""
    },
    "video": {
      title: "Let's Find a Time",
      content: "**Titre :** Let's Find a Time\n\n**(Scene: Anna is on a Teams call with a colleague from another department, Jean-Luc.)**\n\n**NARRATEUR (Voix off, precise and professional) :** Scheduling meetings with colleagues is a daily activity. It requires specific language. Let’s see how Anna and Jean-Luc find a time to meet.\n\n**ANNA :** Hi Jean-Luc. I would like to schedule a meeting to discuss the new project.\n\n**JEAN-LUC :** Good idea. I am quite busy **in** the morning. Are you free **in** the afternoon?\n\n**ANNA :** Yes. How about **on** Wednesday?\n\n**JEAN-LUC :** Wednesday is good for me. Can we meet **at** 3:00 PM?\n\n**NARRATEUR :** Notice the prepositions. **In** for general parts of the day (in the morning). **On** for specific days (on Wednesday). **At** for specific times (at 3:00 PM).\n\n**ANNA :** Perfect. I will send you an invitation for the meeting **on** Wednesday **at** 3:00 PM.\n\n**JEAN-LUC :** Great. My birthday is **in** October, so I am taking some vacation **at** the end of the month. It’s good we are meeting this week.\n\n**NARRATEUR :** Jean-Luc also uses **in** for months (in October) and **at** for a specific point in time (at the end of the month). Mastering these three small words—in, on, at—is essential for clear scheduling.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The Time Pyramid: In / On / At",
      content: "**Titre :** The Time Pyramid: In / On / At\n\nPrepositions of time can be confusing. Think of them as a pyramid, from general to specific.\n\n**IN (General)**\n*   **Centuries:** in the 21st century\n*   **Decades:** in the 1990s\n*   **Years:** in 2026\n*   **Months:** in December\n*   **Weeks:** in two weeks\n*   **Seasons:** in the summer\n*   **Parts of the day:** in the morning, in the afternoon, in the evening\n\n**ON (More Specific)**\n*   **Days:** on Monday, on Friday\n*   **Dates:** on October 31st\n*   **Specific days:** on my birthday, on New Year’s Day\n\n**AT (Very Specific)**\n*   **Times:** at 9:00 AM, at noon, at midnight\n*   **Specific moments:** at the beginning of the meeting, at the end of the day\n*   **Exception:** at night\n\n**Exemple interactif :**\n*Fill in the blanks: \"The meeting is ___ Monday ___ 10:00 AM.\"* (Answer: on, at)"
    },
    "written": {
      title: "Schedule Your Week",
      content: "**Titre :** Schedule Your Week\n\n**Instructions :** You have three events to schedule. Write three separate sentences to put them in your calendar. Use the correct prepositions of time.\n\n1.  A team meeting / Friday / 10:00 AM\n2.  A project deadline / December\n3.  A dentist appointment / Wednesday afternoon\n\n**(Example: 1. The team meeting is on Friday at 10:00 AM. 2. The project deadline is in December. 3. The dentist appointment is on Wednesday in the afternoon.)**"
    },
    "oral": {
      title: "What’s Your Availability?",
      content: "**Titre :** What’s Your Availability?\n\n**Instructions :** Record yourself reading these sentences aloud. Focus on pronouncing the prepositions clearly. They are small but important words.\n\n1.  The meeting is **on** Monday **at** noon.\n2.  I am busy **in** the morning.\n3.  My vacation is **in** August.\n4.  Let’s meet **at** the end of the day.\n5.  The office is closed **on** public holidays."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 3.2: Making Appointments",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the correct preposition: The meeting is ___ 2:00 PM.", options: ["in", "on", "at", "of"], answer: "at", feedback: "Correct! We use \"at\" for specific times." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: My birthday is ___ July.", options: ["in", "on", "at", "for"], answer: "in", feedback: "Correct! We use \"in\" for months." },
          { id: 3, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["The report is due in Friday.", "The report is due on Friday.", "The report is due at Friday.", "The report is due for Friday."], answer: "The report is due on Friday.", feedback: "Correct! We use \"on\" for specific days of the week." },
          { id: 4, type: "multiple-choice" as const, question: "Fill in the blanks: I work ___ the morning, and I have a meeting ___ noon.", options: ["on / at", "at / in", "in / on", "in / at"], answer: "in / at", feedback: "Correct! We say \"in the morning\" for a general part of the day and \"at noon\" for a specific time." },
          { id: 5, type: "multiple-choice" as const, question: "Which preposition is used for a specific date, like \"December 31st\"?", options: ["in", "on", "at", "by"], answer: "on", feedback: "Correct! We use \"on\" for specific dates." }
        ]
      }
    },
    "coaching": {
      title: "Use a Calendar in English",
      content: "**Titre :** Use a Calendar in English\n\nOne of the best ways to practice prepositions of time and scheduling vocabulary is to change the language of your digital calendar (Outlook, Google Calendar) to English. This creates an immersive experience in your daily life.\n\n**Pourquoi ?**\n1.  **Constant exposure:** You see and use the language every time you check your schedule.\n2.  **Low-stakes practice:** It’s a safe way to practice without the pressure of a conversation.\n\n**Votre nouvelle routine :**\n1.  **Change your calendar language:** Go into your calendar settings and change the display language to English.\n2.  **Create appointments in English:** When you create a new event, write the title and description in English (e.g., \"Meeting with David,\" \"Work on project report\")."
    },
  },
  "3.3": {
    "hook": {
      title: "Breaks & Small Talk",
      content: "**Titre :** Breaks & Small Talk\n\nWork is not just about tasks and deadlines. The informal moments—the coffee break, the chat in the hallway—are where relationships are built. Mastering \"small talk\" is a key social skill in the Canadian workplace. This lesson will help you navigate these casual conversations with ease.\n\n**Objectif :** By the end of this lesson, you will be able to make small talk about routines and weather using adverbs of frequency."
    },
    "video": {
      title: "The Coffee Break",
      content: "**Titre :** The Coffee Break\n\n**(Scene: Anna is in the office kitchen making coffee. Her colleague, Mark, walks in.)**\n\n**NARRATEUR (Voix off, friendly and relaxed) :** The coffee break is a classic moment for small talk. It’s a chance to connect with colleagues on a personal level. Let’s listen in.\n\n**MARK :** Hi Anna. How’s your week going?\n\n**ANNA :** It’s going well, thanks. I’m **always** busy on Mondays.\n\n**MARK :** Me too. I **usually** have a lot of meetings at the start of the week. I **sometimes** work from home on Fridays, which is nice.\n\n**NARRATEUR :** Mark and Anna are using **adverbs of frequency** (always, usually, sometimes) to describe how often they do things. These words are perfect for small talk about routines.\n\n**MARK :** (Looks out the window) The weather is terrible today. It **often** rains in the fall here.\n\n**ANNA :** Yes, but I hear it is **rarely** this cold in October.\n\n**MARK :** True. Well, have a good day!\n\n**ANNA :** You too!\n\n**NARRATEUR :** Weather is the most common and safest topic for small talk in Canada. Using adverbs of frequency helps you share your experiences and find common ground with your colleagues.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "How Often? Adverbs of Frequency",
      content: "**Titre :** How Often? Adverbs of Frequency\n\nAdverbs of frequency describe how often an action happens. They are essential for talking about habits and routines.\n\n#### **Pattern 1 → The Frequency Scale**\n\nThink of these adverbs on a scale from 100% to 0%.\n\n*   **Always** (100%) - toujours\n*   **Usually** (90%) - habituellement\n*   **Often** (70%) - souvent\n*   **Sometimes** (50%) - parfois\n*   **Occasionally** (30%) - occasionnellement\n*   **Rarely / Seldom** (10%) - rarement\n*   **Never** (0%) - jamais\n\n#### **Pattern 2 → Sentence Position**\n\nThe adverb usually goes **before** the main verb.\n\n*   Subject + **Adverb** + Main Verb\n*   \"I **usually** drink coffee in the morning.\"\n*   \"She **never** works late.\"\n\n**Exception:** With the verb \"to be,\" the adverb goes **after** the verb.\n\n*   Subject + \"to be\" + **Adverb**\n*   \"I am **always** busy on Mondays.\"\n*   \"He is **often** late.\"\n\n**Exemple interactif :**\n*Put the adverb in the correct place: \"He checks his email.\" (often)* (Answer: He often checks his email.)"
    },
    "written": {
      title: "Your Work Habits",
      content: "**Titre :** Your Work Habits\n\n**Instructions :** Write 5 sentences about your work habits or routines. Use a different adverb of frequency in each sentence.\n\n**(Example: 1. I always start my day with a cup of tea. 2. I usually check my emails first. 3. I often have meetings in the afternoon. 4. I sometimes eat lunch at my desk. 5. I never work on weekends.)**"
    },
    "oral": {
      title: "Small Talk Practice",
      content: "**Titre :** Small Talk Practice\n\n**Instructions :** Record yourself answering these common small talk questions. Use a complete sentence with an adverb of frequency in your answer.\n\n1.  **Question:** Do you drink coffee in the morning?\n    **Answer:** Yes, I always drink coffee in the morning.\n2.  **Question:** Do you work from home?\n    **Answer:** I sometimes work from home on Fridays.\n3.  **Question:** Is it cold in Ottawa in the winter?\n    **Answer:** Yes, it is usually very cold."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 3.3: Breaks & Small Talk",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which adverb means \"100% of the time\"?", options: ["Sometimes", "Usually", "Always", "Often"], answer: "Always", feedback: "Correct! \"Always\" means something happens all the time, without exception." },
          { id: 2, type: "multiple-choice" as const, question: "Choose the correct sentence structure:", options: ["I drink sometimes coffee.", "I sometimes drink coffee.", "Sometimes I drink coffee.", "Both B and C are correct."], answer: "Both B and C are correct.", feedback: "Correct! The adverb usually goes before the main verb, but \"sometimes\" can also start a sentence for emphasis." },
          { id: 3, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["He is often late.", "He often is late.", "He is late often.", "Often he is late."], answer: "He is often late.", feedback: "Correct! With the verb \"to be\", the adverb of frequency comes after it." },
          { id: 4, type: "multiple-choice" as const, question: "Which is the safest topic for small talk with a new colleague?", options: ["Politics", "Salary", "Weather", "Personal problems"], answer: "Weather", feedback: "Correct! Weather is a neutral and universal topic, perfect for light, informal conversation." },
          { id: 5, type: "multiple-choice" as const, question: "Complete the sentence: I ___ work on Sundays. It is my day off.", options: ["always", "sometimes", "never", "often"], answer: "never", feedback: "Correct! \"Never\" means 0% of the time, which fits the context of a day off." }
        ]
      }
    },
    "coaching": {
      title: "The Art of Asking Questions",
      content: "**Titre :** The Art of Asking Questions\n\nGood small talk is a two-way street. It’s not just about talking; it’s also about listening and asking questions. Asking questions shows you are interested in the other person.\n\n**Pourquoi ?**\n1.  **Shows engagement:** It proves you are listening and not just waiting for your turn to speak.\n2.  **Keeps the conversation going:** A good question can open up a whole new topic.\n\n**Votre nouvelle routine :**\n1.  **Use the “And you?” technique:** After you answer a question, turn it back to the other person. (e.g., \"I am very busy today. And you?\")\n2.  **Prepare one open-ended question:** Before a coffee break, think of one simple, open-ended question you can ask a colleague (e.g., \"How was your weekend?\" or \"Do you have any interesting plans for the holidays?\")."
    },
  },
  "3.4": {
    "hook": {
      title: "End of the Day",
      content: "**Titre :** End of the Day\n\nHow you end your workday is just as important as how you start it. Saying goodbye, giving a quick status update, and planning for the next day are all key professional habits. This lesson will teach you how to wrap up your day smoothly and professionally.\n\n**Objectif :** By the end of this lesson, you will be able to connect simple ideas and describe the end of your workday using the conjunctions \"and,\" \"but,\" \"or,\" and \"so.\""
    },
    "video": {
      title: "Wrapping It Up",
      content: "**Titre :** Wrapping It Up\n\n**(Scene: It’s 4:30 PM in the office. Anna is packing her bag. Her manager, David, walks by her desk.)**\n\n**NARRATEUR (Voix off, calm and professional) :** The end of the day is a good time to quickly check in with your manager and colleagues. Let’s see how Anna handles it.\n\n**DAVID :** Good afternoon, Anna. Are you leaving for the day?\n\n**ANNA :** Yes. I finished the report **and** I sent it to you by email.\n\n**DAVID :** Great, thank you. I will review it tomorrow morning.\n\n**NARRATEUR :** Anna uses **\"and\"** to connect two related actions she completed: she finished the report, and she sent it.\n\n**ANNA :** I wanted to start the next task, **but** I have a question about the data.\n\n**DAVID :** No problem. We can talk about it tomorrow. You can start with the research, **or** you can organize the files for the new project.\n\n**NARRATEUR :** Anna uses **\"but\"** to show a contrast or a problem. David uses **\"or\"** to offer a choice between two alternatives.\n\n**ANNA :** Okay, I will start with the research. **So**, I will see you tomorrow morning.\n\n**DAVID :** Sounds good. Have a good evening!\n\n**ANNA :** You too!\n\n**NARRATEUR :** Anna uses **\"so\"** to show a result or conclusion. Mastering these four small words—and, but, or, so—will make your English sound much more natural and fluent.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Connecting Your Ideas: Conjunctions",
      content: "**Titre :** Connecting Your Ideas: Conjunctions\n\nConjunctions are words that connect other words, phrases, or sentences. The four most common are **and, but, or, so**.\n\n#### **Pattern 1 → AND (Addition)**\n\nUse **and** to add one thing to another. It connects two similar ideas.\n\n*   \"I check my emails **and** I drink my coffee.\"\n*   \"He is a manager **and** a team leader.\"\n\n#### **Pattern 2 → BUT (Contrast)**\n\nUse **but** to show a contrast, a surprise, or a problem.\n\n*   \"I want to go, **but** I am busy.\"\n*   \"The report is long, **but** it is interesting.\"\n\n#### **Pattern 3 → OR (Choice)**\n\nUse **or** to show a choice or alternative between two or more options.\n\n*   \"Do you want coffee **or** tea?\"\n*   \"We can have the meeting on Monday **or** Tuesday.\"\n\n#### **Pattern 4 → SO (Result)**\n\nUse **so** to show a result or consequence.\n\n*   \"I was sick, **so** I did not go to work.\"\n*   \"The meeting was cancelled, **so** I have free time.\"\n\n**Exemple interactif :**\n*Choose the correct conjunction: \"I am tired, ___ I am going home.\"* (Answer: so)"
    },
    "written": {
      title: "End-of-Day Summary",
      content: "**Titre :** End-of-Day Summary\n\n**Instructions :** Write a short summary of your workday (real or fictitious) in 4 sentences. Use each conjunction (**and, but, or, so**) one time.\n\n**(Example: Today I worked on the presentation and I sent some emails. I wanted to finish the project, but I ran out of time. Tomorrow I can finish it, or I can start the new task. I have a plan for tomorrow, so I am ready to go home.)**"
    },
    "oral": {
      title: "Saying Goodbye",
      content: "**Titre :** Saying Goodbye\n\n**Instructions :** In English, there are many ways to say goodbye at the end of the workday. Record yourself saying these common expressions. Focus on a friendly and positive intonation.\n\n1.  Have a good evening!\n2.  Have a good night!\n3.  See you tomorrow!\n4.  Take care!\n5.  (On a Friday) Have a great weekend!"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 3.4: End of the Day",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which conjunction is used to show a contrast or problem?", options: ["and", "but", "or", "so"], answer: "but", feedback: "Correct! \"But\" is used to connect two contrasting ideas." },
          { id: 2, type: "multiple-choice" as const, question: "Choose the correct conjunction: I finished my work, ___ I am going home.", options: ["and", "but", "or", "so"], answer: "so", feedback: "Correct! \"So\" is used to show the result or consequence of an action." },
          { id: 3, type: "multiple-choice" as const, question: "Which sentence shows a choice?", options: ["I am tired and I am hungry.", "I am tired, but I am not hungry.", "Are you tired or hungry?", "I am tired, so I am not hungry."], answer: "Are you tired or hungry?", feedback: "Correct! \"Or\" is used to present a choice between two options." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the sentence: He is a manager ___ a good leader.", options: ["and", "but", "or", "so"], answer: "and", feedback: "Correct! \"And\" is used to add a similar, positive quality." },
          { id: 5, type: "multiple-choice" as const, question: "What is a common thing to say on a Friday afternoon?", options: ["Have a good morning!", "Have a great weekend!", "See you in a bit!", "Good night!"], answer: "Have a great weekend!", feedback: "Correct! \"Have a great weekend!\" is the standard farewell at the end of the work week." }
        ]
      }
    },
    "coaching": {
      title: "The Power of a Clean Finish",
      content: "**Titre :** The Power of a Clean Finish\n\nEnding your day with a clear plan for tomorrow is a powerful productivity habit. It reduces stress and allows you to start the next day with focus. This is true for your work, and it is also true for your language learning.\n\n**Pourquoi ?**\n1.  **Reduces anxiety:** Knowing what you need to do next prevents you from feeling overwhelmed.\n2.  **Creates continuity:** It connects today’s learning to tomorrow’s, creating a continuous learning path.\n\n**Votre nouvelle routine :**\n1.  **End-of-day review:** At the end of each lesson, take two minutes to review the main grammar point. What was the most important thing you learned?\n2.  **Set a micro-goal for tomorrow:** Decide on one small thing you will do in English tomorrow (e.g., \"Tomorrow, I will use the word 'but' in a sentence,\" or \"Tomorrow, I will say 'Have a good evening' to a colleague\")."
    },
  },
  "4.1": {
    "hook": {
      title: "I Don't Understand",
      content: "**Titre :** I Don't Understand\n\nAdmitting you don't understand is a critical skill for any learner. In a professional environment, asking for clarification is not a sign of weakness; it is a strategy for ensuring accuracy and avoiding mistakes. This lesson will teach you how to ask for clarification politely and effectively.\n\n**Objectif :** By the end of this lesson, you will be able to ask for clarification using a variety of question words (What, Where, When, Why, How) and appropriate intonation."
    },
    "video": {
      title: "Asking for Clarification",
      content: "**Titre :** Asking for Clarification\n\n**(Scene: Anna is in a meeting with her manager, David. He is explaining a new task.)**\n\n**NARRATEUR (Voix off, clear and encouraging) :** It is normal to not understand everything the first time. The important thing is to ask questions. Let’s see how Anna does it.\n\n**DAVID :** ...so, I need you to take care of the quarterly report. The deadline is next Friday.\n\n**ANNA :** I’m sorry, I don’t quite understand. **What** report are you referring to?\n\n**DAVID :** The departmental performance report. It’s a standard report we do every quarter.\n\n**NARRATEUR :** Anna uses a polite phrase, \"I’m sorry, I don’t quite understand,\" and then asks a specific question with **\"What\"** to get more information.\n\n**ANNA :** Okay. And **where** can I find the template for this report?\n\n**DAVID :** It’s in the shared drive, in the ‘Templates’ folder.\n\n**ANNA :** And **when** exactly is the deadline? You said next Friday?\n\n**DAVID :** Yes, Friday, November 10th, at 5:00 PM.\n\n**ANNA :** Thank you. That’s much clearer now.\n\n**NARRATEUR :** Anna is not afraid to ask multiple questions to ensure she has all the details. She uses **\"Where\"** for location and **\"When\"** for time. This is the mark of a proactive and responsible employee.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The 5 Ws (and 1 H): Question Words",
      content: "**Titre :** The 5 Ws (and 1 H): Question Words\n\nTo get specific information, you need to use the right question word. These are often called the 5 Ws and 1 H.\n\n*   **What?** (Quoi ?) - Asks for information about a thing.\n    *   \"**What** is your name?\"\n*   **Who?** (Qui ?) - Asks for information about a person.\n    *   \"**Who** is the manager?\"\n*   **Where?** (Où ?) - Asks for information about a place.\n    *   \"**Where** is the meeting?\"\n*   **When?** (Quand ?) - Asks for information about a time.\n    *   \"**When** is the deadline?\"\n*   **Why?** (Pourquoi ?) - Asks for a reason or explanation.\n    *   \"**Why** is the meeting cancelled?\"\n*   **How?** (Comment ?) - Asks for information about a process or manner.\n    *   \"**How** do I complete this form?\"\n\n**Reviewing the Structure:**\nRemember the structure from Lesson 2.1: **Question Word + Auxiliary (do/does) + Subject + Verb?**\n*   \"Where **do** you work?\"\n*   \"How **does** she do that?\"\n\n**Exemple interactif :**\n*Choose the correct question word: \"___ is the meeting? It is at 2:00 PM.\"* (Answer: When)"
    },
    "written": {
      title: "Formulate Your Questions",
      content: "**Titre :** Formulate Your Questions\n\n**Instructions :** Your manager gives you a new task but you are missing some information. Write 4 questions to ask for clarification. Use four different question words (What, Where, When, Who, Why, or How).\n\n**(Situation: Your manager says, \"Please organize the team event.\")**\n\n**(Example Questions: 1. What kind of event is it? 2. When is the event? 3. Where should we have the event? 4. Who is invited to the event?)**"
    },
    "oral": {
      title: "Intonation: Rising vs. Falling",
      content: "**Titre :** Intonation: Rising vs. Falling\n\n**Instructions :** The intonation of a question tells the listener what kind of answer you expect. Record yourself saying these questions. Pay attention to your tone.\n\n*   **Yes/No Questions (Rising Intonation ↗):** Your voice goes up at the end.\n    *   \"Is this the correct form? ↗\"\n    *   \"Do you have a minute? ↗\"\n\n*   **Wh- Questions (Falling Intonation ↘):** Your voice goes down at the end.\n    *   \"What is your name? ↘\"\n    *   \"Where is the office? ↘\"\n\n**Practice recording these pairs:**\n1.  \"Is the meeting today? ↗\" / \"When is the meeting? ↘\"\n2.  \"Is he the manager? ↗\" / \"Who is the manager? ↘\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 4.1: I Don't Understand",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which question word is used to ask about a reason?", options: ["What", "When", "Why", "Where"], answer: "Why", feedback: "Correct! \"Why\" is used to ask for a reason or explanation." },
          { id: 2, type: "multiple-choice" as const, question: "Choose the correct question: You want to know the location of the project files.", options: ["What are the project files?", "When are the project files?", "Why are the project files?", "Where are the project files?"], answer: "Where are the project files?", feedback: "Correct! \"Where\" is used to ask about a location." },
          { id: 3, type: "multiple-choice" as const, question: "A question like \"Do you have the report?\" should have what kind of intonation at the end?", options: ["Rising", "Falling", "Flat", "It depends"], answer: "Rising", feedback: "Correct! Yes/No questions typically have a rising intonation." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the question: ___ do I submit this form?", options: ["What", "How", "Who", "Why"], answer: "How", feedback: "Correct! \"How\" is used to ask about the process or method for doing something." },
          { id: 5, type: "multiple-choice" as const, question: "Which is a polite phrase to use before asking for clarification?", options: ["\"This is wrong.\"", "\"I don't get it.\"", "\"What do you mean?\"", "\"I'm sorry, I don't quite understand.\""], answer: "\"I'm sorry, I don't quite understand.\"", feedback: "Correct! This is a polite and professional way to signal that you need more information." }
        ]
      }
    },
    "coaching": {
      title: "Active Listening",
      content: "**Titre :** Active Listening\n\nAsking good questions is only half the battle. You also need to be a good listener. **Active listening** means fully concentrating on what is being said, rather than just passively hearing the message.\n\n**Pourquoi ?**\n1.  **Prevents misunderstanding:** It ensures you truly understand the message the first time.\n2.  **Builds rapport:** It shows the speaker that you respect them and value what they are saying.\n\n**Votre nouvelle routine :**\n1.  **Listen to understand, not to reply:** When someone is speaking, focus 100% on their message. Don’t think about what you are going to say next.\n2.  **Paraphrase to confirm:** After someone explains something, repeat it back in your own words to confirm you understood correctly. (e.g., \"So, if I understand correctly, you need the report by Friday. Is that right?\")"
    },
  },
  "4.2": {
    "hook": {
      title: "Where Is the...?",
      content: "**Titre :** Where Is the...?\n\nNavigating a large office building can be a challenge, especially when you are new. Knowing how to ask for and give simple directions is a fundamental skill that you will use every day. This lesson will give you the tools to find your way around your workplace with confidence.\n\n**Objectif :** By the end of this lesson, you will be able to ask for and give simple directions to places within an office building, using prepositions of place and movement."
    },
    "video": {
      title: "Finding Your Way Around",
      content: "**Titre :** Finding Your Way Around\n\n**(Scene: Anna is walking down a hallway, looking a bit lost. She stops a colleague, Maria.)**\n\n**NARRATEUR (Voix off, helpful and clear) :** Even with a map, it can be hard to find a specific room in a big office. Asking for directions is often the fastest way. Let’s see how Anna does it.\n\n**ANNA :** Excuse me, I’m looking for the boardroom. Can you help me?\n\n**MARIA :** Of course. You’re on the 6th floor. The boardroom is **on** the 7th floor.\n\n**ANNA :** Oh, okay. **How** do I get there?\n\n**MARIA :** **Go down** this hallway and **take** the elevator **up** to the 7th floor. When you exit the elevator, **turn right**. The boardroom is the first door **on your left**.\n\n**NARRATEUR :** Maria gives a clear, step-by-step set of directions. She uses prepositions of movement like \"down,\" \"up,\" and action verbs like \"take\" and \"turn.\"\n\n**ANNA :** So, go down the hall, take the elevator up, turn right, and it’s on the left?\n\n**MARIA :** Exactly. You can’t miss it.\n\n**ANNA :** Thank you so much!\n\n**NARRATEUR :** Anna repeats the directions to confirm she understood correctly. This is an excellent active listening strategy.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Giving Directions: Prepositions of Place & Movement",
      content: "**Titre :** Giving Directions: Prepositions of Place & Movement\n\nGiving clear directions involves a combination of prepositions of place (review from Lesson 1.4) and prepositions of movement.\n\n#### **Pattern 1 → Prepositions of Place (Review)**\n\n*   **in:** in the kitchen\n*   **on:** on the second floor, on the left/right\n*   **at:** at the end of the hall\n*   **next to:** next to the elevator\n*   **between:** between the two offices\n\n#### **Pattern 2 → Prepositions & Verbs of Movement**\n\nThese words describe the path you need to take.\n\n*   **Go down / up / straight:** \"**Go down** this hallway.\"\n*   **Take:** Used for transportation or paths. \"**Take** the elevator.\" \"**Take** the first right.\"\n*   **Turn:** Change direction. \"**Turn** left at the corner.\"\n*   **Across from / Opposite:** On the other side of something. \"The office is **across from** the cafeteria.\"\n*   **Past:** Go further than something. \"Go **past** the reception desk.\"\n\n**Exemple interactif :**\n*Fill in the blank: \"___ the stairs to the second floor.\"* (Answer: Take)"
    },
    "written": {
      title: "Directions to Your Desk",
      content: "**Titre :** Directions to Your Desk\n\n**Instructions :** Imagine a new colleague is at the main entrance of your office floor and needs to find your desk. Write a set of 4-5 simple, step-by-step directions to guide them. Use at least 3 prepositions or verbs of movement.\n\n**(Example: Welcome! To find my desk, first go straight down the main hallway. Then, turn left at the kitchen. Go past the manager’s office. My desk is the third one on the right, next to the window.)**"
    },
    "oral": {
      title: "Pronouncing Floor Numbers",
      content: "**Titre :** Pronouncing Floor Numbers\n\n**Instructions :** In English, we use ordinal numbers for floors (first, second, third, etc.). The \"th\" sound is very common and can be tricky. Record yourself saying the floor numbers from 1 to 10.\n\n*   First (1st)\n*   Second (2nd)\n*   Third (3rd)\n*   Four**th** (4th)\n*   Fif**th** (5th)\n*   Six**th** (6th)\n*   Seven**th** (7th)\n*   Eigh**th** (8th)\n*   Nin**th** (9th)\n*   Ten**th** (10th)"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 4.2: Where Is the...?",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which verb is commonly used for changing direction?", options: ["Go", "Take", "Turn", "Past"], answer: "Turn", feedback: "Correct! We say \"Turn left\" or \"Turn right\" to indicate a change in direction." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: Go ___ the hallway and the boardroom is at the end.", options: ["down", "up", "on", "at"], answer: "down", feedback: "Correct! \"Go down the hallway\" is a standard phrase for moving along a corridor." },
          { id: 3, type: "multiple-choice" as const, question: "What is the ordinal number for \"3\"?", options: ["Three", "Thirth", "Third", "Threeth"], answer: "Third", feedback: "Correct! The first three ordinal numbers are irregular: first, second, third." },
          { id: 4, type: "multiple-choice" as const, question: "The cafeteria is on the other side of the hall from the library. The cafeteria is ___ the library.", options: ["next to", "between", "across from", "past"], answer: "across from", feedback: "Correct! \"Across from\" or \"opposite\" means something is on the other side." },
          { id: 5, type: "multiple-choice" as const, question: "To get to the 5th floor from the 2nd floor, you need to take the elevator ___. ", options: ["up", "down", "past", "on"], answer: "up", feedback: "Correct! You take the elevator \"up\" to go to a higher floor." }
        ]
      }
    },
    "coaching": {
      title: "Don’t Be Afraid to Look Lost",
      content: "**Titre :** Don’t Be Afraid to Look Lost\n\nNobody expects you to know everything on your first day, or even in your first month. It is perfectly acceptable to be a little bit lost. In fact, asking for directions is a great way to meet new colleagues.\n\n**Pourquoi ?**\n1.  **It’s an icebreaker:** It gives you a natural reason to start a conversation with someone.\n2.  **People like to help:** Most people are happy to help someone who is new and trying to find their way.\n\n**Votre nouvelle routine :**\n1.  **Prepare your question:** Before you leave your desk, think about how you will ask for directions. (\"Excuse me, where is the...?)\n2.  **Smile and make eye contact:** A friendly expression makes you more approachable and shows that you appreciate the help."
    },
  },
  "4.3": {
    "hook": {
      title: "I Need Help With...",
      content: "**Titre :** I Need Help With...\n\nSometimes you don’t just need information, you need someone to *do* something for you. Knowing how to make a polite request is one of the most important communication skills in a collaborative workplace. This lesson will teach you how to ask for assistance in a way that is both effective and professional.\n\n**Objectif :** By the end of this lesson, you will be able to make polite requests for help using the modal verbs \"Can,\" \"Could,\" and the phrase \"Would you mind...?\""
    },
    "video": {
      title: "The Ladder of Politeness",
      content: "**Titre :** The Ladder of Politeness\n\n**(Scene: Anna needs help reaching a box on a high shelf in the supply room. She sees her colleague, Mark.)**\n\n**NARRATEUR (Voix off, helpful and nuanced) :** Asking for help can be simple or more formal, depending on the situation. Let’s look at the different levels of politeness.\n\n**(Scenario 1: Casual & Direct)**\n\n**ANNA :** Mark, **can** you help me for a second? I can’t reach that box.\n\n**MARK :** Sure, no problem.\n\n**NARRATEUR :** **\"Can you...?\"** is a simple, direct, and friendly way to ask for help. It’s perfect for small favours between colleagues.\n\n**(Scenario 2: More Formal & Polite)**\n\n**(Scene: Anna is in a meeting with her manager, David. She needs him to explain a concept.)**\n\n**ANNA :** David, **could** you please explain that again? I’m not sure I understand.\n\n**DAVID :** Of course. Let me rephrase it.\n\n**NARRATEUR :** **\"Could you...?\"** is more polite and formal than \"Can you...?\" It is a good choice when speaking to a manager or someone you don’t know well.\n\n**(Scenario 3: Very Formal & Respectful)**\n\n**(Scene: Anna needs to ask the Director General, Ms. Tremblay, to sign a document.)**\n\n**ANNA :** Excuse me, Ms. Tremblay. **Would you mind** signing this document when you have a moment?\n\n**MS. TREMBLAY :** Not at all. Leave it with me.\n\n**NARRATEUR :** **\"Would you mind...?\"** is a very polite and indirect way to make a request. It is used when you are asking for a bigger favour or speaking to someone in a high position of authority. Choosing the right level of politeness is a key social skill.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Making Polite Requests: Can / Could / Would you mind...?",
      content: "**Titre :** Making Polite Requests: Can / Could / Would you mind...?\n\nHere is a simple guide to choosing the right phrase for your request.\n\n#### **Pattern 1 → Can (Informal / Direct)**\n\n*   **Can you** + base verb...?\n*   Use with colleagues for small, easy tasks.\n*   \"**Can you** pass me the stapler?\"\n*   \"**Can you** open the window?\"\n\n#### **Pattern 2 → Could (Polite / More Formal)**\n\n*   **Could you** + base verb...?\n*   Use with managers, clients, or colleagues you don’t know well.\n*   \"**Could you** send me the report?\"\n*   \"**Could you** help me with this file?\"\n\n#### **Pattern 3 → Would you mind...? (Very Polite / Indirect)**\n\n*   **Would you mind** + verb-**ing**...?\n*   Use for bigger requests or with senior leadership.\n*   \"**Would you mind helping** me with this project?\"\n*   \"**Would you mind reviewing** my presentation?\"\n\n**Note the verb form:** After \"Would you mind,\" you must use the -ing form of the verb.\n\n**Responding to \"Would you mind...?\"**\n*   If you agree: \"No, not at all.\" or \"Of course not.\"\n*   (The literal meaning is \"Est-ce que ça vous dérange?\" so the polite answer is \"Non.\")\n\n**Exemple interactif :**\n*You are asking your Director to approve your vacation. Which is the best phrase?* (Answer: Would you mind...)"
    },
    "written": {
      title: "Write Three Requests",
      content: "**Titre :** Write Three Requests\n\n**Instructions :** Write three different requests for help, one for each level of politeness.\n\n1.  **Informal:** Ask a colleague to lend you a pen.\n2.  **Polite:** Ask your manager to give you feedback on your work.\n3.  **Very Polite:** Ask the Director General to attend your team meeting.\n\n**(Example: 1. Can you lend me a pen? 2. Could you please give me some feedback on this report? 3. Would you mind attending our team meeting on Friday?)**"
    },
    "oral": {
      title: "Role-Play: Making a Request",
      content: "**Titre :** Role-Play: Making a Request\n\n**Instructions :** Record yourself making these three requests. Focus on using a polite and respectful tone of voice. Your tone is just as important as your words.\n\n1.  (To a colleague) **Can** you show me how to use the printer?\n2.  (To your manager) **Could** you explain the new policy to me?\n3.  (To a senior executive) **Would you mind** if I ask you a quick question?"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 4.3: I Need Help With...",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which request is the most formal and polite?", options: ["Can you help me?", "Could you help me?", "Would you mind helping me?", "Help me."], answer: "Would you mind helping me?", feedback: "Correct! \"Would you mind...\" is the most indirect and formal way to make a request." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: Would you mind ___ the door?", options: ["open", "to open", "opening", "opened"], answer: "opening", feedback: "Correct! After the phrase \"Would you mind\", we must use the -ing form of the verb." },
          { id: 3, type: "multiple-choice" as const, question: "You are asking a close colleague for a small favour. Which is the best choice?", options: ["Can you...", "Could you...", "Would you mind...", "You must..."], answer: "Can you...", feedback: "Correct! \"Can you...\" is perfect for informal requests between peers." },
          { id: 4, type: "multiple-choice" as const, question: "How do you politely agree to a request that starts with \"Would you mind...?\"", options: ["Yes, I would.", "Yes, I mind.", "No, not at all.", "No, I can't."], answer: "No, not at all.", feedback: "Correct! A positive answer to this question starts with \"No\", because you are saying that you do not mind helping." },
          { id: 5, type: "multiple-choice" as const, question: "Which phrase is a good alternative to \"Could you...\" for a polite request?", options: ["I want you to...", "You should...", "I was wondering if you could...", "Do this..."], answer: "I was wondering if you could...", feedback: "Correct! \"I was wondering if you could...\" is another very polite and indirect way to make a request." }
        ]
      }
    },
    "coaching": {
      title: "The Magic Word: \"Please\"",
      content: "**Titre :** The Magic Word: \"Please\"\n\nIn English, the word \"please\" is not just for children. It is used constantly in professional communication to soften requests and show respect. Forgetting to use \"please\" can make you sound demanding or rude, even if that is not your intention.\n\n**Pourquoi ?**\n1.  **Softens commands:** It turns a direct command (\"Send me the file\") into a polite request (\"Please send me the file\").\n2.  **Shows respect:** It signals that you recognize you are asking for someone’s time and effort.\n\n**Votre nouvelle routine :**\n1.  **Add \"please\" to your imperatives:** Get into the habit of adding \"please\" to all your written and spoken requests. (\"Please call me back,\" \"Could you please review this?\").\n2.  **Notice how often others use it:** Pay attention in meetings and emails. You will see that native English speakers use \"please\" very frequently in a professional context."
    },
  },
  "4.4": {
    "hook": {
      title: "Thank You & Follow Up",
      content: "**Titre :** Thank You & Follow Up\n\nGetting help is the first step. The final step is to show your appreciation and confirm what is happening next. A simple \"thank you\" and a clear follow-up are signs of a true professional. This final lesson of Path I will teach you how to close the loop on your interactions effectively.\n\n**Objectif :** By the end of this lesson, you will be able to express thanks, confirm next steps, and describe ongoing actions using the present continuous tense."
    },
    "video": {
      title: "Closing the Loop",
      content: "**Titre :** Closing the Loop\n\n**(Scene: Anna is at Mark’s desk. He has just finished helping her with a technical problem on her computer.)**\n\n**NARRATEUR (Voix off, professional and conclusive) :** The interaction isn’t over when the problem is solved. A professional knows how to close the loop. Let’s watch.\n\n**MARK :** ...and that should fix the problem.\n\n**ANNA :** It’s working now! **Thank you so much** for your help. I really appreciate it.\n\n**MARK :** You’re welcome. Glad I could help.\n\n**NARRATEUR :** Anna uses a strong expression of thanks: \"Thank you so much.\" She also adds, \"I really appreciate it,\" which is a very professional way to show gratitude.\n\n**(Scene: Later, Anna is on a Teams call with her manager, David. He asked her to find some data.)**\n\n**DAVID :** Anna, did you find that data we talked about?\n\n**ANNA :** Yes. I **am sending** it to you right now. I **am also preparing** the summary you requested.\n\n**DAVID :** Perfect. Thank you for the update.\n\n**NARRATEUR :** Anna uses the **present continuous** tense (\"I am sending,\" \"I am preparing\") to describe actions that are happening right now or are in progress. This is very useful for giving status updates.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "What Are You Doing Now? Present Continuous",
      content: "**Titre :** What Are You Doing Now? Present Continuous\n\nTo talk about actions happening right now or actions that are in progress over a period of time, we use the **Present Continuous** tense.\n\n#### **Pattern 1 → Structure: To Be + Verb-ing**\n\n*   Subject + **am/is/are** + Verb-**ing**\n*   \"I **am working** on the report.\"\n*   \"She **is talking** on the phone.\"\n*   \"They **are having** a meeting.\"\n\n**Use Cases:**\n1.  **Actions happening right now:** \"I can’t talk, I **am driving**.\"\n2.  **Actions in progress (temporary):** \"I **am taking** an English course this semester.\"\n3.  **Future plans (informal):** \"I **am meeting** him tomorrow.\"\n\n**Exemple interactif :**\n*Fill in the blank: \"Please be quiet. The baby ___.\" (to sleep)* (Answer: is sleeping)\n\n#### **Pattern 2 → Ways to Say \"Thank You\"**\n\nThere are many ways to express thanks. The one you choose depends on the situation.\n\n| **Level** | **Phrase** | **When to Use** |\n|---|---|---|\n| **Casual** | Thanks. / Thanks a lot. | For small, everyday things. |\n| **Standard** | Thank you. | The universal, safe choice. |\n| **Formal** | Thank you so much. / Thank you very much. | For bigger favours or to show strong gratitude. |\n| **Very Formal** | I really appreciate it. / I am very grateful. | In writing or for significant help. |\n\n**Exemple interactif :**\n*A colleague holds the door for you. What do you say?* (Answer: Thanks.)"
    },
    "written": {
      title: "Write a Follow-Up Email",
      content: "**Titre :** Write a Follow-Up Email\n\n**Instructions :** A colleague helped you find an important document. Write a short thank-you email. In the email, tell them what you are doing with the document now. Use the present continuous tense.\n\n**(Example Subject: Thank you!)**\n**(Example Body: Hi [Colleague’s Name], Thank you so much for your help finding the project charter. I am reading it now to understand the background. I really appreciate your time. Best regards, [Your Name])**"
    },
    "oral": {
      title: "Giving a Status Update",
      content: "**Titre :** Giving a Status Update\n\n**Instructions :** Your manager calls you to ask about your progress on a few tasks. Record yourself giving these updates using the present continuous. Focus on a clear and confident tone.\n\n1.  \"I **am finishing** the presentation slides.\"\n2.  \"We **are discussing** the budget right now.\"\n3.  \"He **is reviewing** the document you sent.\"\n4.  \"They **are waiting** for your approval.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]"
    },
    "coaching": {
      title: "Congratulations on Completing Path I!",
      content: "**Titre :** Congratulations on Completing Path I!\n\nYou have now completed the 16 lessons of Path I: Foundations. You have built a strong base for your professional English communication skills. You have learned how to introduce yourself, describe your work, manage your schedule, and ask for help. This is a huge accomplishment!\n\n**Pourquoi ?**\n1.  **Foundation is everything:** The skills you learned in this Path are the foundation for everything that comes next. Master them, and you will succeed.\n2.  **Consistency is key:** You have built a habit of learning. This is the most important skill of all.\n\n**Votre nouvelle routine :**\n1.  **Review the Path:** Take some time to go back and review the 16 lessons. Do the quizzes again. See how much you remember.\n2.  **Get ready for Path II:** Path II will build on this foundation, introducing new tenses, more complex situations, and a wider range of vocabulary. Be proud of your progress and get ready for the next step in your journey!"
    },
  },
  "5.1": {
    "hook": {
      title: "The Anatomy of a Professional Email",
      content: "**Titre :** The Anatomy of a Professional Email\n\nIn the Canadian public service, email is the primary form of written communication. A clear, professional email can get you a quick response, while a confusing one can cause delays and misunderstandings. It's more than just writing; it's about structure, tone, and clarity.\n\n**Objectif :** By the end of this lesson, you will be able to write a basic professional email in English, correctly using the present continuous tense to describe ongoing actions."
    },
    "video": {
      title: "The Information Request",
      content: "**Titre :** The Information Request\n\n**(Scene: ANNA is at her desk. She needs a document from her colleague, MARK, for a report she is currently writing.)**\n\n**NARRATEUR (Voix off) :** Anna is working on her first big report. She needs the latest statistics from Mark's team. Let's see how she writes the email.\n\n**(Anna opens a new email. We see her screen.)**\n\n**TO:** Mark.Johnson@department.gc.ca\n**SUBJECT:** Request for Q3 Statistics\n\n**EMAIL BODY:**\n\nHi Mark,\n\nI hope you're having a good week.\n\nI am currently preparing the quarterly performance report for our director. Could you please send me the Q3 statistics for the communications team when you have a moment?\n\nI need them by end of day Friday to finalize my draft.\n\nThanks for your help,\n\nAnna\n\n**NARRATEUR :** Let's break this down. The subject is clear and specific. The greeting is friendly but professional. She explains *why* she needs the document (\"I am preparing the report\"). The request is polite (\"Could you please...\"). She provides a clear deadline. The closing is professional. This is a perfect A2-level professional email.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Actions in Progress: The Present Continuous",
      content: "**Titre :** Actions in Progress: The Present Continuous\n\nTo explain *why* you are writing an email, you often need to describe an action that is happening now or around now. For this, we use the **Present Continuous** tense.\n\n**Pattern → Subject + am/is/are + Verb-ing**\n\n*   I **am writing** to you because...\n*   She **is preparing** a presentation.\n*   They **are reviewing** the document.\n\n**Spelling Rules for -ing:**\n1.  Most verbs: add **-ing** (e.g., work → working)\n2.  Verbs ending in **-e**: remove **-e**, add **-ing** (e.g., write → writing)\n3.  Verbs ending in C-V-C (Consonant-Vowel-Consonant): double the last consonant, add **-ing** (e.g., plan → planning)\n\n**Exemple interactif :**\n*Fill in the blank: \"We ___ (organize) a new training session.\"* (Answer: are organizing)\n\n**Simple Present vs. Present Continuous**\n*   **Simple Present:** For routines and facts. (e.g., \"I **write** reports every month.\")\n*   **Present Continuous:** For actions happening now. (e.g., \"I **am writing** a report right now.\")"
    },
    "written": {
      title: "Write a Request Email",
      content: "**Titre :** Write a Request Email\n\n**Instructions :** You need the agenda for an upcoming meeting from your manager, Ms. Tremblay. Write a short, polite email to request it. Use the present continuous to explain why you need it (e.g., \"I am preparing for the meeting\")."
    },
    "oral": {
      title: "Reading and Replying",
      content: "**Titre :** Reading and Replying\n\n**Instructions :** Read the following email from a colleague, then record yourself reading your reply aloud. Focus on a natural, friendly tone.\n\n**Email from Colleague:**\n\"Hi [Your Name],\n\nI'm just finishing the draft of the presentation for tomorrow. Can you please take a quick look and let me know if you have any feedback?\n\nThanks,\n\nJohn\"\n\n**Your Reply (to read aloud):**\n\"Hi John,\n\nOf course. I am working on the budget file right now, but I can review it this afternoon. I'll send you my comments by 3 PM.\n\nBest,\n\n[Your Name]\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 5.1: Your First Email",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: I ___ a report for my manager.", options: ["write", "am writing", "writes", "am write"], answer: "am writing", feedback: "Correct! Use the present continuous for an action happening now." },
          { id: 2, type: "multiple-choice" as const, question: "Which subject line is most effective?", options: ["Question", "Important", "Report", "Question about the Q3 Report Deadline"], answer: "Question about the Q3 Report Deadline", feedback: "Correct! A specific subject line helps the recipient prioritize." },
          { id: 3, type: "multiple-choice" as const, question: "What is the correct spelling?", options: ["prepareing", "preparring", "preparing", "preparesing"], answer: "preparing", feedback: "Correct! For verbs ending in -e, drop the -e and add -ing." },
          { id: 4, type: "multiple-choice" as const, question: "Choose the best closing for a standard professional email to a colleague.", options: ["Love,", "Cheers,", "Best regards,", "XOXO,"], answer: "Best regards,", feedback: "Correct! 'Best regards' or 'Kind regards' are standard professional closings." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: They ___ for the meeting.", options: ["is preparing", "are preparing", "am preparing", "be preparing"], answer: "are preparing", feedback: "Correct! We use 'are' with the subject pronoun 'they'." }
        ]
      }
    },
    "coaching": {
      title: "Tone in Writing",
      content: "**Titre :** Tone in Writing\n\nIn English, professional emails are usually less formal than in French. Using phrases like \"I hope you're having a good week\" can make your email sound warmer and more approachable. However, avoid being too casual. Never use slang, emojis, or text message abbreviations (like 'u' for 'you') in a professional email.\n\n**Votre nouvelle routine :** Before you send any email, read it aloud. Does it sound like something you would say to a colleague in person? If it sounds too stiff or too casual, adjust it. adjust it. it."
    },
  },
  "5.2": {
    "hook": {
      title: "The Art of the Reply",
      content: "**Titre :** The Art of the Reply\n\nReplying to emails is just as important as writing them. How you accept or decline a request affects your professional relationships and workload. A good reply is clear, polite, and manages expectations effectively.\n\n**Objectif :** By the end of this lesson, you will be able to accept and politely decline requests via email, using object pronouns correctly."
    },
    "video": {
      title: "Accepting and Declining",
      content: "**Titre :** Accepting and Declining\n\n**(Scene: MARK receives Anna's email request for the Q3 statistics.)**\n\n**NARRATEUR (Voix off) :** Mark has received Anna's request. He has the statistics and can send them. Let's look at his positive reply.\n\n**(We see Mark's screen as he replies.)**\n\n**SUBJECT:** Re: Request for Q3 Statistics\n\n**EMAIL BODY:**\n\nHi Anna,\n\nHappy to help. I've attached the Q3 statistics to this email.\n\nLet me know if you need anything else.\n\nBest,\n\nMark\n\n**NARRATEUR :** This is a great reply. It's positive, direct, and efficient. Now, let's imagine a different scenario. What if Mark is too busy?\n\n**(Scene: Mark receives another email, this time from his Director, asking him to join a new committee.)**\n\n**NARRATEUR :** Mark's Director wants him to join a committee, but he doesn't have time. He needs to decline politely.\n\n**(We see Mark's screen as he writes a new email.)**\n\n**SUBJECT:** Re: Invitation to join the Greening Committee\n\n**EMAIL BODY:**\n\nDear Ms. Tremblay,\n\nThank you for the invitation. I appreciate you thinking of me.\n\nUnfortunately, I'm unable to join the committee at this time as my team is currently handling two priority files. However, I would be happy to contribute in a smaller capacity if needed.\n\nPerhaps my colleague, Sarah, would be interested. She has a background in environmental policy.\n\nThank you again for the opportunity.\n\nSincerely,\n\nMark\n\n**NARRATEUR :** This is an excellent refusal. He shows gratitude, gives a valid reason, offers a compromise, and suggests an alternative. He is helpful even when saying no.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Who is Receiving the Action? Object Pronouns",
      content: "**Titre :** Who is Receiving the Action? Object Pronouns\n\nWhen you are the receiver of an action, you use an object pronoun. They come *after* the verb or a preposition (like 'to', 'for', 'with').\n\n**Pattern → Subject + Verb + Object Pronoun**\n\n*   **Subject Pronouns:** I, you, he, she, it, we, they\n*   **Object Pronouns:** me, you, him, her, it, us, them\n\n**Examples:**\n*   Can you send the file **to me**?\n*   I will ask **him**.\n*   She sent **it** yesterday.\n*   The director invited **us** to the meeting.\n\n**Exemple interactif :**\n*Fill in the blank: \"I need to speak with Maria. Can you give this message to ___?\"* (Answer: her)\n\n**Common Error for Francophones:**\nIn French, the object pronoun often comes before the verb (\"Tu **me** donnes le fichier\"). In English, it always comes **after** (\"You give **me** the file\")."
    },
    "written": {
      title: "Accept and Decline",
      content: "**Titre :** Accept and Decline\n\n**Instructions :**\n1.  **Accept:** Your colleague asks you to review a short document. Write a short email accepting the request and saying when you will send it to them.\n2.  **Decline:** Your colleague invites you to a 1-hour meeting that conflicts with another important deadline. Write a polite email declining the invitation, giving a reason, and suggesting a brief 15-minute call later instead."
    },
    "oral": {
      title: "Polite Refusal Phrases",
      content: "**Titre :** Polite Refusal Phrases\n\n**Instructions :** Record yourself saying the following polite refusal phrases. Focus on a sincere and apologetic tone.\n\n*   \"Unfortunately, I'm unable to at the moment.\"\n*   \"I'm afraid I don't have the capacity right now.\"\n*   \"I'd love to help, but I'm currently working on a priority file.\"\n*   \"My schedule is full this week. Could we connect next week instead?\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 5.2: Responding to Requests",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: My manager sent ___ an email this morning.", options: ["I", "my", "me", "mine"], answer: "me", feedback: "Correct! Use the object pronoun 'me' after a verb or preposition." },
          { id: 2, type: "multiple-choice" as const, question: "Which phrase is best for politely declining a request?", options: ["No, I can't.", "I'm too busy.", "That's not possible.", "Unfortunately, I'm unable to at this time."], answer: "Unfortunately, I'm unable to at this time.", feedback: "Correct! This is a polite and professional way to refuse." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: I need to speak with John. Can you give this message to ___?", options: ["he", "his", "him", "himself"], answer: "him", feedback: "Correct! 'him' is the object pronoun for a male person." },
          { id: 4, type: "multiple-choice" as const, question: "When declining a request, it is good practice to...", options: ["ignore the email.", "say 'no' and nothing else.", "give a reason and suggest an alternative.", "forward the email to your manager."], answer: "give a reason and suggest an alternative.", feedback: "Correct! This shows you are still helpful and professional." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: The documents are for Sarah and David. Please send them to ___.", options: ["they", "their", "themselves", "them"], answer: "them", feedback: "Correct! 'them' is the object pronoun for a group of people." }
        ]
      }
    },
    "coaching": {
      title: "Setting Boundaries in English",
      content: "**Titre :** Setting Boundaries in English\n\nSaying \"no\" can be difficult, especially in a second language. You might worry about sounding rude or unhelpful. In the Canadian workplace, it is professional and respected to protect your time and prioritize your work. A polite \"no\" is better than a stressed \"yes\" that leads to poor quality work or missed deadlines.\n\n**Votre nouvelle routine :** When you receive a request you can't handle, don't reply immediately. Take five minutes. Think: 1) Can I really do this? 2) If not, what is a valid reason? 3) What is a helpful alternative I can offer? This small pause will help you write a confident, professional reply. reply."
    },
  },
  "5.3": {
    "hook": {
      title: "Creating an Effective Meeting Invite",
      content: "**Titre :** Creating an Effective Meeting Invite\n\nMeetings are a major part of life in the public service. A clear meeting invitation with a structured agenda is the first step to a productive meeting. It ensures everyone arrives prepared and knows the goal of the discussion.\n\n**Objectif :** By the end of this lesson, you will be able to write a clear meeting invitation and a simple agenda, using the future tense with \"going to\" to describe plans."
    },
    "video": {
      title: "The Project Kick-off Meeting",
      content: "**Titre :** The Project Kick-off Meeting\n\n**(Scene: ANNA needs to schedule the first meeting for a new project. She is writing the invitation in Outlook.)**\n\n**NARRATEUR (Voix off) :** Anna is organizing a new project. She needs to invite her team to a kick-off meeting. Let’s watch her create the invitation.\n\n**(We see Anna’s screen. She creates a new Teams Meeting invite.)**\n\n**TO:** Mark.Johnson@...; Sarah.Chen@...\n**SUBJECT:** Project Alpha: Kick-off Meeting\n\n**LOCATION:** MS Teams\n**DATE:** Thursday, March 15, 2026\n**TIME:** 10:00 AM - 10:45 AM\n\n**EMAIL BODY:**\n\nHi team,\n\nThis meeting is the official kick-off for Project Alpha.\n\nDuring the meeting, we are going to:\n1.  Review the project charter and objectives.\n2.  Define roles and responsibilities.\n3.  Discuss the project timeline and key milestones.\n\nPlease come prepared to discuss your initial ideas.\n\nThanks,\n\nAnna\n\n**NARRATEUR :** This is a model invitation. The subject is clear. The date, time, and location are prominent. The body explains the purpose and provides a clear, 3-point agenda. The use of \"we are going to\" clearly states the plan for the meeting.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Talking About Plans: The Future with \"Going To\"",
      content: "**Titre :** Talking About Plans: The Future with \"Going To\"\n\nWhen we talk about plans and intentions for the future, especially in meetings and projects, we often use \"going to\".\n\n**Pattern → Subject + am/is/are + going to + Verb (base form)**\n\n*   I **am going to present** the findings.\n*   She **is going to lead** the discussion.\n*   We **are going to review** the budget.\n\n**Questions:**\n*   **Are you going to** attend the meeting?\n*   **What are we going to** discuss?\n\n**Exemple interactif :**\n*Fill in the blank: \"He ___ (call) the client this afternoon.\"* (Answer: is going to call)\n\n**\"Will\" vs. \"Going to\"**\n*   **Going to:** For pre-made plans and intentions. (e.g., \"We are going to launch the project next month.\")\n*   **Will:** For spontaneous decisions made at the moment of speaking. (e.g., \"The phone is ringing. I'll get it!\")"
    },
    "written": {
      title: "Write a Meeting Invitation",
      content: "**Titre :** Write a Meeting Invitation\n\n**Instructions :** You need to schedule a 30-minute meeting with your team to brainstorm ideas for the annual report. Write a meeting invitation including a clear subject, date/time, and a simple 3-point agenda. Use \"going to\" to describe the agenda items."
    },
    "oral": {
      title: "Meeting Vocabulary",
      content: "**Titre :** Meeting Vocabulary\n\n**Instructions :** Record yourself saying the following key meeting vocabulary. Pay attention to the word stress (indicated in capitals).\n\n*   a-GEN-da\n*   MIN-utes (of the meeting)\n*   AC-tion i-tem\n*   FOL-low-up\n*   STAKE-hold-er\n*   de-LIV-er-a-ble"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 5.3: Meeting Invitations & Agendas",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: We ___ the budget at the next meeting.", options: ["are going to discuss", "will discuss", "discuss", "are discussing"], answer: "are going to discuss", feedback: "Correct! Use 'going to' for a planned agenda item." },
          { id: 2, type: "multiple-choice" as const, question: "What is the main purpose of an agenda?", options: ["To take notes during the meeting.", "To list who is invited.", "To provide a structure and plan for the meeting.", "To book the room."], answer: "To provide a structure and plan for the meeting.", feedback: "Correct! An agenda outlines the topics to be discussed." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: What ___ you going to do after the meeting?", options: ["is", "are", "am", "be"], answer: "are", feedback: "Correct! Use 'are' with the subject pronoun 'you'." },
          { id: 4, type: "multiple-choice" as const, question: "Which of these is NOT typically in a meeting invitation?", options: ["Subject", "Agenda", "Date and Time", "Detailed meeting minutes"], answer: "Detailed meeting minutes", feedback: "Correct! Meeting minutes are created *after* the meeting, not before." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: I ___ the presentation tomorrow morning.", options: ["am going to prepare", "will prepare", "prepare", "am preparing"], answer: "am going to prepare", feedback: "Correct! This is a planned activity, so 'going to' is appropriate." }
        ]
      }
    },
    "coaching": {
      title: "Preparation Is Confidence",
      content: "**Titre :** Preparation Is Confidence\n\nFeeling nervous before a meeting in English is common. The best way to reduce this anxiety is to prepare. Before the meeting, read the agenda. For each item, think of one or two key vocabulary words you might need. You don't need to script what you will say, but having a few key words in mind acts as a safety net. This small preparation can make a huge difference in your confidence. confidence."
    },
  },
  "5.4": {
    "hook": {
      title: "Managing Your Absence",
      content: "**Titre :** Managing Your Absence\n\nIn the public service, being away from your desk doesn't mean work stops. It's crucial to manage your absence professionally. This includes setting an out-of-office message and formally requesting leave. It shows respect for your colleagues' time and ensures continuity of work.\n\n**Objectif :** By the end of this lesson, you will be able to write a professional out-of-office message and a formal leave request, using countable/uncountable nouns and quantifiers correctly."
    },
    "video": {
      title: "The Annual Leave Request",
      content: "**Titre :** The Annual Leave Request\n\n**(Scene: ANNA is planning a vacation. She needs to request leave and set up her out-of-office message.)**\n\n**NARRATEUR (Voix off) :** Anna has some vacation time planned. First, she needs to formally request the leave from her manager, David.\n\n**(We see Anna's screen as she writes an email.)**\n\n**TO:** David.Chen@department.gc.ca\n**SUBJECT:** Leave Request - Anna Dubois - August 12-16\n\n**EMAIL BODY:**\n\nHi David,\n\nI would like to request 5 days of annual leave from Monday, August 12 to Friday, August 16, inclusive.\n\nI have completed the report on Project Alpha, and my other files are up to date. I will also brief Mark on any urgent items before I leave.\n\nPlease let me know if these dates are approved.\n\nThanks,\n\nAnna\n\n**NARRATEUR :** This is a professional leave request. The subject is clear, the dates are specific, and she shows responsibility by mentioning her work is complete. Now, let's see her out-of-office message.\n\n**(Anna opens her Outlook settings to the Automatic Replies section.)**\n\n**MESSAGE:**\n\nThank you for your message.\n\nI am currently out of the office and will return on Monday, August 19. I will have limited access to email during this time.\n\nFor urgent matters, please contact Mark Johnson at Mark.Johnson@department.gc.ca.\n\nSincerely,\n\nAnna Dubois\n\n**NARRATEUR :** This is a perfect out-of-office message. It states the dates of absence and return, manages expectations about email access, and provides an alternate contact for urgent issues.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "How Much? How Many? Countable vs. Uncountable Nouns",
      content: "**Titre :** How Much? How Many? Countable vs. Uncountable Nouns\n\nTo talk about leave and work, you need to know the difference between countable and uncountable nouns.\n\n*   **Countable Nouns:** Things you can count. They have a plural form. (e.g., one day, two **days**; one email, five **emails**)\n*   **Uncountable Nouns:** Things you cannot count (liquids, concepts, materials). They do not have a plural form. (e.g., time, information, work, advice)\n\n**Quantifiers:**\n\n| Use with Countable | Use with Uncountable | Use with Both |\n|---|---|---|\n| **How many** days? | **How much** time? | a lot of / lots of |\n| a **few** emails | a **little** information | some |\n| **many** tasks | **much** work | any |\n\n**Exemple interactif :**\n*Fill in the blank: \"I need ___ advice on this file.\"* (Answer: some / a little)\n\n**Common Error for Francophones:**\nWords like \"information\" and \"advice\" are countable in French (\"une information\", \"un conseil\") but **uncountable** in English. You cannot say \"an information\" or \"advices\". You say \"a piece of information\" or \"some advice\"."
    },
    "written": {
      title: "Write an Out-of-Office Message",
      content: "**Titre :** Write an Out-of-Office Message\n\n**Instructions :** You will be on sick leave for two days, returning on Monday. Write a professional out-of-office message. State your return date and provide a colleague's name and email for urgent matters."
    },
    "oral": {
      title: "Leave Types",
      content: "**Titre :** Leave Types\n\n**Instructions :** Record yourself saying the different types of leave common in the public service. Focus on clear pronunciation.\n\n*   an-nu-al leave (vacation)\n*   sick leave\n*   fam-i-ly-re-la-ted leave\n*   com-pen-sa-to-ry leave\n*   leave with-out pay"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 5.4: Out of Office & Leave",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the correct question: ___ days of leave do you have?", options: ["How much", "How many", "How long", "How often"], answer: "How many", feedback: "Correct! Use 'How many' with countable nouns like 'days'." },
          { id: 2, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["I need an information.", "I need some informations.", "I need some information.", "I need an informations."], answer: "I need some information.", feedback: "Correct! 'Information' is an uncountable noun in English." },
          { id: 3, type: "multiple-choice" as const, question: "What is the most important element in an out-of-office message?", options: ["A funny joke.", "Your home phone number.", "Your return date and an alternate contact.", "A detailed list of your vacation plans."], answer: "Your return date and an alternate contact.", feedback: "Correct! This allows colleagues to know when you will be back and who to contact in an emergency." },
          { id: 4, type: "multiple-choice" as const, question: "Complete: I have ___ work to do before I leave.", options: ["a lot of", "many", "a few", "several"], answer: "a lot of", feedback: "Correct! 'Work' is uncountable, so 'a lot of' is the best choice." },
          { id: 5, type: "multiple-choice" as const, question: "Which word is uncountable?", options: ["report", "meeting", "email", "advice"], answer: "advice", feedback: "Correct! 'Advice' is an uncountable noun. You can't say 'one advice'." }
        ]
      }
    },
    "coaching": {
      title: "Work-Life Balance in English",
      content: "**Titre :** Work-Life Balance in English\n\nTaking leave is a right and is respected in the Canadian workplace. Don't feel guilty about it. When you are on leave, you are not expected to check your email. The out-of-office message is a professional tool that creates a boundary. It allows you to disconnect fully, which is essential for your well-being and long-term performance.\n\n**Votre nouvelle routine :** When you go on leave, turn off email notifications on your phone. Trust your out-of-office message and your colleagues to handle urgent matters. A rested employee is an effective employee. employee."
    },
  },
  "6.1": {
    "hook": {
      title: "Phone Etiquette in Canada",
      content: "**Titre :** Phone Etiquette in Canada\n\nEven in an age of email and instant messaging, the telephone remains a critical tool in the public service. Knowing how to answer the phone professionally in English can build confidence and create a positive impression from the first word.\n\n**Objectif :** By the end of this lesson, you will be able to answer the phone, identify yourself, and make simple requests and offers using \"can\" and \"could\"."
    },
    "video": {
      title: "The Incoming Call",
      content: "**Titre :** The Incoming Call\n\n**(Scene: ANNA is at her desk. Her phone rings. The call is from an external number she doesn't recognize.)**\n\n**NARRATEUR (Voix off) :** Anna receives a call from outside the department. This requires a formal greeting.\n\n**(Anna picks up the phone.)**\n\n**ANNA:** Good morning, Department of Innovation, Anna Dubois speaking. How can I help you?\n\n**CALLER:** Hello, this is Robert Lavoie from Environment Canada. Could I please speak with David Chen?\n\n**ANNA:** One moment, please. I'll see if he's available. (Pauses) I'm sorry, he's in a meeting right now. Can I take a message?\n\n**CALLER:** Yes, please. Could you ask him to call me back when he is free? My number is 613-555-0123.\n\n**ANNA:** Of course. Robert Lavoie at 613-555-0123. I'll give him the message.\n\n**CALLER:** Thank you for your help.\n\n**ANNA:** You're welcome. Goodbye.\n\n**NARRATEUR :** Anna handled that perfectly. She used a formal greeting, identified her department and herself, offered help, and politely took a message. Notice the use of \"Can I...?\" and \"Could I...?\".\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Polite Possibilities: \"Can\" and \"Could\"",
      content: "**Titre :** Polite Possibilities: \"Can\" and \"Could\"\n\n\"Can\" and \"Could\" are modal verbs used to make requests, ask for permission, and make offers. \"Could\" is generally more polite and formal than \"can\".\n\n**Pattern 1 → Offers (Can I...?)**\n*   **Can I** help you?\n*   **Can I** take a message?\n\n**Pattern 2 → Permission (Can I / Could I...?)**\n*   **Can I** call you back this afternoon?\n*   **Could I** please speak with Ms. Tremblay?\n\n**Pattern 3 → Requests (Can you / Could you...?)**\n*   **Can you** hold, please?\n*   **Could you** please spell that for me?\n\n**Exemple interactif :**\n*Make this request more polite: \"Can you repeat that?\"* (Answer: Could you please repeat that?)"
    },
    "written": {
      title: "Write a Phone Script",
      content: "**Titre :** Write a Phone Script\n\n**Instructions :** Write a short script for how you would answer your work phone. Include:\n1.  A formal greeting (Good morning/afternoon).\n2.  Your name and department.\n3.  An offer to help (\"How can I help you?\")."
    },
    "oral": {
      title: "Phone Numbers & Spelling",
      content: "**Titre :** Phone Numbers & Spelling\n\n**Instructions :** Record yourself saying the following information clearly, as you would on a phone call.\n\n1.  **Phone Numbers:** Say this number digit by digit: 819-555-0199. (Say: eight-one-nine, five-five-five, zero-one-nine-nine).\n2.  **Spelling:** Spell your last name using the NATO phonetic alphabet (Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, etc.). For example, \"My last name is Smith. That's S for Sierra, M for Mike, I for India, T for Tango, H for Hotel.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 6.1: Answering the Phone",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which is the most formal and polite request?", options: ["I want to speak to David.", "Can I speak to David?", "Could I please speak with David?", "Give me David."], answer: "Could I please speak with David?", feedback: "Correct! 'Could I please speak with...' is the most formal and polite structure." },
          { id: 2, type: "multiple-choice" as const, question: "A good way to answer your work phone is:", options: ["Hello?", "Yes?", "Good morning, [Your Name] speaking.", "Speak."], answer: "Good morning, [Your Name] speaking.", feedback: "Correct! This is professional and immediately identifies you." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the offer: ___ I take a message for you?", options: ["Do", "Am", "Will", "Can"], answer: "Can", feedback: "Correct! 'Can I...?' is used to make offers." },
          { id: 4, type: "multiple-choice" as const, question: "What does 'NATO phonetic alphabet' help with?", options: ["Saying numbers.", "Spelling names clearly to avoid confusion.", "Greeting people.", "Ending a call."], answer: "Spelling names clearly to avoid confusion.", feedback: "Correct! It uses words to represent letters (A for Alpha) to ensure clarity over the phone." },
          { id: 5, type: "multiple-choice" as const, question: "Complete the request: ___ you hold for a moment, please?", options: ["Do", "Are", "Could", "Will"], answer: "Could", feedback: "Correct! 'Could you...?' is a polite way to ask someone to do something." }
        ]
      }
    },
    "coaching": {
      title: "Phone Anxiety",
      content: "**Titre :** Phone Anxiety\n\nIt's normal to feel more nervous on the phone in a second language because you can't see the other person's facial expressions. The key to overcoming this is preparation. Before you answer the phone, take a deep breath. Have a small notepad ready. Don't be afraid to ask someone to speak more slowly or to repeat something. Saying \"I'm sorry, could you repeat that more slowly?\" is a perfectly professional and acceptable request.\n\n**Votre nouvelle routine :** Keep a small script with your professional greeting next to your phone. Just seeing it there can give you a boost of confidence before you pick up the receiver."
    },
  },
  "6.2": {
    "hook": {
      title: "The Perfect Message",
      content: "**Titre :** The Perfect Message\n\nTaking an accurate phone message is a critical skill. A good message ensures that communication is not lost and that your colleagues can follow up effectively. It requires active listening and attention to detail.\n\n**Objectif :** By the end of this lesson, you will be able to take and relay a simple phone message, using the past simple of \"to be\" and regular verbs."
    },
    "video": {
      title: "Message Dictation",
      content: "**Titre :** Message Dictation\n\n**(Scene: ANNA has just answered the phone. Her colleague, SARAH, is not available. Anna is taking a message.)**\n\n**NARRATEUR (Voix off) :** Anna needs to take a message for her colleague Sarah. Let's see what key information she records.\n\n**(We see Anna writing on a message pad.)**\n\n**ANNA:** (Speaking on the phone) Okay, so that's Mr. Martin from the Treasury Board. And your number is 613-555-0188. You called about the budget submission. And you would like Sarah to call you back before 4 PM today. Is that all correct?\n\n**CALLER (V.O.):** Yes, that's perfect. Thank you.\n\n**ANNA:** You're welcome. I will make sure she gets the message.\n\n**(Anna hangs up. We see her completed message note.)**\n\n**MESSAGE FOR:** Sarah\n**FROM:** Mr. Martin, Treasury Board\n**PHONE:** 613-555-0188\n**DATE:** March 12, 10:30 AM\n**MESSAGE:** He called about the budget submission. He asked you to call him back before 4 PM today.\n\n**NARRATEUR :** This is a perfect message. It has all the essential elements: who the message is for, who it's from, the caller's contact information, the date and time of the call, and a clear summary of the message and required action.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Talking About the Past: Past Simple (To Be & Regular Verbs)",
      content: "**Titre :** Talking About the Past: Past Simple (To Be & Regular Verbs)\n\nWhen you relay a message, you are talking about something that happened in the past (the phone call). For this, we use the **Past Simple** tense.\n\n**Pattern 1 → Past Simple of \"To Be\"**\n*   I / He / She / It **was** (or **wasn't**)\n*   You / We / They **were** (or **weren't**)\n\n*Example: \"He **was** in a meeting. They **weren't** at their desks.\"*\n\n**Pattern 2 → Past Simple of Regular Verbs**\nFor most verbs, add **-ed** to the base form.\n*   call → call**ed**\n*   ask → ask**ed**\n*   want → want**ed**\n\n*Example: \"He **called** this morning. He **asked** about the report.\"*\n\n**Pronunciation of -ed:**\nThe `-ed` ending has three different sounds:\n1.  **/t/** after voiceless sounds (e.g., ask**ed**, finish**ed**)\n2.  **/d/** after voiced sounds (e.g., call**ed**, answer**ed**)\n3.  **/ɪd/** after /t/ or /d/ sounds (e.g., want**ed**, need**ed**)\n\n**Exemple interactif :**\n*Fill in the blank: \"Mr. Lavoie ___ (call) when you ___ (be) in a meeting.\"* (Answer: called, were)"
    },
    "written": {
      title: "Take a Message",
      content: "**Titre :** Take a Message\n\n**Instructions :** Listen to the following voicemail message and write a complete message note on a piece of paper. Include all the key details (For, From, Phone, Date/Time, Message).\n\n**(Audio of voicemail):** \"Hi, this is Jennifer from Shared Services. I'm calling for David Chen. It's about 2:30 PM on Tuesday. I'm calling about the invoice he submitted last week, number 554-C. There seems to be a small error. Could he please call me back at his earliest convenience? My number is 819-555-0142. Thanks.\""
    },
    "oral": {
      title: "Relay a Message",
      content: "**Titre :** Relay a Message\n\n**Instructions :** Imagine you are leaving a message for your colleague, David. Record yourself relaying the message you just took from Jennifer. Start with: \"Hi David, I have a message for you from Jennifer at Shared Services...\"\n\nFocus on using the past simple tense correctly (e.g., \"She **called** about...\", \"She **asked** you to...\")."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 6.2: Taking a Message",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: He ___ about the report this morning.", options: ["call", "called", "calls", "is calling"], answer: "called", feedback: "Correct! Use the past simple form for a completed action in the past." },
          { id: 2, type: "multiple-choice" as const, question: "Complete: I'm sorry, she ___ not at her desk right now.", options: ["is", "was", "were", "be"], answer: "is", feedback: "Correct! Use the present tense 'is' to describe a current situation." },
          { id: 3, type: "multiple-choice" as const, question: "When relaying a message, you say: 'Mr. Smith called.' The verb 'called' is in the...", options: ["Present Simple", "Present Continuous", "Past Simple", "Future Tense"], answer: "Past Simple", feedback: "Correct! The call happened in the past, so we use the past simple." },
          { id: 4, type: "multiple-choice" as const, question: "Which piece of information is LEAST essential in a phone message?", options: ["The caller's name", "The caller's phone number", "The reason for the call", "The weather outside"], answer: "The weather outside", feedback: "Correct! While the other pieces of information are critical for follow-up, the weather is irrelevant." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: They ___ in a meeting when you called.", options: ["was", "is", "were", "are"], answer: "were", feedback: "Correct! Use 'were' for the past tense of 'to be' with the subject 'they'." }
        ]
      }
    },
    "coaching": {
      title: "Active Listening",
      content: "**Titre :** Active Listening\n\nTaking a good message is about active listening. Don't just passively hear the words. Listen for the key information. The best way to ensure accuracy is to repeat the information back to the caller at the end of the call. Saying \"Okay, so just to confirm...\" shows professionalism and guarantees you have the correct details. It saves time and prevents misunderstandings later.\n\n**Votre nouvelle routine :** Every time you take a message, repeat the name, number, and main point back to the caller before you hang up. This simple habit will make you a more reliable and professional communicator. communicator. communicator."
    },
  },
  "6.3": {
    "hook": {
      title: "Calling with Confidence",
      content: "**Titre :** Calling with Confidence\n\nMaking a phone call in a second language can be intimidating. Unlike answering, you are the one who has to start the conversation. The key to success is preparation: knowing who you are calling, why you are calling, and what you want to say.\n\n**Objectif :** By the end of this lesson, you will be able to plan and initiate a professional phone call, using \"would like to\" to state your purpose politely."
    },
    "video": {
      title: "The Outgoing Call",
      content: "**Titre :** The Outgoing Call\n\n**(Scene: ANNA needs to call Robert Lavoie at Environment Canada to get some information for a report.)**\n\n**NARRATEUR (Voix off) :** Anna needs to make a call to another department. She prepares her key points before dialing.\n\n**(We see Anna’s notepad with a few bullet points: \"- Introduce self\", \"- Ask about Project Greenleaf report\", \"- Confirm deadline\".)**\n\n**(Anna dials the number. The phone rings.)**\n\n**RECEPTIONIST (V.O.):** Good afternoon, Environment Canada.\n\n**ANNA:** Hello, I would like to speak with Robert Lavoie, please.\n\n**RECEPTIONIST (V.O.):** One moment, I’ll put you through.\n\n**(Line transfers.)**\n\n**ROBERT (V.O.):** Robert Lavoie speaking.\n\n**ANNA:** Good afternoon, Mr. Lavoie. My name is Anna Dubois, and I’m a junior analyst at the Department of Innovation. I’m calling about the Project Greenleaf report.\n\n**ROBERT (V.O.):** Ah, yes. How can I help?\n\n**ANNA:** I would like to confirm the submission deadline. Is it still April 30th?\n\n**ROBERT (V.O.):** Yes, that’s correct. April 30th.\n\n**ANNA:** Perfect. Thank you very much for your help.\n\n**ROBERT (V.O.):** You’re welcome. Have a good day.\n\n**NARRATEUR :** That was a smooth and professional call. Anna was prepared. She identified herself and her department, clearly stated her purpose using \"I would like to...\", got the information she needed, and ended the call politely.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Polite Intentions: \"Would Like To\"",
      content: "**Titre :** Polite Intentions: \"Would Like To\"\n\nWhen you want to state your purpose or intention in a formal and polite way, use \"would like to\". It is much more professional than \"I want to\".\n\n**Pattern → Subject + would like to + Verb (base form)**\n\n*   I **would like to** speak with Mr. Chen.\n*   We’**d like to** schedule a meeting.\n*   She’**d like to** get an update.\n\n**Contraction:** `would` often becomes `’d` (e.g., I’d, you’d, she’d).\n\n**Questions:**\n*   **Would you like to** leave a message?\n*   What **would you like to** discuss?\n\n**Exemple interactif :**\n*Rewrite this sentence to be more polite: \"I want to ask a question.\"* (Answer: I would like to ask a question.)"
    },
    "written": {
      title: "Prepare a Call Script",
      content: "**Titre :** Prepare a Call Script\n\n**Instructions :** You need to call the IT Service Desk to ask for help with your computer. It is running very slowly. Write a short script for your call. Include:\n1.  Your introduction (your name and department).\n2.  The reason for your call (using \"I would like to...\").\n3.  A brief description of the problem."
    },
    "oral": {
      title: "Telephone Phrasal Verbs",
      content: "**Titre :** Telephone Phrasal Verbs\n\n**Instructions :** Phrasal verbs are very common in telephone conversations. Record yourself saying these common phrasal verbs and their meanings.\n\n*   **Hold on:** Please wait. (\"Please hold on for a moment.\")\n*   **Put through:** Connect. (\"I’ll put you through to his office.\")\n*   **Call back:** Return a call. (\"I’ll ask her to call you back.\")\n*   **Hang up:** End the call. (\"Don’t hang up!\")\n*   **Pick up:** Answer the phone. (\"She didn’t pick up her phone.\")"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 6.3: Making a Call",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which is the most polite way to state your purpose?", options: ["I want to talk to Sarah.", "I need to talk to Sarah.", "I would like to speak with Sarah.", "Let me talk to Sarah."], answer: "I would like to speak with Sarah.", feedback: "Correct! \"Would like to\" is the most polite and professional choice." },
          { id: 2, type: "multiple-choice" as const, question: "What does the phrasal verb \"put through\" mean?", options: ["End the call", "Connect", "Wait", "Return a call"], answer: "Connect", feedback: "Correct! It means to connect your call to someone else." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the sentence: I’d ___ to schedule an appointment.", options: ["like", "want", "need", "like to"], answer: "like to", feedback: "Correct! The full expression is \"would like to + verb\"." },
          { id: 4, type: "multiple-choice" as const, question: "What is a good first step before making a professional call?", options: ["Dial the number immediately.", "Prepare a few notes about why you are calling.", "Hope the person doesn’t answer.", "Speak very quickly."], answer: "Prepare a few notes about why you are calling.", feedback: "Correct! Preparation is key to a confident and effective call." },
          { id: 5, type: "multiple-choice" as const, question: "The receptionist says, \"Please hold on.\" What should you do?", options: ["Hang up and call back later.", "Start talking about your problem.", "Wait on the line.", "Send an email instead."], answer: "Wait on the line.", feedback: "Correct! \"Hold on\" means to wait." }
        ]
      }
    },
    "coaching": {
      title: "Preparing Before You Dial",
      content: "**Titre :** Preparing Before You Dial\n\nConfidence on the phone comes from preparation. Before you make an important call, take two minutes to write down three bullet points on a sticky note: 1) Who you are, 2) Your main question/purpose (using \"I’d like to...\"), and 3) The key information you need. This isn’t a script, it’s a safety net. If you get nervous, you can just look at your notes. This simple trick will make your calls much smoother and less stressful.\n\n**Votre nouvelle routine :** For the next week, before you make any work call in English, create a 3-point sticky note. See how much more confident you feel. feel."
    },
  },
  "6.4": {
    "hook": {
      title: "Virtual Meeting Etiquette",
      content: "**Titre :** Virtual Meeting Etiquette\n\nIn the modern public service, many meetings happen online via platforms like MS Teams. Knowing the rules of virtual meeting etiquette is essential for professional communication. It’s not just about what you say, but how you participate in the digital space.\n\n**Objectif :** By the end of this lesson, you will be able to participate basic virtual meetings, using correct etiquette and reviewing the difference between the present simple and present continuous tenses."
    },
    "video": {
      title: "The Teams Meeting",
      content: "**Titre :** The Teams Meeting\n\n**(Scene: ANNA, MARK, and DAVID are in a Teams meeting. We see the typical Teams interface.)**\n\n**NARRATEUR (Voix off) :** Welcome to a typical team meeting on MS Teams. Let’s observe the etiquette.\n\n**(David is speaking. Anna and Mark are muted and listening, with their cameras on.)**\n\n**DAVID:** ...so, the deadline for the first draft is next Friday. Any questions?\n\n**(Anna wants to ask a question. She uses the \"Raise Hand\" feature. David sees the notification.)**\n\n**DAVID:** Yes, Anna, go ahead.\n\n**ANNA:** (Unmutes herself) Thanks, David. I have a question about the formatting. Are we using the standard template?\n\n**DAVID:** Good question. Yes, please use the standard departmental template. I’ll share the link in the chat.\n\n**(David types the link into the meeting chat. A notification pops up.)**\n\n**MARK:** (Unmutes himself) Thanks for the link, David. I have it.\n\n**DAVID:** Great. If there are no more questions, let’s move on to the next item.\n\n**NARRATEUR :** Notice the key actions: muting when not speaking to reduce background noise, using the \"raise hand\" feature to ask a question, and using the chat for sharing information without interrupting. This is professional virtual meeting etiquette.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Review: Present Simple vs. Present Continuous",
      content: "**Titre :** Review: Present Simple vs. Present Continuous\n\nLet's review two key tenses for talking about work.\n\n**Present Simple:** For routines, habits, and facts.\n*   \"I **work** from home on Fridays.\" (A regular routine)\n*   \"The meeting **starts** at 10 AM.\" (A fact/schedule)\n\n**Present Continuous:** For actions happening right now or temporary situations.\n*   \"I **am working** from home today.\" (A temporary situation for today only)\n*   \"She **is sharing** her screen right now.\" (An action happening at this moment)\n\n**Signal Words:**\n*   **Present Simple:** always, usually, sometimes, never, every day/week/month\n*   **Present Continuous:** now, right now, at the moment, today, this week\n\n**Exemple interactif :**\n*Fill in the blank: \"She usually ___ (work) in the office, but this week she ___ (work) from home.\"* (Answer: works, is working)"
    },
    "written": {
      title: "Write Meeting Chat Messages",
      content: "**Titre :** Write Meeting Chat Messages\n\n**Instructions :** You are in a Teams meeting. Write 5 short, professional messages you could post in the chat. For example:\n1.  A message to agree with a point someone made.\n2.  A message to ask for a link or document.\n3.  A message to say you have to leave the meeting a few minutes early.\n4.  A message to say hello when you join.\n5.  A message to thank the presenter at the end."
    },
    "oral": {
      title: "Virtual Meeting Phrases",
      content: "**Titre :** Virtual Meeting Phrases\n\n**Instructions :** Record yourself saying these essential virtual meeting phrases. Focus on clear, steady pronunciation.\n\n*   \"Can everyone hear me?\"\n*   \"Sorry, I think you’re on mute.\"\n*   \"I’m going to share my screen now.\"\n*   \"Can you see the presentation?\"\n*   \"I have a question.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 6.4: Conference Calls & Teams Meetings",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "What should you do when you are not speaking in a Teams meeting?", options: ["Turn off your camera.", "Mute your microphone.", "Start a side conversation.", "Leave the meeting."], answer: "Mute your microphone.", feedback: "Correct! Muting your microphone reduces background noise for everyone." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: I ___ from home every Tuesday.", options: ["am working", "work", "works", "working"], answer: "work", feedback: "Correct! Use the present simple for a regular routine or habit." },
          { id: 3, type: "multiple-choice" as const, question: "What is the best way to ask a question during a large virtual meeting?", options: ["Interrupt the speaker loudly.", "Send a private message to a friend.", "Use the \"Raise Hand\" feature.", "Wait until the meeting is over and send an email."], answer: "Use the \"Raise Hand\" feature.", feedback: "Correct! The \"Raise Hand\" feature is the standard, polite way to signal you want to speak." },
          { id: 4, type: "multiple-choice" as const, question: "Complete: Look, the presenter ___ her screen now.", options: ["shares", "is sharing", "share", "is share"], answer: "is sharing", feedback: "Correct! Use the present continuous for an action happening right now." },
          { id: 5, type: "multiple-choice" as const, question: "The phrase \"You’re on mute\" means...", options: ["You are speaking too loudly.", "Your microphone is turned off.", "Your camera is not working.", "You are the host of the meeting."], answer: "Your microphone is turned off.", feedback: "Correct! It means we cannot hear you because your microphone is off." }
        ]
      }
    },
    "coaching": {
      title: "Path II Midpoint Check",
      content: "**Titre :** Path II Midpoint Check\n\nYou are now halfway through Path II. This is a great time to pause and reflect. You have learned to write professional emails and handle phone calls. You are moving from basic survival to active participation. Are you more confident now than you were at the start of this Path? What is still the most difficult part for you? Identifying your challenges is the first step to overcoming them. For the second half of this Path, focus your energy on those specific challenges.\n\n**Votre nouvelle routine :** At the end of each week, write down one thing you did well in English and one thing you want to improve next week. This simple habit of self-assessment will accelerate your learning. learning."
    },
  },
  "7.1": {
    "hook": {
      title: "Finding Your Voice in Meetings",
      content: "**Titre :** Finding Your Voice in Meetings\n\nParticipating in meetings is not just about listening; it's about contributing. Expressing your opinion clearly and respectfully is a key skill for any public servant. It shows you are engaged and adds value to the discussion.\n\n**Objectif :** By the end of this lesson, you will be able to express your opinion, agree, and disagree politely in a meeting using common professional phrases."
    },
    "video": {
      title: "The Brainstorming Session",
      content: "**Titre :** The Brainstorming Session\n\n**(Scene: ANNA, MARK, and DAVID are in a team meeting, brainstorming ideas for a new public awareness campaign.)**\n\n**DAVID:** ...so, we need some fresh ideas for the campaign. What are your initial thoughts?\n\n**MARK:** In my opinion, we should focus on social media. A video campaign on platforms like TikTok and Instagram could be very effective with a younger audience.\n\n**DAVID:** That's a good point, Mark. Anna, what do you think?\n\n**ANNA:** I agree with Mark that social media is important. However, I also think we shouldn't forget traditional media. From my perspective, a balanced approach is better. Perhaps we could partner with a national newspaper for a feature story?\n\n**DAVID:** I see your point. A balanced approach makes sense. I like that idea. So, one action item is to explore a social media campaign, and another is to research potential media partners. Any other ideas?\n\n**NARRATEUR :** Notice how they express their opinions. Mark uses \"In my opinion...\". Anna agrees with \"I agree with Mark,\" but then politely adds her own idea with \"However, I also think...\". David validates both opinions. This is a collaborative and respectful discussion.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "How to Share Your Perspective",
      content: "**Titre :** How to Share Your Perspective\n\nHere are standard phrases for expressing opinions, agreeing, and disagreeing in a professional setting.\n\n**Expressing an Opinion:**\n*   In my opinion, ...\n*   From my perspective, ...\n*   I think that ...\n*   It seems to me that ...\n\n**Agreeing:**\n*   I agree.\n*   I agree with [Name].\n*   That's a good point.\n*   I see what you mean.\n\n**Disagreeing Politely:**\nDisagreeing is not negative; it's part of a healthy discussion. The key is to be respectful.\n\n**Pattern → Agree (Acknowledge) + Disagree (Politely state difference)**\n*   \"I see your point, **but** I think...\"\n*   \"I understand what you're saying, **however**, my perspective is a bit different.\"\n*   \"I agree up to a point, **but** have we considered...?\"\n\n**Exemple interactif :**\n*Your colleague says, \"We should only focus on social media.\" How can you politely disagree and suggest a different idea?* (Answer: \"I understand why you say that, but from my perspective, we should also consider other channels.\")"
    },
    "written": {
      title: "Write Your Opinion",
      content: "**Titre :** Write Your Opinion\n\n**Instructions :** Your team is discussing whether to return to the office 5 days a week. Write a short paragraph (3-4 sentences) expressing your opinion on the topic. Use phrases from this lesson to state your view, and to agree or politely disagree with a potential counter-argument."
    },
    "oral": {
      title: "Opinion Phrases",
      content: "**Titre :** Opinion Phrases\n\n**Instructions :** Record yourself saying the following phrases. Focus on a confident and collaborative tone, not an aggressive one.\n\n*   \"In my opinion, the project needs more resources.\"\n*   \"From my perspective, the deadline is too short.\"\n*   \"I agree with Sarah's point about the budget.\"\n*   \"I see what you mean, however, I think we should also consider the risks.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 7.1: Expressing Your Opinion",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which phrase is a polite way to express your opinion?", options: ["You are wrong.", "My idea is better.", "In my opinion...", "Listen to me."], answer: "In my opinion...", feedback: "Correct! 'In my opinion...' is a standard and professional way to introduce your perspective." },
          { id: 2, type: "multiple-choice" as const, question: "Your colleague says something you agree with. What can you say?", options: ["Obviously.", "Finally!", "That's a good point.", "I guess."], answer: "That's a good point.", feedback: "Correct! This phrase validates your colleague's contribution and shows you are listening." },
          { id: 3, type: "multiple-choice" as const, question: "What is a good strategy for disagreeing politely?", options: ["Interrupt the person.", "First agree with part of their point, then introduce your idea.", "Say nothing.", "Change the subject."], answer: "First agree with part of their point, then introduce your idea.", feedback: "Correct! The 'Agree, but...' structure is a respectful way to show you have considered their view before adding your own." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the phrase: I see what you mean, ___, I have a different perspective.", options: ["so", "because", "however", "and"], answer: "however", feedback: "Correct! 'However' is a key transition word for introducing a contrasting idea politely." },
          { id: 5, type: "multiple-choice" as const, question: "The phrase \"From my perspective...\" is used to...", options: ["give an order.", "state a fact.", "express a personal viewpoint.", "end the meeting."], answer: "express a personal viewpoint.", feedback: "Correct! It signals that you are sharing your personal or professional viewpoint on a matter." }
        ]
      }
    },
    "coaching": {
      title: "You Have a Right to an Opinion",
      content: "**Titre :** You Have a Right to an Opinion\n\nMany people learning a new language are hesitant to share their opinions in meetings. They worry about their grammar or vocabulary. Remember: your ideas have value, even if your English isn't perfect. In the Canadian public service, diverse perspectives are encouraged. Your unique viewpoint as a professional is more important than perfect grammar.\n\n**Votre nouvelle routine :** Set a goal to speak just once in every meeting. It can be a small contribution. You can agree with someone (\"I agree with Mark\"), ask a clarifying question, or state a simple opinion. Start small to build your confidence. Your voice deserves to be heard. heard."
    },
  },
  "7.2": {
    "hook": {
      title: "Decoding Presentations",
      content: "**Titre :** Decoding Presentations\n\nIn the public service, you will attend many presentations, from informal team updates to formal briefings. Being able to understand the key messages, especially when data is presented, is a crucial skill for making informed decisions.\n\n**Objectif :** By the end of this lesson, you will be able to understand the main points of a simple presentation, using comparatives and superlatives to understand data and trends."
    },
    "video": {
      title: "The Quarterly Update",
      content: "**Titre :** The Quarterly Update\n\n**(Scene: MARK is giving a presentation to his team on the performance of their last social media campaign. He is showing a slide with a bar chart.)**\n\n**MARK:** ...and as you can see from this chart, the results from Q2 were very positive. The video campaign was **more successful than** the image campaign. It had **more views** and a **higher** engagement rate.\n\n**(He moves to the next slide.)**\n\n**MARK:** In fact, the launch video was **the most successful** piece of content we produced all year. It performed **better than** all our previous videos. The key takeaway is that video is our **most effective** tool for reaching a wide audience.\n\n**DAVID:** (From the audience) That's great work, Mark. What was the **least successful** part of the campaign?\n\n**MARK:** Good question. The blog post series was **less effective than** we hoped. It had the **lowest** readership.\n\n**NARRATEUR :** Mark uses specific language to compare data. He uses words like **more successful than**, **higher**, **better than** (comparatives) to compare two things. He uses **the most successful**, **most effective**, **lowest** (superlatives) to compare three or more things and identify the extreme (the best or the worst).\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Comparing Information: Comparatives & Superlatives",
      content: "**Titre :** Comparing Information: Comparatives & Superlatives\n\n**Comparatives (Comparing 2 Things)**\n\n1.  **Short Adjectives (1 syllable):** Add **-er + than**\n    *   fast → fast**er than**\n    *   high → high**er than**\n2.  **Long Adjectives (2+ syllables):** Use **more + adjective + than**\n    *   effective → **more** effective **than**\n    *   important → **more** important **than**\n\n**Superlatives (Comparing 3+ Things)**\n\n1.  **Short Adjectives:** Use **the + adjective-est**\n    *   fast → **the** fast**est**\n    *   high → **the** high**est**\n2.  **Long Adjectives:** Use **the most + adjective**\n    *   effective → **the most** effective\n    *   important → **the most** important\n\n**Irregular Forms:**\n*   good → **better** (comparative) → **the best** (superlative)\n*   bad → **worse** (comparative) → **the worst** (superlative)\n\n**Exemple interactif :**\n*Fill in the blank: \"This year's budget is ___ (small) than last year's budget.\"* (Answer: smaller)"
    },
    "written": {
      title: "Analyze the Data",
      content: "**Titre :** Analyze the Data\n\n**Instructions :** Look at the simple table below. Write 3 sentences describing the data using comparatives and superlatives.\n\n| Project | Budget | Team Size |\n|---|---|---|\n| Project Alpha | $50,000 | 5 |\n| Project Beta | $75,000 | 8 |\n| Project Gamma | $40,000 | 4 |\n\n*Example: \"Project Beta has a larger budget than Project Alpha.\"*"
    },
    "oral": {
      title: "Presentation Keywords",
      content: "**Titre :** Presentation Keywords\n\n**Instructions :** Record yourself saying these common presentation phrases. Focus on clear pronunciation and a confident tone.\n\n*   \"As you can see from the chart...\"\n*   \"The key takeaway is...\"\n*   \"Let's move on to the next slide.\"\n*   \"To summarize the main points...\"\n*   \"Are there any questions?\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 7.2: Understanding Presentations",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: This report is ___ than the last one.", options: ["long", "longer", "the longest", "more long"], answer: "longer", feedback: "Correct! For a one-syllable adjective like 'long', add -er for the comparative form." },
          { id: 2, type: "multiple-choice" as const, question: "Which word is a superlative?", options: ["better", "more effective", "the worst", "slower"], answer: "the worst", feedback: "Correct! Superlatives (like 'the worst', 'the best', 'the fastest') are used to compare three or more things and identify the extreme." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: This is ___ important project of the year.", options: ["the most", "more", "most", "the more"], answer: "the most", feedback: "Correct! For a long adjective like 'important', use 'the most' for the superlative form." },
          { id: 4, type: "multiple-choice" as const, question: "The comparative form of 'good' is:", options: ["gooder", "the best", "better", "more good"], answer: "better", feedback: "Correct! 'Good' is an irregular adjective. The comparative is 'better' and the superlative is 'the best'." },
          { id: 5, type: "multiple-choice" as const, question: "A presenter says, \"The key takeaway is...\". What does this mean?", options: ["This is the end of the presentation.", "This is the most important message to remember.", "This is a small, unimportant detail.", "This is the time for questions."], answer: "This is the most important message to remember.", feedback: "Correct! It signals the main conclusion or the most critical point the audience should remember." }
        ]
      }
    },
    "coaching": {
      title: "Listen for Signposts",
      content: "**Titre :** Listen for Signposts\n\nWhen you listen to a presentation in a second language, it can be easy to get lost. Don't try to understand every single word. Instead, listen for \"signpost\" words and phrases that tell you where the presenter is going. Phrases like \"First...\", \"Second...\", \"In conclusion...\", \"The key takeaway is...\" are like signs on a highway. They tell you what's coming next and what is most important. Focusing on these signposts will help you follow the structure and understand the main ideas, even if you miss some of the details.\n\n**Votre nouvelle routine :** The next time you watch a presentation or news report in English, take a piece of paper and write down only the signpost words you hear. See if you can reconstruct the basic outline of the presentation just from those words. This will train you to listen for structure, not just words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words. words."
    },
  },
  "7.3": {
    "hook": {
      title: "After the Meeting: What's Next?",
      content: "**Titre :** After the Meeting: What's Next?\n\nA successful meeting doesn't end when everyone leaves the room. It ends when the agreed-upon actions are completed. Understanding and tracking action items is what turns discussion into progress.\n\n**Objectif :** By the end of this lesson, you will be able to identify and confirm action items from a meeting, using the future tense with \"will\" to talk about promises and decisions."
    },
    "video": {
      title: "The Meeting Wrap-Up",
      content: "**Titre :** The Meeting Wrap-Up\n\n**(Scene: DAVID is concluding the team meeting about the new campaign.)**\n\n**DAVID:** Okay, this was a very productive discussion. Let's summarize the action items before we finish.\n\n**(He shares his screen, showing a simple list in a Word document.)**\n\n**DAVID:** So, to confirm: Mark, you **will draft** the social media plan. Is that correct?\n\n**MARK:** Yes, I **will send** the first draft to the team by Friday.\n\n**DAVID:** Perfect. And Anna, you **will research** potential media partners.\n\n**ANNA:** That's right. I **will have** a list of potential partners for our next meeting.\n\n**DAVID:** Excellent. I **will book** our next meeting for the same time next week to review your progress. Thanks, everyone.\n\n**NARRATEUR :** This is a great meeting wrap-up. David confirms each action item and who is responsible. Mark and Anna use \"I will...\" to confirm their commitment. This is a promise. David also uses \"I will...\" for a spontaneous decision to book the next meeting. This ensures everyone is clear on what happens next.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Promises and Decisions: The Future with \"Will\"",
      content: "**Titre :** Promises and Decisions: The Future with \"Will\"\n\nWe use the future with **will** to make promises, offers, and spontaneous decisions made at the moment of speaking.\n\n**Pattern → Subject + will + Verb (base form)**\n\n*   I **will send** the report this afternoon. (A promise)\n*   Don't worry, I **will help** you. (An offer)\n*   Okay, I **will call** him now. (A spontaneous decision)\n\n**Negative:** `will not` becomes `won't`\n*   I **won't** forget.\n\n**Questions:**\n*   **Will you** be at the meeting tomorrow?\n\n**\"Will\" vs. \"Going to\" Review:**\n*   **Going to:** For pre-made plans. (\"I **am going to present** at the meeting.\" - I knew this before the meeting.)\n*   **Will:** For decisions made *during* the meeting. (\"Okay, I **will present** that slide.\" - I just decided this now.)\n\n**Exemple interactif :**\n*Your colleague is struggling with a heavy box. What can you say?* (Answer: \"I'll help you with that.\" - using \"will\" for a spontaneous offer)"
    },
    "written": {
      title: "Write a Follow-Up Email",
      content: "**Titre :** Write a Follow-Up Email\n\n**Instructions :** You just finished a meeting. Write a short follow-up email to your colleague, Mark. In the email, confirm the action item you are responsible for. Use \"I will...\" to state your promise.\n\n*Your action item: To create the presentation slides for the next meeting.*"
    },
    "oral": {
      title: "Confirming Action Items",
      content: "**Titre :** Confirming Action Items\n\n**Instructions :** Record yourself saying these phrases for confirming action items. Focus on a clear and confident tone.\n\n*   \"So, just to confirm, I will handle the research.\"\n*   \"Is that correct? I will draft the report?\"\n*   \"I will send the minutes by the end of the day.\"\n*   \"Who will be responsible for booking the next meeting?\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 7.3: Action Items & Follow-Up",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "You decide during a meeting to send an email. What do you say?", options: ["I am sending the email.", "I send the email.", "I will send the email.", "I am going to send the email."], answer: "I will send the email.", feedback: "Correct! Use \"will\" for a spontaneous decision made at the moment." },
          { id: 2, type: "multiple-choice" as const, question: "What is an \"action item\"?", options: ["The meeting agenda.", "A task assigned to someone to be completed after the meeting.", "The meeting minutes.", "A question asked during the meeting."], answer: "A task assigned to someone to be completed after the meeting.", feedback: "Correct! It is a specific task that needs to be done." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the sentence: Don't worry, I ___ forget to call him.", options: ["will", "am not", "won't", "don't"], answer: "won't", feedback: "Correct! \"Won't\" is the contraction of \"will not\" and is used to make a negative promise." },
          { id: 4, type: "multiple-choice" as const, question: "Why is it important to summarize action items at the end of a meeting?", options: ["To make the meeting longer.", "To ensure everyone is clear on their responsibilities.", "To decide who to blame if something goes wrong.", "To practice speaking English."], answer: "To ensure everyone is clear on their responsibilities.", feedback: "Correct! It prevents confusion and ensures accountability." },
          { id: 5, type: "multiple-choice" as const, question: "Your colleague says, \"The printer is broken.\" You say: \"I ___ call IT support.\"", options: ["am going to", "will", "am", "do"], answer: "will", feedback: "Correct! This is a spontaneous decision and offer of help, so \"will\" is the best choice." }
        ]
      }
    },
    "coaching": {
      title: "The Power of the Follow-Up Email",
      content: "**Titre :** The Power of the Follow-Up Email\n\nPeople are busy and can sometimes forget what they promised in a meeting. A short, polite follow-up email is a powerful tool. It’s not about checking up on people; it’s about ensuring clarity and alignment. An email that says, \"Hi Mark, just to confirm our discussion, I will send you the draft by Friday. You will provide the statistics by Thursday. Thanks!\" is a professional way to make sure everyone is on the same page. It shows you are organized and proactive.\n\n**Votre nouvelle routine :** After your next important meeting, send a 3-sentence follow-up email to one colleague, confirming your action item and theirs. This simple act builds a reputation for reliability and professionalism. professionalism."
    },
  },
  "7.4": {
    "hook": {
      title: "Language That Includes Everyone",
      content: "**Titre :** Language That Includes Everyone\n\nIn the Canadian public service, diversity and inclusion are core values. The language we use should reflect this. Using inclusive, gender-neutral language is not just a matter of political correctness; it’s a sign of respect and professionalism. It ensures everyone feels seen, valued, and included.\n\n**Objectif :** By the end of this lesson, you will be able to recognize and use basic inclusive language, including the singular \"they\" and gender-neutral job titles."
    },
    "video": {
      title: "Updating the Job Posting",
      content: "**Titre :** Updating the Job Posting\n\n**(Scene: ANNA and DAVID are reviewing a job posting for a new analyst.)**\n\n**DAVID:** Okay, let’s review this job posting before we send it to HR. \"The ideal candidate will be a recent graduate. **He** should have strong analytical skills...\"\n\n**ANNA:** David, I have a suggestion. Instead of \"he,\" could we use \"they\"? It’s more inclusive.\n\n**DAVID:** You’re absolutely right, Anna. Good catch. Let’s change that. \"The ideal candidate will be a recent graduate. **They** should have strong analytical skills.\" That’s much better.\n\n**ANNA:** And for the job title, instead of \"Chairman,\" the new standard is just \"Chair.\"\n\n**DAVID:** Excellent point. Let’s make sure all the language is gender-neutral. Instead of \"manpower,\" we should use \"personnel\" or \"workforce.\" Instead of \"policeman,\" it’s \"police officer.\"\n\n**NARRATEUR :** This is an important conversation. Using gender-neutral language like the singular \"they\" and titles like \"Chair\" or \"police officer\" ensures that the language is inclusive and welcoming to all potential candidates, regardless of gender.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The Singular \"They\" and Gender-Neutral Nouns",
      content: "**Titre :** The Singular \"They\" and Gender-Neutral Nouns\n\n**1. The Singular \"They\"**\n\nTraditionally, \"he\" was used to refer to a person of unknown gender. Today, we use **\"they\"**. It is grammatically correct to use \"they\" as a singular pronoun.\n\n*   **Old:** When a new employee starts, **he** receives a laptop.\n*   **New:** When a new employee starts, **they** receive a laptop.\n\nUse \"they,\" \"them,\" and \"their\" for a single person if you don’t know their gender, or if you want to be inclusive.\n\n*Example: \"The next speaker hasn't arrived yet. **They** are running late.\"*\n\n**2. Gender-Neutral Job Titles**\n\nMany job titles have been updated to be gender-neutral.\n\n| Old Title | Neutral Title |\n|---|---|\n| Chairman | Chair / Chairperson |\n| Policeman | Police Officer |\n| Fireman | Firefighter |\n| Salesman | Salesperson / Sales Associate |\n| Manpower | Personnel / Workforce / Staff |\n\n**Exemple interactif :**\n*Make this sentence more inclusive: \"Every manager must approve his team's vacation requests.\"* (Answer: \"Every manager must approve their team's vacation requests.\")"
    },
    "written": {
      title: "Edit for Inclusivity",
      content: "**Titre :** Edit for Inclusivity\n\n**Instructions :** Rewrite the following sentences to make them more inclusive.\n\n1.  Each employee should update his password every 90 days.\n2.  The new chairman of the committee will be elected next week.\n3.  We need to hire more manpower for this project.\n4.  A good public servant always does his best."
    },
    "oral": {
      title: "Inclusive Pronunciation",
      content: "**Titre :** Inclusive Pronunciation\n\n**Instructions :** Record yourself saying the following sentences. Focus on using a natural, inclusive tone.\n\n*   \"If a client calls, ask them to leave a message.\"\n*   \"The new Director is starting next week. I am excited to meet them.\"\n*   \"Our new team lead is great. They are very supportive.\"\n*   \"We are looking for a new chairperson for the committee.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 7.4: Inclusive Language",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which sentence is the most inclusive?", options: ["An employee must use his ID card.", "An employee must use her ID card.", "An employee must use their ID card.", "An employee must use his or her ID card."], answer: "An employee must use their ID card.", feedback: "Correct! Using the singular \"their\" is the modern, standard way to be inclusive." },
          { id: 2, type: "multiple-choice" as const, question: "What is a gender-neutral term for \"policeman\"?", options: ["Policewoman", "Policeperson", "Police Officer", "Cop"], answer: "Police Officer", feedback: "Correct! \"Police Officer\" is the standard, professional, and gender-neutral term." },
          { id: 3, type: "multiple-choice" as const, question: "Why is it important to use inclusive language?", options: ["It is a new grammar rule.", "It is more complicated.", "It shows respect and ensures everyone feels included.", "It is only for formal documents."], answer: "It shows respect and ensures everyone feels included.", feedback: "Correct! It reflects the core public service values of diversity and respect." },
          { id: 4, type: "multiple-choice" as const, question: "Instead of \"manpower\", a better word is...", options: ["workforce", "manteam", "boypower", "guy-power"], answer: "workforce", feedback: "Correct! \"Workforce\", \"personnel\", or \"staff\" are all excellent gender-neutral alternatives." },
          { id: 5, type: "multiple-choice" as const, question: "You don't know the gender of the person you are writing about. Which pronoun should you use?", options: ["he", "she", "it", "they"], answer: "they", feedback: "Correct! The singular \"they\" is the standard pronoun to use in this situation." }
        ]
      }
    },
    "coaching": {
      title: "It's a Habit, Not a Test",
      content: "**Titre :** It's a Habit, Not a Test\n\nUsing inclusive language might feel strange at first if you are not used to it. You might make mistakes, and that's okay. The goal is not to be perfect immediately, but to build a new habit. The more you practice using the singular \"they\" and gender-neutral titles, the more natural it will become. It's a small change in your language that can have a big impact on making your colleagues feel respected.\n\n**Votre nouvelle routine :** For the next week, review one email you have written each day. Look specifically for pronouns and job titles. Is there a place where you could have used \"they\" or a more neutral title? This small act of self-correction will build the habit quickly. quickly."
    },
  },
  "8.1": {
    "hook": {
      title: "What Do You Do, Exactly?",
      content: "**Titre :** What Do You Do, Exactly?\n\nBeing able to clearly and concisely describe your work is fundamental to professional life. Whether in a performance review, a team meeting, or a networking event, explaining your tasks and responsibilities shows your value to the organization.\n\n**Objectif :** By the end of this lesson, you will be able to describe your main job tasks, using the verbs \"do\" and \"make\" correctly in common professional collocations."
    },
    "video": {
      title: "The Team Huddle",
      content: "**Titre :** The Team Huddle\n\n**(Scene: DAVID is leading a quick morning huddle with his team.)**\n\n**DAVID:** Okay team, quick round table. What is the main thing you are working on today? Mark?\n\n**MARK:** I'm **making** some final changes to the presentation for the Director General. I'm also **doing** some research for the new campaign.\n\n**DAVID:** Great. Anna?\n\n**ANNA:** I'm **doing** the monthly statistical report. After that, I need to **make** a few phone calls to follow up on the data.\n\n**DAVID:** Excellent. It sounds like everyone is on track. Let's **do** our best to meet our deadlines this week. This will **make** a big difference for the project.\n\n**NARRATEUR :** Listen to the verbs they use. Mark is **making** changes, but **doing** research. Anna is **doing** a report, but **making** phone calls. The choice between \"do\" and \"make\" is not random; it depends on the noun that follows. Mastering these combinations, or collocations, is key to sounding natural.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "\"Do\" vs. \"Make\": A Common Challenge",
      content: "**Titre :** \"Do\" vs. \"Make\": A Common Challenge\n\nFor many learners, including francophones (where \"faire\" means both), the difference between \"do\" and \"make\" is difficult.\n\n**\"Do\" is for...**\n*   Tasks, jobs, and routine activities.\n*   General, non-specific actions.\n\n*Common Collocations:* **do** research, **do** work, **do** a report, **do** a job, **do** your best.\n\n**\"Make\" is for...**\n*   Creating, producing, or constructing something new.\n*   Actions that cause a reaction or result.\n\n*Common Collocations:* **make** a presentation, **make** a decision, **make** a phone call, **make** a mistake, **make** a change, **make** a difference.\n\n**Exemple interactif :**\n*Fill in the blank: \"I need to ___ a decision about the budget.\"* (Answer: make)\n\n**Exemple interactif 2:**\n*Fill in the blank: \"She is going to ___ a presentation at the conference.\"* (Answer: make)"
    },
    "written": {
      title: "Describe Your Job",
      content: "**Titre :** Describe Your Job\n\n**Instructions :** Write 3-4 sentences describing your main professional responsibilities. Use at least two collocations with \"do\" and two collocations with \"make\".\n\n*Example: \"As an analyst, I **do** a lot of research and **do** reports. I also **make** presentations for my team and **make** recommendations to my manager.\"*"
    },
    "oral": {
      title: "\"Do\" and \"Make\" Collocations",
      content: "**Titre :** \"Do\" and \"Make\" Collocations\n\n**Instructions :** Record yourself saying the following sentences. Focus on pronouncing the phrases naturally as a single unit.\n\n*   \"I have to **do some work**.\"\n*   \"She needs to **make a phone call**.\"\n*   \"We are going to **do some research**.\"\n*   \"He has to **make a decision**.\"\n*   \"Let's **do our best**.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 8.1: My Tasks & Responsibilities",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete the sentence: I need to ___ a phone call.", options: ["do", "make", "take", "have"], answer: "make", feedback: "Correct! The correct collocation is 'make a phone call'." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: She is ___ research for her project.", options: ["doing", "making", "taking", "having"], answer: "doing", feedback: "Correct! The correct collocation is 'do research'." },
          { id: 3, type: "multiple-choice" as const, question: "Which verb is used for creating or producing something?", options: ["Do", "Make", "Take", "Have"], answer: "Make", feedback: "Correct! 'Make' is generally used when something new is created." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the sentence: It's important to ___ a good impression.", options: ["do", "make", "give", "show"], answer: "make", feedback: "Correct! The correct collocation is 'make an impression'." },
          { id: 5, type: "multiple-choice" as const, question: "Which verb is used for general tasks and jobs?", options: ["Do", "Make", "Take", "Have"], answer: "Do", feedback: "Correct! 'Do' is generally used for tasks and routine activities." }
        ]
      }
    },
    "coaching": {
      title: "Learning Collocations",
      content: "**Titre :** Learning Collocations\n\nDon't try to memorize a long list of \"do\" and \"make\" rules. It's not effective. The best way to learn collocations is in context. When you learn a new noun, learn the verb that goes with it. Think of them as a single unit. Instead of learning the word \"decision,\" learn the phrase \"make a decision.\" Instead of \"research,\" learn \"do research.\" This \"chunking\" approach will help you internalize the patterns much faster and sound more natural when you speak.\n\n**Votre nouvelle routine :** Keep a \"Collocation Notebook.\" When you hear a new phrase with \"do\" or \"make,\" write the full phrase down, not just the individual words. Review your list once a week. week."
    },
  },
  "8.2": {
    "hook": {
      title: "Keeping Your Manager Informed",
      content: "**Titre :** Keeping Your Manager Informed\n\nProviding regular, clear updates on your work is a key professional responsibility. It allows your manager to track progress, identify problems early, and report to their own superiors. A good update is concise and informative.\n\n**Objectif :** By the end of this lesson, you will be able to give a simple update on your work, using adverbs of frequency and degree to provide more detail."
    },
    "video": {
      title: "The Weekly Check-in",
      content: "**Titre :** The Weekly Check-in\n\n**(Scene: ANNA is in her weekly one-on-one meeting with her manager, DAVID.)**\n\n**DAVID:** So, Anna, how is the quarterly report coming along?\n\n**ANNA:** It’s going well. I **always** start with the data analysis, and that part is **almost** finished. I **usually** find that to be the most difficult part.\n\n**DAVID:** Good. And the presentation for the team meeting?\n\n**ANNA:** It’s **nearly** ready. I just need to add the final charts. I **sometimes** have trouble with the formatting, but this time it was **quite** easy. I am **very** confident it will be ready for Friday.\n\n**DAVID:** That’s excellent news. It sounds like everything is **completely** under control.\n\n**NARRATEUR :** Anna gives a great update. She doesn’t just say what she is doing; she adds detail using adverbs. Words like **always**, **usually**, **sometimes** (adverbs of frequency) describe *how often* she does something. Words like **almost**, **nearly**, **quite**, **very**, **completely** (adverbs of degree) describe *to what extent* something is done. This gives her manager a much clearer picture.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Adding Detail with Adverbs",
      content: "**Titre :** Adding Detail with Adverbs\n\n**1. Adverbs of Frequency (How often?)**\n\nThese adverbs usually go **before** the main verb, but **after** the verb \"to be\".\n\n| Adverb | Frequency |\n|---|---|\n| always | 100% |\n| usually | ~90% |\n| often | ~70% |\n| sometimes | ~50% |\n| rarely / seldom | ~10% |\n| never | 0% |\n\n*Example: \"I **usually** have a meeting on Monday mornings.\"*\n*Example: \"She is **rarely** late.\"*\n\n**2. Adverbs of Degree (To what extent?)**\n\nThese adverbs modify adjectives or other adverbs to make them stronger or weaker.\n\n*   **Strong:** completely, totally, absolutely, very\n*   **Medium:** quite, rather, pretty, fairly\n*   **Weak:** a little, slightly, almost, nearly\n\n*Example: \"The report is **almost** finished.\"*\n*Example: \"The task was **very** difficult.\"*\n\n**Exemple interactif :**\n*Put the adverb in the correct place: \"I check my email in the morning. (always)\"* (Answer: \"I always check my email in the morning.\")"
    },
    "written": {
      title: "Write an Update",
      content: "**Titre :** Write an Update\n\n**Instructions :** Your manager asks for an update on a report you are writing. Write a short, 3-sentence update. Use at least one adverb of frequency and two adverbs of degree.\n\n*Example: \"The report is going well. I **always** find the introduction difficult, but it is **almost** done. The rest of the report is **quite** straightforward.\"*"
    },
    "oral": {
      title: "Adverb Pronunciation",
      content: "**Titre :** Adverb Pronunciation\n\n**Instructions :** Record yourself saying the following sentences. Focus on putting the stress on the adverb to emphasize the meaning.\n\n*   \"The project is **almost** complete.\"\n*   \"I **usually** finish work at 5 PM.\"\n*   \"This task is **very** important.\"\n*   \"I **rarely** have meetings on Fridays.\"\n*   \"The results are **completely** accurate.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 8.2: Giving Updates",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which sentence is grammatically correct?", options: ["I check always my email.", "I always check my email.", "Always I check my email.", "I check my email always."], answer: "I always check my email.", feedback: "Correct! Adverbs of frequency usually go before the main verb." },
          { id: 2, type: "multiple-choice" as const, question: "Which adverb means \"almost 100% of the time\"?", options: ["Sometimes", "Rarely", "Usually", "Never"], answer: "Usually", feedback: "Correct! \"Usually\" indicates a very high frequency." },
          { id: 3, type: "multiple-choice" as const, question: "Which adverb of degree makes an adjective stronger?", options: ["a little", "slightly", "very", "almost"], answer: "very", feedback: "Correct! \"Very\" intensifies the adjective (e.g., very important)." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the sentence: The report is ___ finished. I just have to write the conclusion.", options: ["completely", "very", "almost", "not"], answer: "almost", feedback: "Correct! \"Almost\" means nearly finished, which fits the context." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: She is ___ late for meetings. She is very punctual.", options: ["always", "often", "sometimes", "rarely"], answer: "rarely", feedback: "Correct! If she is punctual, she is rarely (not often) late." }
        ]
      }
    },
    "coaching": {
      title: "No News is Not Good News",
      content: "**Titre :** No News is Not Good News\n\nIn some cultures, not giving an update means everything is fine. In the Canadian workplace, this is not always true. Managers expect regular updates, even if it’s just to say, \"Everything is on track.\" A short, proactive update shows that you are organized and in control of your files. It prevents your manager from having to chase you for information, which builds trust and confidence in your work.\n\n**Votre nouvelle routine :** At the end of each week, send your manager a very short (2-3 sentence) email summarizing the status of your main file. For example: \"Hi [Manager Name], just a quick update: The draft report is almost complete. I plan to send it to you by Tuesday as planned. Thanks.\" This small habit makes you look incredibly professional and feel more professional and reliable. reliable."
    },
  },
  "8.3": {
    "hook": {
      title: "Talking About Your Performance",
      content: "**Titre :** Talking About Your Performance\n\nPerformance reviews and informal check-ins are a regular part of professional life. Being able to talk about what you have accomplished (your achievements) and where you have struggled (your challenges) is essential for your career development.\n\n**Objectif :** By the end of this lesson, you will be able to describe past achievements and challenges using the past simple of common irregular verbs."
    },
    "video": {
      title: "The Performance Review",
      content: "**Titre :** The Performance Review\n\n**(Scene: ANNA is in a performance review meeting with DAVID.)**\n\n**DAVID:** So, Anna, let’s talk about the last quarter. What is one achievement you are proud of?\n\n**ANNA:** I am proud of the presentation I **gave** to the management team. I **spent** a lot of time on it, and I **felt** very confident. I **got** good feedback from the Director.\n\n**DAVID:** I agree, you **did** a great job on that. Now, what about a challenge? What was something you **found** difficult?\n\n**ANNA:** I **found** the tight deadline for the budget report challenging. I **made** a few small mistakes because I **was** in a hurry. I **spoke** with Mark in finance, and he **gave** me some advice for next time.\n\n**DAVID:** That’s great that you **took** the initiative to seek advice. That shows real growth.\n\n**NARRATEUR :** This is a constructive conversation. Anna uses past simple verbs to describe completed actions in the past. Many of these verbs are irregular: **gave** (not gived), **spent** (not spended), **felt** (not feeled), **got** (not getted), **did** (not doed), **found** (not finded), **made** (not maked), **spoke** (not speaked), **took** (not taked). Memorizing these is essential.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Past Simple: Irregular Verbs",
      content: "**Titre :** Past Simple: Irregular Verbs\n\nMany of the most common verbs in English are irregular in the past simple. They do not end in -ed. You must memorize them.\n\nHere are some of the most common ones for the workplace:\n\n| Base Form | Past Simple |\n|---|---|\n| be | was / were |\n| do | did |\n| get | got |\n| give | gave |\n| go | went |\n| have | had |\n| make | made |\n| say | said |\n| see | saw |\n| speak | spoke |\n| take | took |\n| think | thought |\n| write | wrote |\n\n**Exemple interactif :**\n*Fill in the blank: \"I ___ a report and ___ it to my manager yesterday.\"* (Answer: wrote, gave)"
    },
    "written": {
      title: "Your Achievements and Challenges",
      content: "**Titre :** Your Achievements and Challenges\n\n**Instructions :** Think about the last month at work. Write two sentences about one achievement, and two sentences about one challenge. Use at least four different irregular verbs from the list above.\n\n*Example: \"Last week, I **gave** a presentation. I **felt** good about it. I also **had** a difficult phone call. I **spoke** with a client who **was** very unhappy.\"*"
    },
    "oral": {
      title: "Irregular Verb Pronunciation",
      content: "**Titre :** Irregular Verb Pronunciation\n\n**Instructions :** Record yourself saying the following sentences. Focus on the correct pronunciation of the irregular verbs.\n\n*   \"I **wrote** the email and **sent** it.\"\n*   \"She **spoke** with her manager.\"\n*   \"We **went** to the meeting.\"\n*   \"He **took** the file home.\"\n*   \"They **thought** it was a good idea.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 8.3: Achievements & Challenges",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "What is the past simple of the verb \"to write\"?", options: ["writed", "wrote", "written", "wroten"], answer: "wrote", feedback: "Correct! \"Write\" is an irregular verb." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: I ___ to my director yesterday.", options: ["speak", "speaked", "spoke", "spoken"], answer: "spoke", feedback: "Correct! The past simple of \"speak\" is \"spoke\"." },
          { id: 3, type: "multiple-choice" as const, question: "Complete the sentence: We ___ a great idea in the meeting.", options: ["have", "had", "haved", "has"], answer: "had", feedback: "Correct! The past simple of \"have\" is \"had\"." },
          { id: 4, type: "multiple-choice" as const, question: "Which of the following is a regular verb?", options: ["go", "see", "ask", "make"], answer: "ask", feedback: "Correct! The past simple of \"ask\" is \"asked\". The others are irregular (went, saw, made)." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: She ___ a mistake on the form.", options: ["did", "maked", "made", "do"], answer: "made", feedback: "Correct! The past simple of \"make\" is \"made\"." }
        ]
      }
    },
    "coaching": {
      title: "Challenges are Opportunities",
      content: "**Titre :** Challenges are Opportunities\n\nTalking about challenges or mistakes at work can be scary. You might worry that it makes you look incompetent. In a healthy Canadian work environment, the opposite is true. Talking about a challenge shows self-awareness and a desire to grow. The key is to also talk about what you learned or what you are doing to improve. Saying \"I found this difficult, so I asked for help\" is much more powerful than pretending you never have any problems.\n\n**Votre nouvelle routine :** Start a \"Lessons Learned\" journal. Once a week, write down one challenge you faced and what you learned from it. This reframes challenges as learning opportunities and gives you confident answers for your next performance review. review."
    },
  },
  "8.4": {
    "hook": {
      title: "Preparing for Level A",
      content: "**Titre :** Preparing for Level A\n\nThis lesson is a comprehensive review of everything you have learned in Path I and Path II. It is designed to consolidate your knowledge and give you the confidence to demonstrate Level A proficiency in the Second Language Evaluation (SLE). This is your first major milestone.\n\n**Objectif :** By the end of this lesson, you will have reviewed and practiced the core grammar and vocabulary from levels A1 and A2, in a format that simulates the SLE test for Level A."
    },
    "video": {
      title: "The SLE Simulation",
      content: "**Titre :** The SLE Simulation\n\n**(Scene: A split screen. On one side, ANNA is sitting at a desk, looking at the camera as if speaking to an examiner. On the other side, we see text prompts simulating the oral test.)**\n\n**NARRATEUR (Voix off) :** The SLE oral test for Level A assesses your ability to handle simple, routine work situations. The questions are predictable. Let’s watch Anna answer some typical Level A questions.\n\n**PROMPT:** \"Good morning. Please introduce yourself.\"\n\n**ANNA:** Good morning. My name is Anna Dubois. I am a junior analyst at the Department of Innovation. I work in the policy group.\n\n**PROMPT:** \"Describe your typical day at work.\"\n\n**ANNA:** I usually start work at 8:30 AM. First, I read my emails. Then, I often have a team meeting in the morning. I do research and I write reports. I usually finish work at 5:00 PM.\n\n**PROMPT:** \"You receive a call, but your colleague is not there. What do you do?\"\n\n**ANNA:** I say, \"I’m sorry, she is not at her desk. Can I take a message?\" I write down the caller’s name and number. I give the message to my colleague.\n\n**NARRATEUR :** Anna’s answers are simple, direct, and use the grammar and vocabulary from Paths I and II correctly (Present Simple, collocations with do/make, Can I...?). This is exactly what is required for Level A.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Level A Grammar & Vocabulary Review",
      content: "**Titre :** Level A Grammar & Vocabulary Review\n\nThis section is a rapid-fire review of the core concepts from Paths I and II.\n\n**Key Grammar:**\n*   **Present Simple:** For routines and facts. (\"I **work** here.\")\n*   **Present Continuous:** For actions now. (\"I **am working** on a report.\")\n*   **Past Simple:** For completed past actions. (\"I **finished** it yesterday.\" / \"I **wrote** it.\")\n*   **Future with \"going to\" & \"will\"**: For plans and promises. (\"I **am going to** start it.\" / \"I **will** send it.\")\n*   **Modal Verbs:** Can, Could, Would like to. (\"**Can** I help?\" / \"**Could** you repeat that?\" / \"I’**d like to** ask...\")\n*   **Pronouns:** Subject (I, you, he) and Object (me, you, him).\n*   **Nouns:** Countable (days, emails) and Uncountable (time, information).\n\n**Key Vocabulary Themes:**\n*   Introductions & Greetings\n*   Jobs & Departments\n*   Office Supplies & Technology\n*   Daily Routines & Time\n*   Phone Calls & Messages\n*   Meetings & Agendas\n*   Achievements & Challenges\n\n**Exemple interactif :**\n*Correct the error: \"I am wanting to ask a question.\"* (Answer: \"I would like to ask a question.\" - \"Want\" is not typically used in the continuous form, and \"would like to\" is more polite.)"
    },
    "written": {
      title: "Simulated Written Expression Test",
      content: "**Titre :** Simulated Written Expression Test\n\n**Instructions :** You have 10 minutes. Write a short email (approx. 50-75 words) to your manager. In the email, you must:\n1.  State that you finished a report yesterday (Past Simple).\n2.  Say what you are working on now (Present Continuous).\n3.  Ask for a short meeting next week to discuss it (Future)."
    },
    "oral": {
      title: "Simulated Oral Proficiency Test",
      content: "**Titre :** Simulated Oral Proficiency Test\n\n**Instructions :** Record yourself answering the following typical SLE Level A questions. Speak for approximately 30-45 seconds for each question. Use simple, clear sentences.\n\n1.  \"Tell me about your responsibilities at work.\"\n2.  \"Describe a meeting you attended recently.\"\n3.  \"What did you do yesterday at work?\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 8.4: SLE Preparation — Level A",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Choose the best answer for: \"What do you do?\"", options: ["I am fine, thank you.", "I am an analyst.", "I did a report.", "I will make a call."], answer: "I am an analyst.", feedback: "Correct! This question asks for your job/profession." },
          { id: 2, type: "multiple-choice" as const, question: "Complete the sentence: I ___ the report yesterday.", options: ["finish", "am finishing", "finished", "will finish"], answer: "finished", feedback: "Correct! \"Yesterday\" is a time marker for the past simple." },
          { id: 3, type: "multiple-choice" as const, question: "Which question is grammatically correct?", options: ["You are working on what?", "What you are working on?", "What are you working on?", "What you work on?"], answer: "What are you working on?", feedback: "Correct! The structure for questions in the present continuous is (Wh-word) + am/is/are + Subject + Verb-ing?" },
          { id: 4, type: "multiple-choice" as const, question: "A colleague asks, \"Can you help me?\" What is a good response?", options: ["No.", "I am busy.", "Of course, what do you need?", "Why?"], answer: "Of course, what do you need?", feedback: "Correct! This is a polite and helpful response." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: She ___ to her manager every morning.", options: ["speaks", "is speaking", "spoke", "will speak"], answer: "speaks", feedback: "Correct! \"Every morning\" indicates a routine, so we use the present simple." }
        ]
      }
    },
    "coaching": {
      title: "Level A is About Survival, Not Perfection",
      content: "**Titre :** Level A is About Survival, Not Perfection\n\nThe key to passing the Level A test is to understand what the government is looking for. They are not looking for perfect grammar or a large vocabulary. They are looking for one thing: can you survive in a workplace environment? Can you handle simple, routine tasks without causing a major communication breakdown? Your goal is to be understood, not to be impressive. Use simple sentences. Use the vocabulary you know well. Don’t take risks. Answer the question directly. If you do this, you will succeed.\n\n**Votre nouvelle routine :** Congratulations on completing Path II! You now have all the tools for Level A. Your next step is to practice, practice, practice. Review the lessons in Path I and II. Do the oral and written exercises again. The more you use the language, the more automatic it will become. You are ready. ready."
    },
  },
  "9.1": {
    "hook": {
      title: "From Idea to Action: Planning Your Projects",
      content: "**Titre :** From Idea to Action: Planning Your Projects\n\nIn the public service, work is organized into projects. A project is not just a task; it's a structured effort to create value. Knowing how to plan a project—defining its goals, milestones, and timeline—is a core competency for any operational professional.\n\n**Objectif :** By the end of this lesson, you will be able to describe a project plan, using the future tenses \"will\" and \"going to\" correctly to distinguish between promises and established plans."
    },
    "video": {
      title: "The Kick-Off Meeting",
      content: "**Titre :** The Kick-Off Meeting\n\n**(Scene: ANNA is leading a kick-off meeting for a new project to update the department's website.)**\n\n**ANNA:** Welcome, everyone. As you know, we **are going to update** the departmental website over the next three months. The plan is approved. In Phase 1, we **are going to gather** user feedback.\n\n**MARK:** When will Phase 1 start?\n\n**ANNA:** We **are going to start** next Monday. David, you're leading the feedback survey, correct?\n\n**DAVID:** Yes. It's a tight deadline, but I **will send** the draft survey to the team for review by Wednesday. I promise.\n\n**ANNA:** Perfect. Once we have the survey results, we **will analyze** them and then we **will move** to Phase 2. I **will book** the next check-in meeting for two weeks from now.\n\n**NARRATEUR :** Anna uses \"are going to\" to talk about the project plan that is already decided. David uses \"I will send\" to make a promise or a spontaneous decision about his specific task within the plan. This distinction is key to clear communication about future actions.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Future Tense: \"Will\" vs. \"Going To\"",
      content: "**Titre :** Future Tense: \"Will\" vs. \"Going To\"\n\nThis is a common point of confusion. Both refer to the future, but they are not always interchangeable.\n\n**Use \"Going To\" for:**\n*   **Prior Plans:** Decisions made *before* the moment of speaking.\n*   **Evidence-Based Predictions:** When you see something is about to happen (e.g., \"Look at those dark clouds. It's **going to rain**.\")\n\n*Pattern:* Subject + am/is/are + going to + Verb\n*Example (Plan):* \"We **are going to launch** the new policy in Q3.\"\n\n**Use \"Will\" for:**\n*   **Spontaneous Decisions:** Decisions made *at* the moment of speaking.\n*   **Promises & Offers:** (\"I **will help** you.\")\n*   **Facts about the Future:** (\"The Minister **will make** an announcement tomorrow.\")\n\n*Pattern:* Subject + will + Verb\n*Example (Spontaneous):* \"The phone is ringing. I'**ll get** it.\"\n\n**Exemple interactif :**\n*You decided last week to reorganize your files. You say: \"This weekend, I ___ reorganize my files.\"* (Answer: am going to)"
    },
    "written": {
      title: "Write a Project Summary",
      content: "**Titre :** Write a Project Summary\n\n**Instructions :** You are the project lead for a new initiative to create a mentorship program in your directorate. Write a short project summary (4-5 sentences) for your director. Describe the main phases of the plan using \"going to\" and make one specific promise about your own immediate action using \"will\"."
    },
    "oral": {
      title: "Presenting Your Plan",
      content: "**Titre :** Presenting Your Plan\n\n**Instructions :** Record yourself giving a 1-minute verbal summary of the mentorship project plan you just wrote. Pay close attention to the natural pronunciation of \"going to\" (often sounds like \"gonna\") and \"I will\" (often sounds like \"I'll\").\n\n*   \"We're gonna start with a survey.\"\n*   \"Then, we're gonna match mentors and mentees.\"\n*   \"I'll send the draft plan by Friday.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 9.1: Project Planning",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "You have a plan to start a new project next month. You say:", options: ["We will start a new project.", "We are going to start a new project.", "We start a new project.", "We started a new project."], answer: "We are going to start a new project.", feedback: "Correct! Use 'going to' for a pre-existing plan." },
          { id: 2, type: "multiple-choice" as const, question: "Your colleague is having trouble with a file. You decide to help them at that moment. You say:", options: ["I help you.", "I am helping you.", "I am going to help you.", "I will help you."], answer: "I will help you.", feedback: "Correct! Use 'will' for a spontaneous offer of help." },
          { id: 3, type: "multiple-choice" as const, question: "What is a 'milestone' in a project?", options: ["A small task", "A team member", "A major point or event in the project's timeline", "The final budget"], answer: "A major point or event in the project's timeline", feedback: "Correct! A milestone marks a significant achievement or phase completion." },
          { id: 4, type: "multiple-choice" as const, question: "Complete the sentence: The project plan is approved. We ___ the first phase next week.", options: ["will begin", "are going to begin", "begin", "began"], answer: "are going to begin", feedback: "Correct! This is a planned action, so 'going to' is the best fit." },
          { id: 5, type: "multiple-choice" as const, question: "What is a 'deliverable'?", options: ["A team meeting", "A project manager", "A tangible output or result of the project", "A project risk"], answer: "A tangible output or result of the project", feedback: "Correct! A deliverable is a concrete product, like a report or a new system." }
        ]
      }
    },
    "coaching": {
      title: "Thinking Ahead in English",
      content: "**Titre :** Thinking Ahead in English\n\nWhen you plan a project in your second language, you are doing two difficult things at once: organizing complex ideas and communicating them in a foreign language. A powerful technique is to plan on paper first. Before a meeting, take 5 minutes to write down the key points of your plan in simple English. Use bullet points. This act of writing clarifies your thoughts and gives you the key vocabulary you need. When you speak, you won't be searching for words; you will be confidently expressing a plan you have already articulated.\n\n**Votre nouvelle routine :** Before your next meeting where you need to discuss a plan, create a 3-bullet-point summary in English. This small preparation will make a big difference in your clarity and confidence."
    },
  },
  "9.2": {
    "hook": {
      title: "Racing the Clock: Managing Deadlines & Priorities",
      content: "**Titre :** Racing the Clock: Managing Deadlines & Priorities\n\nIn the public service, you often have multiple tasks with competing deadlines. Simply working hard is not enough; you must work smart. This means knowing how to identify what is truly urgent and important, and how to communicate your priorities to your manager.\n\n**Objectif :** By the end of this lesson, you will be able to negotiate deadlines and discuss priorities using the first conditional (\"If... will...\") to explain the consequences of your choices."
    },
    "video": {
      title: "The Priority Discussion",
      content: "**Titre :** The Priority Discussion\n\n**(Scene: MARK is meeting with his manager, ANNA.)**\n\n**ANNA:** Mark, I need you to prepare the briefing note for the DG by tomorrow.\n\n**MARK:** Okay. I can do that, but I also have the deadline for the monthly report tomorrow. **If I work** on the briefing note, I **will not have** time to finish the report.\n\n**ANNA:** I see. The briefing note is the top priority. What do you suggest for the report?\n\n**MARK:** **If you give** me an extension until Friday for the report, I **will be able** to complete both tasks properly.\n\n**ANNA:** That sounds reasonable. Okay, focus on the briefing note. **If you finish** it early, you **can start** on the report. But the new deadline for the report is Friday.\n\n**NARRATEUR :** Mark uses the first conditional to explain a real future possibility and its consequence. \"If [present tense], ... will [verb].\" This is the language of negotiation and planning. He clearly states the problem and proposes a solution.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The First Conditional: \"If... will...\"",
      content: "**Titre :** The First Conditional: \"If... will...\"\n\nWe use the first conditional to talk about the result of a possible future action. It describes a real possibility.\n\n**Structure:**\n`If + Present Simple, ... will/won't + Verb`\n\n*   The \"if\" clause describes the condition (the possible action).\n*   The main clause describes the result (the consequence).\n\n**Examples:**\n*   \"**If** we **get** the approval, we **will start** the project.\"\n*   \"**If** you **don't finish** the report, your manager **will not be** happy.\"\n*   \"What **will you do if** the client **calls**?\" (You can reverse the clauses)\n\n**Exemple interactif :**\n*Complete the sentence: If I ___ (have) time, I ___ (call) you later.* (Answer: have / will call)"
    },
    "written": {
      title: "Prioritize Your Tasks",
      content: "**Titre :** Prioritize Your Tasks\n\n**Instructions :** Your manager has just given you a new urgent task (Task C), but you already have two other tasks with deadlines for today (Task A and Task B). Write a short email to your manager. Explain the situation using the first conditional and propose a new plan for the deadlines."
    },
    "oral": {
      title: "Negotiating a Deadline",
      content: "**Titre :** Negotiating a Deadline\n\n**Instructions :** Record yourself having a conversation with your manager. Use the phrases below. Practice linking the words naturally.\n\n*   \"If I work on this, I won't have time for that.\" (I-won't-have-time)\n*   \"If you give me an extension, I'll be able to finish it.\" (I'll-be-able)\n*   \"What will you do if they don't respond?\" (What-will-you-do)"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 9.2: Deadlines & Priorities",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete: If you ___ late, we ___ without you.", options: ["are / will start", "will be / start", "are / start", "will be / will start"], answer: "are / will start", feedback: "Correct! The structure is 'If + Present Simple, ... will + Verb'." },
          { id: 2, type: "multiple-choice" as const, question: "Which phrase means 'as soon as possible'?", options: ["EOD", "TBD", "FYI", "ASAP"], answer: "ASAP", feedback: "Correct! ASAP stands for As Soon As Possible." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: What ___ if your computer ___?", options: ["will you do / crashes", "you do / will crash", "do you do / crashes", "will you do / will crash"], answer: "will you do / crashes", feedback: "Correct! The question form is 'What will [subject] do if [subject] [present simple verb]?'" },
          { id: 4, type: "multiple-choice" as const, question: "To negotiate a deadline, it is best to:", options: ["Say nothing and be late.", "Explain the problem and propose a solution.", "Work all night.", "Blame a colleague."], answer: "Explain the problem and propose a solution.", feedback: "Correct! Proactive communication is a key professional skill." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: I ___ the report if I ___ time.", options: ["finish / will have", "will finish / will have", "will finish / have", "finish / have"], answer: "will finish / have", feedback: "Correct! The clauses are reversed here: 'will + Verb ... if + Present Simple'." }
        ]
      }
    },
    "coaching": {
      title: "Saying \"I Need More Time\"",
      content: "**Titre :** Saying \"I Need More Time\"\n\nIn North American work culture, especially in government, being proactive is highly valued. It can feel difficult to say \"I can't do this\" or \"I need more time\" in a second language. You might worry about appearing incompetent. Reframe your thinking. You are not saying \"no.\" You are saying, \"Yes, and to do this well, we need to adjust the plan.\"\n\nWhen you use the first conditional (\"If I do X, then Y will happen\"), you are not making an excuse. You are demonstrating strategic thinking. You are showing your manager that you understand the consequences of actions and that you are managing your workload responsibly. This builds trust and shows you are a reliable professional.\n\n**Votre nouvelle routine :** The next time you feel overloaded, don't just feel stressed. Write down one \"If... will...\" sentence that explains your situation. This is the first step to taking control."
    },
  },
  "9.3": {
    "hook": {
      title: "Empowering Your Team: The Art of Delegation",
      content: "**Titre :** Empowering Your Team: The Art of Delegation\n\nAs you advance in your career, you cannot do everything yourself. Delegation is not just about giving tasks to others; it's about empowering your team, developing their skills, and focusing your own energy on the most critical work. Clear delegation is a sign of a confident leader.\n\n**Objectif :** By the end of this lesson, you will be able to delegate tasks using modal verbs (must, have to, should, could) to show different levels of obligation and suggestion."
    },
    "video": {
      title: "The Delegation Conversation",
      content: "**Titre :** The Delegation Conversation\n\n**(Scene: ANNA is delegating tasks to her team members, MARK and DAVID.)**\n\n**ANNA:** Okay team, let's talk about the next steps for the website project. Mark, you **must** complete the security assessment by Friday. This is a mandatory requirement.\n\n**MARK:** Understood. I'll get on it right away.\n\n**ANNA:** David, you **should** start drafting the content for the 'About Us' page. It's not as urgent as the security assessment, but it's the next logical step.\n\n**DAVID:** Okay. Should I use the old content as a base?\n\n**ANNA:** You **could** do that, or you **could** start fresh. I'll leave that to your professional judgment. Just make sure it aligns with the new departmental mandate.\n\n**NARRATEUR :** Anna uses different modal verbs to show the level of urgency. \"Must\" for a non-negotiable obligation. \"Should\" for a strong suggestion or recommendation. \"Could\" for a possibility or option. This nuanced language makes her a clear and effective manager.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Modal Verbs for Obligation & Suggestion",
      content: "**Titre :** Modal Verbs for Obligation & Suggestion\n\nModal verbs modify other verbs to express ideas like ability, permission, or, in this case, obligation and suggestion. They don't change with the subject (no \"-s\" for he/she/it).\n\n**Strong Obligation (100% necessary):**\n*   **Must:** Internal obligation or very strong rule. (\"You **must** submit your timesheet.\")\n*   **Have to:** External rule or obligation. (\"You **have to** get a security clearance for this job.\")\n\n**Recommendation / Strong Suggestion (80% necessary):**\n*   **Should / Ought to:** This is the best advice or the correct thing to do. (\"You **should** double-check the numbers.\")\n\n**Possibility / Gentle Suggestion (50% necessary):**\n*   **Could / Might:** These are options, not requirements. (\"You **could** add a chart to the presentation.\")\n\n**Exemple interactif :**\n*To enter the building, you need a pass. You ___ have your pass with you.* (Answer: must / have to)"
    },
    "written": {
      title: "Write a Delegation Email",
      content: "**Titre :** Write a Delegation Email\n\n**Instructions :** You are a team lead. Write a short email to a colleague, delegating the task of organizing the next team meeting. Use at least three different modal verbs from the lesson to explain what is mandatory, what is recommended, and what is optional."
    },
    "oral": {
      title: "Delegating Verbally",
      content: "**Titre :** Delegating Verbally\n\n**Instructions :** Record yourself delegating a task to a team member. Practice the pronunciation of the modal verbs. Notice that the \"l\" in \"should\" and \"could\" is silent.\n\n*   \"You must finish this by noon.\" (Stress on \"must\")\n*   \"You should check with finance first.\" (shood)\n*   \"You could ask Maria for help.\" (cood)"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 9.3: Delegating Tasks",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which sentence expresses the strongest obligation?", options: ["You could finish the report.", "You should finish the report.", "You must finish the report.", "You might finish the report."], answer: "You must finish the report.", feedback: "Correct! 'Must' indicates a mandatory, non-negotiable obligation." },
          { id: 2, type: "multiple-choice" as const, question: "Complete: You ___ get a new password. This one has expired.", options: ["should", "could", "have to", "might"], answer: "have to", feedback: "Correct! 'Have to' is used for external rules or obligations." },
          { id: 3, type: "multiple-choice" as const, question: "Your colleague asks for advice on a presentation. You say:", options: ["You must add more slides.", "You should add more visuals.", "You have to add more visuals.", "You could to add more visuals."], answer: "You should add more visuals.", feedback: "Correct! 'Should' is the best way to give strong, polite advice." },
          { id: 4, type: "multiple-choice" as const, question: "To give someone an option or possibility, you use:", options: ["Must", "Have to", "Should", "Could"], answer: "Could", feedback: "Correct! 'Could' presents an idea as one of several possibilities." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: First, you ___ the form. Then, you ___ it to HR. Finally, you ___ for confirmation.", options: ["download / submit / wait", "downloading / submitting / waiting", "to download / to submit / to wait", "downloads / submits / waits"], answer: "download / submit / wait", feedback: "Correct! When giving instructions, use the base form of the verb (imperative)." }
        ]
      }
    },
    "coaching": {
      title: "Trust and Verify",
      content: "**Titre :** Trust and Verify\n\nDelegation is a dance between trust and verification. When you delegate, you show trust in your colleague's abilities. This is motivating. However, as a manager or team lead, you are still accountable for the final result. This is where verification comes in.\n\nIn a bilingual environment, clear communication is extra important. When you delegate, don't just say, \"Please do this.\" A better way is to say, \"Please do this. Could you send me a quick update by end of day?\" or \"Let's have a quick 5-minute chat tomorrow morning to see how it's going.\"\n\nThis isn't micromanagement. It's a system of clear communication that ensures everyone is on the same page, respects the person doing the work, and guarantees the quality of the outcome. It's how you build a high-performing team.\n\n**Votre nouvelle routine :** The next time you delegate a task, also schedule a brief, low-pressure check-in. This builds a rhythm of accountability."
    },
  },
  "9.4": {
    "hook": {
      title: "On Track or Off Track? Reporting Your Progress",
      content: "**Titre :** On Track or Off Track? Reporting Your Progress\n\nHow do you know if a project is succeeding? You track its progress. A progress report isn't just a list of completed tasks. It's a communication tool that tells stakeholders what you have accomplished, what problems you have encountered, and what you will do next. It builds confidence and ensures there are no surprises.\n\n**Objectif :** By the end of this lesson, you will be able to write and present a simple progress report using the present perfect tense (\"I have finished...\") to connect past actions to the present status."
    },
    "video": {
      title: "The Weekly Check-In",
      content: "**Titre :** The Weekly Check-In\n\n**(Scene: DAVID is giving a weekly progress update to his manager, ANNA.)**\n\n**ANNA:** Hi David, how is the website content coming along?\n\n**DAVID:** It's going well. So far, I **have drafted** the content for the 'Home' and 'About Us' pages. I **have also gathered** the photos we need.\n\n**ANNA:** Great. What about the 'Contact Us' page? **Have you started** that yet?\n\n**DAVID:** No, I **haven't started** it yet. I **have run into** a small problem. I don't have the final contact information for the regional offices.\n\n**ANNA:** I see. I will get that for you. What have you planned for next week?\n\n**DAVID:** I **have planned** to draft the 'Services' page. Once I get the contact info, I will finish the 'Contact Us' page.\n\n**NARRATEUR :** David uses the present perfect (\"have drafted,\" \"have gathered\") to talk about recent, completed actions that are relevant to the project's current status. Anna uses it to ask about progress (\"Have you started...?\"). This tense is essential for reporting.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Introduction to the Present Perfect",
      content: "**Titre :** Introduction to the Present Perfect\n\nWe use the present perfect to talk about past actions that have a connection to the present. The exact time of the action is not important.\n\n**Structure:**\n`Subject + have/has + Past Participle`\n\nThe past participle for regular verbs is the same as the simple past (-ed). For irregular verbs, it's the third form (e.g., do → did → **done**; see → saw → **seen**).\n\n**Use the Present Perfect for:**\n*   **Recent Past Actions with Present Results:** \"I **have lost** my keys.\" (Result: I can't get in my house now.)\n*   **Life Experiences:** \"She **has worked** in three different departments.\"\n*   **Changes Over Time:** \"The department **has grown** a lot in the last year.\"\n\n**Signal Words:**\n*   **For / Since:** (I have worked here **for** three years / **since** 2021.)\n*   **Already / Yet / Just:** (I have **already** finished. / I haven't finished **yet**. / I have **just** arrived.)\n*   **So far / Recently:** (We have completed two phases **so far**.)\n\n**Exemple interactif :**\n*You started a report on Monday. It is now Wednesday. You say: \"I ___ (work) on this report since Monday.\"* (Answer: have worked)"
    },
    "written": {
      title: "Write a Progress Report",
      content: "**Titre :** Write a Progress Report\n\n**Instructions :** You are working on organizing a team-building event. Write a short progress report email to your manager. Use the present perfect at least three times to describe what you have done so far (e.g., booked a room, sent invitations, prepared the agenda)."
    },
    "oral": {
      title: "Giving a Verbal Progress Update",
      content: "**Titre :** Giving a Verbal Progress Update\n\n**Instructions :** Record yourself giving a 1-minute verbal progress update on the team-building event. Focus on the pronunciation of the contracted forms.\n\n*   \"I've booked the conference room.\" (I've)\n*   \"She's sent the invitations.\" (She's)\n*   \"We haven't received all the RSVPs yet.\" (haven't)"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 9.4: Progress Reports",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete: She ___ the report. It's on your desk.", options: ["finish", "finished", "has finished", "was finishing"], answer: "has finished", feedback: "Correct! The action is completed in the recent past and has a present result." },
          { id: 2, type: "multiple-choice" as const, question: "Which sentence is correct?", options: ["I have seen that movie yesterday.", "I saw that movie yesterday.", "I have saw that movie yesterday.", "I seen that movie yesterday."], answer: "I saw that movie yesterday.", feedback: "Correct! When you specify a finished time in the past (yesterday), you must use the simple past." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: They ___ here for three years.", options: ["worked", "work", "have worked", "are working"], answer: "have worked", feedback: "Correct! Use the present perfect with 'for' to describe an action that started in the past and continues to the present." },
          { id: 4, type: "multiple-choice" as const, question: "What is the past participle of 'to write'?", options: ["Wrote", "Writed", "Written", "Writing"], answer: "Written", feedback: "Correct! 'Write' is an irregular verb: write -> wrote -> written." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: Have you finished the presentation ___?", options: ["already", "yet", "just", "so far"], answer: "yet", feedback: "Correct! 'Yet' is used in questions and negative sentences to ask if something has happened." }
        ]
      }
    },
    "coaching": {
      title: "Reporting Bad News",
      content: "**Titre :** Reporting Bad News\n\nSometimes, a progress report must include bad news: a delay, a problem, a risk. It can be stressful to report this in a second language. The key is to be direct, but also solution-oriented.\n\nNever just state the problem. Always pair the problem with a proposed solution or action. Instead of saying, \"We have missed the deadline,\" try saying:\n\n\"We **have encountered** a delay with the data analysis. The impact is a potential two-day delay. To mitigate this, I **have already asked** for support from the analytics team, and I **propose** we work on a different section of the report in the meantime.\"\n\nThis structure shows that you are not just reporting a problem; you are actively managing it. This builds credibility and trust with your manager and stakeholders.\n\n**Votre nouvelle routine :** The next time you face a problem, practice this formula: 1. State the problem (using present perfect). 2. State the impact. 3. State the action you have taken or propose to solve it."
    },
  },
  "10.1": {
    "hook": {
      title: "Feedback is a Gift: Giving Constructive Criticism",
      content: "**Titre :** Feedback is a Gift: Giving Constructive Criticism\n\nIn a high-performing team, feedback is not criticism; it's a tool for growth. Learning to give feedback that is clear, specific, and actionable is one of the most valuable communication skills you can develop. It helps your colleagues improve and strengthens your entire team.\n\n**Objectif :** By the end of this lesson, you will be able to give constructive feedback using the SBI model (Situation-Behavior-Impact) and soften your advice with the modal verbs \"should\" and \"could\"."
    },
    "video": {
      title: "The Feedback Sandwich",
      content: "**Titre :** The Feedback Sandwich\n\n**(Scene: ANNA is giving feedback to MARK on a presentation he gave.)**\n\n**ANNA:** Mark, do you have a minute to chat about the presentation?\n\n**MARK:** Sure, Anna. How did it go?\n\n**ANNA:** Overall, it was very strong. Your analysis was excellent. I want to give you one piece of feedback. **(Situation)** During the Q&A session, **(Behavior)** you looked at your notes a lot when you were answering questions. **(Impact)** The impact was that it made you seem a little less confident in your answers.\n\n**MARK:** Oh, I see. I wasn't aware I was doing that.\n\n**ANNA:** It's a small thing. For your next presentation, you **should** try to make more eye contact with the audience. You **could** even practice your answers beforehand. But like I said, the content was top-notch.\n\n**NARRATEUR :** Anna uses the SBI model to be specific and objective. She doesn't say \"You were nervous.\" She describes the specific behavior and its impact. She then uses \"should\" and \"could\" to offer actionable advice. This is a masterclass in professional feedback.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The SBI Model & Softening Language",
      content: "**Titre :** The SBI Model & Softening Language\n\n**SBI = Situation - Behavior - Impact**\nThis model removes judgment and focuses on facts.\n\n*   **Situation:** When and where did it happen? (e.g., \"In yesterday's team meeting...\")\n*   **Behavior:** What was the specific, observable action? (e.g., \"...you interrupted a colleague twice.\")\n*   **Impact:** What was the result of that behavior? (e.g., \"...and the impact was that we didn't get to hear their full idea.\")\n\n**Softening with Modals:**\nAfter giving SBI feedback, you offer a solution. Use \"should\" and \"could\" to make your advice sound like a helpful suggestion, not a command.\n\n*   **Should:** Strong advice. (\"You **should** try to let people finish their thoughts.\")\n*   **Could:** A gentle suggestion or possibility. (\"You **could** use a notepad to write down your point and wait for your turn.\")\n\n**Exemple interactif :**\n*Your colleague sent an email with many typos. Rephrase \"Your email is unprofessional\" using SBI.* (Answer: \"In the email you sent this morning (S), there were several spelling mistakes (B). The impact is that it could reflect poorly on our team's attention to detail (I).\")"
    },
    "written": {
      title: "Write Feedback",
      content: "**Titre :** Write Feedback\n\n**Instructions :** A colleague submitted a report that was poorly organized and difficult to follow. Using the SBI model, write a paragraph of constructive feedback. Then, add a sentence with a \"should\" or \"could\" suggestion for improvement."
    },
    "oral": {
      title: "Delivering Feedback Verbally",
      content: "**Titre :** Delivering Feedback Verbally\n\n**Instructions :** Record yourself delivering the feedback you just wrote. Focus on a calm, helpful, and professional tone. Avoid sounding accusatory. Practice these softening phrases:\n\n*   \"I have a small piece of feedback for you...\"\n*   \"One thing you might consider is...\"\n*   \"Perhaps you could try...\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 10.1: Constructive Feedback",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "What does SBI stand for?", options: ["Situation-Behavior-Impact", "Suggestion-Behavior-Improvement", "Situation-Belief-Impact", "Standard-Business-Interaction"], answer: "Situation-Behavior-Impact", feedback: "Correct! SBI is a model for giving specific, objective feedback." },
          { id: 2, type: "multiple-choice" as const, question: "Which statement is the best example of 'Behavior' in the SBI model?", options: ["You were disrespectful.", "You arrived 15 minutes late to the meeting.", "You don't care about the team.", "You need to be more professional."], answer: "You arrived 15 minutes late to the meeting.", feedback: "Correct! This is a specific, observable action, not a judgment or interpretation." },
          { id: 3, type: "multiple-choice" as const, question: "To give strong but polite advice, you should use:", options: ["Must", "Could", "Should", "Have to"], answer: "Should", feedback: "Correct! 'Should' offers a recommendation without being a command." },
          { id: 4, type: "multiple-choice" as const, question: "What is the goal of the 'feedback sandwich'?", options: ["To hide the negative feedback.", "To make the feedback less direct.", "To start and end on a positive note, with the constructive feedback in the middle.", "To confuse the person."], answer: "To start and end on a positive note, with the constructive feedback in the middle.", feedback: "Correct! It balances positive reinforcement with constructive advice to keep the person receptive." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: You ___ try using the spell-checker before sending emails.", options: ["must", "have to", "could", "will"], answer: "could", feedback: "Correct! 'Could' offers a gentle suggestion or possibility." }
        ]
      }
    },
    "coaching": {
      title: "Feedback Is a Gift",
      content: "**Titre :** Feedback Is a Gift\n\nReceiving feedback, especially in a second language, can feel like a personal attack. It's easy to become defensive. The first step to becoming good at *giving* feedback is to become good at *receiving* it. Reframe your mindset: feedback is not criticism, it is a gift. It is free data that you can use to improve.\n\nWhen someone gives you feedback, your only job is to listen and understand. You don't have to agree or defend yourself. Just say, \"Thank you for the feedback. I will think about that.\" This simple phrase shows professionalism and emotional maturity. It diffuses tension and positions you as a coachable, high-potential employee.\n\n**Votre nouvelle routine :** The next time you receive feedback, your first and only response will be: \"Thank you for the feedback.\" Practice it. It's a power phrase."
    },
  },
  "10.2": {
    "hook": {
      title: "The Other Side of the Coin: Receiving Feedback Gracefully",
      content: "**Titre :** The Other Side of the Coin: Receiving Feedback Gracefully\n\nYour ability to receive feedback is even more important than your ability to give it. It shows you are open to growth, secure in your abilities, and a true team player. Receiving feedback well is a superpower that will accelerate your career, especially in a cross-cultural environment.\n\n**Objectif :** By the end of this lesson, you will be able to respond to feedback professionally by asking clarifying questions and using common phrasal verbs related to work."
    },
    "video": {
      title: "The Difficult Conversation",
      content: "**Titre :** The Difficult Conversation\n\n**(Scene: ANNA is giving Mark some critical feedback.)**\n\n**ANNA:** ...and the impact was that the client was confused about the next steps.\n\n**MARK:** Okay. Thank you for the feedback. I want to make sure I understand. **Could you give me** a specific example of the part that was confusing?\n\n**ANNA:** Yes, in the final paragraph, the timeline was not clear.\n\n**MARK:** I see. Thank you. I will **look into** it and make sure my next emails are clearer. I will **follow up** with the client to clarify the timeline.\n\n**ANNA:** Thank you, Mark. I appreciate you **taking on** this feedback.\n\n**MARK:** Of course. I want to improve. I will **work on** it.\n\n**NARRATEUR :** Mark does not get defensive. He does three things perfectly: 1. He thanks Anna. 2. He asks a clarifying question to understand the problem better. 3. He proposes a clear action plan using phrasal verbs (\"look into,\" \"follow up\"). He has turned a difficult conversation into a demonstration of his professionalism.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Responding to Feedback & Phrasal Verbs",
      content: "**Titre :** Responding to Feedback & Phrasal Verbs\n\n**The 3-Step Response to Feedback:**\n1.  **Thank You:** Start by thanking the person. (\"Thank you for letting me know.\")\n2.  **Clarify (If Needed):** Ask questions to understand. (\"Could you explain what you mean by...?\" / \"Can you give me an example?\")\n3.  **State Your Action:** Say what you will do next. (\"I will work on that.\" / \"I will keep that in mind for next time.\")\n\n**Phrasal Verbs for Work (Part 1):**\nA phrasal verb = Verb + Preposition. Their meaning is often not literal.\n\n*   **look into sth:** to investigate; to examine the facts about a problem.\n*   **follow up (with sb / on sth):** to take further action connected with something.\n*   **take on sth:** to accept a task or responsibility.\n*   **carry out sth:** to do or complete a task.\n*   **set up sth:** to arrange or organize something.\n*   **put off sth:** to postpone; to do something at a later time.\n\n**Exemple interactif :**\n*Your manager gives you a new project. You accept it. You say: \"I will ___ this new project.\"* (Answer: take on)"
    },
    "written": {
      title: "Respond to Feedback",
      content: "**Titre :** Respond to Feedback\n\n**Instructions :** Your manager has just given you this feedback: \"In the team meeting, you were a bit too quiet. The impact was that we didn't hear your perspective on the issue.\" Write a short email response using the 3-step method and include at least two phrasal verbs from the lesson."
    },
    "oral": {
      title: "Asking Clarifying Questions",
      content: "**Titre :** Asking Clarifying Questions\n\n**Instructions :** Record yourself asking the following clarifying questions. Focus on a curious and non-defensive tone. Notice the rising intonation at the end of a yes/no question.\n\n*   \"Could you give me a specific example?\" ↗\n*   \"Can you explain what you mean by 'less direct'?\" ↗\n*   \"So, what I'm hearing is that I should be more prepared. Is that right?\" ↗"
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 10.2: Receiving Feedback",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "What is the best first response when receiving feedback?", options: ["Make an excuse.", "Say nothing.", "Say 'Thank you'.", "Disagree immediately."], answer: "Say 'Thank you'.", feedback: "Correct! This shows you are open and professional, even if you don't agree." },
          { id: 2, type: "multiple-choice" as const, question: "Which phrasal verb means 'to investigate'?", options: ["put off", "look into", "take on", "set up"], answer: "look into", feedback: "Correct! To 'look into' a problem is to investigate it." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: We need to ___ the meeting for next week.", options: ["set up", "follow up", "carry out", "look into"], answer: "set up", feedback: "Correct! To 'set up' a meeting is to organize it." },
          { id: 4, type: "multiple-choice" as const, question: "If you want to postpone a task, you ___ it ___.", options: ["take / on", "look / into", "put / off", "carry / out"], answer: "put / off", feedback: "Correct! To 'put off' something means to do it later." },
          { id: 5, type: "multiple-choice" as const, question: "A good clarifying question starts with:", options: ["'Why did you...?'", "'But I didn't...!'", "'Could you explain...?'", "'That's not true!'"], answer: "'Could you explain...?'", feedback: "Correct! This type of question seeks to understand, not to argue." }
        ]
      }
    },
    "coaching": {
      title: "Emotional Intelligence in English",
      content: "**Titre :** Emotional Intelligence in English\n\nWhen you are working in a second language, you are often concentrating very hard on the words. This can mean you have less mental energy to manage your emotions. Receiving feedback can trigger a strong emotional reaction (anger, embarrassment, anxiety). This is normal.\n\nThe key is to create a space between the feeling and your response. When you feel a strong emotion, pause. Take a breath. Your goal is not to *not feel* the emotion, but to *not act* on it immediately. Your simple, practiced response—\"Thank you for the feedback\"—is your tool. It gives your brain a moment to catch up with your feelings. This ability to manage your emotions in a professional context is called emotional intelligence, and it is just as important as your language skills.\n\n**Votre nouvelle routine :** The next time you feel a strong emotion in a professional conversation, consciously take one deep breath before you speak. This is your pause button."
    },
  },
  "10.3": {
    "hook": {
      title: "Stronger Together: The Power of Peer Collaboration",
      content: "**Titre :** Stronger Together: The Power of Peer Collaboration\n\nIn the modern public service, very little work is done alone. Most significant achievements are the result of team collaboration. Knowing how to work effectively with your peers—co-drafting documents, reviewing each other's work, and sharing accountability—is essential for success.\n\n**Objectif :** By the end of this lesson, you will be able to provide feedback to a peer on a shared document and narrate past collaborative actions using a review of the simple past tense."
    },
    "video": {
      title: "The Peer Review",
      content: "**Titre :** The Peer Review\n\n**(Scene: DAVID and MARK are co-drafting a report.)**\n\n**DAVID:** Hey Mark, I **finished** my section of the report. Could you take a look?\n\n**MARK:** Of course. I **read** it this morning. Overall, it's really good. You **explained** the background very clearly. I just **had** one suggestion.\n\n**DAVID:** Great, what is it?\n\n**MARK:** In the third paragraph, you **wrote** that the project **was** successful. **What if we added** a specific statistic to show that? For example, we **reduced** processing time by 20%.\n\n**DAVID:** That's a great idea. It makes the point much stronger. I **didn't think** of that. I'll add it in. Thanks!\n\n**NARRATEUR :** Mark gives peer feedback effectively. He starts with a positive comment, then uses a question (\"What if we added...?\") to make his suggestion sound collaborative, not critical. They both use the simple past to talk about the actions they have completed.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Simple Past Review & Collaborative Phrases",
      content: "**Titre :** Simple Past Review & Collaborative Phrases\n\nWe use the **Simple Past** to talk about actions that started and finished at a specific time in the past.\n\n**Regular Verbs:** Add -ed (e.g., finish → **finished**, explain → **explained**)\n**Irregular Verbs:** Have unique forms you must memorize (e.g., write → **wrote**, see → **saw**, be → **was/were**)\n**Negative:** did not / didn't + Verb (e.g., \"I **didn't see** the email.\")\n**Question:** Did + Subject + Verb? (e.g., \"**Did you finish** the report?\")\n\n**Phrases for Collaborative Suggestions:**\nInstead of saying \"You should change this,\" try these more collaborative phrases:\n\n*   \"What if we...?\" (e.g., \"**What if we** moved this section?\")\n*   \"How about...?\" (e.g., \"**How about** adding a conclusion?\")\n*   \"Have you considered...?\" (e.g., \"**Have you considered** using a table?\")\n*   \"Let's try...\" (e.g., \"**Let's try** rephrasing this sentence.\")\n\n**Exemple interactif :**\n*You and a colleague worked on a file yesterday. Rephrase \"We should add a title\" collaboratively.* (Answer: \"What if we added a title?\" or \"How about adding a title?\")"
    },
    "written": {
      title: "Peer Review a Document",
      content: "**Titre :** Peer Review a Document\n\n**Instructions :** Below is a short paragraph from a colleague's report. Read it and write a short email giving one piece of positive feedback and one collaborative suggestion for improvement using \"What if we...?\" or \"How about...?\"\n\n*\"The project was good. We did a lot of work. We finished on time. The clients were happy. The budget was respected. It was a success.\"*"
    },
    "oral": {
      title: "Discussing Improvements",
      content: "**Titre :** Discussing Improvements\n\n**Instructions :** Record yourself making the following suggestions to a colleague. Focus on a positive and collaborative tone.\n\n*   \"What if we add a chart here?\"\n*   \"How about we simplify this language?\"\n*   \"Let's work on the conclusion together.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 10.3: Peer Collaboration",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete: I ___ the email this morning.", options: ["send", "sended", "sent", "have sent"], answer: "sent", feedback: "Correct! The simple past of the irregular verb 'send' is 'sent'." },
          { id: 2, type: "multiple-choice" as const, question: "Which phrase is the most collaborative for making a suggestion?", options: ["You must change this.", "This is wrong.", "My idea is better.", "What if we tried this?"], answer: "What if we tried this?", feedback: "Correct! This phrase invites discussion and positions the idea as a shared one." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: ___ you ___ the meeting yesterday?", options: ["Did / attend", "Have / attended", "Do / attend", "Were / attended"], answer: "Did / attend", feedback: "Correct! For a question about a finished past time (yesterday), use 'Did + subject + verb'." },
          { id: 4, type: "multiple-choice" as const, question: "What is the negative form of 'He wrote the report'?", options: ["He not wrote the report.", "He didn't wrote the report.", "He didn't write the report.", "He no write the report."], answer: "He didn't write the report.", feedback: "Correct! The structure is 'didn't + base form of the verb'." },
          { id: 5, type: "multiple-choice" as const, question: "'Co-drafting' means:", options: ["Writing a document alone.", "Writing a document with one or more colleagues.", "Reviewing a document.", "Deleting a document."], answer: "Writing a document with one or more colleagues.", feedback: "Correct! 'Co-' means 'together' or 'jointly'." }
        ]
      }
    },
    "coaching": {
      title: "The Bilingual Advantage",
      content: "**Titre :** The Bilingual Advantage\n\nAs a bilingual professional, you have a unique advantage in collaborative work. You understand that words can have different nuances and that communication is more than just literal translation. You are naturally more attuned to the challenges of clear communication.\n\nUse this skill. When you are collaborating with anglophone colleagues, you can be the bridge. You can ask clarifying questions that others might not think to ask. For example, \"When we say 'ASAP,' do we mean today or this week? Let's clarify for everyone.\" Or, \"This acronym might be new for some people. Let's spell it out.\"\n\nBy doing this, you are not just helping yourself; you are helping the entire team communicate more effectively. You are turning your second-language experience into a leadership skill.\n\n**Votre nouvelle routine :** In your next team meeting, listen for one opportunity to ask a clarifying question that helps everyone on the team have the team have a shared understanding."
    },
  },
  "10.4": {
    "hook": {
      title: "Know Thyself: The Power of Self-Assessment",
      content: "**Titre :** Know Thyself: The Power of Self-Assessment\n\nTo grow in your career, you need a map. You need to know where you are, where you want to go, and what skills you need to get there. Self-assessment is the process of creating that map. It is the foundation of your professional development and a key part of the performance management process in the public service.\n\n**Objectif :** By the end of this lesson, you will be able to write a simple self-assessment and discuss your career goals using the past continuous tense to provide context for your achievements."
    },
    "video": {
      title: "The Career Conversation",
      content: "**Titre :** The Career Conversation\n\n**(Scene: MARK is having a career conversation with his manager, ANNA.)**\n\n**ANNA:** So Mark, let's talk about your development. What are your career goals for the next year?\n\n**MARK:** Well, I want to take on more leadership responsibility. For example, **while I was working** on the website project, I really enjoyed mentoring the junior analyst. I would like to do more of that.\n\n**ANNA:** That's great to hear. What are your strengths?\n\n**MARK:** I believe I am very detail-oriented and analytical. I enjoy solving complex problems.\n\n**ANNA:** I agree. And what about areas for development?\n\n**MARK:** I want to improve my presentation skills. I **was attending** a conference last month, and I realized how important it is to be a confident speaker.\n\n**NARRATEUR :** Mark uses the past continuous (\"was working,\" \"was attending\") to describe a background action that provides context for his main point. This makes his story more engaging and specific. He is not just listing skills; he is telling a story about his professional growth.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Past Continuous for Background Actions",
      content: "**Titre :** Past Continuous for Background Actions\n\nWe use the **Past Continuous** to describe an action that was in progress at a specific time in the past. It often provides the \"background scene\" for another, shorter action (in the simple past).\n\n**Structure:**\n`Subject + was/were + Verb-ing`\n\n**Use the Past Continuous for:**\n*   **An action in progress at a specific time:** \"At 3 PM yesterday, I **was writing** a report.\"\n*   **Two actions happening at the same time:** \"I **was finishing** the presentation **while** she **was making** the copies.\"\n*   **A background action interrupted by a shorter action:** \"I **was walking** to the office **when** I **saw** my director.\"\n\n**Simple Past vs. Past Continuous:**\n*   **Simple Past:** For completed, single actions. (\"I **wrote** the report.\")\n*   **Past Continuous:** For the background or context. (\"I **was writing** the report when the fire alarm **rang**.\")\n\n**Exemple interactif :**\n*Complete the sentence: I ___ (read) the document when my phone ___ (ring).* (Answer: was reading / rang)"
    },
    "written": {
      title: "Write a Self-Assessment",
      content: "**Titre :** Write a Self-Assessment\n\n**Instructions :** Write a short paragraph for your performance review. Identify one strength and one area for development. For each one, use the past continuous to give a specific example or context for how you identified it."
    },
    "oral": {
      title: "Discussing Your Goals",
      content: "**Titre :** Discussing Your Goals\n\n**Instructions :** Record yourself answering the question: \"What is one of your career goals for next year, and why?\" Use the past continuous to provide context.\n\n*   \"While I was working on..., I discovered...\"\n*   \"I was attending a workshop when I realized...\"\n*   \"As I was preparing the budget, I found that...\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 10.4: Self-Assessment",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete: I ___ a presentation when my manager ___ me.", options: ["gave / was calling", "was giving / called", "give / called", "was giving / was calling"], answer: "was giving / called", feedback: "Correct! A longer background action (was giving) was interrupted by a shorter action (called)." },
          { id: 2, type: "multiple-choice" as const, question: "Which vocabulary word is a strength?", options: ["Procrastination", "Disorganized", "Adaptable", "Inflexible"], answer: "Adaptable", feedback: "Correct! Being adaptable, or able to adjust to new conditions, is a key strength." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: What ___ you ___ at 10 AM this morning?", options: ["did / do", "were / doing", "do / do", "have / done"], answer: "were / doing", feedback: "Correct! We use the past continuous to ask about an action in progress at a specific past time." },
          { id: 4, type: "multiple-choice" as const, question: "Complete: He was writing an email ___ his colleague was making coffee.", options: ["when", "while", "so", "but"], answer: "while", feedback: "Correct! We use 'while' to connect two continuous actions happening at the same time." },
          { id: 5, type: "multiple-choice" as const, question: "A 'learning plan' is a document that outlines:", options: ["Your past mistakes.", "Your salary expectations.", "Your vacation schedule.", "Your development goals and activities."], answer: "Your development goals and activities.", feedback: "Correct! A learning plan is a key part of the public service performance management process." }
        ]
      }
    },
    "coaching": {
      title: "Confidence in Your Growth",
      content: "**Titre :** Confidence in Your Growth\n\nIt's easy to focus on your mistakes in a second language and forget how far you have come. Self-assessment is a time to be honest, but also a time to be proud. You are functioning professionally in a second language—that is already a huge achievement.\n\nConfidence comes from recognizing your own progress. Don't just think about your weaknesses. Make a list of three things you can do in English now that you couldn't do one year ago. Maybe you can understand your team meetings. Maybe you can write a simple email without using a translator. Maybe you can answer the phone without panicking.\n\nCelebrate these small wins. They are the building blocks of fluency. Recognizing your progress is not arrogant; it is the fuel that will motivate you to tackle your next set of challenges.\n\n**Votre nouvelle routine :** At the end of each week, write down one small thing you did in English that you are proud of. This is your \"win list.\""
    },
  },
  "11.1": {
    "hook": {
      title: "The Machinery of Government: Understanding the System",
      content: "**Titre :** The Machinery of Government: Understanding the System\n\nTo be effective in the public service, you need to understand the system you are part of. How are decisions made? Who holds the authority? Understanding the structure of the Canadian government—from Parliament to departments—is crucial for navigating your career and serving the public effectively.\n\n**Objectif :** By the end of this lesson, you will be able to describe a government process using the passive voice to emphasize the action rather than the actor, a common feature of government writing."
    },
    "video": {
      title: "How a Policy is Made",
      content: "**Titre :** How a Policy is Made\n\n**(Scene: An animated video showing the flow of a policy idea.)**\n\n**NARRATEUR :** Where do government policies come from? It starts with an issue. First, the issue **is identified** by public servants. Research **is conducted**, and options **are analyzed**. A recommendation **is made** to the Minister.\n\nIf the Minister agrees, a policy proposal **is written**. It **is presented** to Cabinet, the committee of senior ministers. If Cabinet approves, the policy **is adopted** by the government.\n\nNext, the implementation plan **is developed** by the department. The new program **is launched**, and services **are delivered** to Canadians. The results **are monitored**, and the policy **is evaluated** to ensure it is working.\n\n**NARRATEUR :** Notice the use of the passive voice. \"The policy **is adopted**.\" We don't say \"The government adopts the policy.\" In formal government writing, the process is often more important than the person doing the action. This creates a tone of objectivity and formality.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Introduction to the Passive Voice",
      content: "**Titre :** Introduction to the Passive Voice\n\nIn an active sentence, the subject performs the action. (e.g., \"The manager approved the report.\")\nIn a passive sentence, the subject receives the action. (e.g., \"The report was approved by the manager.\")\n\n**Structure:**\n`Subject + am/is/are/was/were + Past Participle`\n\n**Why use the passive voice?**\n1.  **When the actor is unknown or unimportant:** \"My car **was stolen**.\" (We don't know who stole it.)\n2.  **To sound objective and formal (very common in government):** \"The decision **was made** to proceed.\" (Focus is on the decision, not who made it.)\n3.  **When the action is more important than the actor:** \"The new bridge **was built** in two years.\"\n\n**Active to Passive:**\n*   Active: \"The team **wrote** the report.\"\n*   Passive: \"The report **was written** by the team.\"\n\n**Exemple interactif :**\n*Change this sentence to the passive voice: \"The Minister signed the document.\"* (Answer: \"The document was signed by the Minister.\")"
    },
    "written": {
      title: "Explain a Government Process",
      content: "**Titre :** Explain a Government Process\n\n**Instructions :** Think of a simple process in your workplace (e.g., how a document is approved, how a request is processed). Write a short paragraph (3-4 sentences) explaining this process using the passive voice at least twice."
    },
    "oral": {
      title: "Presenting Your Department",
      content: "**Titre :** Presenting Your Department\n\n**Instructions :** Record yourself giving a 1-minute presentation on your department's mandate. Use the passive voice to describe what services are provided or what results are achieved.\n\n*   \"Services **are provided** to...\"\n*   \"Policies **are developed** to...\"\n*   \"Research **is conducted** on...\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 11.1: How Government Works",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Change to passive: 'The committee reviewed the proposal.''", options: ["The proposal was reviewed by the committee.", "The proposal reviewed the committee.", "The committee was reviewed by the proposal.", "The proposal is reviewed by the committee."], answer: "The proposal was reviewed by the committee.", feedback: "Correct! The object (the proposal) becomes the subject of the passive sentence." },
          { id: 2, type: "multiple-choice" as const, question: "What does the acronym 'PCO' stand for?", options: ["Public Complaint Office", "Privy Council Office", "Parliamentary Control Office", "Policy and Coordination Office"], answer: "Privy Council Office", feedback: "Correct! The Privy Council Office is the central agency that supports the Prime Minister and Cabinet." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: The new regulations ___ last month.", options: ["were announced", "was announced", "are announced", "announced"], answer: "were announced", feedback: "Correct! Use 'were' for a plural subject (regulations) in the past passive." },
          { id: 4, type: "multiple-choice" as const, question: "Why is the passive voice often used in government writing?", options: ["To make it more personal.", "To sound more exciting.", "To sound objective and formal.", "To make it shorter."], answer: "To sound objective and formal.", feedback: "Correct! It focuses on the action and the process, creating a formal and objective tone." },
          { id: 5, type: "multiple-choice" as const, question: "Change to active: 'The budget was approved by Parliament.''", options: ["The budget is approved.", "Parliament was approved by the budget.", "Parliament approved the budget.", "The budget approved Parliament."], answer: "Parliament approved the budget.", feedback: "Correct! The agent (Parliament) becomes the subject of the active sentence." }
        ]
      }
    },
    "coaching": {
      title: "Speaking \"Government\" in English",
      content: "**Titre :** Speaking \"Government\" in English\n\nEvery profession has its own dialect, and the public service is no exception. \"Government English\" (often called \"bureaucratese\") loves the passive voice, acronyms, and formal vocabulary. As a learner, this can be intimidating.\n\nYour goal is not to become a master of complex bureaucratic language. Your goal is to understand it and to be able to use it when necessary. The most important skill is code-switching: the ability to use formal language in a formal document, and then switch to clear, simple language when explaining that document to a colleague or a member of the public.\n\nStart by noticing the passive voice. When you read a report or a memo, highlight the passive verbs (\"it was decided,\" \"it is recommended\"). This will help you internalize the sound and structure of government English.\n\n**Votre nouvelle routine :** This week, find one example of the passive voice in an email or document at work. Translate it into a simple, active sentence to make sure you understand who is doing what."
    },
  },
  "11.2": {
    "hook": {
      title: "Your Moral Compass: Values & Ethics in the Public Service",
      content: "**Titre :** Your Moral Compass: Values & Ethics in the Public Service\n\nWorking in the public service is more than a job; it's a public trust. The Values and Ethics Code is the moral compass that guides every decision you make. Understanding these values—respect, integrity, stewardship, and excellence—is fundamental to your role as a public servant.\n\n**Objectif :** By the end of this lesson, you will be able to discuss hypothetical ethical situations using the second conditional (\"If... would...\") to explore potential courses of action."
    },
    "video": {
      title: "An Ethical Dilemma",
      content: "**Titre :** An Ethical Dilemma\n\n**(Scene: MARK is talking to his colleague, DAVID.)**\n\n**MARK:** David, I have a situation. My cousin's company is bidding on a government contract, and my unit is part of the evaluation team. It feels like a conflict of interest.\n\n**DAVID:** Wow, that's a tough one. **What would you do if** you were me?\n\n**MARK:** Well, **if I were you**, I **would report** it to my manager immediately. It's better to be transparent.\n\n**DAVID:** You're right. **If I didn't say** anything, it **could cause** a huge problem later. But what if my manager thinks I'm trying to cause trouble?\n\n**MARK:** I don't think so. **If you explained** the situation clearly, your manager **would appreciate** your integrity. It shows you respect the values of the public service.\n\n**NARRATEUR :** They are discussing a hypothetical or imaginary situation. They use the second conditional to explore possibilities. \"If [simple past], ... would [verb].\" This is the language of advice, problem-solving, and ethical deliberation.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "The Second Conditional: \"If... would...\"",
      content: "**Titre :** The Second Conditional: \"If... would...\"\n\nWe use the second conditional to talk about unreal, imaginary, or hypothetical situations in the present or future.\n\n**Structure:**\n`If + Simple Past, ... would/wouldn't + Verb`\n\n*   The \"if\" clause describes the unreal condition.\n*   The main clause describes the probable result.\n\n**Important Note:** In the \"if\" clause, we use \"were\" for all subjects (I, you, he, she, it, we, they), especially in formal English. (\"If I **were** the Minister...\")\n\n**Examples:**\n*   \"**If** I **had** more time, I **would learn** another language.\"\n*   \"**If** she **knew** the answer, she **would tell** us.\"\n*   \"What **would you do if** you **won** the lottery?\"\n\n**First vs. Second Conditional:**\n*   **First:** Real possibility. (\"If I **have** time, I **will call** you.\")\n*   **Second:** Imaginary situation. (\"If I **had** time, I **would call** you.\")\n\n**Exemple interactif :**\n*Complete the sentence: If I ___ (be) the Prime Minister, I ___ (lower) taxes.* (Answer: were / would lower)"
    },
    "written": {
      title: "Discuss an Ethical Scenario",
      content: "**Titre :** Discuss an Ethical Scenario\n\n**Instructions :** You see a colleague using their government-issued phone for personal business excessively. Write a short paragraph explaining what you would do in this situation and why, using the second conditional at least twice."
    },
    "oral": {
      title: "Role-Play: The Ethics Discussion",
      content: "**Titre :** Role-Play: The Ethics Discussion\n\n**Instructions :** Record yourself asking for and giving advice about an ethical dilemma. Practice the pronunciation of \"would\" (often contracted to \"'d\").\n\n*   \"What would you do if you were me?\" (wha-wud-joo-doo)\n*   \"If I were you, I'd report it.\" (I'd-report-it)\n*   \"I'd be careful if I were you.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 11.2: Values & Ethics",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete: If I ___ the answer, I ___ you.", options: ["know / will tell", "knew / would tell", "knew / will tell", "know / would tell"], answer: "knew / would tell", feedback: "Correct! This is a hypothetical situation, so it uses the second conditional structure: If + Simple Past, ... would + Verb." },
          { id: 2, type: "multiple-choice" as const, question: "What is a 'conflict of interest'?", options: ["A disagreement with a colleague.", "A situation where personal interests could improperly influence professional duties.", "A difficult project.", "A meeting with no agenda."], answer: "A situation where personal interests could improperly influence professional duties.", feedback: "Correct! This is a key concept in public service ethics." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: What would you do if you ___ a mistake?", options: ["made", "make", "would make", "will make"], answer: "made", feedback: "Correct! The 'if' clause of the second conditional uses the simple past." },
          { id: 4, type: "multiple-choice" as const, question: "Which of these is NOT a core value in the Public Sector Values and Ethics Code?", options: ["Respect for Democracy", "Respect for People", "Integrity", "Profit"], answer: "Profit", feedback: "Correct! The public service is not a for-profit enterprise." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: If I ___ the manager, I ___ change the policy.", options: ["was / would", "am / will", "were / would", "were / will"], answer: "were / would", feedback: "Correct! In formal conditional sentences, we use 'were' for all subjects." }
        ]
      }
    },
    "coaching": {
      title: "Speaking About Difficult Topics",
      content: "**Titre :** Speaking About Difficult Topics\n\nDiscussing ethics, values, or conflicts can be challenging even in your first language. In a second language, you might be tempted to stay silent. Don't.\n\nThe second conditional is a powerful tool because it creates a safe, hypothetical space. When you say, \"What would you do if...?\" or \"If I were in that situation, I would...,\" you are not accusing anyone. You are exploring ideas. You are problem-solving collaboratively.\n\nUsing this hypothetical language allows you to talk about sensitive issues in a professional, objective way. It separates the person from the problem. Mastering this structure will not just improve your grammar; it will make you a more effective and trusted colleague.\n\n**Votre nouvelle routine :** Find a news story about a difficult situation. Ask yourself, \"What would I do if I were in that person's position?\" Practice formulating your answer in English. This builds the mental muscle for real-life professional challenges atical muscle for real-life situations."
    },
  },
  "11.3": {
    "hook": {
      title: "Cracking the Code: Acronyms & Jargon",
      content: "**Titre :** Cracking the Code: Acronyms & Jargon\n\nEvery workplace has its own special language, and the Government of Canada is famous for it. From PCO to TBS to MCs, the \"alphabet soup\" of acronyms and jargon can be overwhelming. Learning to navigate this language is a key step to feeling confident and competent in your role.\n\n**Objectif :** By the end of this lesson, you will be able to ask for clarification on acronyms and jargon and explain them to others using defining relative clauses (\"...which is...\", \"...who is...\")."
    },
    "video": {
      title: "The Acronym Jungle",
      content: "**Titre :** The Acronym Jungle\n\n**(Scene: A team meeting. ANNA is speaking.)**\n\n**ANNA:** Okay team, for the next phase, we need to get approval from TBS. Then we can prepare the MC for the Minister, who will present it to Cabinet.\n\n**(Scene: Later, MARK is talking to DAVID, a new employee.)**\n\n**DAVID:** I'm sorry, I got a little lost in that meeting. What is \"TBS\"?\n\n**MARK:** No problem. TBS is the Treasury Board Secretariat, **which is** the central agency that functions as the government's management board. They approve funding for new projects.\n\n**DAVID:** And an \"MC\"?\n\n**MARK:** An MC is a Memorandum to Cabinet, **which is** the document we use to give advice and make recommendations to ministers.\n\n**DAVID:** Got it. And the Minister?\n\n**MARK:** The Minister is the elected official **who is** in charge of our department.\n\n**NARRATEUR :** Mark doesn't just define the acronyms. He uses relative clauses (\"which is...\", \"who is...\") to add extra information and explain the *function* of each term. This is much more helpful than a simple definition.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Defining with Relative Clauses",
      content: "**Titre :** Defining with Relative Clauses\n\nRelative clauses add extra information to a sentence. They start with a relative pronoun like **who**, **which**, or **that**.\n\n*   **Who:** for people\n*   **Which:** for things\n*   **That:** for people or things (often used in informal speech)\n\n**Defining vs. Non-Defining:**\n*   **Defining:** Gives essential information. No commas. (\"The woman **who works at the front desk** is very helpful.\")\n*   **Non-Defining:** Gives extra, non-essential information. Uses commas. (\"My manager, **who is from Newfoundland**, is very experienced.\")\n\nIn this lesson, we focus on **non-defining clauses with \"which\"** to explain jargon.\n\n**Structure for Explaining Acronyms:**\n`[Acronym] is the [Full Name], which is [Explanation of function].`\n\n*   \"PCO is the Privy Council Office, **which is** the agency that supports the Prime Minister.\"\n\n**Exemple interactif :**\n*Combine these sentences: \"This is the briefing note. I wrote it yesterday.\"* (Answer: \"This is the briefing note **which/that** I wrote yesterday.\")"
    },
    "written": {
      title: "Create a Jargon Buster",
      content: "**Titre :** Create a Jargon Buster\n\n**Instructions :** Think of two acronyms or pieces of jargon common in your workplace. For each one, write a sentence that gives the full name and then uses a non-defining relative clause with \"which\" to explain its function."
    },
    "oral": {
      title: "Asking for Clarification",
      content: "**Titre :** Asking for Clarification\n\n**Instructions :** It is never a sign of weakness to ask for clarification. Record yourself asking the following questions. Focus on a polite and confident tone.\n\n*   \"I'm sorry, what does 'TBS' stand for?\"\n*   \"Could you please explain what an 'MC' is?\"\n*   \"I'm not familiar with that term. Could you elaborate?\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 11.3: Acronyms & Jargon",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Which relative pronoun is used for people?", options: ["Which", "That", "Who", "What"], answer: "Who", feedback: "Correct! We use 'who' to give more information about a person." },
          { id: 2, type: "multiple-choice" as const, question: "Complete: A DG is a Director General, ___ is a senior executive in the public service.", options: ["that", "who", "which", "it"], answer: "who", feedback: "Correct! We use 'who' for a person (Director General)." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: This is the report ___ I was telling you about.", options: ["who", "which", "it", "what"], answer: "which", feedback: "Correct! We use 'which' or 'that' for a thing (the report)." },
          { id: 4, type: "multiple-choice" as const, question: "A non-defining relative clause...", options: ["Gives essential information and has no commas.", "Gives extra information and uses commas.", "Is always at the beginning of a sentence.", "Is always a question."], answer: "Gives extra information and uses commas.", feedback: "Correct! It adds extra, non-essential information and is separated by commas." },
          { id: 5, type: "multiple-choice" as const, question: "If you don't understand an acronym in a meeting, you should:", options: ["Pretend you understand.", "Interrupt the speaker immediately.", "Write it down and ask a colleague later.", "Leave the meeting."], answer: "Write it down and ask a colleague later.", feedback: "Correct! This is the most professional and non-disruptive strategy." }
        ]
      }
    },
    "coaching": {
      title: "Your Personal Glossary",
      content: "**Titre :** Your Personal Glossary\n\nDon't just learn acronyms—master them. The best way to do this is to create your own personal glossary. Get a small notebook or create a document on your computer. Every time you hear a new acronym or piece of jargon, write it down.\n\nBut don't just write the definition. Use the structure from this lesson: write the full name, and then write a sentence with a relative clause that explains its *function* and *why it is important to you*.\n\n*   **Bad entry:** TBS = Treasury Board Secretariat\n*   **Good entry:** TBS = Treasury Board Secretariat, **which is** the agency I need to get approval from for my project's funding.\n\nBy personalizing the definition, you are creating a stronger mental link to the term. You are not just memorizing words; you are understanding how the machinery of government works and how you fit into it.\n\n**Votre nouvelle routine :** This week, add three new entries to your personal glossary."
    },
  },
  "11.4": {
    "hook": {
      title: "A Bilingual Public Service: The Official Languages Act",
      content: "**Titre :** A Bilingual Public Service: The Official Languages Act\n\nThe bilingual nature of the Canadian public service is not just a nice idea; it's the law. The Official Languages Act ensures that both English and French have equal status and that Canadians can be served in the official language of their choice. Understanding your rights and obligations under this Act is a core part of your identity as a public servant.\n\n**Objectif :** By the end of this lesson, you will be able to explain a right or obligation using reported speech to convey information from an official source."
    },
    "video": {
      title: "Your Language Rights",
      content: "**Titre :** Your Language Rights\n\n**(Scene: DAVID is attending an orientation session with ANNA, an HR advisor.)**\n\n**DAVID:** I'm still a bit new to the public service. Can you explain my language rights at work?\n\n**ANNA:** Of course. The Official Languages Act is very clear. It **states that** you have the right to work in the official language of your choice in designated bilingual regions.\n\n**DAVID:** So I can write emails to my manager in English?\n\n**ANNA:** Exactly. The Act also **says that** supervision should be provided in your language of choice. Your manager **told me that** she is comfortable supervising you in English.\n\n**DAVID:** That's great to know. What about training?\n\n**ANNA:** The policy **explains that** personal and central services, including training, must be available in both official languages.\n\n**NARRATEUR :** Anna is not giving her personal opinion. She is relaying information from an official source (the Act, the policy, her manager). She uses reported speech with verbs like \"states that,\" \"says that,\" and \"explains that\" to show she is a reliable source of information.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Introduction to Reported Speech",
      content: "**Titre :** Introduction to Reported Speech\n\nWe use reported speech (or indirect speech) to tell someone what another person said. When we do this, we often change the verb tense (one step back into the past).\n\n**Direct Speech:** \"I **am** happy.\" (The exact words)\n**Reported Speech:** She said that she **was** happy.\n\n**Tense Changes:**\n*   Present Simple → Past Simple (\"I **work** here.\" → He said he **worked** there.)\n*   Present Continuous → Past Continuous (\"I **am working**.\" → He said he **was working**.)\n*   Past Simple → Past Perfect (\"I **finished** it.\" → He said he **had finished** it.)\n*   Present Perfect → Past Perfect (\"I **have finished**.\" → He said he **had finished** it.)\n*   will → would (\"I **will** call.\" → He said he **would** call.)\n*   can → could (\"I **can** help.\" → He said he **could** help.)\n\n**Reporting Verbs:**\nInstead of always using \"said,\" you can use more descriptive verbs:\n*   The Act **states that**...\n*   The manager **explained that**...\n*   She **told me that**...\n*   He **announced that**...\n\n**Exemple interactif :**\n*Change to reported speech: Your manager says, \"The meeting is at 2 PM.\"* (Answer: \"My manager said that the meeting was at 2 PM.\")"
    },
    "written": {
      title: "Explain a Policy",
      content: "**Titre :** Explain a Policy\n\n**Instructions :** Your colleague asks you about the work-from-home policy. You just read the official email from HR. The email said: \"Employees can work from home two days per week. They must get approval from their manager.\" Write a short response to your colleague using reported speech."
    },
    "oral": {
      title: "Relaying Information",
      content: "**Titre :** Relaying Information\n\n**Instructions :** Record yourself relaying the following messages. Focus on the past tense shift.\n\n*   Direct: \"The training is mandatory.\" → \"She said the training **was** mandatory.\"\n*   Direct: \"I will send the document.\" → \"He said he **would** send the document.\"\n*   Direct: \"We have finished the project.\" → \"They said they **had finished** the project.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 11.4: Official Languages",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Change to reported speech: She says, \"I am busy.\"", options: ["She said she is busy.", "She said she was busy.", "She said I was busy.", "She says she was busy."], answer: "She said she was busy.", feedback: "Correct! The present tense 'am' changes to the past tense 'was'." },
          { id: 2, type: "multiple-choice" as const, question: "Which region is NOT designated bilingual for language-of-work purposes?", options: ["National Capital Region", "Montreal", "New Brunswick", "Calgary"], answer: "Calgary", feedback: "Correct! While some federal offices in Calgary may offer bilingual services, the region itself is not designated bilingual for language-of-work purposes like the NCR or New Brunswick." },
          { id: 3, type: "multiple-choice" as const, question: "Change to reported speech: He said, \"I will do it.\"", options: ["He said he will do it.", "He said I would do it.", "He said he would do it.", "He said he did it."], answer: "He said he would do it.", feedback: "Correct! 'Will' changes to 'would' in reported speech." },
          { id: 4, type: "multiple-choice" as const, question: "The Official Languages Act ensures that:", options: ["All public servants must be bilingual.", "English and French have equal status in federal institutions.", "All documents must be written in French.", "Meetings must be in English."], answer: "English and French have equal status in federal institutions.", feedback: "Correct! This is the core principle of the Act." },
          { id: 5, type: "multiple-choice" as const, question: "Change to reported speech: They said, \"We have submitted the report.\"", options: ["They said we have submitted the report.", "They said they submitted the report.", "They said they had submitted the report.", "They said they would submit the report."], answer: "They said they had submitted the report.", feedback: "Correct! The present perfect ('have submitted') changes to the past perfect ('had submitted')." }
        ]
      }
    },
    "coaching": {
      title: "You Are an Ambassador",
      content: "**Titre :** You Are an Ambassador\n\nAs a public servant who is learning or has learned a second official language, you are a living example of the Official Languages Act in action. You are an ambassador for a bilingual public service. This is something to be incredibly proud of.\n\nSometimes, you may encounter colleagues (anglophone or francophone) who are frustrated with the language requirements. The best way to respond is not with anger, but with your own positive example. When you make an effort to write a bilingual email, or you start a meeting with \"Hello, bonjour,\" you are doing more than just communicating. You are actively building a culture of respect.\n\nYour journey to bilingualism is a service to the public and an asset to your team. Own it with pride.\n\n**Votre nouvelle routine :** This week, make one small, visible effort to promote bilingualism. It could be adding \"(Français à suivre)\" to an email, or simply using a bilingual greeting. Every small action helps build a culture of respect for a bilingual public service. This is something to be incredibly proud of."
    },
  },
  "12.1": {
    "hook": {
      title: "Your Performance Story: Acing Your Review",
      content: "**Titre :** Your Performance Story: Acing Your Review\n\nA performance review isn't a test; it's a conversation. It's your opportunity to tell the story of your accomplishments over the past year and to align your goals with your manager's expectations for the future. Preparing for it properly is the key to making it a positive and productive experience.\n\n**Objectif :** By the end of this lesson, you will be able to describe your accomplishments and challenges using a variety of past tenses (simple past, present perfect, past continuous) to tell a compelling performance story."
    },
    "video": {
      title: "The Performance Conversation",
      content: "**Titre :** The Performance Conversation\n\n**(Scene: ANNA is conducting Mark's annual performance review.)**\n\n**ANNA:** So, Mark, let's talk about the past year. What do you see as your biggest accomplishment?\n\n**MARK:** I think my biggest accomplishment was the website project. It was a big challenge. **While I was managing** the project, I **learned** a lot about project management. We **delivered** the project on time and under budget.\n\n**ANNA:** I agree, you **did** an excellent job on that. What about challenges? What **have you been working on**?\n\n**MARK:** I **have been focusing** on my presentation skills. I **took** a course last spring, and I **have already presented** at two team meetings. I feel much more confident now than I did a year ago.\n\n**ANNA:** That's great progress. Your efforts are noticeable.\n\n**NARRATEUR :** Mark uses a mix of tenses to tell his story. Past Continuous (\"was managing\") for context. Simple Past (\"learned,\" \"delivered,\" \"took\") for finished actions. Present Perfect Continuous (\"have been focusing\") for an ongoing action over a period. Present Perfect (\"have already presented\") for recent, completed actions. This variety makes his language rich and precise.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Review of Past Tenses for Storytelling",
      content: "**Titre :** Review of Past Tenses for Storytelling\n\nTo tell a good story, you need the right tools. In grammar, this means choosing the right tense.\n\n*   **Simple Past:** For finished actions at a specific past time. (I **finished** the report yesterday.)\n*   **Past Continuous:** For a background action that was in progress. (I **was finishing** the report when you called.)\n*   **Present Perfect:** For a recent past action with a present result, or a life experience. (I **have finished** the report. Here it is.)\n*   **Present Perfect Continuous:** For an action that started in the past and is still in progress, or has just finished. Emphasizes duration. (I **have been working** on this report all day.)\n\n**Choosing the Right Tense:**\n*   Use **Simple Past** for the main events of your story.\n*   Use **Past Continuous** to set the scene.\n*   Use **Present Perfect** to connect the past to the present.\n*   Use **Present Perfect Continuous** to emphasize the effort and time you have invested.\n\n**Exemple interactif :**\n*You started learning English two years ago and you are still learning. You say: \"I ___ (learn) English for two years.\"* (Answer: have been learning)"
    },
    "written": {
      title: "Write Your Accomplishment Story",
      content: "**Titre :** Write Your Accomplishment Story\n\n**Instructions :** Think of one significant accomplishment from the past year. Write a short paragraph describing it. Use at least three different past tenses to tell the story of how you achieved it."
    },
    "oral": {
      title: "Talking About Your Year",
      content: "**Titre :** Talking About Your Year\n\n**Instructions :** Record yourself answering the question: \"What is one thing you have been working on to improve yourself professionally this year?\"\n\n*   \"I've been working on my writing skills.\"\n*   \"I've been trying to be more organized.\"\n*   \"I took a course on project management.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 12.1: Performance Reviews",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "Complete: I ___ on this project for three months.", options: ["worked", "work", "am working", "have been working"], answer: "have been working", feedback: "Correct! The phrase 'for three months' indicates a duration of time, making the Present Perfect Continuous the best choice." },
          { id: 2, type: "multiple-choice" as const, question: "Which tense is best to describe the main, completed events of a story?", options: ["Simple Past", "Past Continuous", "Present Perfect", "Future Simple"], answer: "Simple Past", feedback: "Correct! The Simple Past is the backbone of storytelling in English." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: I ___ the report when my boss ___ in.", options: ["finished / walked", "was finishing / was walking", "was finishing / walked", "finished / was walking"], answer: "was finishing / walked", feedback: "Correct! A longer background action (was finishing) was interrupted by a shorter one (walked)." },
          { id: 4, type: "multiple-choice" as const, question: "What does 'PMA' stand for in the context of the public service?", options: ["Personal Management Agreement", "Performance Management Agreement", "Project Management Approach", "Policy and Management Approval"], answer: "Performance Management Agreement", feedback: "Correct! The PMA is the formal document that outlines your performance objectives and learning plan for the year." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: She ___ in three different departments since she started her career.", options: ["worked", "has worked", "was working", "works"], answer: "has worked", feedback: "Correct! Use the Present Perfect to talk about life experiences over a period of time that continues to the present." }
        ]
      }
    },
    "coaching": {
      title: "The STAR Method",
      content: "**Titre :** The STAR Method\n\nWhen you describe your accomplishments, don't just list your tasks. Show your impact. A powerful tool for this is the STAR method.\n\n*   **S - Situation:** Briefly describe the context. What was the challenge?\n*   **T - Task:** What was your specific responsibility?\n*   **A - Action:** What specific actions did you take?\n*   **R - Result:** What was the outcome? Quantify it if possible.\n\n**Instead of saying:** \"I worked on the website project.\"\n\n**Use STAR:** \"(S) Our team was tasked with launching a new website with a tight deadline. (T) My task was to write all the content. (A) I organized interviews with subject matter experts, drafted all the copy, and managed the translation process. (R) As a result, the website launched on time and traffic has increased by 15%.\"\n\nThis is much more powerful. It tells a complete story and demonstrates your value to the organization.\n\n**Votre nouvelle routine :** Take one accomplishment from your CV and rewrite it using the STAR method. This is excellent practice for both performance reviews and job interviews."
    },
  },
  "12.2": {
    "hook": {
      title: "Your Next Chapter: Understanding Job Postings & CVs",
      content: "**Titre :** Your Next Chapter: Understanding Job Postings & CVs\n\nYour career is a journey, and every journey needs a map. In the professional world, job postings are the destinations, and your CV is the map that shows how you can get there. Learning to read those postings carefully and tailor your CV accordingly is the first step toward landing your next role.\n\n**Objectif :** By the end of this lesson, you will be able to analyze a job posting and customize your CV using action verbs and keywords to match the statement of merit criteria."
    },
    "video": {
      title: "Decoding the Job Posting",
      content: "**Titre :** Decoding the Job Posting\n\n**(Scene: MARK is showing DAVID a job posting on GC Jobs.)**\n\n**MARK:** See this posting for a Senior Analyst? Let's break it down. The most important part is the \"Statement of Merit Criteria.\" This is exactly what they are looking for.\n\n**DAVID:** It says \"Experience in **analyzing** complex policy issues.\"\n\n**MARK:** Right. So, on your CV, you need to use that exact keyword. You should have a bullet point that says something like, \"**Analyzed** complex policy issues related to...\"\n\n**DAVID:** And here it says, \"Ability to **communicate** effectively in writing.\"\n\n**MARK:** Exactly. So you need a bullet point that demonstrates that. For example, \"**Communicated** findings to senior management by **writing** briefing notes and reports.\" You need to mirror the language of the posting.\n\n**NARRATEUR :** Mark understands that a CV is a marketing document. The goal is not just to list your past jobs, but to prove that you have the specific experience and skills required for the *new* job. He is matching his experience to the keywords in the job posting.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Action Verbs & Keywords",
      content: "**Titre :** Action Verbs & Keywords\n\nYour CV should be a dynamic document, not a passive list. Use strong action verbs to start each bullet point. These verbs show that you are a person who gets things done.\n\n**Common Action Verbs:**\n*   **Management/Leadership:** Managed, Led, Supervised, Coordinated, Organized\n*   **Communication:** Communicated, Presented, Wrote, Drafted, Advised\n*   **Analysis/Research:** Analyzed, Researched, Evaluated, Identified, Assessed\n*   **Achievement:** Achieved, Completed, Delivered, Improved, Increased, Reduced\n\n**Keyword Matching:**\nThe HR process often uses software to scan CVs for keywords from the job posting. If your CV doesn't have the right keywords, a human may never even see it.\n\n1.  **Identify** the keywords in the \"Experience\" and \"Abilities\" sections of the job posting.\n2.  **Mirror** those exact keywords in your CV.\n3.  **Prove** it with a specific example using the STAR method.\n\n**Exemple interactif :**\n*Job posting says: \"Experience in managing projects.\" Your CV should say:* (Answer: \"**Managed** a project to [do something], which resulted in [a specific outcome].\")"
    },
    "written": {
      title: "Customize Your CV",
      content: "**Titre :** Customize Your CV\n\n**Instructions :** Below is a bullet point from a generic CV and a criterion from a job posting. Rewrite the CV bullet point to match the criterion, using a strong action verb and keywords.\n\n*   **CV Bullet Point:** \"Was responsible for team communications.\"\n*   **Job Posting Criterion:** \"Experience in preparing and delivering presentations to stakeholders.\""
    },
    "oral": {
      title: "Selling Your Skills",
      content: "**Titre :** Selling Your Skills\n\n**Instructions :** A CV gets you the interview, but in the interview, you have to \"sell\" your skills. Record yourself saying the following sentences. Focus on a confident and energetic tone.\n\n*   \"I have extensive experience in **analyzing** data.\"\n*   \"In my previous role, I **managed** a team of five analysts.\"\n*   \"I successfully **delivered** the project ahead of schedule.\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 12.2: Job Postings & CVs",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "What is the most important section of a Government of Canada job posting?", options: ["The salary", "The location", "The Statement of Merit Criteria", "The closing date"], answer: "The Statement of Merit Criteria", feedback: "Correct! This section tells you exactly what skills and experience are required." },
          { id: 2, type: "multiple-choice" as const, question: "Which of these is the strongest action verb for a CV?", options: ["Helped", "Watched", "Was part of", "Implemented"], answer: "Implemented", feedback: "Correct! 'Implemented' shows that you took direct action and made something happen." },
          { id: 3, type: "multiple-choice" as const, question: "To 'tailor' your CV means to:", options: ["Make it shorter.", "Make it longer.", "Customize it for a specific job posting.", "Use a different font."], answer: "Customize it for a specific job posting.", feedback: "Correct! You should never use a generic CV. Always tailor it to the specific job." },
          { id: 4, type: "multiple-choice" as const, question: "What does the acronym 'SMC' stand for in a job posting?", options: ["Senior Management Committee", "Statement of Merit Criteria", "Security and Material Control", "Standard a Merit Criteria"], answer: "Statement of Merit Criteria", feedback: "Correct! The SMC is the list of essential and asset qualifications for the job." },
          { id: 5, type: "multiple-choice" as const, question: "If a job posting asks for 'Experience in research', your CV should include:", options: ["A sentence that says 'I am a good researcher.'", "A bullet point starting with 'Researched...' followed by a specific example.", "A list of books you have read.", "A link to Google."], answer: "A bullet point starting with 'Researched...' followed by a specific example.", feedback: "Correct! You must mirror the keyword and provide a concrete example of your experience." }
        ]
      }
    },
    "coaching": {
      title: "You Are the Solution",
      content: "**Titre :** You Are the Solution\n\nA job posting is a description of a problem. The hiring manager has a problem—they have work that needs to be done, and they need the right person to do it. Your CV and cover letter are your chance to show that you are the solution to their problem.\n\nDon't think of your CV as a history of your past. Think of it as a proposal for their future. Every line should be focused on the employer's needs, not your own. Ask yourself: \"How does my experience solve their problem?\"\n\nWhen you shift your mindset from \"I need a job\" to \"I am the solution to your problem,\" your confidence will increase, and the quality of your application will improve dramatically. You are not a job seeker; you are a problem solver.\n\n**Votre nouvelle routine :** Find a job posting on GC Jobs that interests you, even if you are not qualified for it. Practice identifying the key \"problem\" the manager is trying to solve and think about how you would position yourself as the solution."
    },
  },
  "12.3": {
    "hook": {
      title: "The Interview: It's Your Time to Shine",
      content: "**Titre :** The Interview: It's Your Time to Shine\n\nThe job interview is the final stage. You've proven on paper that you have the qualifications; now you have to prove in person that you are the right fit for the team. A successful interview is not about having the \"right\" answers; it's about communicating your value clearly and confidently.\n\n**Objectif :** By the end of this lesson, you will be able to answer common interview questions by reviewing and combining a variety of tenses and structures to tell your professional story effectively."
    },
    "video": {
      title: "The Panel Interview",
      content: "**Titre :** The Panel Interview\n\n**(Scene: MARK is in a job interview with ANNA and another manager.)**\n\n**ANNA:** So, Mark, thank you for coming in. Can you start by telling us about your experience with project management?\n\n**MARK:** Of course. For the past two years, I **have been working** as a project coordinator. In my current role, I **am responsible for** tracking budgets and timelines. For example, last year I **managed** a project to redesign our team's intranet site. **If I had to** choose my biggest strength, I **would say** it is my attention to detail.\n\n**ANNA:** Can you give us an example of a time you had to deal with a difficult client?\n\n**MARK:** Yes. A few months ago, a client **was** unhappy with a report. First, I **listened** to their concerns. Then, I **explained** the data we **had used**. Finally, I **offered** to provide a supplementary analysis. The client **was** very satisfied with the solution. **If I hadn't listened** first, the situation **could have become** much worse.\n\n**NARRATEUR :** Mark is a master storyteller. He uses a range of grammar: Present Perfect Continuous for duration, Simple Present for current duties, Simple Past for a story, Second Conditional for a hypothetical, and even the Third Conditional (\"If I hadn't...\") to reflect on a past situation. This demonstrates his fluency and his ability to communicate complex ideas.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Grammar Review for Interviews",
      content: "**Titre :** Grammar Review for Interviews\n\nAn interview is a test of all your communication skills. Let's review the key structures.\n\n*   **To talk about your current role:** Use the **Simple Present**. (\"I **manage** a team.\")\n*   **To talk about your experience over time:** Use the **Present Perfect** or **Present Perfect Continuous**. (\"I **have worked** here for five years.\" / \"I **have been managing** projects for five years.\")\n*   **To tell a story (STAR method):** Use the **Simple Past** for the main events. (\"I **received** the request, I **analyzed** the data, and I **wrote** the report.\") Use the **Past Continuous** for the background. (\"I **was working** on the budget when I **found** an error.\")\n*   **To answer hypothetical questions (\"What would you do if...?\"):** Use the **Second Conditional**. (\"If I **had** that problem, I **would speak** to my manager.\")\n*   **To reflect on a past situation:** Use the **Third Conditional**. (\"If we **had had** more time, we **would have done** more testing.\")\n\n**Exemple interactif :**\n*Interviewer: \"Tell me about a successful project.\" You start your story with:* (Answer: \"Last year, I **worked** on a project to...\")"
    },
    "written": {
      title: "Prepare an Interview Answer",
      content: "**Titre :** Prepare an Interview Answer\n\n**Instructions :** Prepare a written answer (3-5 sentences) to the common interview question: \"What is your biggest weakness?\" Remember the classic strategy: state a real but not critical weakness, and then explain what you have been doing to improve it. Use at least two different tenses."
    },
    "oral": {
      title: "The 30-Second Elevator Pitch",
      content: "**Titre :** The 30-Second Elevator Pitch\n\n**Instructions :** The question \"Tell me about yourself\" is your chance to make a strong first impression. Prepare and record a 30-45 second \"elevator pitch\" that summarizes who you are, what you do, and what you want to do next. This is your core professional story."
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 12.3: Job Interviews",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "To answer \"Tell me about a time when...\", you should use:", options: ["The STAR method and Simple Past", "The Future tense", "The Present Continuous", "A yes/no answer"], answer: "The STAR method and Simple Past", feedback: "Correct! This question asks for a story about a past event, which is perfect for the STAR method and past tenses." },
          { id: 2, type: "multiple-choice" as const, question: "What is the best way to answer \"What is your biggest weakness?\"?", options: ["Say you have no weaknesses.", "Mention a critical flaw in your personality.", "Mention a real, non-critical skill gap and explain how you are improving it.", "Blame your previous manager."], answer: "Mention a real, non-critical skill gap and explain how you are improving it.", feedback: "Correct! This shows self-awareness and a commitment to professional development." },
          { id: 3, type: "multiple-choice" as const, question: "Complete: If I ___ the manager, I ___ do things differently.", options: ["am / will", "was / would", "were / would", "have been / would"], answer: "were / would", feedback: "Correct! This is a hypothetical situation requiring the second conditional. Use 'were' for all subjects in formal situations." },
          { id: 4, type: "multiple-choice" as const, question: "At the end of an interview, you should always:", options: ["Ask about the salary.", "Leave immediately.", "Ask at least one thoughtful question about the role or the team.", "Say nothing."], answer: "Ask at least one thoughtful question about the role or the team.", feedback: "Correct! Asking questions shows you are engaged and genuinely interested in the position." },
          { id: 5, type: "multiple-choice" as const, question: "Complete: I ___ in the public service for ten years.", options: ["have been working", "am working", "was working", "will work"], answer: "have been working", feedback: "Correct! The Present Perfect Continuous is perfect for describing an action that started in the past and continues to the present, emphasizing the duration." }
        ]
      }
    },
    "coaching": {
      title: "It's a Two-Way Street",
      content: "**Titre :** It's a Two-Way Street\n\nAn interview is not just about the employer evaluating you. It is also about you evaluating the employer. Is this a team you want to join? Is this a manager you want to work for? Is this a job that will help you achieve your career goals?\n\nThis is why the question \"Do you have any questions for us?\" at the end of the interview is so important. It is your chance to interview them. Don't ask about salary or vacation. Ask thoughtful questions that show your interest and help you make your decision.\n\n*   \"What does success look like in this role?\"\n*   \"Can you describe the team's culture?\"\n*   \"What are the biggest challenges the team is currently facing?\"\n\nAsking good questions shows you are a serious professional who is thinking about their future, not just their next paycheque.\n\n**Votre nouvelle routine :** Before your next interview (or even just for practice), prepare three thoughtful questions to ask the hiring manager. This will shift your mindset from \"I hope they like me\" to \"I wonder if this is the right place for me.\""
    },
  },
  "12.4": {
    "hook": {
      title: "Reaching the Next Level: SLE Preparation for Level B",
      content: "**Titre :** Reaching the Next Level: SLE Preparation for Level B\n\nLevel B is the benchmark for operational fluency in the public service. It means you can handle most work situations in your second language, even if you still make some mistakes. This lesson is a simulation and strategy session to prepare you for the specific challenges of the Level B oral and written exams.\n\n**Objectif :** By the end of this lesson, you will have practiced the key competencies for the Level B SLE tests, including narrating in the past, handling hypothetical questions, and writing a clear, structured email."
    },
    "video": {
      title: "The Level B Simulation",
      content: "**Titre :** The Level B Simulation\n\n**(Scene: An animated simulation of the oral proficiency test.)**\n\n**EXAMINER (V.O.):** Hello. Let's begin. First, please tell me about your professional background.\n\n**CANDIDATE:** Certainly. I **have been working** for the government for five years. I **started** as a junior analyst. In that role, I **was responsible for** gathering data. Now, I **am** a policy analyst.\n\n**EXAMINER (V.O.):** Thank you. Now, I would like you to tell me about a time you had to solve a difficult problem at work.\n\n**CANDIDATE:** Last year, my team **was organizing** a conference, and our main speaker **cancelled** at the last minute. I **had to** find a replacement quickly. I **called** several experts, and I **found** a new speaker within a few hours. If I **hadn't acted** quickly, we **would have had to** cancel the session.\n\n**EXAMINER (V.O.):** Thank you. Now for a different type of question. If you could change one thing about your current job, what would it be?\n\n**CANDIDATE:** That's an interesting question. **If I could** change one thing, I **would create** more opportunities for informal team-building. I think that **if we knew** each other better on a personal level, we **would collaborate** more effectively.\n\n**NARRATEUR :** The candidate demonstrates Level B skills. She can narrate a story in the past using different tenses. She can handle a hypothetical question using the second conditional. Her grammar is not perfect, but her message is always clear. This is the essence of Level B.\n\n**(Fin de la vidéo)**"
    },
    "strategy": {
      title: "Key Strategies for the SLE Level B",
      content: "**Titre :** Key Strategies for the SLE Level B\n\n**Oral Proficiency Test (Interview):**\n*   **Part 1: Warm-up.** Simple questions about you and your job. (Use Simple Present, Present Perfect).\n*   **Part 2: Storytelling.** You will be asked to describe a past event. Use the STAR method and a mix of past tenses.\n*   **Part 3: Hypothetical.** You will be asked a \"What would you do if...?\" or \"What do you think about...?\" question. Use the second conditional and give a structured opinion.\n*   **Key to Success:** Structure is more important than perfect grammar. Use transition words (First, Then, Finally). Don't be afraid to pause and think.\n\n**Written Expression Test (Email):**\n*   You will be given a scenario and asked to write an email (approx. 150-200 words).\n*   **Key to Success:** Planning. Before you write, take 5 minutes to plan your 3 paragraphs:\n    1.  **Opening:** State the purpose of your email.\n    2.  **Body:** Explain the situation, provide details, and make your request or recommendation.\n    3.  **Closing:** State the desired next step and thank the reader.\n*   Focus on clear, simple sentences. It is better to be clear and correct than to be complex and wrong.\n\n**Exemple interactif :**\n*The examiner asks: \"Tell me about your last vacation.\" You should:* (Answer: Use the simple past to tell a short, clear story.)"
    },
    "written": {
      title: "Simulated Written Exam (Level B)",
      content: "**Titre :** Simulated Written Exam (Level B)\n\n**Instructions :** You are a public servant. Your manager has asked you to organize a farewell party for a colleague who is retiring. Write an email to your team (approx. 150 words) to inform them of the party and to ask for their ideas and contributions. Use the 3-paragraph structure."
    },
    "oral": {
      title: "Simulated Oral Exam (Level B)",
      content: "**Titre :** Simulated Oral Exam (Level B)\n\n**Instructions :** Record yourself answering the following three questions, as if you were in the real SLE oral test. Take a moment to think before you answer each one.\n\n1.  \"Tell me about your current roles and responsibilities.\"\n2.  \"Describe a time you worked on a successful team project. What was your role?\"\n3.  \"If your department received a $1 million budget increase, how do you think it should be spent?\""
    },
    "quiz": {
      title: "Quiz (Format JSON, 7 min)",
      content: "[Quiz questions loaded interactively]",
      quiz: {
        title: "Quiz 12.4: SLE Preparation (Level B)",
        questions: [
          { id: 1, type: "multiple-choice" as const, question: "The SLE Oral Test for Level B primarily assesses your ability to:", options: ["Speak with a perfect accent.", "Use complex vocabulary.", "Communicate effectively in common work situations.", "Recite grammar rules."], answer: "Communicate effectively in common work situations.", feedback: "Correct! The focus is on effective communication, not perfection." },
          { id: 2, type: "multiple-choice" as const, question: "When telling a story in the oral test, you should use:", options: ["The STAR method", "A long and detailed explanation", "Only the present tense", "As many idioms as possible"], answer: "The STAR method", feedback: "Correct! The STAR method provides a clear and easy-to-follow structure for your story." },
          { id: 3, type: "multiple-choice" as const, question: "For the written test, what is the most important first step?", options: ["Start writing immediately.", "Check the word count.", "Make a 3-paragraph plan.", "Worry about your grammar."], answer: "Make a 3-paragraph plan.", feedback: "Correct! A good plan is the key to a clear and well-structured email." },
          { id: 4, type: "multiple-choice" as const, question: "To answer a hypothetical question like \"What would you do if...?\", you should use:", options: ["The first conditional", "The simple past", "The third conditional", "The second conditional"], answer: "The second conditional", feedback: "Correct! The second conditional (If... would...) is for imaginary or hypothetical situations." },
          { id: 5, type: "multiple-choice" as const, question: "At Level B, it is expected that you will:", options: ["Make no mistakes.", "Speak as fluently as a native speaker.", "Be able to handle most work-related tasks, even with some errors.", "Understand everything you hear."], answer: "Be able to handle most work-related tasks, even with some errors.", feedback: "Correct! Level B is about operational fluency and effective communication, not perfection." }
        ]
      }
    },
    "coaching": {
      title: "The B-Level Mindset",
      content: "**Titre :** The B-Level Mindset\n\nMany candidates fail the Level B test not because their English is bad, but because they have the wrong mindset. They try to be perfect. They use complex sentences and advanced vocabulary, and they make mistakes. Or, they are so afraid of making a mistake that they say very little.\n\nThe key to Level B is to be clear, simple, and structured. Your goal is to communicate your message effectively. The examiner is not trying to trick you; they are trying to have a conversation with you.\n\nRelax. Breathe. Listen carefully to the question. Use the structures you know well. Tell a simple story. Give a clear opinion. Write a basic, professional email. It is better to get 100% of the marks for a simple, correct answer than to get 50% of the marks for a complex, incorrect one. Aim for clarity, not complexity. That is the B-Level mindset.\n\n**Votre nouvelle routine :** Practice explaining a work situation in English for one minute every day. Don't worry about perfection. Just focus on being clear. This will build the fluency and confidence you need to succeed."
    },
  },
  "13.1": {
    "hook": {
      title: "Have you ever been in a meeting that felt like a waste of time? A strong opening is the first step to ensuring your meetings are productive and respected. Today, you learn to take control from the very first minute.",
      content: "**Hook:** Have you ever been in a meeting that felt like a waste of time? A strong opening is the first step to ensuring your meetings are productive and respected. Today, you learn to take control from the very first minute.\n\n**Objective:** By the end of this lesson, you will be able to open a formal meeting in English, clearly state its purpose, and establish the agenda with confidence, using the Present Perfect tense correctly."
    },
    "video": {
      title: "The Chair's Role",
      content: "**Title:** The Chair's Role\n\n**Scenario:** A video shows a manager, Sarah, chairing a weekly project update meeting. She opens the meeting with a clear welcome, reviews the agenda, and sets the ground rules for participation. The video highlights key phrases she uses, such as \"Let's get started,\" \"The purpose of today's meeting is...\" and \"We have three items on the agenda.\""
    },
    "strategy": {
      title: "Present Perfect vs. Simple Past",
      content: "**Title:** Present Perfect vs. Simple Past\n\n**Content:**\n\nThis is a crucial distinction at the B2 level, especially when discussing past events in a meeting.\n\n- **Simple Past:** Used for a **completed action** at a **specific time** in the past.\n  - *Example:* \"We **discussed** this issue **last week**.\"\n  - *Signal words:* yesterday, last week/month/year, in 2022, ago.\n\n- **Present Perfect:** Used for an action that happened at an **unspecified time** in the past, or an action that **started in the past and is still relevant now**.\n  - *Example:* \"We **have discussed** this issue before.\" (The exact time is not important; the fact that it was discussed is.)\n  - *Example:* \"I **have prepared** the agenda for today's meeting.\" (The action is complete, and the result is relevant now.)\n  - *Signal words:* before, ever, never, already, yet, for, since.\n\n**Table of Comparison:**\n\n| Tense | Usage | Example |\n|---|---|---|\n| Simple Past | Finished action, specific time | \"I **sent** the email yesterday.\" |\n| Present Perfect | Finished action, unspecified time | \"I **have sent** the email.\" |\n| Present Perfect | Action started in past, continues now | \"She **has worked** here for five years.\" |"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Write an opening statement for a meeting you would chair. The topic is \"Improving Bilingual Communication in Our Team.\" Include a welcome, the purpose of the meeting, and a three-item agenda. Use at least one sentence in the Present Perfect.\n\n**Example Starter:** \"Good morning, everyone. Thank you for coming. The purpose of today's meeting is to discuss how we can improve bilingual communication in our team. I **have prepared** a short agenda for us...\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself delivering the opening statement you just wrote. Focus on a confident, clear tone. Pay attention to the pronunciation of key phrases and the intonation of your sentences."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Choose the correct sentence:**\n    a) I have sent the report yesterday.\n    b) I sent the report yesterday.\n    *Answer: b)*\n\n2.  **Choose the correct sentence:**\n    a) We have discussed this many times.\n    b) We discussed this many times.\n    *Answer: a)*\n\n3.  **Fill in the blank:** \"The purpose of today's meeting ___ to finalize the budget.\"\n    a) is\n    b) are\n    *Answer: a)*\n\n4.  **Which phrase is best for starting a meeting?**\n    a) \"So...\"\n    b) \"Let's get started.\"\n    *Answer: b)*\n\n5.  **Fill in the blank:** \"I ___ the documents for you all to review.\"\n    a) have brought\n    b) brought\n    *Answer: a)*"
    },
    "coaching": {
      title: "Authority Without Arrogance",
      content: "**Title:** Authority Without Arrogance\n\n**Content:** As a meeting chair, your goal is to project confidence and authority, not to be bossy. Use inclusive language like \"we\" and \"us\" (\"What should **we** focus on?\"). Frame the agenda as a shared goal. Your role is to guide the team to a productive outcome, not to dictate it. A calm, clear, and respectful tone will earn you more respect than a loud or demanding one."
    },
  },
  "13.2": {
    "hook": {
      title: "A meeting without discussion is just a monologue. A great chair doesn't just talk; they facilitate. Today, you learn the art of drawing out ideas and ensuring everyone has a voice.",
      content: "**Hook:** A meeting without discussion is just a monologue. A great chair doesn't just talk; they facilitate. Today, you learn the art of drawing out ideas and ensuring everyone has a voice.\n\n**Objective:** By the end of this lesson, you will be able to use key phrases to facilitate a discussion, manage participation, and use the Present Perfect Continuous tense to describe ongoing work."
    },
    "video": {
      title: "The Art of Facilitation",
      content: "**Title:** The Art of Facilitation\n\n**Scenario:** The video continues with Sarah's meeting. She facilitates a discussion on the first agenda item. She uses open-ended questions (\"What are your thoughts on this?\"), encourages a quiet team member (\"Jean, we haven't heard from you yet.\"), and politely interrupts a dominant speaker (\"Thanks, Mark. Let's see what others think.\")."
    },
    "strategy": {
      title: "Present Perfect Continuous",
      content: "**Title:** Present Perfect Continuous\n\n**Content:**\n\nThis tense is perfect for describing the duration of an action that started in the past and is still in progress. It emphasizes the continuity of the work.\n\n- **Structure:** `has/have + been + verb-ing`\n- **Usage:** To talk about an action that started in the past and is still happening now.\n  - *Example:* \"We **have been working** on this project for three months.\"\n  - *Example:* \"She **has been leading** this file since January.\"\n\n**Comparison with Present Perfect Simple:**\n\n| Tense | Focus | Example |\n|---|---|---|\n| Present Perfect Simple | The result of the action | \"I **have written** the report.\" (The report is finished.) |\n| Present Perfect Continuous | The duration of the action | \"I **have been writing** the report all morning.\" (The action itself is the focus.) |\n\n**Key Facilitation Questions:**\n\n- To open discussion: \"What are your thoughts on...?\" / \"What's your take on this?\"\n- To involve someone: \"[Name], what do you think?\" / \"[Name], I'd like to hear your perspective.\"\n- To manage a dominant speaker: \"Thank you, [Name]. Let's get some other views.\"\n- To clarify: \"Could you elaborate on that point?\""
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Your team has been working on a new policy for two months. Write 5 open-ended facilitation questions you could use in a meeting to discuss the progress. Use the Present Perfect Continuous in your introductory sentence.\n\n**Example Starter:** \"Good morning. We **have been developing** this new policy for two months now, and I'd like to get everyone's input on our progress. My first question is...\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself facilitating a 3-minute discussion. Imagine you are in the meeting from the previous task. Ask your questions, and practice using phrases to encourage participation and manage the flow of conversation."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Choose the correct sentence:**\n    a) I have been finishing the project.\n    b) I have finished the project.\n    *Answer: b) (Focus is on the result)*\n\n2.  **Choose the correct sentence:**\n    a) They have been discussing this for an hour.\n    b) They have discussed this for an hour.\n    *Answer: a) (Focus is on the duration)*\n\n3.  **Which question is open-ended?**\n    a) Did you finish the task?\n    b) What are the next steps for this task?\n    *Answer: b)*\n\n4.  **How do you politely involve a quiet person?**\n    a) \"Why aren't you talking?\"\n    b) \"[Name], we'd love to hear your thoughts on this.\"\n    *Answer: b)*\n\n5.  **Fill in the blank:** \"He ___ the team since 2020.\"\n    a) has been leading\n    b) has led\n    *Answer: a)*"
    },
    "coaching": {
      title: "Managing Silence",
      content: "**Title:** Managing Silence\n\n**Content:** Don't be afraid of silence. After you ask a question, wait. People need time to think. If you jump in too quickly to fill the silence, you rob them of that thinking time and often answer your own question. Count to seven in your head. More often than not, someone will speak up. Comfortable silence is a powerful facilitation tool."
    },
  },
  "13.3": {
    "hook": {
      title: "Disagreement isn't a sign of a bad meeting; it's often a sign of a passionate team. The difference between a productive debate and a destructive argument is a skilled facilitator. Today, you learn to be that facilitator.",
      content: "**Hook:** Disagreement isn't a sign of a bad meeting; it's often a sign of a passionate team. The difference between a productive debate and a destructive argument is a skilled facilitator. Today, you learn to be that facilitator.\n\n**Objective:** By the end of this lesson, you will be able to manage disagreements diplomatically using advanced concession and contrast language."
    },
    "video": {
      title: "When People Disagree",
      content: "**Title:** When People Disagree\n\n**Scenario:** In Sarah's meeting, two team members, David and Chloe, have a strong disagreement about the best approach for the next phase of the project. Sarah steps in, acknowledges both viewpoints, finds common ground, and proposes a way forward that respects both positions."
    },
    "strategy": {
      title: "Concession & Contrast (Advanced)",
      content: "**Title:** Concession & Contrast (Advanced)\n\n**Content:**\n\nThese words and phrases are essential for acknowledging one point while introducing a different one. They are the language of diplomacy.\n\n| Phrase | Usage | Example |\n|---|---|---|\n| **While / Whereas** | To contrast two ideas directly. | \"**While** David's point about the budget is valid, Chloe's concern about the timeline is also critical.\" |\n| **Although / Even though** | To introduce a subordinate idea that contrasts with the main idea. | \"**Although** the risk is high, the potential reward is greater.\" |\n| **Nevertheless / Nonetheless** | To introduce a point that contrasts with what was just said. (Formal) | \"The data is concerning. **Nevertheless**, we must proceed.\" |\n| **On the one hand... On the other hand...** | To present two opposing sides of an argument. | \"**On the one hand**, we need to be innovative. **On the other hand**, we must manage risk.\" |\n| **Be that as it may...** | To acknowledge a point but dismiss it as not the most important. (Very Formal) | \"The timeline is tight. **Be that as it may**, quality cannot be compromised.\" |\n\n**The 3-Step Disagreement Management Formula:**\n1.  **Acknowledge:** \"I understand your concern about...\" / \"I hear what you're saying...\"\n2.  **Validate & Bridge:** \"That's a valid point. **However**, we also need to consider...\"\n3.  **Redirect:** \"What if we could find a solution that addresses both...?\" / \"Let's look at this from another angle.\""
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Two colleagues are disagreeing. Colleague A wants to launch a new service quickly to be first to market. Colleague B wants to do more testing to ensure quality. Write a short paragraph (as the meeting chair) that summarizes the situation and proposes a consensus, using at least two concession/contrast phrases.\n\n**Example Starter:** \"I understand both perspectives. **On the one hand**, speed is important. **On the other hand**, we cannot risk our reputation with a faulty product. **While** a delay is not ideal, what if we plan a limited, phased rollout to a small user group?\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself verbally managing the disagreement from the previous task. Play the role of the chair. Use the 3-step formula: acknowledge, validate & bridge, and redirect. Focus on a calm and neutral tone."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which phrase introduces a contrasting idea?**\n    a) Furthermore\n    b) Nevertheless\n    *Answer: b)*\n\n2.  **Complete the sentence:** \"___ it was a difficult project, the team succeeded.\"\n    a) Although\n    b) Despite\n    *Answer: a)*\n\n3.  **What is the first step in managing a disagreement?**\n    a) Choose a side.\n    b) Acknowledge both viewpoints.\n    *Answer: b)*\n\n4.  **Which is the most formal?**\n    a) But\n    b) Be that as it may\n    *Answer: b)*\n\n5.  **Complete the sentence:** \"I see your point. ___, we have to consider the budget.\"\n    a) However\n    b) Also\n    *Answer: a)*"
    },
    "coaching": {
      title: "Staying Neutral",
      content: "**Title:** Staying Neutral\n\n**Content:** As the chair, you are Switzerland. Even if you have a strong personal opinion, your role is to facilitate a fair process. If you take sides, you lose credibility as a neutral facilitator. Focus on the *process* of the discussion, not the *content*. Your job is to help the *group* find the best solution, which may not be your personal preference."
    },
  },
  "13.4": {
    "hook": {
      title: "A meeting without a clear ending is just a conversation. The final five minutes are the most important; they turn discussion into action. Today, you learn to close your meetings with purpose and impact.",
      content: "**Hook:** A meeting without a clear ending is just a conversation. The final five minutes are the most important; they turn discussion into action. Today, you learn to close your meetings with purpose and impact.\n\n**Objective:** By the end of this lesson, you will be able to close a formal meeting, summarize key decisions, and assign clear action items using the Future Perfect and Future Continuous tenses."
    },
    "video": {
      title: "Ending on a Strong Note",
      content: "**Title:** Ending on a Strong Note\n\n**Scenario:** The video shows the end of Sarah's meeting. She summarizes the key decisions made, confirms the action items with clear owners and deadlines (\"So, Mark, you will... by next Friday?\"), and sets the date for the next meeting. Everyone leaves knowing exactly what was decided and what they need to do."
    },
    "strategy": {
      title: "Future Perfect & Future Continuous",
      content: "**Title:** Future Perfect & Future Continuous\n\n**Content:**\n\nThese tenses are perfect for describing future actions and deadlines, which is exactly what you do at the end of a meeting.\n\n- **Future Continuous:** `will be + verb-ing`\n  - **Usage:** To describe an action that will be in progress at a specific time in the future.\n  - *Example:* \"**This time next week, we will be implementing** the new solution.\"\n\n- **Future Perfect:** `will have + past participle`\n  - **Usage:** To describe an action that will be completed *before* a specific time in the future.\n  - *Example:* \"**By next Friday, you will have submitted** the final report.\"\n\n**The W.H.O. Action Item Formula:**\n\nWhen assigning action items, be crystal clear. Use the W.H.O. formula:\n- **W**hat: What is the specific task?\n- **H**o: Who is responsible for it?\n- **O**ften (by when): What is the deadline?\n\n*Example:* \"Okay, so the action item is: **(What)** Complete the budget analysis. **(Who)** Jean is the lead. **(By When)** The deadline is end-of-day this Thursday.\""
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Write the closing section for the meeting minutes from the previous lessons. Include a summary of two key decisions, and assign three action items using the W.H.O. formula. Use the Future Perfect in at least one action item.\n\n**Example Starter:** \"**Decisions:** 1. We will proceed with a phased rollout. 2. The budget for Phase 1 is approved. **Action Items:** 1. (Who) Chloe will (What) draft the project plan (By When) by this Wednesday. 2. (Who) David will (What) have finalized the risk assessment (By When) by Friday.\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself closing a meeting. Deliver the summary of decisions and action items you just wrote. Use clear, concise language and a confident tone. End by thanking everyone for their time."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Choose the correct sentence:**\n    a) By next month, we will have finished the project.\n    b) By next month, we will finish the project.\n    *Answer: a)*\n\n2.  **Choose the correct sentence:**\n    a) This time tomorrow, I will be flying to Ottawa.\n    b) This time tomorrow, I will fly to Ottawa.\n    *Answer: a)*\n\n3.  **What does W.H.O. stand for in action items?**\n    a) What, How, Often\n    b) What, Who, Often (by when)\n    *Answer: b)*\n\n4.  **Which phrase is best for summarizing?**\n    a) \"So, yeah...\"\n    b) \"To summarize the key takeaways...\"\n    *Answer: b)*\n\n5.  **Fill in the blank:** \"By the end of the year, she ___ in this role for a decade.\"\n    a) will be working\n    b) will have been working\n    *Answer: b) (Future Perfect Continuous)*"
    },
    "coaching": {
      title: "The Complete Chair",
      content: "**Title:** The Complete Chair\n\n**Content:** You've now learned the three key stages of chairing a meeting: opening with purpose, facilitating discussion, and closing with action. A great chair is like a great orchestra conductor. They don't play the instruments, but they ensure everyone plays together, in time, to create a beautiful result. Practice these skills, and you will build a reputation as someone who runs meetings that matter."
    },
  },
  "14.1": {
    "hook": {
      title: "In the Government of Canada, the Briefing Note (BN) is the currency of decision-making. Mastering this format is not just a writing skill; it's a career skill. Today, you learn to write with the clarity and authority that gets decisions made.",
      content: "**Hook:** In the Government of Canada, the Briefing Note (BN) is the currency of decision-making. Mastering this format is not just a writing skill; it's a career skill. Today, you learn to write with the clarity and authority that gets decisions made.\n\n**Objective:** By the end of this lesson, you will be able to structure a standard Government of Canada Briefing Note and use the passive voice effectively for a formal, objective tone."
    },
    "video": {
      title: "Anatomy of a Briefing Note",
      content: "**Title:** Anatomy of a Briefing Note\n\n**Scenario:** A video breaks down a sample Briefing Note on a fictional issue (e.g., \"Proposal to Pilot a Four-Day Work Week\"). An expert narrator explains the purpose of each section: **Issue**, **Background**, **Current Status**, and **Recommendations**. The video highlights the concise, factual, and neutral language required."
    },
    "strategy": {
      title: "Passive Voice (Advanced)",
      content: "**Title:** Passive Voice (Advanced)\n\n**Content:**\n\nThe passive voice is essential for the objective, impersonal tone of a Briefing Note. It focuses on the action, not the actor.\n\n- **Structure:** `Object + to be (conjugated) + past participle`\n- **Usage:** When the person doing the action is unknown, unimportant, or obvious.\n\n**Active vs. Passive in a BN:**\n\n| Active (Less Formal) | Passive (Formal & Objective) |\n|---|---|\n| \"We recommend that you approve Option B.\" | \"**It is recommended that** Option B **be approved**.\" |\n| \"My team has raised concerns.\" | \"Concerns **have been raised**.\" |\n| \"We approved the proposal in the last meeting.\" | \"The proposal **was approved** in the last meeting.\" |\n\n**Why use the passive voice in a BN?**\n1.  **Objectivity:** It removes personal feelings and focuses on facts.\n2.  **Formality:** It creates a professional, institutional tone.\n3.  **Focus:** It places emphasis on the action or the result, which is what matters to the decision-maker."
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Write a one-page Briefing Note for a decision-maker (e.g., your Director) on a real or imagined workplace issue. Use the standard four-part structure (Issue, Background, Current Status, Recommendations). Write at least three sentences in the passive voice.\n\n**Topic Idea:** The need for new project management software."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Imagine you have 60 seconds with your Director before she enters a meeting. Record yourself presenting the key points of your Briefing Note. Be concise, clear, and focus on the \"ask\" (the recommendation)."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **What are the four main sections of a GC Briefing Note?**\n    a) Intro, Body, Conclusion, Appendix\n    b) Issue, Background, Current Status, Recommendations\n    *Answer: b)*\n\n2.  **Change to passive voice:** \"We completed the analysis.\"\n    a) The analysis was completed.\n    b) The analysis has been completed.\n    *Answer: a)*\n\n3.  **Why is the passive voice used in BNs?**\n    a) To make the writing more personal.\n    b) To create an objective and formal tone.\n    *Answer: b)*\n\n4.  **Which sentence is most appropriate for a BN?**\n    a) I think we should do this.\n    b) It is recommended that this course of action be taken.\n    *Answer: b)*\n\n5.  **Fill in the blank:** \"The decision ___ at the last committee meeting.\"\n    a) was made\n    b) made\n    *Answer: a)*"
    },
    "coaching": {
      title: "Writing Like a Pro",
      content: "**Title:** Writing Like a Pro\n\n**Content:** Professional government writing is clear, concise, and neutral. Avoid emotional language (\"I feel,\" \"I believe\"). Avoid jargon where possible, but use official acronyms correctly. Always write with your reader in mind. What does the Deputy Minister need to know to make a decision? Give them that, and only that. Your goal is to make their job easier."
    },
  },
  "14.2": {
    "hook": {
      title: "A 100-page report is useless if no one reads it. The most important part of any long document is the short version. Today, you learn to write executive summaries that get read and get action.",
      content: "**Hook:** A 100-page report is useless if no one reads it. The most important part of any long document is the short version. Today, you learn to write executive summaries that get read and get action.\n\n**Objective:** By the end of this lesson, you will be able to structure an effective report, write a concise executive summary, and use linking words to create cohesive and logical arguments."
    },
    "video": {
      title: "Writing Effective Reports",
      content: "**Title:** Writing Effective Reports\n\n**Scenario:** A video explains the standard structure of a formal report: **Executive Summary**, **Introduction**, **Findings**, **Analysis**, **Recommendations**, and **Appendices**. The narrator emphasizes that the Executive Summary is a standalone document that must contain the most critical information."
    },
    "strategy": {
      title: "Linking Words & Cohesion",
      content: "**Title:** Linking Words & Cohesion\n\n**Content:**\n\nLinking words (or transition words) are the glue that holds your arguments together. They show the relationship between your ideas and guide the reader through your logic.\n\n| Category | Linking Words | Example |\n|---|---|---|\n| **Addition** | Furthermore, Moreover, In addition | \"The project is on budget. **Furthermore**, it is ahead of schedule.\" |\n| **Contrast** | However, Nevertheless, On the other hand | \"Option A is cheaper. **However**, Option B offers better long-term value.\" |\n| **Cause & Effect** | Consequently, Therefore, As a result | \"The server failed. **As a result**, the system was down for two hours.\" |\n| **Conclusion** | In conclusion, To summarize, In short | \"**In conclusion**, the evidence strongly supports the recommendation.\" |\n\nUsing these words makes your writing more sophisticated, logical, and easier for a busy executive to follow."
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** You have just finished a report on employee satisfaction. The key findings are: 1) Satisfaction is high, but 2) there are concerns about work-life balance, and 3) communication could be improved. The recommendation is to create a new internal communications working group. Write a 150-word executive summary of this report, using at least three linking words."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself presenting the key findings of your executive summary in 2 minutes. Imagine you are briefing your Director. Use linking words to connect your points smoothly."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which section of a report should be written last, but read first?**\n    a) Introduction\n    b) Executive Summary\n    *Answer: b)*\n\n2.  **Which linking word shows a contrast?**\n    a) Moreover\n    b) However\n    *Answer: b)*\n\n3.  **Which linking word shows a result?**\n    a) Consequently\n    b) In addition\n    *Answer: a)*\n\n4.  **Complete the sentence:** \"The data is positive. ___, we should be cautious.\"\n    a) Therefore\n    b) Nevertheless\n    *Answer: b)*\n\n5.  **What is the main purpose of an executive summary?**\n    a) To provide all the details.\n    b) To give a busy reader the most important information quickly.\n    *Answer: b)*"
    },
    "coaching": {
      title: "Less Is More",
      content: "**Title:** Less Is More\n\n**Content:** In professional writing, your goal is not to show how many words you know, but how clearly you can express an idea. Good writing is concise. After you write a draft, go back and challenge every word. Can you say it more simply? Is this sentence necessary? Can one word replace three? Eliminating unnecessary words makes your writing more powerful and more likely to be read."
    },
  },
  "14.3": {
    "hook": {
      title: "From a simple internal memo to a formal letter to a stakeholder, the way you write represents your department and the Government of Canada. Knowing the right format and tone is critical. Today, you master the art of official correspondence.",
      content: "**Hook:** From a simple internal memo to a formal letter to a stakeholder, the way you write represents your department and the Government of Canada. Knowing the right format and tone is critical. Today, you master the art of official correspondence.\n\n**Objective:** By the end of this lesson, you will be able to differentiate between formal and informal registers and write a professional internal memo using the appropriate tone and structure."
    },
    "video": {
      title: "Professional Correspondence",
      content: "**Title:** Professional Correspondence\n\n**Scenario:** A video showcases different types of Government of Canada correspondence. It compares an internal memo (short, direct, for information), a formal letter to an external partner (more detailed, formal salutations), and a response to ministerial correspondence (highly formal, follows strict protocols)."
    },
    "strategy": {
      title: "Formal vs. Informal Register",
      content: "**Title:** Formal vs. Informal Register\n\n**Content:**\n\nChoosing the right register (level of formality) is crucial. It depends on your audience and your purpose.\n\n| Feature | Informal Register (e.g., email to a colleague) | Formal Register (e.g., memo to staff) |\n|---|---|---|\n| **Salutation** | \"Hi Mark,\" / \"Hello team,\" | \"Dear colleagues,\" / \"MEMORANDUM FOR:\" |\n| **Contractions** | Used (don't, can't, it's) | Avoided (do not, cannot, it is) |\n| **Phrasal Verbs** | Common (look into, find out) | Less common; prefer single verbs (investigate, determine) |\n| **Vocabulary** | Simpler, more direct | More formal, Latinate (e.g., \"commence\" instead of \"start\") |\n| **Sentence Structure** | Shorter, simpler sentences | Longer, more complex sentences |\n| **Closing** | \"Thanks,\" / \"Cheers,\" | \"Sincerely,\" / \"Regards,\" |\n\n**Example:**\n- **Informal:** \"Just wanted to let you know that the meeting is cancelled.\"\n- **Formal:** \"This memo is to inform you that the scheduled meeting has been cancelled.\""
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Write a short, formal internal memo to all staff in your division announcing a new policy on flexible work arrangements. Use the appropriate formal register, avoid contractions, and include a clear subject line, date, and sender."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** You need to call a colleague to give them the information from the memo you just wrote. Record yourself explaining the new policy in a more informal, conversational tone suitable for a phone call."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which sentence is in a formal register?**\n    a) We can't approve the request.\n    b) We are unable to approve the request.\n    *Answer: b)*\n\n2.  **Which is a common feature of informal writing?**\n    a) Use of contractions.\n    b) Complex sentence structures.\n    *Answer: a)*\n\n3.  **For a memo to all staff, which salutation is best?**\n    a) \"Hey everyone,\"\n    b) \"MEMORANDUM FOR ALL STAFF\"\n    *Answer: b)*\n\n4.  **Replace the phrasal verb \"look into\" with a more formal verb.**\n    a) investigate\n    b) see\n    *Answer: a)*\n\n5.  **When is an informal register appropriate?**\n    a) In a briefing note for a Deputy Minister.\n    b) In a quick email to a trusted colleague.\n    *Answer: b)*"
    },
    "coaching": {
      title: "Finding Your Written Voice",
      content: "**Title:** Finding Your Written Voice\n\n**Content:** Your professional written voice should be clear, confident, and consistent. It doesn't mean you have to sound like a robot. You can be formal and still be human. Read the writing of senior leaders you admire. Notice how they structure their sentences and choose their words. Over time, you will develop a professional voice that is both authoritative and authentically yours."
    },
  },
  "14.4": {
    "hook": {
      title: "The difference between a good writer and a great writer is editing. Even the best writers make mistakes. The final read-through is your last line of defense against errors that can undermine your credibility. Today, you become your own best editor.",
      content: "**Hook:** The difference between a good writer and a great writer is editing. Even the best writers make mistakes. The final read-through is your last line of defense against errors that can undermine your credibility. Today, you become your own best editor.\n\n**Objective:** By the end of this lesson, you will be able to apply a three-pass editing process to your writing and identify and correct the most common English writing errors made by Francophones."
    },
    "video": {
      title: "The Editing Process",
      content: "**Title:** The Editing Process\n\n**Scenario:** A video illustrates the \"three-pass\" editing process. \n1.  **Content Pass:** Read for meaning. Does it say what you want it to say? Is the argument logical?\n2.  **Structure Pass:** Read for flow. Are the paragraphs in the right order? Are the transitions smooth?\n3.  **Language Pass:** Read for errors. Check grammar, spelling, punctuation, and typos. The video advises reading the text backwards for this pass to focus only on the words, not the meaning."
    },
    "strategy": {
      title: "Common Francophone Errors (False Friends)",
      content: "**Title:** Common Francophone Errors (False Friends)\n\n**Content:**\n\nLanguage interference from French is the source of many common errors. Being aware of these \"false friends\" is half the battle.\n\n| French Word | English False Friend | Correct English Word(s) |\n|---|---|---|\n| **actuellement** | actually (means *en réalité*) | **currently, at the moment** |\n| **éventuellement** | eventually (means *finalement*) | **possibly, potentially** |\n| **assister à** | to assist (means *aider*) | **to attend** |\n| **demander** | to demand (means *exiger*) | **to ask, to request** |\n| **librairie** | library (means *bibliothèque*) | **bookstore** |\n| **rester** | to rest (means *se reposer*) | **to stay, to remain** |\n| **sensible** | sensible (means *raisonnable*) | **sensitive** |\n\n**Other Common Errors:**\n- **Prepositions:** \"I am agree\" -> \"I agree.\" / \"We discussed about the issue\" -> \"We discussed the issue.\"\n- **Articles:** Forgetting \"the\" or \"a/an\" where needed."
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Edit the following paragraph, which contains 5 common errors. Rewrite the corrected paragraph.\n\n*\"Actually, our team is working on a new project. We will assist to a meeting tomorrow to discuss about it. I demand that you prepare the presentation. Eventually, we can finish it by Friday if we have time. I am sensible to the tight deadline, but it is important.\"\n\n**Corrected Version:**\n*\"**Currently**, our team is working on a new project. We will **attend** a meeting tomorrow to **discuss** it. I **request** that you prepare the presentation. **Possibly**, we can finish it by Friday if we have time. I am **sensitive** to the tight deadline, but it is important.\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Review a piece of your own writing from a previous lesson in this module. Find at least one error or one sentence you can improve. Record yourself explaining the error and how you corrected it."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **What does the English word \"eventually\" mean?**\n    a) possibly\n    b) finally\n    *Answer: b)*\n\n2.  **Correct the sentence:** \"I will assist to the conference.\"\n    a) I will attend the conference.\n    b) I will assist the conference.\n    *Answer: a)*\n\n3.  **What is the first pass in the three-pass editing process?**\n    a) Language Pass (for errors)\n    b) Content Pass (for meaning)\n    *Answer: b)*\n\n4.  **Correct the sentence:** \"We need to discuss about the budget.\"\n    a) We need to discuss the budget.\n    b) We need to discuss on the budget.\n    *Answer: a)*\n\n5.  **\"Actuellement\" in French means what in English?**\n    a) actually\n    b) currently\n    *Answer: b)*"
    },
    "coaching": {
      title: "Perfectionism vs. Progress",
      content: "**Title:** Perfectionism vs. Progress\n\n**Content:** Your goal is not to write perfect English. Even native speakers make mistakes. Your goal is to communicate clearly and effectively. Don't let the fear of making a mistake stop you from writing. Write your draft, then edit. The more you write and edit, the fewer mistakes you will make over time. Focus on progress, not perfection."
    },
  },
  "15.1": {
    "hook": {
      title: "A great presentation is a story. It has a beginning, a middle, and an end. Without a clear structure, even the best ideas get lost. Today, you learn the classic structure that will make your presentations clear, memorable, and persuasive.",
      content: "**Hook:** A great presentation is a story. It has a beginning, a middle, and an end. Without a clear structure, even the best ideas get lost. Today, you learn the classic structure that will make your presentations clear, memorable, and persuasive.\n\n**Objective:** By the end of this lesson, you will be able to structure a formal presentation using the \"Tell-Tell-Tell\" model and use signposting language to guide your audience."
    },
    "video": {
      title: "The Presentation Blueprint",
      content: "**Title:** The Presentation Blueprint\n\n**Scenario:** A video shows a manager, David, giving a presentation to senior leadership. The video breaks down his structure:\n1.  **Tell them what you're going to tell them:** (Introduction & Agenda)\n2.  **Tell them:** (The main body of the presentation, with 3 key messages)\n3.  **Tell them what you told them:** (Conclusion & Summary)"
    },
    "strategy": {
      title: "Signposting Language",
      content: "**Title:** Signposting Language\n\n**Content:**\n\nSignposting language is the set of phrases you use to guide your audience through your presentation. They are the road signs that tell your audience where they are, where they are going, and where they have been.\n\n| Function | Signposting Phrases |\n|---|---|\n| **Introduction** | \"Today, I'd like to talk to you about...\" / \"The purpose of my presentation is to...\" |\n| **Outlining** | \"I've divided my presentation into three parts.\" / \"First, I'll..., then I'll..., and finally, I'll...\" |\n| **Moving to a new point** | \"Let's now turn to...\" / \"This brings me to my next point...\" |\n| **Summarizing** | \"To sum up...\" / \"In conclusion...\" |\n| **Referring to visuals** | \"If you look at the graph, you'll see...\" / \"As you can see on this slide...\" |"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Prepare a one-page outline for a 10-minute presentation on a topic of your choice related to your work. Use the \"Tell-Tell-Tell\" structure and include at least five different signposting phrases in your outline."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself delivering the 2-minute introduction to your presentation. Use your outline and focus on clear signposting to tell your audience what you are going to tell them."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **What is the \"Tell-Tell-Tell\" model?**\n    a) Tell a story, tell a joke, tell the time.\n    b) Tell them what you'll say, say it, tell them what you said.\n    *Answer: b)*\n\n2.  **Which phrase is used for moving to a new point?**\n    a) \"In conclusion...\"\n    b) \"This brings me to my next point...\"\n    *Answer: b)*\n\n3.  **What is the purpose of signposting language?**\n    a) To confuse the audience.\n    b) To guide the audience through the presentation.\n    *Answer: b)*\n\n4.  **Which phrase is best for an introduction?**\n    a) \"So, my topic is...\"\n    b) \"The purpose of my presentation is to...\"\n    *Answer: b)*\n\n5.  **\"If you look at the chart...\" is an example of what?**\n    a) Referring to a visual.\n    b) Summarizing.\n    *Answer: a)*"
    },
    "coaching": {
      title: "The Rule of Three",
      content: "**Title:** The Rule of Three\n\n**Content:** People remember things in threes. When you structure the body of your presentation, try to have three key messages. Not two, not four. Three. It's a powerful and memorable structure. \"Today I have three points to share with you.\" This simple technique will make your presentations much more impactful."
    },
  },
  "15.2": {
    "hook": {
      title: "A picture is worth a thousand words, but a confusing chart is worth nothing. Your slides should support your message, not become the message. Today, you learn to present data in a way that is clear, compelling, and easy to understand.",
      content: "**Hook:** A picture is worth a thousand words, but a confusing chart is worth nothing. Your slides should support your message, not become the message. Today, you learn to present data in a way that is clear, compelling, and easy to understand.\n\n**Objective:** By the end of this lesson, you will be able to describe trends and changes in data using appropriate vocabulary and create simple, effective visual aids."
    },
    "video": {
      title: "Presenting Data Clearly",
      content: "**Title:** Presenting Data Clearly\n\n**Scenario:** A video shows two versions of a slide. The first is cluttered, with a complex chart and too much text. The second is simple and clear, with one key message, a simple bar chart, and minimal text. The narrator explains why the second slide is much more effective."
    },
    "strategy": {
      title: "Describing Trends & Changes",
      content: "**Title:** Describing Trends & Changes\n\n**Content:**\n\nWhen you present data, you need the right vocabulary to describe what is happening.\n\n| Trend | Verbs | Nouns |\n|---|---|---|\n| **Upward** | to increase, to rise, to grow, to climb | an increase, a rise, a growth, a climb |\n| **Downward** | to decrease, to fall, to drop, to decline | a decrease, a fall, a drop, a decline |\n| **No Change** | to remain stable, to stay the same | a period of stability |\n| **Change** | to fluctuate, to vary | a fluctuation, a variation |\n\n**Adjectives & Adverbs:**\n- **Adjectives (describe nouns):** \"There was a **significant** increase.\"\n- **Adverbs (describe verbs):** \"Sales increased **significantly**.\"\n\n| Degree of Change | Adjectives | Adverbs |\n|---|---|---|\n| **Large** | significant, dramatic, sharp | significantly, dramatically, sharply |\n| **Small** | slight, gradual, modest | slightly, gradually, modestly |"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Look at a simple line graph showing your department's budget over the last five years. Write a short paragraph describing the trend. Use at least two different verbs, one noun, one adjective, and one adverb from the tables above."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself presenting the data from the previous task. Imagine you are showing the graph to your team. Use signposting language (\"As you can see from the graph...\") and the vocabulary for describing trends."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which word describes a large, fast increase?**\n    a) a slight rise\n    b) a sharp increase\n    *Answer: b)*\n\n2.  **Which word is an adverb?**\n    a) gradual\n    b) gradually\n    *Answer: b)*\n\n3.  **Complete the sentence:** \"There was a ___ fall in prices.\"\n    a) dramatically\n    b) dramatic\n    *Answer: b)*\n\n4.  **What is a key principle for good visual aids?**\n    a) Put as much information as possible on one slide.\n    b) Keep them simple and clear, with one key message per slide.\n    *Answer: b)*\n\n5.  **Which verb means \"to go up and down\"?**\n    a) to fluctuate\n    b) to remain stable\n    *Answer: a)*"
    },
    "coaching": {
      title: "One Slide, One Idea",
      content: "**Title:** One Slide, One Idea\n\n**Content:** The biggest mistake people make with PowerPoint is putting too much information on one slide. Your slides are not your script. They are there to support what you are saying. Follow the \"one slide, one idea\" rule. If you have a new idea, you need a new slide. This will force you to be clear and concise, and it will make your presentation much easier for your audience to follow."
    },
  },
  "15.3": {
    "hook": {
      title: "The Q&A is not the end of your presentation; it IS the presentation. It's where you connect with your audience, clarify your message, and show your expertise. A great Q&A can turn a good presentation into a memorable one. Today, you learn to handle any question with confidence.",
      content: "**Hook:** The Q&A is not the end of your presentation; it IS the presentation. It's where you connect with your audience, clarify your message, and show your expertise. A great Q&A can turn a good presentation into a memorable one. Today, you learn to handle any question with confidence.\n\n**Objective:** By the end of this lesson, you will be able to manage a Q&A session effectively, handle difficult questions, and use the third conditional to discuss hypothetical past situations."
    },
    "video": {
      title: "Mastering the Q&A",
      content: "**Title:** Mastering the Q&A\n\n**Scenario:** A video shows David from the previous lesson handling a Q&A session. He receives a difficult, critical question. He listens, paraphrases the question to ensure he understands, answers calmly and directly, and then bridges back to his key message. The video highlights the phrases he uses."
    },
    "strategy": {
      title: "Third Conditional",
      content: "**Title:** Third Conditional\n\n**Content:**\n\nThe third conditional is used to talk about a hypothetical or unreal situation in the past. It's perfect for answering \"what if\" questions in a Q&A.\n\n- **Structure:** `If + past perfect (had + past participle), ...would have + past participle`\n- **Usage:** To imagine a different past.\n\n**Examples:**\n- \"**If we had had** more time, we **would have done** more testing.\" (We didn't have more time, so we didn't do more testing.)\n- \"**If you had asked** me earlier, I **would have been able** to help.\" (You didn't ask me earlier, so I wasn't able to help.)\n\n**The A-B-C-D Formula for Difficult Questions:**\n- **A**cknowledge: \"That's an excellent question.\"\n- **B**reak it down: Paraphrase the question to ensure you understand it. \"So, if I understand correctly, you're asking...\"\n- **C**onvey your answer: Answer the question clearly and concisely.\n- **D**ivert back: Bridge back to one of your key messages. \"And that speaks to my main point about...\""
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** You have just given a presentation on a project that was delayed. You are asked: \"Why didn't you finish the project on time?\" Write a response using the A-B-C-D formula and the third conditional.\n\n**Example Starter:** \"(A) That's a very important question. (B) If I understand correctly, you're asking about the factors that led to the delay. (C) The primary issue was an unexpected technical problem. **If we had known** about this issue earlier, we **would have allocated** more resources to it...\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself answering the difficult question from the previous task. Focus on a calm, confident, and non-defensive tone. Practice the A-B-C-D formula until it feels natural."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **What is the third conditional used for?**\n    a) To talk about a likely future.\n    b) To talk about an unreal situation in the past.\n    *Answer: b)*\n\n2.  **Complete the sentence:** \"If I had known, I ___ you.\"\n    a) would have told\n    b) would tell\n    *Answer: a)*\n\n3.  **What is the first step in the A-B-C-D formula for difficult questions?**\n    a) Convey your answer.\n    b) Acknowledge the question.\n    *Answer: b)*\n\n4.  **Why should you paraphrase a question?**\n    a) To waste time.\n    b) To ensure you understand it correctly and give yourself time to think.\n    *Answer: b)*\n\n5.  **Complete the sentence:** \"If the budget had been bigger, we ___ more staff.\"\n    a) could have hired\n    b) could hire\n    *Answer: a)*"
    },
    "coaching": {
      title: "The Power of \"I Don't Know\"",
      content: "**Title:** The Power of \"I Don't Know\"\n\n**Content:** The most powerful phrase in a Q&A is sometimes, \"That's a great question. I don't have the specific data on that right now, but I will find out and get back to you.\" It is much better to admit you don't know something than to guess and be wrong. It shows honesty, integrity, and a commitment to providing accurate information. It builds credibility, and it turns a potential negative into a positive follow-up opportunity."
    },
  },
  "15.4": {
    "hook": {
      title: "You can have the best slides and the best structure, but if your delivery is flat, your message will fall flat. Your voice, your body language, and your passion are what connect you to your audience. Today, you learn to deliver with impact.",
      content: "**Hook:** You can have the best slides and the best structure, but if your delivery is flat, your message will fall flat. Your voice, your body language, and your passion are what connect you to your audience. Today, you learn to deliver with impact.\n\n**Objective:** By the end of this lesson, you will be able to use techniques for emphasis and inversion to make your delivery more powerful and engaging."
    },
    "video": {
      title: "The Confident Presenter",
      content: "**Title:** The Confident Presenter\n\n**Scenario:** A video shows two versions of the same presenter delivering the same line. The first is monotone and nervous. The second is confident, with strong eye contact, purposeful gestures, and vocal variety. The narrator analyzes the key differences in body language and vocal delivery."
    },
    "strategy": {
      title: "Emphasis & Inversion",
      content: "**Title:** Emphasis & Inversion\n\n**Content:**\n\nThese are advanced grammatical structures used to add emphasis to a particular part of your sentence. They are powerful tools for making a key point.\n\n**Emphasis with \"What\" or \"It\":**\n- Instead of: \"The timeline is the main problem.\"\n- More emphatic: \"**What the main problem is**, is the timeline.\" or \"**It is the timeline that is** the main problem.\"\n\n**Inversion (Formal & Emphatic):**\nThis involves reversing the normal subject-verb order. It is used with negative or limiting adverbs.\n\n| Adverb | Normal Sentence | Inverted Sentence (More Emphatic) |\n|---|---|---|\n| **Not only... but also** | \"He is not only a great leader, but also a skilled mentor.\" | \"**Not only is he** a great leader, but he is also a skilled mentor.\" |\n| **Never before** | \"We have never before faced such a challenge.\" | \"**Never before have we** faced such a challenge.\" |\n| **Under no circumstances** | \"You should not share this information under any circumstances.\" | \"**Under no circumstances should you** share this information.\" |"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Rewrite the following sentences to be more emphatic, using the structures from the table above.\n1.  The most important thing is our commitment to service.\n2.  We have never seen such positive results.\n3.  This project is not only innovative, but also cost-effective.\n\n**Answers:**\n1.  **What is most important is** our commitment to service. / **It is our commitment to service that is** most important.\n2.  **Never before have we** seen such positive results.\n3.  **Not only is this project** innovative, but it is also cost-effective."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Choose one of the emphatic sentences you just wrote. Record yourself delivering it. Practice putting vocal stress on the part you want to emphasize. Use pauses before and after the key phrase to give it more weight."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which sentence is more emphatic?**\n    a) The deadline is the key issue.\n    b) What the key issue is, is the deadline.\n    *Answer: b)*\n\n2.  **Rewrite with inversion:** \"I have rarely seen such a good presentation.\"\n    a) Rarely have I seen such a good presentation.\n    b) Rarely I have seen such a good presentation.\n    *Answer: a)*\n\n3.  **What is the purpose of inversion?**\n    a) To make the sentence more confusing.\n    b) To add emphasis.\n    *Answer: b)*\n\n4.  **Complete the sentence:** \"Not only ___ talented, but she is also a hard worker.\"\n    a) she is\n    b) is she\n    *Answer: b)*\n\n5.  **Which is NOT a key part of impactful delivery?**\n    a) Reading directly from your slides.\n    b) Vocal variety and eye contact.\n    *Answer: a)*"
    },
    "coaching": {
      title: "Practice, Practice, Practice",
      content: "**Title:** Practice, Practice, Practice\n\n**Content:** Nobody is a \"natural\" presenter. Great presenters are made, not born. They practice. They rehearse their presentations out loud, multiple times. They record themselves and watch it back. They know their material so well that they don't need to read their slides. The confidence you see comes from preparation. The only secret to great presenting is practice."
    },
  },
  "16.1": {
    "hook": {
      title: "Persuasion is not about winning an argument; it's about building consensus. It's the art of bringing people to your point of view because they see the logic and the shared benefit. Today, you learn the language of influence.",
      content: "**Hook:** Persuasion is not about winning an argument; it's about building consensus. It's the art of bringing people to your point of view because they see the logic and the shared benefit. Today, you learn the language of influence.\n\n**Objective:** By the end of this lesson, you will be able to use modal verbs for certainty and possibility to frame your arguments persuasively."
    },
    "video": {
      title: "The Persuasive Colleague",
      content: "**Title:** The Persuasive Colleague\n\n**Scenario:** A video shows a team meeting where a manager, Chloe, needs to convince her team to adopt a new software. She doesn't command them; she persuades them. She highlights the benefits, acknowledges their concerns, and uses language that shows both confidence in her proposal and respect for their autonomy."
    },
    "strategy": {
      title: "Modal Verbs for Certainty & Possibility",
      content: "**Title:** Modal Verbs for Certainty & Possibility\n\n**Content:**\n\nThe modal verb you choose shows your level of confidence in your statement. Choosing the right one is key to persuasion.\n\n| Level of Certainty | Modal Verbs | Example |\n|---|---|---|\n| **High (90-100%)** | will, must | \"This **will** improve our efficiency.\" / \"We **must** act now.\" |\n| **Medium (50-90%)** | should, could | \"This **should** solve the problem.\" / \"We **could** see significant savings.\" |\n| **Low (0-50%)** | may, might | \"This **may** be a good option.\" / \"It **might** work.\" |\n\n**Persuasive Strategy:**\n- Use **high-certainty** modals for the benefits of your proposal (\"This **will** save us time.\").\n- Use **medium-certainty** modals to show potential and opportunity (\"We **could** become the leaders in this area.\").\n- Use **low-certainty** modals to acknowledge risks or alternatives in a non-threatening way (\"There **might** be some initial challenges.\")."
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** You want to persuade your manager to approve your request to attend a conference. Write a short email making your case. Use at least one modal verb from each level of certainty (high, medium, and low).\n\n**Example Starter:** \"I am writing to request approval to attend the upcoming conference. I believe this **will** be highly beneficial for our team. I **could** share the key learnings with everyone upon my return. While there **may** be a cost, the potential return on investment is significant.\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself making a 2-minute verbal pitch to your manager based on the email you just wrote. Pay attention to your tone. Use a confident tone for high-certainty modals and a more measured tone for low-certainty modals."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which modal shows the highest certainty?**\n    a) should\n    b) must\n    *Answer: b)*\n\n2.  **Which modal is best for acknowledging a small risk?**\n    a) will\n    b) might\n    *Answer: b)*\n\n3.  **Complete the sentence:** \"If we adopt this plan, we ___ see great results.\"\n    a) should\n    b) may\n    *Answer: a) (shows confident expectation)*\n\n4.  **Which statement is more persuasive?**\n    a) \"This might be a good idea.\"\n    b) \"This will be a game-changer for our team.\"\n    *Answer: b)*\n\n5.  **What is the goal of persuasion?**\n    a) To win an argument at all costs.\n    b) To build consensus and bring people to your point of view.\n    *Answer: b)*"
    },
    "coaching": {
      title: "It's Not About You",
      content: "**Title:** It's Not About You\n\n**Content:** The most persuasive word in the English language is \"you.\" When you are trying to persuade someone, frame your arguments in terms of the benefits to *them*. Don't say, \"*I* want to do this because *I* think it's a good idea.\" Say, \"This will help *you* achieve *your* goals by...\" or \"This will make *your* job easier by...\" Focus on their needs, not your own, and you will be much more persuasive."
    },
  },
  "16.2": {
    "hook": {
      title: "Negotiation is not a battle; it's a dance. It's a structured conversation to find a mutually agreeable solution. The best negotiators don't seek to win; they seek to find the win-win. Today, you learn the steps of this dance.",
      content: "**Hook:** Negotiation is not a battle; it's a dance. It's a structured conversation to find a mutually agreeable solution. The best negotiators don't seek to win; they seek to find the win-win. Today, you learn the steps of this dance.\n\n**Objective:** By the end of this lesson, you will be able to apply a four-step negotiation model and use all four types of conditional sentences to discuss possibilities, options, and outcomes."
    },
    "video": {
      title: "The Win-Win Negotiation",
      content: "**Title:** The Win-Win Negotiation\n\n**Scenario:** A video shows two managers, Mark and Sarah, negotiating over shared resources for their projects. They go through four stages: \n1.  **Preparation:** They come with their data.\n2.  **Opening:** They state their ideal outcomes.\n3.  **Bargaining:** They explore options and make concessions.\n4.  **Closing:** They agree on a solution and confirm the details."
    },
    "strategy": {
      title: "Conditionals Review (0, 1, 2, 3)",
      content: "**Title:** Conditionals Review (0, 1, 2, 3)\n\n**Content:**\n\nConditionals are the language of negotiation. Mastering all four is essential at the B2 level.\n\n| Type | Usage | Structure | Example |\n|---|---|---|---|\n| **Zero** | General truths, facts | `If + present simple, ...present simple` | \"**If** you **heat** water, it **boils**.\" |\n| **First** | Real possibility in the future | `If + present simple, ...will + verb` | \"**If** you **give** us a discount, we **will sign** the contract today.\" |\n| **Second** | Unreal/hypothetical situation in the present or future | `If + past simple, ...would + verb` | \"**If** we **had** a bigger budget, we **would hire** more staff.\" (We don't have a bigger budget.) |\n| **Third** | Unreal/hypothetical situation in the past | `If + past perfect, ...would have + past participle` | \"**If** we **had known** about the problem, we **would have acted** sooner.\" (We didn't know.) |"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** You are negotiating with a vendor for a new software license. They are asking for $10,000. Your budget is $8,000. Write a short paragraph using at least two different conditional types to propose a solution.\n\n**Example Starter:** \"I understand your price is $10,000. **If we had** a budget of $10,000, we **would agree** immediately. Unfortunately, our limit is $8,000. **If you can meet** that price, we **will sign** the agreement this week.\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself making your negotiation pitch from the previous task. Practice a tone that is firm but flexible, and respectful but clear about your limits."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Which conditional talks about a general truth?**\n    a) Zero Conditional\n    b) First Conditional\n    *Answer: a)*\n\n2.  **Which conditional talks about a real future possibility?**\n    a) Second Conditional\n    b) First Conditional\n    *Answer: b)*\n\n3.  **Complete the sentence:** \"If I ___ you, I would take the offer.\"\n    a) was\n    b) were\n    *Answer: b) (subjunctive mood for hypothetical situations)*\n\n4.  **Complete the sentence:** \"If she had studied harder, she ___ the exam.\"\n    a) would pass\n    b) would have passed\n    *Answer: b)*\n\n5.  **What is the goal of a win-win negotiation?**\n    a) To get everything you want.\n    b) To find a mutually agreeable solution.\n    *Answer: b)*"
    },
    "coaching": {
      title: "Know Your BATNA",
      content: "**Title:** Know Your BATNA\n\n**Content:** In negotiation theory, BATNA stands for **B**est **A**lternative **T**o a **N**egotiated **A**greement. It's your walk-away plan. Before you enter any negotiation, you must know what you will do if you can't reach a deal. What is your Plan B? Knowing your BATNA gives you power. If you are not afraid to walk away, you will be a much more confident and effective negotiator."
    },
  },
  "16.3": {
    "hook": {
      title: "On any major project, you have dozens of stakeholders: your boss, your team, other departments, senior management, external partners. Keeping them all informed and on-side is a critical skill. Today, you learn how to report what others have said and manage stakeholder communications effectively.",
      content: "**Hook:** On any major project, you have dozens of stakeholders: your boss, your team, other departments, senior management, external partners. Keeping them all informed and on-side is a critical skill. Today, you learn how to report what others have said and manage stakeholder communications effectively.\n\n**Objective:** By the end of this lesson, you will be able to use advanced reported speech to accurately convey messages from stakeholders and manage complex communications."
    },
    "video": {
      title: "Managing Stakeholders",
      content: "**Title:** Managing Stakeholders\n\n**Scenario:** A video shows a project manager, Jean, giving an update to his Director. He needs to report on a conversation he had with a key stakeholder from another department. He accurately reports what the stakeholder said, including their concerns and their commitments, using reported speech."
    },
    "strategy": {
      title: "Reported Speech (Advanced)",
      content: "**Title:** Reported Speech (Advanced)\n\n**Content:**\n\nReported speech (or indirect speech) is how you report what someone else said. At the B2 level, you need to master the tense changes.\n\n**The Backshift Rule:** When you report what someone said in the past, the verb tense in the reported clause usually moves one step back into the past.\n\n| Direct Speech (What they actually said) | Reported Speech (What you say about it) |\n|---|---|\n| **Present Simple:** \"I **am** happy.\" | **Past Simple:** \"She said that she **was** happy.\" |\n| **Present Continuous:** \"I **am working**.\" | **Past Continuous:** \"He said that he **was working**.\" |\n| **Past Simple:** \"I **finished** it.\" | **Past Perfect:** \"She said that she **had finished** it.\" |\n| **Present Perfect:** \"I **have finished** it.\" | **Past Perfect:** \"He said that he **had finished** it.\" |\n| **will:** \"I **will** help.\" | **would:** \"She said that she **would** help.\" |\n| **can:** \"I **can** do it.\" | **could:** \"He said that he **could** do it.\" |\n\n**Reporting Verbs:** Don't just use \"said.\" Use more descriptive verbs:\n- *She **explained** that...*\n- *He **promised** that...*\n- *They **agreed** that...*\n- *She **warned** that...*"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** Your colleague said the following to you in a meeting: \"I am working on the report, and I will finish it by Friday. I can send you a draft tomorrow.\" Report this message to your manager in an email. Use reported speech and at least two different reporting verbs.\n\n**Example Answer:** \"I spoke with Sarah. She **confirmed** that she **was working** on the report and **promised** that she **would finish** it by Friday. She also **mentioned** that she **could send** me a draft tomorrow.\""
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** Record yourself verbally reporting the message from the previous task to your manager. Focus on clear pronunciation and a confident, informative tone."
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "1.  **Direct Speech:** \"I am busy.\" **Reported Speech:** \"He said he ___ busy.\"\n    a) is\n    b) was\n    *Answer: b)*\n\n2.  **Direct Speech:** \"I will call you.\" **Reported Speech:** \"She said she ___ call me.\"\n    a) will\n    b) would\n    *Answer: b)*\n\n3.  **Direct Speech:** \"I finished the task.\" **Reported Speech:** \"He said he ___ the task.\"\n    a) finished\n    b) had finished\n    *Answer: b)*\n\n4.  **Which reporting verb is best for a promise?**\n    a) said\n    b) promised\n    *Answer: b)*\n\n5.  **What is the \"backshift rule\" in reported speech?**\n    a) The verb tense moves one step forward in time.\n    b) The verb tense moves one step back in time.\n    *Answer: b)*"
    },
    "coaching": {
      title: "No Surprises",
      content: "**Title:** No Surprises\n\n**Content:** The golden rule of stakeholder management is \"no surprises.\" Your boss and your key partners should never be surprised by bad news in a formal meeting. If there is a problem, you need to give them a heads-up in advance. This is called \"pre-briefing.\" It shows respect, gives them time to process the information, and allows you to manage the message. Good stakeholder management is about building trust, and trust is built on open and communication."
    },
  },
  "16.4": {
    "hook": {
      title: "You have reached the end of Path IV. You have the skills to operate at a B2 level. Now, it's time to prove it. Level C of the SLE is the gold standard for bilingualism in the Government of Canada. This lesson is your final preparation to meet that standard.",
      content: "**Hook:** You have reached the end of Path IV. You have the skills to operate at a B2 level. Now, it's time to prove it. Level C of the SLE is the gold standard for bilingualism in the Government of Canada. This lesson is your final preparation to meet that standard.\n\n**Objective:** By the end of this lesson, you will complete a comprehensive review of all B2 grammar and communication skills and complete a full simulation of the SLE Level C oral and written exams."
    },
    "video": {
      title: "The Level C Exam",
      content: "**Title:** The Level C Exam\n\n**Scenario:** A video provides a detailed overview of the SLE Level C exams for Oral Proficiency and Written Expression. It explains the format, the timing, the types of questions, and the criteria for success. It emphasizes that Level C requires not just accuracy, but also nuance, precision, and the ability to handle complex and abstract topics."
    },
    "strategy": {
      title: "Comprehensive B2 Review",
      content: "**Title:** Comprehensive B2 Review\n\n**Content:**\n\nThis lesson consolidates everything you have learned in Path IV. Let's review the key grammar points:\n\n- **Advanced Tenses:** Present Perfect Continuous, Future Perfect, Future Continuous.\n- **Conditionals:** Mastery of all four types (0, 1, 2, 3).\n- **Passive Voice:** For formal, objective writing.\n- **Reported Speech:** Including the \"backshift rule.\"\n- **Advanced Structures:** Inversion and emphasis.\n- **Linking Words:** For cohesion and logical flow.\n- **Modal Verbs:** For certainty, possibility, and persuasion.\n\n**Key Communication Skills:**\n- Leading meetings\n- Writing Briefing Notes and reports\n- Delivering formal presentations\n- Handling difficult Q&A sessions\n- Negotiating and persuading"
    },
    "written": {
      title: "Pratique Écrite / Written Practice (15 min)",
      content: "**Task:** **SLE Written Exam Simulation.**\n\nWrite a 250-word essay on the following topic: \"In your opinion, what is the biggest challenge facing the public service today, and what is one potential solution?\" You have 15 minutes. Focus on clear structure, logical arguments, and correct B2-level grammar."
    },
    "oral": {
      title: "Pratique Orale / Oral Practice (10 min)",
      content: "**Task:** **SLE Oral Exam Simulation.**\n\nRecord yourself giving a 5-minute presentation on the topic from the written exercise. After your presentation, you will be asked two follow-up questions. Answer them clearly and concisely.\n\n1.  \"Could you elaborate on the solution you proposed?\"\n2.  \"If you had unlimited resources, what other solutions would you suggest?\""
    },
    "quiz": {
      title: "Quiz Formatif / Formative Quiz (7 min)",
      content: "This quiz is a rapid-fire review of Path IV grammar.\n\n1.  **Correct the error:** \"Never before I have seen such a result.\"\n    *Answer: \"Never before have I seen...\"*\n\n2.  **Direct Speech:** \"I can help.\" **Reported Speech:** \"He said he ___ help.\"\n    *Answer: could*\n\n3.  **Complete the sentence:** \"If we had known, we ___ differently.\"\n    *Answer: would have acted*\n\n4.  **Which is more formal?** \"We looked into the problem.\" or \"The problem was investigated.\"\n    *Answer: \"The problem was investigated.\"*\n\n5.  **What does BATNA stand for?**\n    *Answer: Best Alternative To a Negotiated Agreement*"
    },
    "coaching": {
      title: "The Journey to C",
      content: "**Title:** The Journey to C\n\n**Content:** Congratulations on completing Path IV. You now have all the tools you need to achieve Level C. The final step is confidence. Believe in your skills. Practice regularly. Read in English, listen to English news, and speak English whenever you have the chance. Level C is not just about passing a test; it's about being able to operate comfortably and effectively in English in any professional situation. You are ready. Good luck!"
    },
  },
  "17.1": {
    "hook": {
      title: "You're a manager. An employee has been underperforming. How do you address this constructively in their performance review without destroying their morale? This is one of the most challenging tasks for any leader.",
      content: "**Hook:** You're a manager. An employee has been underperforming. How do you address this constructively in their performance review without destroying their morale? This is one of the most challenging tasks for any leader.\n\n**Objective:** By the end of this lesson, you will be able to conduct a balanced performance review in English, using perfect modals (should have, could have) to discuss past actions and provide constructive feedback."
    },
    "video": {
      title: "The Performance Review",
      content: "**Title:** The Performance Review\n\n**Scene:** ANNA (Director) is conducting a performance review with MARK (PM-05), a dedicated but struggling employee.\n\n**(Video shows Anna and Mark in a formal meeting room. Anna has a printed document. Mark looks nervous.)**\n\n**Anna:** \"Thanks for coming in, Mark. As you know, today we'll be going over your performance assessment for the past year.\"\n\n**Mark:** \"Of course. I'm a bit nervous, to be honest.\"\n\n**Anna:** \"That's understandable. Let's start with your strengths. Your dedication to the file is unquestionable, and your written work is always top-notch. The team really appreciates your analytical skills.\"\n\n**Mark:** \"Thank you. I do try my best.\"\n\n**Anna:** \"Now, let's talk about some areas for development. On the Q4 project, there were some significant delays. We **should have had** a clearer project plan from the start. You **could have flagged** the resource issues earlier. What are your thoughts on that?\"\n\n**Mark:** \"I agree. I was overwhelmed and I **should have asked** for help. I thought I could handle it on my own.\"\n\n**Anna:** \"I appreciate that honesty. We **could have avoided** the last-minute rush if we had communicated better. For next year, let's set a clear development goal around project management and proactive communication. I've already approved you for the CSPS project management course.\"\n\n**Mark:** \"Wow, thank you. That's great.\"\n\n**Anna:** \"You have the potential to be an excellent team lead, Mark. Let's work together to build those skills. Overall, you've met expectations, with a clear plan to exceed them next year.\"\n\n**(Video ends with Mark looking relieved and motivated.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Perfect Modals for Constructive Feedback\n\nPerfect modals are essential for discussing past actions and missed opportunities without sounding accusatory. They are crucial for performance reviews.\n\n**Structure:**\n`modal verb (should, could, would) + have + past participle`\n\n**1. Should have + past participle:**\n- **Use:** To talk about a past mistake or regret; a better action was advisable.\n- **Meaning:** *Il aurait fallu / On aurait dû...*\n- **Example:** \"We **should have started** earlier.\" (We didn't, and that was a mistake.)\n- **Example:** \"You **should have told** me.\" (You didn't, and I wish you had.)\n\n**2. Could have + past participle:**\n- **Use:** To talk about a past possibility that didn't happen.\n- **Meaning:** *On aurait pu...*\n- **Example:** \"We **could have finished** on time.\" (It was possible, but we didn't.)\n- **Example:** \"You **could have asked** for an extension.\" (This was an option you didn't take.)\n\n**3. Would have + past participle:**\n- **Use:** To talk about an imagined past result (often part of the 3rd conditional).\n- **Meaning:** *On aurait...*\n- **Example:** \"If we had started earlier, we **would have finished** on time.\"\n\n**Key for Feedback:**\n- Use \"**We** should have...\" to create a sense of shared responsibility.\n- Use \"You **could have**...\" to suggest alternative actions the employee might have taken, which is softer than \"You should have...\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are a manager. Your employee, Sarah, missed a critical deadline for a briefing note. She is a strong writer but struggles with time management. Write a paragraph for her performance review using at least three perfect modals (should have, could have, would have) to address the situation constructively.\n\n**Example Starter:**\n\"Regarding the Q3 briefing note, while the final quality was excellent, the missed deadline created significant pressure on the team. Looking back, we **should have...**\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself conducting a 3-minute performance review opening. You are speaking to an employee who is excellent at stakeholder relations but needs to improve their written briefing skills. Use the script you prepared in the previous slot as a model. Be sure to balance positive and constructive feedback.\n\n**Instructions:**\n1. Start by acknowledging the employee's strengths.\n2. Gently introduce the area for development.\n3. Use at least two perfect modals to discuss a past situation (e.g., a poorly written report).\n4. End on a positive, forward-looking note."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence is grammatically correct?\n(a) We should have plan better.\n(b) We should had planned better.\n(c) We should have planned better.\n(d) We should of planned better.\n\n**Question 2:** \"You could have told me\" implies:\n(a) It was a mistake not to tell me.\n(b) It was an option to tell me.\n(c) You will tell me in the future.\n(d) I am angry that you didn't tell me.\n\n**Question 3:** To create shared responsibility, it's best to say:\n(a) \"You should have...\"\n(b) \"We should have...\"\n(c) \"They should have...\"\n(d) \"I should have...\"\n\n**Question 4:** Complete the sentence: \"If I had known, I ___ helped.\"\n(a) would\n(b) would have\n(c) should have\n(d) could\n\n**Question 5:** \"Should have\" is used to express:\n(a) A past possibility\n(b) A future obligation\n(c) A past regret or mistake\n(d) A present ability"
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**The Manager's Mindset:** As a leader in the public service, your role is not just to evaluate, but to develop. Every piece of feedback is an investment in your team's future and the organization's capacity. When you switch to English, it's easy to become direct and lose nuance. Remember that your tone and framing matter as much as your words. The goal of a performance review isn't to win an argument; it's to build a stronger, more capable employee. Frame your feedback as a shared goal, and you will build a loyal, high-performing team.\n\n---\n*Answers: 1(c), 2(b), 3(b), 4(b), 5(c)*"
    },
  },
  "17.2": {
    "hook": {
      title: "You see a talented junior analyst who has the potential to become a leader, but they lack confidence. How do you guide them without giving them all the answers? That is the art of mentoring and coaching.",
      content: "**Hook:** You see a talented junior analyst who has the potential to become a leader, but they lack confidence. How do you guide them without giving them all the answers? That is the art of mentoring and coaching.\n\n**Objective:** By the end of this lesson, you will be able to structure a mentoring conversation in English and use advanced reported speech to summarize and reflect on discussions."
    },
    "video": {
      title: "The Mentoring Session",
      content: "**Title:** The Mentoring Session\n\n**Scene:** DAVID (EX-01) is having a mentoring session with CHLOE (EC-04), a bright analyst who is unsure about her next career move.\n\n**(Video shows David and Chloe in a more relaxed office setting, with coffee.)**\n\n**David:** \"So, Chloe, you mentioned you were feeling a bit stuck. Tell me more about that.\"\n\n**Chloe:** \"Well, I enjoy my work, but I don't see a clear path forward. I see my colleagues applying for manager positions, but I don't feel ready.\"\n\n**David:** \"That's a very common feeling. Let me ask you this: what would success look like for you in two years?\"\n\n**Chloe:** \"I'm not sure. I guess I'd like to have more leadership opportunities.\"\n\n**David:** \"Okay. And what's holding you back from seeking those opportunities now?\"\n\n**Chloe:** \"I think it's my confidence in English. In meetings, I have ideas, but I hesitate.\"\n\n**David:** \"I see. So, you're **suggesting that improving your language confidence is key** to your career progression. Last week, you **mentioned having considered** the advanced language training. What happened with that?\"\n\n**Chloe:** \"I looked into it, but I felt I was too busy.\"\n\n**David:** \"I understand. How might you approach this differently to make it a priority? What's one small step you could take this week?\"\n\n**Chloe:** \"I could schedule a meeting with my manager to discuss it. He **denied being aware** of my interest before, so it's on me to raise it.\"\n\n**David:** \"That sounds like an excellent first step. Let's touch base next month and see how it went.\"\n\n**(Video ends with Chloe looking more confident and determined.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Advanced Reported Speech\n\nAs a leader, you often need to report on conversations. Using sophisticated reporting verbs and structures shows a high level of language mastery.\n\n**Structure:**\n`Reporting Verb + Gerund (-ing)` or `Reporting Verb + Preposition + Gerund`\n\n**1. Verbs followed by a Gerund:**\n- **admit, deny, mention, recall, regret, suggest**\n- **Example:** \"He **admitted making** a mistake.\" (NOT: He admitted to make...)\n- **Example:** \"She **suggested taking** a different approach.\" (NOT: She suggested to take...)\n- **Example:** \"He **denied being** involved.\"\n\n**2. Verbs followed by Preposition + Gerund:**\n- **apologize for, complain about, insist on, talk about**\n- **Example:** \"He **apologized for being** late.\"\n- **Example:** \"They **insisted on following** the original plan.\"\n\n**3. Verbs followed by Object + Preposition + Gerund:**\n- **accuse (of), blame (for), congratulate (on), thank (for)**\n- **Example:** \"She **accused him of hiding** the information.\"\n- **Example:** \"I **congratulated her on getting** the promotion.\"\n\n**Why use this?** It's more concise and elegant than using \"that\" clauses. Compare:\n- \"He said that he made a mistake.\" (Good)\n- \"He **admitted making** a mistake.\" (Better - C1 Level)"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You just had a mentoring session with a junior employee named Alex. Alex is frustrated with his workload. He said: \"I feel like I'm drowning. My manager keeps giving me more tasks. I complained to her, but she didn't listen. I regret not speaking up earlier.\" \n\nWrite a short summary of the conversation for your own notes, using at least three advanced reported speech structures.\n\n**Example Starter:**\n\"In our session, Alex **mentioned feeling** overwhelmed by his workload...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are in a meeting with your director. She asks you about your mentoring session with Alex. Record yourself giving her a 2-minute verbal update. Use the summary you wrote in the previous slot as a basis.\n\n**Instructions:**\n1. Start by summarizing the main issue.\n2. Use at least two different advanced reported speech structures to convey what Alex said.\n3. Conclude with the next steps you and Alex agreed upon."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence is correct?\n(a) He suggested to leave.\n(b) He suggested leaving.\n(c) He suggested that to leave.\n(d) He suggested for leaving.\n\n**Question 2:** Choose the best C1-level sentence.\n(a) She said she was sorry for being late.\n(b) She apologized that she was late.\n(c) She apologized for being late.\n(d) She was sorry and late.\n\n**Question 3:** \"He denied ___ the document.\"\n(a) to see\n(b) seeing\n(c) that he saw\n(d) have seen\n\n**Question 4:** \"I congratulated him ___ the promotion.\"\n(a) for getting\n(b) on getting\n(c) to get\n(d) about getting\n\n**Question 5:** \"She insisted ___ the bill.\"\n(a) on paying\n(b) to pay\n(c) for paying\n(d) paying"
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Leading by Example:** As you advance in your career, your ability to develop others becomes as important as your own skills. Mentoring is a core leadership competency in the public service. By mastering the language of coaching—asking powerful questions, listening actively, and summarizing effectively—you not only help others grow, but you also signal your own readiness for senior roles. Your bilingualism is a superpower here; being able to coach and mentor in both official languages makes you an invaluable asset to the organization.\n\n---\n*Answers: 1(b), 2(c), 3(b), 4(b), 5(a)*"
    },
  },
  "17.3": {
    "hook": {
      title: "An employee on your team has a conflict with a colleague, and it's affecting the whole team's morale. You have to intervene. How do you address the issue without making it worse? This requires diplomatic and carefully chosen language.",
      content: "**Hook:** An employee on your team has a conflict with a colleague, and it's affecting the whole team's morale. You have to intervene. How do you address the issue without making it worse? This requires diplomatic and carefully chosen language.\n\n**Objective:** By the end of this lesson, you will be able to plan and conduct a difficult conversation in English, using hedging and softening language to maintain a constructive tone."
    },
    "video": {
      title: "The Difficult Conversation",
      content: "**Title:** The Difficult Conversation\n\n**Scene:** ANNA (Director) is mediating a conflict between two team members, LIAM and SOPHIE.\n\n**(Video shows Anna, Liam, and Sophie in a meeting room. The atmosphere is tense.)**\n\n**Anna:** \"Thank you both for coming. I wanted to talk about the project handover. **It seems that there was** some miscommunication, and I want to make sure we're all on the same page.\"\n\n**Liam:** \"She didn't give me the files on time!\"\n\n**Sophie:** \"You didn't ask for them until the last minute!\"\n\n**Anna:** \"Okay, let's pause. My goal here is to find a solution, not to place blame. Liam, **I was wondering if you could** walk me through your perspective on the timeline. Sophie, **it might be worth considering** how we can make the handover process clearer in the future. **There appears to be** a gap in our process.\"\n\n**Sophie:** \"I suppose I could have sent a reminder email.\"\n\n**Liam:** \"And I could have checked in earlier. **It seems like** we both made some assumptions.\"\n\n**Anna:** \"Exactly. It's a process issue. So, what's one thing we can agree on to improve this for next time? Perhaps a shared checklist?\"\n\n**(Video ends with Liam and Sophie starting to discuss a solution, the tension easing.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Hedging & Softening Language\n\nHedging is the use of cautious or vague language to make your statements less direct or assertive. It is absolutely critical for difficult conversations and diplomatic communication.\n\n**1. Using Tentative Verbs & Phrases:**\n- Instead of: \"There is a problem.\" (Direct)\n- Use: \"**It seems that** there is a problem.\" / \"**There appears to be** a problem.\" (Softer)\n- Instead of: \"You are wrong.\"\n- Use: \"**I think there might be** a misunderstanding.\" / \"**I see it a bit differently.**\"\n\n**2. Using Modal Verbs:**\n- Instead of: \"We need to change this.\" (Assertive)\n- Use: \"We **could** consider changing this.\" / \"It **might** be a good idea to change this.\" (Suggestive)\n\n**3. Using Introductory Phrases:**\n- \"**I was wondering if** we could discuss...\"\n- \"**I may be wrong, but** it looks like...\"\n- \"**Correct me if I'm wrong, but**...\"\n\n**4. Using Adverbs:**\n- \"This is **slightly** concerning.\"\n- \"The results are **somewhat** unexpected.\"\n\n**The Golden Rule:** Address the **situation**, not the **person**. \n- Instead of: \"You made a mistake.\"\n- Use: \"**It seems there was** a mistake in the calculation.\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You need to talk to a colleague who has been speaking loudly on their phone, disturbing the team. Write a script for how you would open this difficult conversation. Use at least three different hedging or softening techniques.\n\n**Example Starter:**\n\"Hi Mark, do you have a minute? **I was wondering if I could** talk to you about something...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself having the difficult conversation from the previous slot. Imagine you are speaking to Mark. Your goal is to have him lower his voice on the phone without creating conflict.\n\n**Instructions:**\n1. Use a calm and friendly tone.\n2. Use the hedging language from your script.\n3. Focus on the impact on the team (the situation), not on him personally.\n4. Propose a solution collaboratively (e.g., \"Perhaps you could use the quiet room for calls?\")."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence is the most diplomatic?\n(a) You're late again.\n(b) It seems you're having trouble with punctuality.\n(c) You must be on time.\n(d) Why are you always late?\n\n**Question 2:** \"It might be worth considering...\" is a way to:\n(a) Give a strong command.\n(b) Express uncertainty.\n(c) Make a soft suggestion.\n(d) Ask a question.\n\n**Question 3:** Which phrase is NOT a hedging phrase?\n(a) There appears to be...\n(b) Without a doubt...\n(c) It seems like...\n(d) I was wondering if...\n\n**Question 4:** To soften a statement, you can change \"This is a problem\" to:\n(a) \"This is a huge problem.\"\n(b) \"This could be a bit of a problem.\"\n(c) \"This is your problem.\"\n(d) \"This is the problem.\"\n\n**Question 5:** The goal of hedging in a difficult conversation is to:\n(a) Avoid the problem.\n(b) Sound more intelligent.\n(c) Reduce conflict and defensiveness.\n(d) Confuse the other person."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Courage in Communication:** Having difficult conversations is a sign of a healthy team and a courageous leader. Avoiding them leads to resentment and decreased performance. As a non-native speaker, you might feel you lack the precise words to be diplomatic. That's why mastering hedging is so important. It gives you a toolkit to be both clear and kind. Remember, your objective is not to be right, but to get it right. Focus on a positive outcome for the team, and you will find the right words.\n\n---\n*Answers: 1(b), 2(c), 3(b), 4(b), 5(c)*"
    },
  },
  "17.4": {
    "hook": {
      title: "Your team has just finished a long, difficult project. Morale is low. How do you re-energize them and get them ready for the next challenge? A leader's words can be a powerful motivator.",
      content: "**Hook:** Your team has just finished a long, difficult project. Morale is low. How do you re-energize them and get them ready for the next challenge? A leader's words can be a powerful motivator.\n\n**Objective:** By the end of this lesson, you will be able to write and deliver a motivational message in English, using leadership idioms to inspire your team."
    },
    "video": {
      title: "Inspiring Your Team",
      content: "**Title:** Inspiring Your Team\n\n**Scene:** DAVID (EX-01) is addressing his team after a tough quarter.\n\n**(Video shows David standing in front of his team in a common area.)**\n\n**David:** \"Team, I want to thank you all for your incredible work on the Phoenix project. It was a marathon, not a sprint, and you all **stepped up to the plate**. We faced some major hurdles, but we didn't give up. We need to **think outside the box** to solve the next set of challenges.\"\n\n**(He gestures to a chart showing project completion.)**\n\n**David:** \"Because of your efforts, we **moved the needle** on our department's key performance indicator. We have **raised the bar** for what our team can accomplish. I want you all to take a well-deserved break, recharge, and come back ready to **hit the ground running** on Monday. I have full confidence that we can build on this success. Let's get on board with the new priorities.\"\n\n**(Video ends with the team applauding, looking re-energized.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Idiomatic Expressions for Leadership\n\nIdioms are common in North American business culture, especially in leadership contexts. Using them correctly makes you sound more natural and authoritative.\n\n**1. Step up to the plate:**\n- **Meaning:** To take responsibility; to accept a challenge.\n- **Example:** \"When the project manager left, Sarah **stepped up to the plate** and took over.\"\n\n**2. Think outside the box:**\n- **Meaning:** To think creatively and unconventionally.\n- **Example:** \"We can't solve this with the old methods. We need to **think outside the box**.\"\n\n**3. Move the needle:**\n- **Meaning:** To make a noticeable difference; to have a tangible impact.\n- **Example:** \"Our efforts are not **moving the needle** on public perception. We need a new strategy.\"\n\n**4. Raise the bar:**\n- **Meaning:** To set a higher standard.\n- **Example:** \"This report is excellent. You have **raised the bar** for the whole team.\"\n\n**5. Hit the ground running:**\n- **Meaning:** To start something with speed and enthusiasm.\n- **Example:** \"Our new employee has a lot of experience, so she should be able to **hit the ground running**.\"\n\n**6. Get on board:**\n- **Meaning:** To agree with and support a plan or idea.\n- **Example:** \"We need to get the entire team **on board** with this new approach.\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Your team is about to start a new, ambitious project. Write a short, motivational email (2-3 paragraphs) to kick things off. Use at least three of the leadership idioms from this lesson.\n\n**Example Starter:**\n\"Team, as we launch the 2025 Modernization Initiative today, I want to set the tone for the important work ahead. This project will require us to **think outside the box**...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself delivering a 3-minute motivational speech to your team. Imagine you are kicking off a new project. Use the email you wrote as a script, but adapt it for spoken delivery.\n\n**Instructions:**\n1. Use an energetic and positive tone.\n2. Make eye contact with your imaginary audience.\n3. Use gestures to emphasize your points.\n4. Speak clearly and with conviction."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** What does \"move the needle\" mean?\n(a) To sew something.\n(b) To make a significant impact.\n(c) To change the time.\n(d) To play a record.\n\n**Question 2:** If you \"raise the bar,\" you are:\n(a) Setting a higher standard.\n(b) Going for a drink.\n(c) Lifting something heavy.\n(d) Asking a question.\n\n**Question 3:** \"We need to get everyone on board.\" This means:\n(a) We need everyone to get on a boat.\n(b) We need everyone to agree and support the plan.\n(c) We need to hire more people.\n(d) We need to write on a board.\n\n**Question 4:** To \"think outside the box\" is to think:\n(a) Creatively.\n(b) Logically.\n(c) Carefully.\n(d) About packaging.\n\n**Question 5:** A new hire who can \"hit the ground running\" is someone who:\n(a) Is a good athlete.\n(b) Can start working effectively immediately.\n(c) Trips and falls.\n(d) Is very enthusiastic but unskilled."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Authentic Leadership:** Some non-native speakers worry that using idioms will make them sound unnatural or even foolish. The key is to start with idioms that you genuinely understand and that fit your personality. Don't force them. The goal is not to sound like a walking cliché, but to connect with your team using the shared language of the North American workplace. Your leadership is authentic when your words align with your actions. Use these phrases to reinforce the positive actions you are already taking as a leader.\n\n---\n*Answers: 1(b), 2(a), 3(b), 4(a), 5(b)*"
    },
  },
  "18.1": {
    "hook": {
      title: "You have two minutes in an elevator with your Director General (DG). This is your one chance to get their buy-in on a critical project. What do you say? Briefing senior executives is a specialized skill.",
      content: "**Hook:** You have two minutes in an elevator with your Director General (DG). This is your one chance to get their buy-in on a critical project. What do you say? Briefing senior executives is a specialized skill.\n\n**Objective:** By the end of this lesson, you will be able to structure and deliver a concise briefing for a senior executive in English, using the subjunctive mood for formal recommendations."
    },
    "video": {
      title: "The Elevator Briefing",
      content: "**Title:** The Elevator Briefing\n\n**Scene:** ANNA (Director) catches her DG, MR. HASSAN, in the elevator.\n\n**(Video shows Anna getting into an elevator. Mr. Hassan is already inside, looking at his phone.)**\n\n**Anna:** \"Good morning, Mr. Hassan.\"\n\n**Mr. Hassan:** \"Anna. Good morning. I only have a minute.\"\n\n**Anna:** \"Of course. I wanted to give you a quick update on the data-sharing initiative. The bottom line is that we have a major risk of delay due to legal bottlenecks. The ask is for your support to prioritize the legal review. **It is recommended that the committee review** the file at its next meeting. I **suggest that you be briefed** by the legal team directly.\"\n\n**Mr. Hassan:** (Looks up from his phone, interested) \"A delay? By how much?\"\n\n**Anna:** \"Six months, potentially. This impacts our Treasury Board submission. **It is crucial that we act** now.\"\n\n**Mr. Hassan:** \"I see. Send me a one-page summary. My office will schedule a 15-minute call for this afternoon. Good work flagging this.\"\n\n**(The elevator doors open. Mr. Hassan exits. Anna looks relieved and successful.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** The Subjunctive for Formal Recommendations\n\nThe subjunctive is a specific verb mood used in formal English to express recommendations, suggestions, or demands. It is very common in Government of Canada formal writing (like Briefing Notes).\n\n**Structure:**\n`It is + adjective + that + subject + base verb (infinitive without 'to')`\n\n**Common Adjectives:**\n- **crucial, essential, imperative, important, recommended, vital**\n\n**Examples:**\n- \"It is **essential that he attend** the meeting.\" (NOT: ...that he attends...)\n- \"It is **recommended that the committee review** the document.\" (NOT: ...reviews...)\n- \"It is **vital that we be** prepared.\" (NOT: ...that we are...)\n\n**Structure with Verbs of Suggestion:**\n`suggest/propose/request/demand + that + subject + base verb`\n\n**Examples:**\n- \"I **suggest that she lead** the project.\" (NOT: ...that she leads...)\n- \"They **requested that he provide** an update.\"\n\n**Passive Subjunctive:**\n`that + subject + be + past participle`\n- \"I **suggest that you be briefed** by the legal team.\"\n- \"It is **recommended that the report be finalized** by Friday.\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are writing a formal recommendation section for a Briefing Note to your DG. The issue is a lack of resources for a key project. You need to recommend that (1) the project be given priority and (2) the finance committee approve additional funding. Write two sentences using the subjunctive mood.\n\n**Example Starter:**\n\"Based on the analysis above, the following recommendations are proposed:\n1. It is **crucial that...**\n2. We **request that...**\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You have 2 minutes to brief your DG on the resource issue from the previous slot. Record yourself delivering a concise \"elevator briefing.\"\n\n**Instructions:**\n1. State the issue clearly (the \"bottom line\").\n2. State your recommendation (the \"ask\").\n3. Use at least one subjunctive phrase in your recommendation.\n4. Be prepared for a follow-up question."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence is correct?\n(a) It is vital that she is here.\n(b) It is vital that she be here.\n(c) It is vital that she was here.\n(d) It is vital for she to be here.\n\n**Question 2:** \"I suggest that he ___ the team.\"\n(a) joins\n(b) join\n(c) will join\n(d) joined\n\n**Question 3:** Which sentence uses the passive subjunctive correctly?\n(a) It is recommended that the plan is approved.\n(b) It is recommended that the plan be approved.\n(c) It is recommended for the plan to be approved.\n(d) It is recommended that the plan will be approved.\n\n**Question 4:** The subjunctive is used to express:\n(a) Facts\n(b) Past events\n(c) Recommendations, suggestions, or demands\n(d) Personal opinions\n\n**Question 5:** \"The ask is...\" is executive language for:\n(a) \"I have a question.\"\n(b) \"This is what I need from you.\"\n(c) \"Please ask me anything.\"\n(d) \"The question is...\""
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Thinking Like an Executive:** Senior leaders are incredibly busy. They don’t have time for long stories. They think in terms of issues, risks, and decisions. When you communicate with them, get straight to the point. This is often called the \"bottom line up front\" (BLUF) approach. What is the issue? What is the impact? What do you need from me? Mastering this direct, concise communication style—and the formal grammar like the subjunctive that goes with it—is a key sign that you are ready for more senior responsibilities.\n\n---\n*Answers: 1(b), 2(b), 3(b), 4(c), 5(b)*"
    },
  },
  "18.2": {
    "hook": {
      title: "You are in a meeting with people from Finance, HR, and IT. They all speak a different \"language\" and have different priorities. How do you get them all to agree on a common path forward? This is the challenge of interdepartmental collaboration.",
      content: "**Hook:** You are in a meeting with people from Finance, HR, and IT. They all speak a different \"language\" and have different priorities. How do you get them all to agree on a common path forward? This is the challenge of interdepartmental collaboration.\n\n**Objective:** By the end of this lesson, you will be able to participate effectively in a cross-departmental meeting in English, using cleft sentences to add emphasis to your key points."
    },
    "video": {
      title: "The Interdepartmental Committee",
      content: "**Title:** The Interdepartmental Committee\n\n**Scene:** ANNA (Director, Policy) is in a meeting with representatives from IT and Communications.\n\n**(Video shows Anna at a boardroom table with two other people.)**\n\n**IT Rep:** \"...so from a technical standpoint, we can't launch the new portal until Q3. The security protocols aren't ready.\"\n\n**Comms Rep:** \"But we have a public announcement scheduled for Q2! We can't delay it.\"\n\n**Anna:** \"Okay, let's find a way forward. We all agree that the launch is the priority. **What we need to focus on** is managing the risk. **It's the security issue that's the real blocker**, not the technology itself. **What I'm proposing is** a phased launch. We can launch the informational pages in Q2 and the interactive portal in Q3.\"\n\n**Comms Rep:** \"That could work. We can announce the full launch is coming in Q3.\"\n\n**IT Rep:** \"A phased approach is feasible. **It's the 'big bang' launch that's too risky.**\"\n\n**Anna:** \"Excellent. So we have a path forward. **It's this kind of collaboration that will make this project a success.**\"\n\n**(Video ends with the group agreeing on the new plan.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Cleft Sentences for Emphasis\n\nCleft sentences (phrases clivées) are used to emphasize a particular part of a sentence. They are very common in spoken English to make a point clear, especially in discussions and debates.\n\n**1. 'What' Clefts:**\n- **Structure:** `What-clause + be + emphasized information`\n- **Use:** To emphasize an action or a thing.\n- **Normal:** \"We need to focus on the user experience.\"\n- **Cleft:** \"**What we need to focus on is** the user experience.\"\n- **Normal:** \"I'm proposing a new timeline.\"\n- **Cleft:** \"**What I'm proposing is** a new timeline.\"\n\n**2. 'It' Clefts:**\n- **Structure:** `It + be + emphasized information + that/who-clause`\n- **Use:** To emphasize the subject or object of a sentence.\n- **Normal:** \"The legal opinion is blocking the project.\"\n- **Cleft:** \"**It's the legal opinion that's** blocking the project.\"\n- **Normal:** \"We need to convince the director.\"\n- **Cleft:** \"**It's the director who** we need to convince.\"\n\n**Why use them?**\n- They signal to the listener: \"This is the most important part of what I'm saying.\"\n- They allow you to control the flow of the conversation and bring the focus back to your key point.\n- They make you sound more persuasive and articulate."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are in a meeting. Your colleague says: \"We should focus on cutting costs because the budget is the main problem.\" You disagree. You think the main problem is the inefficient process. Rewrite this idea into two separate, emphatic sentences using one 'what' cleft and one 'it' cleft.\n\n**Example Sentences to Transform:**\n1. \"We need to improve our workflow.\"\n2. \"The outdated software is causing the delays.\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself making a 2-minute intervention in a meeting. Imagine your colleagues are focused on the budget. You want to shift the focus to the inefficient process.\n\n**Instructions:**\n1. Acknowledge their point (e.g., \"I understand the budget is a concern...\").\n2. Use a 'what' cleft to state what you think the focus should be.\n3. Use an 'it' cleft to identify the real source of the problem.\n4. Propose a next step."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence correctly emphasizes \"the deadline\"?\n(a) It's the deadline that we need to respect.\n(b) What we need to respect is the deadline.\n(c) Both (a) and (b).\n(d) The deadline is what we need to respect it.\n\n**Question 2:** Transform \"We need a clear communication plan.\" into a 'what' cleft.\n(a) What we need is a clear communication plan.\n(b) It's a clear communication plan that we need.\n(c) A clear communication plan is what we need.\n(d) We need what is a clear communication plan.\n\n**Question 3:** Transform \"The minister made the final decision.\" into an 'it' cleft.\n(a) What the minister made was the final decision.\n(b) It's the final decision that the minister made.\n(c) It was the minister who made the final decision.\n(d) The final decision was made by the minister it was.\n\n**Question 4:** Cleft sentences are primarily used to:\n(a) Ask questions.\n(b) Add emphasis.\n(c) Make sentences longer.\n(d) Express doubt.\n\n**Question 5:** \"What I'm saying is...\" is used to:\n(a) Repeat yourself.\n(b) Clarify and emphasize your main point.\n(c) Ask for an opinion.\n(d) End the conversation."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Finding Common Ground:** In the Government of Canada, almost every significant project is interdepartmental. Your success depends on your ability to build consensus among people with different mandates and priorities. Your language can either build bridges or walls. Cleft sentences are a powerful tool for bridging. They allow you to acknowledge one point (\"It's true that the budget is tight...\") while gently redirecting to another (\"...but what we really need to address is the underlying process.\"). This shows you are listening, but it also allows you to lead the conversation towards a solution.\n\n---\n*Answers: 1(c), 2(a), 3(c), 4(b), 5(b)*"
    },
  },
  "18.3": {
    "hook": {
      title: "You're presenting your project to Treasury Board Secretariat (TBS). They have the power to approve or reject your funding. How do you speak their language and anticipate their questions? This is the high-stakes world of central agency relations.",
      content: "**Hook:** You're presenting your project to Treasury Board Secretariat (TBS). They have the power to approve or reject your funding. How do you speak their language and anticipate their questions? This is the high-stakes world of central agency relations.\n\n**Objective:** By the end of this lesson, you will understand the role of central agencies and be able to use inversion for emphasis in formal presentations and briefings."
    },
    "video": {
      title: "The TBS Briefing",
      content: "**Title:** The TBS Briefing\n\n**Scene:** DAVID (EX-01) is presenting his department's funding proposal to a TBS analyst.\n\n**(Video shows David in a formal presentation setting. The TBS analyst is listening intently.)**\n\n**David:** \"...and so, our proposal directly aligns with the government's key priorities on digital transformation. **Not only will this project** modernize our service delivery, **but it will also** generate significant long-term savings. **Under no circumstances can we** afford to continue with our outdated legacy systems. **Rarely have we had** such a clear business case for investment.\"\n\n**TBS Analyst:** \"Your business case is strong, David. But what about the risks?\"\n\n**David:** \"An excellent question. **Nowhere in the proposal do we** underestimate the implementation risks. On page 15, you will find a detailed risk mitigation strategy. **So compelling is the need** for this investment that we have already secured buy-in from three partner departments.\"\n\n**(Video ends with the TBS analyst nodding, looking convinced.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Inversion for Emphasis\n\nInversion means changing the normal word order of a sentence, usually by putting an adverbial phrase at the beginning. This is a sophisticated technique used in formal English to create strong emphasis.\n\n**Structure:**\n`Negative or Limiting Adverbial + Auxiliary Verb + Subject + Main Verb`\n\n**1. With 'Not only... but also':**\n- **Normal:** \"This project will not only save money, but it will also improve service.\"\n- **Inversion:** \"**Not only will this project** save money, **but it will also** improve service.\"\n\n**2. With Negative Adverbials:**\n- **Under no circumstances:** \"**Under no circumstances can we** accept this risk.\" (Instead of: We can under no circumstances...)\n- **Never before:** \"**Never before have we** faced such a challenge.\"\n- **Rarely:** \"**Rarely do we see** such a clear-cut case.\"\n- **Nowhere:** \"**Nowhere in the document does it** mention the costs.\"\n\n**3. With 'So + Adjective... that':**\n- **Normal:** \"The need is so compelling that we must act now.\"\n- **Inversion:** \"**So compelling is the need** that we must act now.\"\n\n**Why use it?**\n- It adds a dramatic, formal, and persuasive flair to your language.\n- It signals that you are making a very strong point.\n- It is highly effective in formal speeches, presentations, and written arguments."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are preparing speaking notes for a presentation to the Privy Council Office (PCO). You want to emphasize two points:\n1. Your initiative is not only innovative, but it also aligns perfectly with the Speech from the Throne.\n2. You believe that under no circumstances should the government miss this opportunity.\n\nRewrite these two points using inversion for emphasis."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself delivering the two emphatic points from the previous slot. Imagine you are in a high-stakes meeting with central agency analysts.\n\n**Instructions:**\n1. Speak slowly and deliberately.\n2. Pause slightly after the inverted phrase to add to the dramatic effect.\n3. Use a confident and authoritative tone."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence uses inversion correctly?\n(a) Not only this project will save money...\n(b) Not only will this project save money...\n(c) Not only this project saves money...\n(d) Not only money will this project save...\n\n**Question 2:** \"Under no circumstances ___ leave the room.\"\n(a) you should\n(b) should you\n(c) you can\n(d) can you\n\n**Question 3:** Choose the most emphatic sentence.\n(a) We have rarely seen such a success.\n(b) Rarely we have seen such a success.\n(c) Rarely have we seen such a success.\n(d) We have seen rarely such a success.\n\n**Question 4:** \"So important was the issue that...\" is an inversion of:\n(a) The issue was so important that...\n(b) So the issue was important that...\n(c) The important issue was so that...\n(d) That the issue was so important...\n\n**Question 5:** Inversion is typically used in:\n(a) Informal conversations.\n(b) Formal and persuasive contexts.\n(c) Asking simple questions.\n(d) Text messages."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Speaking the Language of Power:** Central agencies like TBS, PCO, and Finance Canada are the nerve centre of the government. They have their own culture and their own way of speaking—formal, analytical, and evidence-based. When you engage with them, you need to speak their language. Mastering sophisticated grammatical structures like inversion does more than just make you sound smart; it signals that you understand the rules of the game. It shows that you belong in the room where the big decisions are made.\n\n---\n*Answers: 1(b), 2(b), 3(c), 4(a), 5(b)*"
    },
  },
  "18.4": {
    "hook": {
      title: "Your department can't achieve its mandate alone. You need to partner with another department, or even a private sector company. How do you negotiate a partnership that benefits everyone? This requires strategic thinking and complex negotiation skills.",
      content: "**Hook:** Your department can't achieve its mandate alone. You need to partner with another department, or even a private sector company. How do you negotiate a partnership that benefits everyone? This requires strategic thinking and complex negotiation skills.\n\n**Objective:** By the end of this lesson, you will be able to discuss hypothetical partnership scenarios in English, using mixed conditionals to explore past actions and their present consequences."
    },
    "video": {
      title: "The Partnership Negotiation",
      content: "**Title:** The Partnership Negotiation\n\n**Scene:** ANNA (Director) is in a meeting with a potential partner from another government department.\n\n**(Video shows Anna at a table with another Director.)**\n\n**Anna:** \"Thank you for meeting with me. I believe a partnership between our departments on the digital identity file could be very powerful.\"\n\n**Other Director:** \"I agree in principle, Anna. But we have limited resources. We invested heavily in our own platform last year.\"\n\n**Anna:** \"I understand. **If you hadn't invested in that platform, we would be having a very different conversation** today. But that decision is in the past. The reality is, your platform is strong on identity verification, and ours is strong on user experience. **If we had combined our expertise from the start, we would have a market-leading solution by now.**\"\n\n**Other Director:** \"That's true. Hindsight is 20/20.\"\n\n**Anna:** \"It is. But we can still create a win-win. **If we were to integrate our systems, we could offer a much better service** to Canadians. **If your team had the resources, would you be open** to a joint pilot project?\"\n\n**Other Director:** \"If we had the resources... yes, I would. Let's explore what that might look like.\"\n\n**(Video ends with the two directors starting to sketch out a plan on a whiteboard.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Mixed Conditionals\n\nMixed conditionals combine two different conditional types. They are used to link a past event with a present result, or a present condition with a past result. They are excellent for analyzing scenarios and negotiating.\n\n**Type 1: Past Condition, Present Result**\n- **Structure:** `If + Past Perfect (had + p.p.), ... would + base verb`\n- **Use:** To talk about how a different past action would change the present reality.\n- **Example:** \"**If I had taken** that job in Toronto, **I would be living** there now.\" (But I didn't take the job, so I don't live there.)\n- **Example:** \"**If we had started** the project on time, **we wouldn't be** so far behind schedule.\"\n\n**Type 2: Present Condition, Past Result**\n- **Structure:** `If + Simple Past, ... would have + past participle`\n- **Use:** To talk about how a different present reality would have changed a past event. (This is less common.)\n- **Example:** \"**If I were** more organized, **I would have finished** the report yesterday.\" (But I am not organized, so I didn't finish it.)\n- **Example:** \"**If he spoke** French, **he would have gotten** the job.\" (But he doesn't speak French, so he didn't get it.)"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Your department chose not to partner with a tech company last year. Now, your main project is delayed because of technology issues. Write two sentences for a lessons-learned report using mixed conditionals.\n1. Use a Past Condition -> Present Result structure.\n2. Use a Present Condition -> Past Result structure.\n\n**Example Starters:**\n1. \"**If we had signed** the partnership agreement last year, **we would not be** facing these delays today...\"\n2. \"**If we had** more in-house technical expertise, **we would not have needed** to consider the partnership in the first place...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are in a meeting discussing the failed project from the previous slot. Record yourself explaining what went wrong and what could have been done differently. Use the two mixed conditional sentences you wrote.\n\n**Instructions:**\n1. Briefly state the current problem (the project is delayed).\n2. Use a mixed conditional to explain how a different past action would change the present.\n3. Use another mixed conditional to explain how a different present reality would have changed the past.\n4. Conclude with a forward-looking statement."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence is a mixed conditional?\n(a) If I had time, I would go.\n(b) If I have time, I will go.\n(c) If I had studied, I would have passed.\n(d) If I had studied, I would be a doctor now.\n\n**Question 2:** \"If he hadn't missed his flight, he ___ here with us now.\"\n(a) would be\n(b) would have been\n(c) will be\n(d) was\n\n**Question 3:** \"If I ___ better at French, I would have applied for that job.\"\n(a) were\n(b) had been\n(c) am\n(d) would be\n\n**Question 4:** The phrase \"Hindsight is 20/20\" means:\n(a) It's easy to know the right thing to do after it has happened.\n(b) You need glasses to see the future.\n(c) The year 2020 was very clear.\n(d) You should always look behind you.\n\n**Question 5:** Mixed conditionals are useful for:\n(a) Giving simple instructions.\n(b) Stating facts.\n(c) Analyzing hypothetical scenarios.\n(d) Making promises."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**The Art of the Possible:** In the public service, you are often constrained by past decisions and present realities. Strategic thinking is the art of seeing beyond those constraints. Mixed conditionals are the language of strategic thinking. They allow you to analyze past mistakes (\"If we had done X, we would be in a better position now\") and explore future possibilities (\"If we had more resources, we could have achieved X\"). By mastering this language, you demonstrate that you are not just a manager of the present, but a shaper of the future.\n\n---\n*Answers: 1(d), 2(a), 3(a), 4(a), 5(c)*"
    },
  },
  "19.1": {
    "hook": {
      title: "You've been asked to brief your ADM on the new *Artificial Intelligence and Data Act*. It's 100 pages of dense, legal text. Where do you even begin? Reading legislation is a core skill for any policy professional.",
      content: "**Hook:** You've been asked to brief your ADM on the new *Artificial Intelligence and Data Act*. It's 100 pages of dense, legal text. Where do you even begin? Reading legislation is a core skill for any policy professional.\n\n**Objective:** By the end of this lesson, you will be able to navigate a piece of Canadian legislation in English and understand key legal terminology and structures."
    },
    "video": {
      title: "Deconstructing the Act",
      content: "**Title:** Deconstructing the Act\n\n**Scene:** A senior policy analyst is explaining a new Act to a junior analyst.\n\n**(Video shows two analysts at a screen displaying a fictional Act of Parliament.)**\n\n**Senior Analyst:** \"Okay, so when you first open an Act, don't try to read it from start to finish. First, look at the structure. You have the short title, the definitions section—this is critical—and then the main parts or divisions.\"\n\n**Junior Analyst:** \"What does 'notwithstanding' mean? I see it everywhere.\"\n\n**Senior Analyst:** \"Good question. 'Notwithstanding' means 'in spite of'. So, 'Notwithstanding section 5' means 'Even if section 5 says something different, this new rule applies.' It's a way to create an exception. Then you have 'pursuant to', which means 'according to' or 'in accordance with'. For example, 'The Minister may make regulations **pursuant to** section 25.'\"\n\n**Junior Analyst:** \"And what about 'shall' versus 'may'?\"\n\n**Senior Analyst:** \"'Shall' is an obligation. It means 'must'. 'The Minister **shall** report to Parliament.' 'May' is a discretionary power. 'The Minister **may** establish a committee.' One is a duty, the other is a choice. Understanding that difference is everything.\"\n\n**(Video ends with the junior analyst looking more confident.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Legal English: Key Structures\n\nLegal English has a specific vocabulary and structure designed for precision.\n\n**1. Key Terms of Power & Obligation:**\n- **Shall:** (Obligation) Must do something. *doit*\n- **May:** (Discretion) Has the power to do something, but is not required to. *peut*\n- **Must:** (Condition precedent) A condition that must be met. *doit*\n\n**2. Key Terms of Relationship:**\n- **Notwithstanding:** (In spite of) Creates an exception or override. *nonobstant, malgré*\n- **Pursuant to:** (According to / Under) Links an action to its authority. *en vertu de, conformément à*\n- **Subject to:** (Conditional upon) An action is limited by another section. *sous réserve de*\n\n**3. Archaic Terms (still in use):**\n- **Herein:** In this document.\n- **Thereof:** Of that thing just mentioned.\n- **Wherein:** In which.\n\n**How to Read an Act:**\n1.  **Scan the Table of Contents:** Understand the main parts.\n2.  **Read the Definitions Section:** This is your dictionary for the Act.\n3.  **Identify the Powers and Obligations:** Who *shall* do what? Who *may* do what?\n4.  **Look for the Exceptions:** Find the \"notwithstanding\" and \"subject to\" clauses."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Read the following short, fictional legal text and answer the questions below in plain English.\n\n*Text:* \"**5. (1)** Subject to subsection (2), the Minister **shall**, on an annual basis, report to Parliament on the administration of this Act. **(2)** The Minister **may**, pursuant to an agreement with a provincial government, delegate the administration of this Act. **(3)** Notwithstanding subsection (1), if this Act is delegated, the provincial minister **shall** be responsible for reporting.\"\n\n**Questions:**\n1. Who is normally required to report to Parliament?\n2. Is it mandatory for the Minister to delegate the administration?\n3. If the Act is delegated, who reports to Parliament?"
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself explaining the fictional legal text from the previous slot to a colleague who has not read it. Your goal is to explain it clearly and concisely in plain English in under 2 minutes.\n\n**Instructions:**\n1. Start by explaining the general rule (who usually reports).\n2. Explain the exception or condition (the delegation).\n3. Explain the consequence of the exception (who reports then)."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** In legal English, \"shall\" means:\n(a) Maybe\n(b) Must\n(c) Should\n(d) Will in the future\n\n**Question 2:** \"Notwithstanding section 10\" means:\n(a) Because of section 10\n(b) In addition to section 10\n(c) In spite of section 10\n(d) According to section 10\n\n**Question 3:** If a Minister \"may\" do something, it is:\n(a) A mandatory duty.\n(b) A discretionary power.\n(c) A recommendation.\n(d) A future action.\n\n**Question 4:** \"Pursuant to\" means:\n(a) Before\n(b) After\n(c) In spite of\n(d) In accordance with\n\n**Question 5:** The first section you should read carefully in an Act is often the:\n(a) Last section\n(b) Definitions section\n(c) Short title\n(d) Coming into force section"
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**From Text to Context:** Reading legislation is not just about understanding words; it's about understanding power. Who has it? How can they use it? What are their obligations? When you can read an Act and see the invisible structures of power and responsibility, you move from being a simple analyst to a strategic advisor. Don't be intimidated by the language. Every Act is a story about a problem the government is trying to solve. Your job is to understand that story and explain it to others.\n\n---\n*Answers: 1(b), 2(c), 3(b), 4(d), 5(b)*"
    },
  },
  "19.2": {
    "hook": {
      title: "The government wants to reduce plastic waste. What should it do? Ban plastic bags? Invest in recycling technology? Launch a public awareness campaign? Choosing the right tool requires careful policy analysis.",
      content: "**Hook:** The government wants to reduce plastic waste. What should it do? Ban plastic bags? Invest in recycling technology? Launch a public awareness campaign? Choosing the right tool requires careful policy analysis.\n\n**Objective:** By the end of this lesson, you will be able to structure a basic policy analysis in English, using advanced cause-and-effect language to explain your reasoning."
    },
    "video": {
      title: "The Options Analysis",
      content: "**Title:** The Options Analysis\n\n**Scene:** A policy analyst is presenting options to their director.\n\n**(Video shows an analyst at a whiteboard, with a director listening.)**\n\n**Analyst:** \"So, the core problem is the rising cost of housing. This **stems from** a lack of supply. **As a consequence of** this shortage, prices have skyrocketed. We have three options. Option 1 is a new tax on foreign buyers. **The intended effect is** to cool demand. However, **a potential side effect could be** a reduction in new construction.\"\n\n**Director:** \"What about Option 2?\"\n\n**Analyst:** \"Option 2 is to provide incentives for developers. **This would lead to** an increase in housing supply. **The underlying assumption is** that developers would pass the savings on to consumers. **This, in turn, would** lower prices.\"\n\n**Director:** \"And the third option?\"\n\n**Analyst:** \"Option 3 is direct investment in social housing. **This has the direct result of** creating affordable units, but it is the most expensive option. Given the evidence, I recommend Option 2, combined with some elements of Option 3.\"\n\n**(Video ends with the director nodding thoughtfully.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Advanced Cause & Effect Language\n\nMoving beyond simple \"because\" and \"so\" is key to sophisticated policy analysis.\n\n**1. Explaining the Cause (Stating the Origin):**\n- \"This problem **stems from**...\" (*provient de*)\n- \"The issue **originates from**...\" (*trouve son origine dans*)\n- \"The **underlying cause is**...\" (*la cause sous-jacente est*)\n\n**2. Explaining the Effect (Stating the Result):**\n- \"This **leads to**...\" (*cela mène à*)\n- \"This **results in**...\" (*cela résulte en*)\n- \"**As a consequence of** this...\" (*en conséquence de*)\n- \"This has the **direct result of**...\" (*cela a pour résultat direct de*)\n\n**3. Explaining a Chain of Events:**\n- \"The first action **triggers** a second action, which **in turn** causes a third.\" (*déclenche... qui à son tour...*)\n\n**4. Explaining Intended vs. Unintended Effects:**\n- \"The **intended effect is**...\" (*l’effet escompté est*)\n- \"A **potential side effect could be**...\" (*un effet secondaire potentiel pourrait être*)\n- \"An **unintended consequence was**...\" (*une conséquence imprévue fut*)\n\n**5. Stating the Assumption:**\n- \"The **underlying assumption is** that...\" (*l’hypothèse sous-jacente est que*)"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** The government is considering a four-day work week for public servants. Analyze this policy. Write a short paragraph identifying one potential positive effect and one potential negative effect. Use at least two different advanced cause-and-effect phrases.\n\n**Example Starter:**\n\"A four-day work week could lead to several outcomes. The intended effect is to improve work-life balance, which in turn could boost morale. However, a potential side effect could be...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself presenting your analysis of the four-day work week policy. Your presentation should be 2-3 minutes long.\n\n**Instructions:**\n1. State the policy being considered.\n2. Explain the cause or reason for the policy.\n3. Present the potential positive effect using advanced language.\n4. Present the potential negative effect or unintended consequence.\n5. Conclude with your overall assessment or recommendation."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** \"The problem stems from a lack of funding.\" This means:\n(a) The problem is causing a lack of funding.\n(b) A lack of funding is the origin of the problem.\n(c) The problem is like a plant stem.\n(d) The problem will lead to a lack of funding.\n\n**Question 2:** Which phrase introduces an unintended result?\n(a) The intended effect is...\n(b) This leads to...\n(c) A potential side effect could be...\n(d) The underlying cause is...\n\n**Question 3:** \"A leads to B, which ___ leads to C.\"\n(a) in turn\n(b) in return\n(c) by turn\n(d) turning\n\n**Question 4:** \"The underlying assumption\" is:\n(a) The final conclusion.\n(b) The most obvious fact.\n(c) The hidden belief that the argument depends on.\n(d) A minor detail.\n\n**Question 5:** To express a direct result, you could say:\n(a) \"This has the direct result of...\"\n(b) \"This might result in...\"\n(c) \"This is a result.\"\n(d) \"The result is...\""
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Clarity of Thought, Clarity of Language:** Policy analysis is fundamentally about clear thinking. Can you identify the real problem? Can you see the logical chain of cause and effect? Can you anticipate unintended consequences? Your language doesn’t just communicate your thoughts; it shapes them. By using precise, advanced cause-and-effect language, you force yourself to think more clearly and logically. This is how you move from simply having an opinion to providing credible, evidence-based advice.\n\n---\n*Answers: 1(b), 2(c), 3(a), 4(c), 5(a)*"
    },
  },
  "19.3": {
    "hook": {
      title: "You are in a parliamentary committee. A member of the opposition is challenging your department's new policy. You need to defend it, persuasively and respectfully. How do you win the argument? Welcome to the art of debate.",
      content: "**Hook:** You are in a parliamentary committee. A member of the opposition is challenging your department's new policy. You need to defend it, persuasively and respectfully. How do you win the argument? Welcome to the art of debate.\n\n**Objective:** By the end of this lesson, you will be able to structure a persuasive argument in English, using rhetorical devices to make your points more memorable and impactful."
    },
    "video": {
      title: "The Committee Debate",
      content: "**Title:** The Committee Debate\n\n**Scene:** DAVID (EX-01) is appearing before a parliamentary committee to defend a new environmental policy.\n\n**(Video shows David at a witness table, facing a committee of MPs.)**\n\n**Opposition MP:** \"Mr. Chairman, through you to the witness. Mr. Hassan, your department claims this new carbon tax will be effective. But isn't it true that it will simply raise costs for ordinary Canadians?\"\n\n**David:** \"Thank you for the question. I would frame it differently. **Is it not our collective responsibility** to protect the environment for future generations? (Rhetorical Question) This policy is not about punishing people; it's about changing behaviour. It's about encouraging innovation, promoting green technology, and securing a sustainable future. (Tricolon / Rule of Three)\"\n\n**Opposition MP:** \"But at what cost?\"\n\n**David:** \"The cost of inaction is far greater. Some say we can't afford to act. I say we can't afford *not* to act. (Antithesis) We can have a strong economy, or we can have a healthy environment. This policy is designed to achieve both. **It is not a choice between the economy and the environment; it is a bridge between the two.**\"\n\n**(Video ends with the committee members looking thoughtful.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Rhetorical Devices for Persuasion\n\nRhetorical devices are techniques used to make an argument more persuasive and memorable.\n\n**1. Rhetorical Question:**\n- **Definition:** A question asked for effect, not to get an answer. It makes the audience think.\n- **Example:** \"Can we truly say we have done enough?\"\n- **Example:** \"Is this the best we can do?\"\n\n**2. Tricolon (Rule of Three):**\n- **Definition:** A series of three parallel words, phrases, or clauses.\n- **Why it works:** The human brain finds patterns of three satisfying and memorable.\n- **Example:** \"This policy is fair, effective, and affordable.\"\n- **Example:** \"We will consult with stakeholders, analyze the data, and report back to the committee.\"\n\n**3. Antithesis:**\n- **Definition:** Putting two opposite ideas together in a sentence to create a contrasting effect.\n- **Example:** \"Ask not what your country can do for you; ask what you can do for your country.\" (J.F. Kennedy)\n- **Example:** \"It was the best of times, it was the worst of times.\" (Charles Dickens)\n- **Example:** \"This is not an end, but a beginning.\"\n\n**4. Anaphora:**\n- **Definition:** Repeating a word or phrase at the beginning of successive clauses.\n- **Example:** \"**We cannot** accept this. **We cannot** allow this to continue. **We cannot** fail in our duty.\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are writing a speech to defend a new policy that increases funding for public transit. Write a short, powerful paragraph using at least two different rhetorical devices (e.g., a tricolon and an antithesis).\n\n**Example Starter:**\n\"This policy is not about spending more money; it's about investing in our future. It's about creating cleaner air, reducing traffic congestion, and building more livable cities...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself delivering the speech from the previous slot. Your goal is to sound persuasive and confident.\n\n**Instructions:**\n1. Speak with conviction.\n2. Pause for effect before and after your rhetorical devices.\n3. Use your tone to emphasize the key phrases."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** \"Veni, vidi, vici\" (I came, I saw, I conquered) is a famous example of:\n(a) Antithesis\n(b) Rhetorical Question\n(c) Tricolon\n(d) Anaphora\n\n**Question 2:** \"It's not a problem; it's an opportunity.\" This is an example of:\n(a) Antithesis\n(b) Rhetorical Question\n(c) Tricolon\n(d) Anaphora\n\n**Question 3:** Which of the following is a rhetorical question?\n(a) What time is it?\n(b) Are we not all Canadians?\n(c) Did you get the memo?\n(d) Where is the meeting?\n\n**Question 4:** The main purpose of rhetorical devices is to:\n(a) Make your speech longer.\n(b) Confuse your audience.\n(c) Make your argument more persuasive and memorable.\n(d) Show off your vocabulary.\n\n**Question 5:** Repeating a phrase at the beginning of clauses is called:\n(a) Antithesis\n(b) Rhetorical Question\n(c) Tricolon\n(d) Anaphora"
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**The Power of the Podium:** In the public service, your ideas are only as good as your ability to communicate them. When the stakes are high, you can't just present facts and figures; you need to tell a story. You need to connect with your audience on an emotional level. Rhetorical devices are the tools of storytelling. They transform a dry policy briefing into a compelling call to action. Master them, and you will not only win debates; you will win hearts and minds.\n\n---\n*Answers: 1(c), 2(a), 3(b), 4(c), 5(d)*"
    },
  },
  "19.4": {
    "hook": {
      title: "Your department has a new policy. Now you need to turn that policy into rules that businesses and citizens have to follow. How do you do that? You create regulations. Understanding this process is key to understanding how government works.",
      content: "**Hook:** Your department has a new policy. Now you need to turn that policy into rules that businesses and citizens have to follow. How do you do that? You create regulations. Understanding this process is key to understanding how government works.\n\n**Objective:** By the end of this lesson, you will understand the basics of the Canadian regulatory process and be able to use the formal register appropriate for regulatory communication."
    },
    "video": {
      title: "The Regulatory Process",
      content: "**Title:** The Regulatory Process\n\n**Scene:** A senior analyst is explaining the regulatory process to a group of junior analysts.\n\n**(Video shows a presentation slide with a flowchart.)**\n\n**Senior Analyst:** \"So, once the policy decision is made, we move to the regulatory development phase. This is where we draft the actual text of the regulation. It must be extremely precise. We use a very formal register. For example, we don't say, 'Companies should submit a report.' We say, '**It is required that** all regulated entities **submit** an annual report.' We use nominalizations—turning verbs into nouns. Instead of 'We will analyze the impacts,' we write, 'An **analysis** of the impacts will be undertaken.'\"\n\n**Junior Analyst:** \"And what is the Canada Gazette?\"\n\n**Senior Analyst:** \"The Canada Gazette is the official newspaper of the Government of Canada. Proposed regulations are pre-published in Canada Gazette, Part I, for a public comment period. This is a critical part of stakeholder consultation. After we analyze the feedback, the final regulation is published in Canada Gazette, Part II, and it becomes law.\"\n\n**(Video ends with a shot of the Canada Gazette website.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Formal Register Mastery\n\nThe formal register is the style of language used in official and serious contexts, like regulatory documents. It is characterized by being impersonal, precise, and complex.\n\n**1. Use of the Passive Voice:**\n- **Informal:** \"We will review the applications.\"\n- **Formal:** \"The applications **will be reviewed**.\"\n- **Why?** It focuses on the action, not the actor, making it sound more objective.\n\n**2. Nominalization (Turning Verbs into Nouns):**\n- **Informal:** \"We need to analyze the data.\"\n- **Formal:** \"An **analysis** of the data is required.\"\n- **Informal:** \"We will implement the policy.\"\n- **Formal:** \"The **implementation** of the policy will begin next quarter.\"\n- **Why?** It creates a more abstract and formal tone.\n\n**3. Impersonal Structures (It is...):**\n- **Informal:** \"You have to complete the form.\"\n- **Formal:** \"**It is necessary to** complete the form.\"\n- **Formal:** \"**It is required that** the form **be** completed.\"\n\n**4. Complex Sentences:**\n- Formal writing tends to use longer sentences with more subordinate clauses."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are drafting a sentence for a regulatory document. You need to say that companies must report any data breaches within 24 hours. Rewrite this instruction in a formal register, using the passive voice and an impersonal structure.\n\n**Informal Sentence:** \"Companies must report data breaches within 24 hours.\"\n\n**Formal Version:** \"...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself explaining the reporting requirement from the previous slot. Imagine you are at a stakeholder consultation session. You need to sound formal, clear, and authoritative.\n\n**Instructions:**\n1. Use the formal sentence you drafted.\n2. Speak slowly and clearly.\n3. Be prepared to answer a follow-up question like, \"What do you mean by 'data breach'?\""
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence is the most formal?\n(a) We'll check the reports.\n(b) The reports will be checked by us.\n(c) The reports will be checked.\n(d) We have to check the reports.\n\n**Question 2:** \"The implementation of the plan\" is an example of:\n(a) Passive voice\n(b) Nominalization\n(c) An idiom\n(d) A cleft sentence\n\n**Question 3:** Which is NOT a characteristic of a formal register?\n(a) Use of slang and contractions.\n(b) Use of the passive voice.\n(c) Use of complex sentences.\n(d) Use of impersonal structures.\n\n**Question 4:** Proposed regulations are pre-published for public comment in:\n(a) A national newspaper.\n(b) The Canada Gazette, Part I.\n(c) The Canada Gazette, Part II.\n(d) A departmental report.\n\n**Question 5:** The main purpose of using a formal register in regulations is to be:\n(a) Friendly and approachable.\n(b) Quick and easy to read.\n(c) Precise, objective, and authoritative.\n(d) Creative and interesting."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**The Power of Precision:** In the world of regulations, every word matters. A misplaced comma or a vague verb can create a loophole that costs millions of dollars or undermines the entire purpose of a law. This is why the formal register is so important. It is a tool for precision. As you move into more senior roles, your ability to understand and use this precise language will be critical. It demonstrates attention to detail, a respect for the rule of law, and a mastery of your craft as a public servant.\n\n---\n*Answers: 1(c), 2(b), 3(a), 4(b), 5(c)*"
    },
  },
  "20.1": {
    "hook": {
      title: "A major data breach has just occurred in your department. The media is calling, the Minister is demanding answers, and the public is losing trust. What do you do first? It's not a matter of *if* a crisis will happen, but *when*. Being prepared is everything.",
      content: "**Hook:** A major data breach has just occurred in your department. The media is calling, the Minister is demanding answers, and the public is losing trust. What do you do first? It's not a matter of *if* a crisis will happen, but *when*. Being prepared is everything.\n\n**Objective:** By the end of this lesson, you will be able to identify the key elements of a crisis communication plan and use specific vocabulary to describe states of readiness and response."
    },
    "video": {
      title: "The Crisis Cell",
      content: "**Title:** The Crisis Cell\n\n**Scene:** A communications director is leading a crisis response team meeting.\n\n**(Video shows a group of people in a boardroom, looking stressed. A director is at the front.)**\n\n**Director:** \"Okay team, let's get a handle on this. First, what is our state of readiness? Have the holding statements been approved by legal?\"\n\n**Analyst 1:** \"Yes, they're good to go. We have pre-approved messages for media, stakeholders, and the public.\"\n\n**Director:** \"Excellent. We need to be proactive, not reactive. Our communications posture must be one of transparency and empathy. I want a media scrum organized for 2 p.m. We need to get ahead of the narrative. What's our contingency plan if the system goes down completely?\"\n\n**Analyst 2:** \"We have a fallback plan. All public updates will be posted on our secondary website and social media channels.\"\n\n**Director:** \"Good. Remember the protocol: one single spokesperson. All media inquiries are to be funneled through our office. We need to speak with one voice. Let's execute.\"\n\n**(Video ends with the team moving into action.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Crisis Communication Vocabulary\n\n**1. States of Readiness:**\n- **Readiness:** The state of being prepared.\n- **Preparedness:** The actions taken to be ready.\n- **Contingency Plan / Fallback Plan:** A plan for what to do if the main plan fails. (*plan d'urgence*)\n- **Protocol:** The official procedure or system of rules.\n\n**2. States of Response:**\n- **Proactive:** Acting in anticipation of future problems.\n- **Reactive:** Acting in response to a situation rather than creating or controlling it.\n- **Posture:** Your overall attitude and position on an issue (e.g., a defensive posture).\n\n**3. Key Tools & Actions:**\n- **Holding Statement:** A pre-prepared, generic statement to be released at the start of a crisis before all facts are known. It shows you are aware and taking action.\n- **Media Scrum:** An impromptu press conference, often with many journalists shouting questions.\n- **Spokesperson:** The single, official voice for the organization.\n- **Funneling:** Directing everything to a central point."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** A major winter storm is forecast to hit your city. Your department is responsible for emergency services. Write a short paragraph for an internal memo outlining your communications readiness. Use at least three key terms from the vocabulary list.\n\n**Example Starter:**\n\"To ensure our **readiness** for the upcoming storm, we have activated the emergency communications **protocol**. **Holding statements** have been prepared, and our **contingency plan** includes hourly updates on all channels...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself giving a 1-minute briefing to your team at the start of the storm crisis. Your goal is to sound calm, confident, and in control.\n\n**Instructions:**\n1. State the situation.\n2. Confirm your state of readiness.\n3. Remind the team of the key protocol (e.g., one spokesperson).\n4. Motivate the team."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** A pre-approved message to be used at the start of a crisis is a:\n(a) Holding Statement\n(b) Media Scrum\n(c) Contingency Plan\n(d) Protocol\n\n**Question 2:** A plan for what to do if the main plan fails is a:\n(a) Holding Statement\n(b) Media Scrum\n(c) Contingency Plan\n(d) Protocol\n\n**Question 3:** To be \"proactive\" means to:\n(a) Act in response to events.\n(b) Act in anticipation of events.\n(c) Act professionally.\n(d) Act quickly.\n\n**Question 4:** The term for directing all inquiries to a single point is:\n(a) Posturing\n(b) Funneling\n(c) Reacting\n(d) Holding\n\n**Question 5:** A \"communications posture\" refers to your:\n(a) Physical stance.\n(b) Official procedure.\n(c) Overall attitude and position.\n(d) Fallback plan."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Calm in the Storm:** In a crisis, communication is not a soft skill; it is a critical operational function. Your ability to communicate clearly, calmly, and effectively can be the difference between a manageable situation and a total disaster. The key is preparation. Crises are chaotic, but your response should not be. By having clear protocols, pre-approved messages, and a designated spokesperson, you create an island of order in a sea of chaos. This is how you build and maintain public trust, even when things go wrong.\n\n---\n*Answers: 1(a), 2(c), 3(b), 4(b), 5(c)*"
    },
  },
  "20.2": {
    "hook": {
      title: "You are the spokesperson. You step in front of a dozen cameras, microphones, and shouting journalists. You have 30 seconds to deliver your key message and take control of the story. This is the media scrum, one of the most challenging situations in communications.",
      content: "**Hook:** You are the spokesperson. You step in front of a dozen cameras, microphones, and shouting journalists. You have 30 seconds to deliver your key message and take control of the story. This is the media scrum, one of the most challenging situations in communications.\n\n**Objective:** By the end of this lesson, you will learn and practice the \"bridging\" technique to handle difficult questions in a media scrum."
    },
    "video": {
      title: "Facing the Media",
      content: "**Title:** Facing the Media\n\n**Scene:** ANNA (Director) is in a media scrum, taking questions about a data breach.\n\n**(Video shows Anna at a podium, surrounded by journalists.)**\n\n**Journalist 1:** \"Director, how could your department let this happen? Was this a failure of management?\"\n\n**Anna:** \"**That’s an important question, but what’s most important right now is** protecting the information of Canadians. Our top priority is securing the system and ensuring this doesn’t happen again. (Bridge) We have a team of experts working around the clock...\"\n\n**Journalist 2:** \"But can you guarantee that no personal information was stolen?\"\n\n**Anna:** \"**I understand why you’re asking that, and the key issue here is** that we are taking this situation extremely seriously. (Bridge) We have launched a full investigation to determine the extent of the breach. We will be transparent, and we will provide updates as soon as we have verified information.\"\n\n**Journalist 3:** \"So you can’t guarantee it? Yes or no?\"\n\n**Anna:** \"**What I can tell you is this:** we are committed to doing everything in our power to support those affected. (Bridge) We have set up a dedicated hotline and will be offering credit monitoring services to all impacted individuals.\"\n\n**(Video ends with Anna calmly finishing her statement.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** The Bridging Technique\n\nBridging is a classic media training technique for handling difficult questions. It allows you to acknowledge the journalist's question and then transition (or \"bridge\") to the key message you want to deliver.\n\n**The A-B-C Formula:**\n- **A = Acknowledge:** Acknowledge the question directly and respectfully.\n- **B = Bridge:** Use a bridging phrase to transition away from the negative or difficult question.\n- **C = Communicate:** Deliver your key message.\n\n**Examples of Bridging Phrases (B):**\n- \"That’s an important point, and what it speaks to is...\"\n- \"I understand your concern, and the core issue is...\"\n- \"That’s the question on everyone’s mind, and what I can tell you is...\"\n- \"I don’t have the specific details on that, but what is important to know is...\"\n- \"That’s an interesting perspective, and what we are focused on is...\"\n\n**Why it works:**\n- It prevents you from getting stuck on a negative or hostile question.\n- It allows you to stay in control of the interview.\n- It shows you are listening but allows you to deliver your own agenda.\n- It avoids a direct \"no comment,\" which can sound evasive."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** A journalist asks you a difficult question: \"Your department spent $50 million on a project that has now failed. Isn’t that a massive waste of taxpayer money?\" Write a response using the A-B-C bridging technique.\n\n**A (Acknowledge):** \"I understand the concern about taxpayer dollars...\"\n**B (Bridge):** \"...and what is critical in any innovative project is...\"\n**C (Communicate):** \"...that we learn from our experiences to deliver better results in the future. The lessons learned from this pilot project are already being applied to save money on three other major initiatives.\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself answering the journalist's question from the previous slot. Imagine you are in a tense media scrum.\n\n**Instructions:**\n1. Acknowledge the question without being defensive.\n2. Use your bridging phrase smoothly.\n3. Deliver your key message with confidence.\n4. Stay calm and professional."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** The bridging technique is used to:\n(a) Build bridges.\n(b) Avoid answering questions.\n(c) Acknowledge a question and transition to your key message.\n(d) End the interview.\n\n**Question 2:** What does \"A\" stand for in the A-B-C formula?\n(a) Answer\n(b) Acknowledge\n(c) Argue\n(d) Announce\n\n**Question 3:** Which is a good example of a bridging phrase?\n(a) \"No comment.\"\n(b) \"That’s a stupid question.\"\n(c) \"I don’t know.\"\n(d) \"That’s an important point, and what it really comes down to is...\"\n\n**Question 4:** The main goal of a media scrum for a spokesperson is to:\n(a) Answer every single question in detail.\n(b) Deliver and repeat your key messages.\n(c) Make friends with the journalists.\n(d) Announce new information.\n\n**Question 5:** If you don't know the answer to a specific, detailed question, you should:\n(a) Guess the answer.\n(b) Say \"no comment.\"\n(c) Use a bridge to your key message about what you *do* know.\n(d) End the scrum immediately."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Stay on Message:** In a media scrum, you are not there to have a conversation; you are there to communicate. The journalists have their agenda (to get a dramatic headline), and you must have yours (to deliver your key messages). The bridging technique is your single most powerful tool to ensure your agenda wins. Remember: acknowledge, bridge, communicate. Repeat. Stay calm, stay on message, and you will stay in control.\n\n---\n*Answers: 1(c), 2(b), 3(d), 4(b), 5(c)*"
    },
  },
  "20.3": {
    "hook": {
      title: "The media is only one audience. During a crisis, you also need to communicate with your Minister's office, your employees, your partner departments, and the public. Each audience needs a different message, delivered in a different way. This is the art of stakeholder communication.",
      content: "**Hook:** The media is only one audience. During a crisis, you also need to communicate with your Minister's office, your employees, your partner departments, and the public. Each audience needs a different message, delivered in a different way. This is the art of stakeholder communication.\n\n**Objective:** By the end of this lesson, you will be able to tailor crisis messages for different stakeholder groups and use hedging language to communicate uncertainty without losing credibility."
    },
    "video": {
      title: "Different Audiences, Different Messages",
      content: "**Title:** Different Audiences, Different Messages\n\n**Scene:** ANNA (Director) is in her office, drafting three different crisis messages.\n\n**(Video shows Anna at her computer, switching between three documents.)**\n\n**Anna (voiceover):** \"The first message is for the Minister's office. This needs to be direct, factual, and concise. They need to know the facts, the risks, and our recommended course of action.\"\n\n**(Screen shows: \"Minister's Office: Situation Update — Data Breach. Facts: Approximately 50,000 records may have been compromised. Risk: High media interest expected. Recommendation: Issue a public statement within 24 hours.\")**\n\n**Anna (voiceover):** \"The second message is for our employees. They need reassurance. They need to know that we are handling the situation and that they are supported.\"\n\n**(Screen shows: \"All Staff: We are aware of a recent security incident. Please know that our IT security team is working diligently to resolve this. If you have any concerns, please contact your manager.\")**\n\n**Anna (voiceover):** \"The third message is for the public. This needs to be empathetic, transparent, and action-oriented. We need to tell them what happened, what we are doing, and what they can do.\"\n\n**(Screen shows: \"Public Statement: We take the security of your information very seriously. We are currently investigating an incident and will provide updates as they become available. If you believe you may be affected, please call our dedicated hotline at...\")**\n\n**(Video ends with Anna sending the three messages.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** Hedging Language for Communicating Uncertainty\n\nIn a crisis, you often don't have all the facts. You need to communicate what you know without making promises you can't keep. Hedging language allows you to express uncertainty in a professional and credible way.\n\n**1. Modal Verbs for Uncertainty:**\n- \"The data **may** have been compromised.\" (Possible, but not confirmed.)\n- \"This **could** affect up to 50,000 individuals.\" (An estimate, not a certainty.)\n- \"The investigation **might** take several weeks.\" (A possibility.)\n\n**2. Adverbs of Probability:**\n- \"**Approximately** 50,000 records were involved.\" (*environ*)\n- \"The breach **potentially** affected personal data.\" (*potentiellement*)\n- \"We **believe** the situation is now contained.\" (*nous croyons*)\n\n**3. Phrases for Communicating What You Don't Know:**\n- \"**At this time**, we do not have all the details.\"\n- \"**Based on our preliminary assessment**, the impact appears to be limited.\"\n- \"We are **in the process of** determining the full scope of the incident.\"\n- \"We will provide updates **as soon as verified information becomes available**.\"\n\n**Why Hedging Matters:**\n- It protects you from making inaccurate statements.\n- It builds credibility because you are being honest about what you don't know.\n- It avoids the trap of saying \"no comment\" or making a false guarantee."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** A chemical spill has occurred near a government building. You don't yet know if it's dangerous. Write a short public statement using hedging language.\n\n**Key Information:**\n- A spill occurred at approximately 10:00 a.m.\n- The substance has not yet been identified.\n- The building has been evacuated as a precaution.\n- Health and safety experts are on site.\n\n**Example Starter:**\n\"At approximately 10:00 a.m. today, a chemical spill was reported near [building name]. **At this time**, the substance has not been identified. As a precautionary measure, the building has been evacuated. Health and safety experts are **currently in the process of** assessing the situation...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself delivering the public statement from the previous slot. Imagine you are the spokesperson at a press conference.\n\n**Instructions:**\n1. Speak calmly and with authority.\n2. Use hedging language naturally, not as a way to avoid the question.\n3. Be empathetic: show that you understand people are worried.\n4. End with a clear action step (e.g., \"We will provide an update at 3 p.m.\")."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** Which sentence best communicates uncertainty professionally?\n(a) \"I don't know what happened.\"\n(b) \"Nothing happened.\"\n(c) \"Based on our preliminary assessment, the impact appears to be limited.\"\n(d) \"Everything is fine, don't worry.\"\n\n**Question 2:** \"The data may have been compromised\" means:\n(a) The data was definitely compromised.\n(b) It is possible the data was compromised.\n(c) The data was not compromised.\n(d) We don't care about the data.\n\n**Question 3:** When communicating with the Minister's office during a crisis, the tone should be:\n(a) Emotional and empathetic.\n(b) Direct, factual, and concise.\n(c) Vague and hedging.\n(d) Informal and friendly.\n\n**Question 4:** \"At this time\" is used to:\n(a) Tell the exact time.\n(b) Signal that the situation may change.\n(c) End the conversation.\n(d) Start a new topic.\n\n**Question 5:** Why is hedging language important in a crisis?\n(a) It makes you sound smarter.\n(b) It allows you to avoid responsibility.\n(c) It allows you to communicate honestly about uncertainty.\n(d) It makes the message longer."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**Empathy is Not Weakness:** In a crisis, your stakeholders are not just looking for information; they are looking for reassurance. They want to know that someone competent is in charge and that they are being treated with respect. Tailoring your message to each audience is not about being dishonest; it's about being empathetic. The Minister needs facts. Your employees need support. The public needs transparency. By meeting each audience where they are, you demonstrate true leadership.\n\n---\n*Answers: 1(c), 2(b), 3(b), 4(b), 5(c)*"
    },
  },
  "20.4": {
    "hook": {
      title: "The crisis is over. The media has moved on. But your work is not done. How do you rebuild trust? How do you learn from the experience? And how do you demonstrate that your English is at the C1 level required for the highest SLE rating? This final lesson brings it all together.",
      content: "**Hook:** The crisis is over. The media has moved on. But your work is not done. How do you rebuild trust? How do you learn from the experience? And how do you demonstrate that your English is at the C1 level required for the highest SLE rating? This final lesson brings it all together.\n\n**Objective:** By the end of this lesson, you will be able to write a post-crisis lessons-learned report and demonstrate C1-level English proficiency across all four skills (reading, writing, listening, speaking) in preparation for the SLE."
    },
    "video": {
      title: "The Lessons Learned",
      content: "**Title:** The Lessons Learned\n\n**Scene:** DAVID (EX-01) is presenting a post-crisis debrief to his senior management team.\n\n**(Video shows David at a boardroom table.)**\n\n**David:** \"Thank you all for your time. The purpose of today's meeting is to conduct a thorough debrief of the recent incident and to identify lessons learned. First, what went well. Our crisis communication protocol was activated within 30 minutes. The holding statements were effective, and we maintained a consistent message throughout. Our communications posture of transparency was well-received by the media.\"\n\n**ADM:** \"And what didn't go well?\"\n\n**David:** \"There were two key areas for improvement. First, our internal communication was too slow. Employees were hearing about the crisis from the media before they heard from us. Second, our contingency plan for social media was inadequate. We were not prepared for the volume of public inquiries on Twitter and Facebook.\"\n\n**ADM:** \"What are your recommendations?\"\n\n**David:** \"I have three recommendations. First, we need to establish a dedicated internal notification system that can reach all employees within 15 minutes. Second, we need to develop a comprehensive social media crisis response plan. Third, I recommend a full-scale crisis simulation exercise within the next six months to test these improvements.\"\n\n**(Video ends with the ADM nodding approvingly.)**"
    },
    "strategy": {
      title: "POINT-STRATÉGIE (12 min)",
      content: "**Focus:** SLE C1 Mastery — Integrated Skills Review\n\nThis lesson serves as a comprehensive review of the key C1-level skills covered in Path V.\n\n**1. Writing — Formal Register & Nominalization (Lesson 19.4):**\n- Can you write a formal report using the passive voice, nominalization, and impersonal structures?\n\n**2. Speaking — Rhetorical Devices & Bridging (Lessons 19.3, 20.2):**\n- Can you deliver a persuasive argument using tricolon, antithesis, and anaphora?\n- Can you handle a hostile question using the A-B-C bridging technique?\n\n**3. Reading — Legal English (Lesson 19.1):**\n- Can you read and interpret a piece of legislation, understanding \"shall,\" \"may,\" \"notwithstanding,\" and \"pursuant to\"?\n\n**4. Listening — Advanced Comprehension:**\n- Can you follow a complex, multi-party discussion and identify the key arguments?\n\n**5. Grammar — Advanced Structures:**\n- Cleft sentences (Lesson 18.2)\n- Inversion for emphasis (Lesson 18.3)\n- Mixed conditionals (Lesson 18.4)\n- Advanced cause & effect (Lesson 19.2)"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are writing the executive summary for a \"Lessons Learned\" report after a crisis. The crisis was a major IT system failure that disrupted services for 48 hours. Write a 3-paragraph executive summary covering:\n1. What happened (use formal register and passive voice).\n2. What went well (use advanced cause & effect language).\n3. Recommendations (use inversion for emphasis on the most critical recommendation).\n\n**Example Starter:**\n\"On [date], a critical system failure was experienced, resulting in a 48-hour disruption to public-facing services. An investigation was subsequently undertaken to determine the root cause...\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record yourself presenting the executive summary from the previous slot to your ADM. This is a 3-minute oral presentation.\n\n**Instructions:**\n1. Use a formal but confident tone.\n2. Demonstrate your mastery of advanced grammar: use at least one cleft sentence, one instance of inversion, and one mixed conditional.\n3. End with a strong, persuasive closing statement using a rhetorical device."
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "**Question 1:** A \"lessons learned\" report is written:\n(a) Before a crisis.\n(b) During a crisis.\n(c) After a crisis.\n(d) Instead of a crisis.\n\n**Question 2:** Which is the best opening for a formal executive summary?\n(a) \"So, here's what happened...\"\n(b) \"On [date], a critical incident was identified...\"\n(c) \"We messed up.\"\n(d) \"I want to tell you about a problem.\"\n\n**Question 3:** \"Not only did the team respond quickly, but they also maintained public trust.\" This sentence uses:\n(a) A cleft sentence.\n(b) Inversion with \"Not only.\"\n(c) A mixed conditional.\n(d) The passive voice.\n\n**Question 4:** \"If we had invested in better systems, we would not be in this situation now.\" This is:\n(a) A first conditional.\n(b) A second conditional.\n(c) A third conditional.\n(d) A mixed conditional.\n\n**Question 5:** The SLE C1 level requires:\n(a) Basic conversational ability.\n(b) The ability to function independently in most work situations.\n(c) The ability to handle complex, abstract, and nuanced communication in a professional setting.\n(d) Native-like fluency with no errors."
    },
    "coaching": {
      title: "CONSEIL COACHING (3 min)",
      content: "**The Journey to Mastery:** Congratulations. You have reached the end of Path V. You have moved from the fundamentals of English to the highest levels of professional communication. You can now lead meetings, write briefing notes, present to senior management, navigate legislation, and manage a crisis—all in English. This is not just a language achievement; it is a career achievement. The C1 level is the gold standard for the SLE. You are ready. Trust your preparation, trust your skills, and trust yourself. The next step is Path VI: Executive Mastery, where you will refine these skills to the highest possible level. But for now, take a moment to appreciate how far you have come.\n\n---\n*Answers: 1(c), 2(b), 3(b), 4(d), 5(c)*"
    },
  },
  "21.1": {
    "hook": {
      title: "\"We view the proposal with interest.\" Does this mean we like it? Or that we are suspicious? In diplomacy, what is *not* said is often more important than what *is* said. Welcome to the art of diplomatic language.",
      content: "**Hook:** \"We view the proposal with interest.\" Does this mean we like it? Or that we are suspicious? In diplomacy, what is *not* said is often more important than what *is* said. Welcome to the art of diplomatic language.\n**Objective:** By the end of this lesson, you will be able to understand and use diplomatic language, including understatement and litotes, to communicate sensitive information with precision and tact."
    },
    "video": {
      title: "The Bilateral Meeting",
      content: "**Title:** The Bilateral Meeting\n**Scene:** A Canadian diplomat (SARAH) meets with a counterpart (MR. CHEN) to discuss a contentious trade issue.\n**(Video shows a formal meeting room. Sarah and Mr. Chen are seated across a table.)**\n**Mr. Chen:** \"We were surprised by your government's recent announcement. It creates certain... complications.\"\n**Sarah:** \"We understand your position. We believe the policy is necessary, but we **note with interest** your government's perspective. We would **welcome further discussion** on this matter.\"\n**Mr. Chen:** \"Further discussion would be... **not unhelpful**. However, our position remains that this policy is inconsistent with the spirit of our trade agreement.\"\n**Sarah:** \"We have a different interpretation of the agreement's spirit. However, we are committed to finding a mutually agreeable path forward. This **remains a matter of some concern** for us as well.\""
    },
    "strategy": {
      title: "Understatement & Litotes",
      content: "**Title:** Understatement & Litotes\n\n**1. Understatement:** Deliberately representing something as less important than it is. It's a key tool for de-escalation and maintaining a calm, professional tone.\n   - *Direct:* \"This is a major problem.\" -> *Diplomatic:* \"This presents **certain challenges**.\"\n   - *Direct:* \"We strongly disagree.\" -> *Diplomatic:* \"We have a **different perspective** on this issue.\"\n\n**2. Litotes:** A form of understatement using a double negative to express a positive. It's subtle and allows for plausible deniability.\n   - *Direct:* \"This is a good idea.\" -> *Diplomatic:* \"This is **not a bad idea**.\"\n   - *Direct:* \"This is very helpful.\" -> *Diplomatic:* \"This is **not unhelpful**.\"\n   - *Direct:* \"We will definitely do this.\" -> *Diplomatic:* \"This is **not impossible**.\"\n\n**Key Diplomatic Phrases & Their Real Meanings:**\n| Phrase | What it sounds like | What it really means |\n|---|---|---|\n| \"With all due respect...\" | I respect you, but... | I do not respect you, and you are wrong. |\n| \"We note with interest...\" | That's interesting. | We are aware of this, and we are watching you. |\n| \"This is a matter of concern.\" | We are a bit worried. | This is a serious problem that could damage our relationship. |\n| \"We are studying the proposal.\" | We are considering it. | We are looking for a polite way to say no. |"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Rewrite the following direct statements into diplomatic language. Use understatement, litotes, and the key phrases from Slot 3.\n\n1.  \"This is a terrible idea and we will never agree to it.\"\n2.  \"You broke the agreement.\"\n3.  \"We demand that you reverse this policy immediately.\"\n4.  \"This is a huge crisis.\"\n5.  \"Your explanation is a lie.\"\n\n**Your Response:**\n\n> 1.  \"With all due respect, we have a different perspective on this proposal and would welcome further discussion to find a mutually agreeable path forward.\"\n> 2.  \"We have some concerns regarding the recent implementation of the policy, which appears to be inconsistent with our shared understanding of the agreement.\"\n> 3.  \"We would welcome an opportunity to discuss the possibility of reviewing this policy.\"\n| 4.  \"This situation presents certain significant challenges.\"\n| 5.  \"We find that your explanation is not entirely consistent with the facts as we understand them.\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are a Canadian diplomat. Your counterpart has just accused Canada of acting in bad faith. Record your 1-minute response. Use at least two diplomatic phrases from this lesson.\n\n**Example starter:** \"Thank you for sharing your perspective. I can assure you that Canada always acts in good faith. We may have different interpretations of the events, and we believe it would be not unhelpful to clarify our respective positions...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  What is the real meaning of \"We note with interest...\"?\n    a) We find it fascinating.\n    b) We are aware and watching.\n    c) We are happy about it.\n2.  Which of the following is an example of litotes?\n    a) \"This is a serious issue.\"\n    b) \"This is not unproblematic.\"\n    c) \"This is a challenge.\"\n3.  How would you diplomatically say \"You are wrong\"?\n    a) \"You are incorrect.\"\n    b) \"I disagree completely.\"\n    c) \"I have a different perspective.\"\n4.  \"This is a matter of grave concern\" is a stronger statement than \"This is a matter of concern.\"\n    a) True\n    b) False\n5.  Understatement is used to:\n    a) Exaggerate a problem.\n    b) De-escalate a situation.\n    c) Show excitement.\n\n**Answers:** 1-b, 2-b, 3-c, 4-a, 5-b"
    },
    "coaching": {
      title: "The Power of the Pause",
      content: "**Title:** The Power of the Pause\n\nIn diplomacy, silence is a tool. When faced with a difficult question or accusation, don't rush to answer. Take a deliberate pause. Breathe. This does three things: it shows you are taking the matter seriously, it gives you time to formulate a careful response, and it projects confidence and control. Your silence can be more powerful than your words. Practice the art of the strategic pause."
    },
  },
  "21.2": {
    "hook": {
      title: "A successful negotiation is not about winning; it's about achieving your core interests while allowing the other side to achieve theirs. It's a complex dance of strategy, language, and psychology. Are you ready to lead the dance?",
      content: "**Hook:** A successful negotiation is not about winning; it's about achieving your core interests while allowing the other side to achieve theirs. It's a complex dance of strategy, language, and psychology. Are you ready to lead the dance?\n**Objective:** By the end of this lesson, you will be able to use the English subjunctive mood in formal proposals and understand key strategies for international negotiations."
    },
    "video": {
      title: "The Climate Accord",
      content: "**Title:** The Climate Accord\n**Scene:** Negotiators from Canada and two other countries are finalizing a climate agreement.\n**(Video shows a tense but professional negotiation room.)**\n**Canadian Negotiator:** \"We have made significant concessions. We **propose that the committee establish** a fund to support developing nations, and **it is imperative that all parties contribute** their fair share.\"\n**Negotiator 2:** \"We could consider that, **subject to** an independent review of the contribution formula. Our red line remains the emissions target for our industrial sector.\"\n**Canadian Negotiator:** \"We understand your domestic pressures. However, **we insist that the agreement reflect** the latest scientific consensus. Perhaps we can explore a phased approach to the industrial targets.\""
    },
    "strategy": {
      title: "The Subjunctive in Formal Proposals",
      content: "**Title:** The Subjunctive in Formal Proposals\n\nThe subjunctive mood is used in formal English to express proposals, demands, or suggestions. It uses the base form of the verb (e.g., \"be\", \"contribute\", \"reflect\") regardless of the subject.\n\n**Structure:**\n- **\"We propose/suggest/recommend that...\"** + subject + **base verb**\n  - *Example:* \"We suggest that the working group **reconvene** next month.\"\n- **\"We insist/demand/request that...\"** + subject + **base verb**\n  - *Example:* \"They demanded that the clause **be** removed.\"\n- **\"It is essential/vital/imperative that...\"** + subject + **base verb**\n  - *Example:* \"It is vital that the agreement **protect** indigenous rights.\"\n\n**Key Negotiation Vocabulary:**\n- **Concession:** Something you agree to give up to end a disagreement.\n- **Red Line:** A non-negotiable position.\n- **Subject to:** Dependant on a condition.\n- **Mutually acceptable:** Agreed upon by all parties.\n- **Deadlock:** A situation where no progress can be made."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are negotiating a new data-sharing agreement. Write a 150-word formal proposal outlining Canada's position. Use at least three subjunctive constructions.\n\n**Your Response:**\n\n> To our esteemed colleagues,\n>\n> We present this proposal for a new data-sharing framework. It is **essential that the new agreement respect** the privacy principles of both our nations. We **propose that a joint oversight committee be established** to monitor compliance. Furthermore, we **suggest that the framework include** a clear process for data breach notifications.\n>\n> We believe these provisions are fundamental to a robust and trustworthy agreement. We look forward to your response."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Your negotiation has reached a deadlock over a key issue. Record a 1-minute intervention to break the deadlock and propose a way forward. Use subjunctive mood and negotiation vocabulary.\n\n**Example starter:** \"Colleagues, we seem to have reached a deadlock. I propose that we take a short recess. It is imperative that we find a mutually acceptable solution...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  Which sentence is grammatically correct?\n    a) \"We propose that the team reports back next week.\"\n    b) \"We propose that the team report back next week.\"\n    c) \"We propose that the team will report back next week.\"\n2.  A \"red line\" in a negotiation is:\n    a) A minor point.\n    b) A non-negotiable position.\n    c) A point of agreement.\n3.  Choose the correct verb form: \"It is vital that she ___ present.\"\n    a) is\n    b) was\n    c) be\n4.  What is a \"concession\"?\n    a) Something you give up to reach an agreement.\n    b) Your main objective.\n    c) A final offer.\n5.  Which phrase introduces a condition?\n    a) \"In addition to...\"\n    b) \"Furthermore...\"\n    c) \"Subject to...\"\n\n**Answers:** 1-b, 2-b, 3-c, 4-a, 5-c"
    },
    "coaching": {
      title: "Know Your BATNA",
      content: "**Title:** Know Your BATNA\n\nIn negotiation, always know your **B**est **A**lternative **T**o a **N**egotiated **A**greement (BATNA). What will you do if you walk away with no deal? A strong BATNA gives you power and confidence. A weak BATNA forces you to make concessions. Before any negotiation, spend as much time developing your BATna as you do preparing your opening offer. It is your ultimate source of strength."
    },
  },
  "21.3": {
    "hook": {
      title: "Do you address a Governor General as \"Your Excellency\" or \"The Right Honourable\"? In the world of protocol, small mistakes can cause major offence. Mastering these details is a sign of respect and professionalism.",
      content: "**Hook:** Do you address a Governor General as \"Your Excellency\" or \"The Right Honourable\"? In the world of protocol, small mistakes can cause major offence. Mastering these details is a sign of respect and professionalism.\n**Objective:** By the end of this lesson, you will be able to correctly use Canadian forms of address and understand the basic principles of official protocol."
    },
    "video": {
      title: "The State Dinner",
      content: "**Title:** The State Dinner\n**Scene:** A junior Canadian official (LIAM) is attending his first state dinner and is being introduced to various dignitaries by his boss (MARTHA).\n**(Video shows a grand ballroom. Liam looks overwhelmed.)**\n**Martha:** \"Liam, I'd like to introduce you to the Ambassador of France, **His Excellency** Jean-Pierre Dubois. Mr. Ambassador, this is Liam, a promising officer from our department.\"\n**Liam:** (Nodding) \"Your Excellency. An honour.\"\n**Martha:** \"And here is the Prime Minister. **Prime Minister**, a pleasure to see you.\"\n**Prime Minister:** \"Martha, good to see you. And you are?\"\n**Liam:** \"Liam, sir. I mean, Prime Minister.\""
    },
    "strategy": {
      title: "Canadian Forms of Address",
      content: "**Title:** Canadian Forms of Address\n\nMastering forms of address is crucial. Here are the key ones for the Government of Canada:\n\n| Official | Written Salutation | Spoken Address (First time) | Spoken Address (Subsequent) |\n|---|---|---|---|\n| Governor General | Your Excellency, | Your Excellency, | Your Excellency, or Ma'am/Sir |\n| Prime Minister | Dear Prime Minister, | Prime Minister, | Prime Minister, or Sir |\n| Cabinet Minister | The Honourable [Full Name], | Minister, | Minister, |\n| Senator | The Honourable [Full Name], | Senator, | Senator, |\n| Member of Parliament | [Full Name], M.P., | Mr./Ms. [Last Name], | Mr./Ms. [Last Name], |\n| Ambassador | Your Excellency, | Your Excellency, | Your Excellency, or Ma'am/Sir |\n| Supreme Court Justice | The Right Honourable [Full Name], | Chief Justice, or Justice [Last Name], | Chief Justice, or Justice, |\n\n**Key Principles:**\n- **The Right Honourable:** Reserved for the Governor General, Prime Minister, and Chief Justice of the Supreme Court.\n- **The Honourable:** Used for Cabinet Ministers, Senators, and Lieutenant Governors.\n- **Your Excellency:** Used for the Governor General and Ambassadors."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are writing an email to invite a group of dignitaries to a policy launch. Write the opening paragraph, correctly addressing a Cabinet Minister, a Senator, and an Ambassador.\n\n**Your Response:**\n\n> Dear **The Honourable** Jane Smith, Minister of Innovation, Science and Industry,\n> **The Honourable** Yuen Pau Woo, Senator,\n> and **Her Excellency** Maria Schmidt, Ambassador of Germany,\n>\n> It is with great pleasure that I invite you to the official launch of Canada's new Artificial Intelligence Strategy on behalf of the Government of Canada..."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are at an official reception. Record yourself making a brief, formal introduction between your boss (a Director General) and a Senator you know.\n\n**Example starter:** \"Senator, good evening. I hope you are well. I would like to introduce my Director General, Ms. Alice Wong. Ms. Wong, this is the Honourable Senator Peter Harder...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  How should you address the Prime Minister in conversation for the first time?\n    a) Mr. Trudeau\n    b) Prime Minister\n    c) The Right Honourable\n2.  \"Your Excellency\" is the correct form of address for:\n    a) A Senator\n    b) A Cabinet Minister\n    c) An Ambassador\n3.  The title \"The Right Honourable\" is used for:\n    a) All Members of Parliament\n    b) The Prime Minister and Governor General\n    c) All Cabinet Ministers\n4.  When writing to a Senator, the correct salutation is \"Dear Senator [Last Name]\".\n    a) True\n    b) False\n5.  After the initial address, you can continue to call the Governor General \"Your Excellency\" or switch to \"Ma'am/Sir\".\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-c, 3-b, 4-b, 5-a"
    },
    "coaching": {
      title: "When in Doubt, Ask.",
      content: "**Title:** When in Doubt, Ask.\n\nProtocol can be complex. If you are ever unsure how to address someone, it is far better to ask discreetly than to make a mistake. You can ask a protocol officer, a colleague, or even the person's assistant: \"What is the correct form of address for the Minister in this setting?\" This shows respect and a commitment to getting it right. Humility is a greater sign of professionalism than false confidence."
    },
  },
  "21.4": {
    "hook": {
      title: "From climate change to global security, the world's biggest challenges require countries to work together. This is multilateral engagement: the complex, frustrating, but essential work of global problem-solving.",
      content: "**Hook:** From climate change to global security, the world's biggest challenges require countries to work together. This is multilateral engagement: the complex, frustrating, but essential work of global problem-solving.\n**Objective:** By the end of this lesson, you will be able to write a clear and coherent statement for a multilateral forum, using advanced cohesion techniques."
    },
    "video": {
      title: "Canada at the UN",
      content: "**Title:** Canada at the UN\n**Scene:** A Canadian representative delivers a statement at a United Nations forum on digital cooperation.\n**(Video shows the Canadian representative at a podium with the UN logo behind her.)**\n**Representative:** \"Thank you, Mr. Chair. Canada is a firm believer in multilateralism. **This conviction** guides our approach to digital governance. We believe that an open, free, and secure internet is essential for global prosperity. **Such a framework** requires international cooperation. **This cooperation**, however, must be inclusive. We must ensure that the voices of all nations, not just the most powerful, are heard in **this critical dialogue**.\""
    },
    "strategy": {
      title: "Advanced Cohesion & Coherence",
      content: "**Title:** Advanced Cohesion & Coherence\n\nCohesion is how your sentences stick together. Coherence is how your ideas make sense. At the C2 level, you need to master advanced techniques.\n\n**1. Thematic Progression:** Start sentences with information that is already known (from the previous sentence) and end with new information. This creates a natural flow.\n   - *Example:* \"Canada is committed to multilateralism. **This commitment** shapes our foreign policy.\"\n\n**2. Lexical Chains:** Use synonyms or related words to create a chain of meaning throughout the text.\n   - *Example:* \"We need a new **agreement**. This **pact** must be fair. The **treaty** should be signed by all parties.\"\n\n**3. Reference Chains (this, that, such):** Use demonstrative pronouns to refer back to ideas, not just single words.\n   - *Example:* \"The policy has been criticized for being too expensive. **This** is a valid concern, but...\n   - *Example:* \"We need a framework that is both flexible and robust. **Such a framework** is not easy to design.\"\n\n**4. Ellipsis:** Omitting words that are understood from the context to create a more concise and sophisticated style.\n   - *Example:* \"Some nations favour regulation; others, a more hands-off approach.\" (The verb \"favour\" is omitted in the second clause)."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are writing a 150-word statement for a G7 meeting on artificial intelligence. Write the opening paragraph, using at least two different cohesion techniques from Slot 3.\n\n**Your Response:**\n\n> Chair, colleagues,\n>\n> Artificial intelligence represents one of the most profound transformations of our time. **This technology** offers immense potential for economic growth and social progress. However, **it** also presents significant risks, from algorithmic bias to autonomous weapons. We, the G7 nations, have a special responsibility to guide the development of AI in a way that reflects our shared democratic values. **Such a responsibility** requires a coordinated international approach. Some will advocate for rapid innovation; others, for cautious regulation. We must find a balance between **the two**."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are delivering a statement at a NATO meeting about collective security. Record the opening 1-minute of your speech, focusing on creating a strong, cohesive argument.\n\n**Example starter:** \"Mr. Secretary General, allies. Our alliance was founded on a simple principle: collective defence. That principle is more important today than ever before. The threats we face may have changed, but our commitment to each other has not...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  What is the main purpose of thematic progression?\n    a) To introduce new topics randomly.\n    b) To create a logical flow between sentences.\n    c) To use complex vocabulary.\n2.  \"The plan was ambitious. **This** was its main weakness.\" What does \"This\" refer to?\n    a) The plan.\n    b) The ambition.\n    c) The fact that the plan was ambitious.\n3.  Using \"agreement,\" \"pact,\" and \"treaty\" in a text is an example of:\n    a) A lexical chain.\n    b) Ellipsis.\n    c) Thematic progression.\n4.  Which sentence uses ellipsis?\n    a) \"He went to the meeting, and she went to the meeting too.\"\n    b) \"He went to the meeting, and she did too.\"\n    c) \"He went to the meeting; she, to the office.\"\n5.  Cohesion refers to how ideas make sense, while coherence refers to how sentences stick together.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-c, 3-a, 4-c, 5-b"
    },
    "coaching": {
      title: "Think in Paragraphs, Not Sentences",
      content: "**Title:** Think in Paragraphs, Not Sentences\n\nAt this level, stop thinking about writing sentence by sentence. Start thinking in paragraphs. Before you write, ask yourself: What is the single key idea of this paragraph? Your first sentence should introduce that idea. The following sentences should support and develop it. Your last sentence should summarize it or transition to the next paragraph. A well-structured paragraph is a building block of a powerful argument."
    },
  },
  "22.1": {
    "hook": {
      title: "You have five minutes to brief the Minister on a complex file before she goes into Question Period. Your language must be precise, concise, and impactful. This is the ultimate test of a public servant's communication skills.",
      content: "**Hook:** You have five minutes to brief the Minister on a complex file before she goes into Question Period. Your language must be precise, concise, and impactful. This is the ultimate test of a public servant's communication skills.\n**Objective:** By the end of this lesson, you will be able to use nominalizations to create formal, concise language suitable for a ministerial briefing."
    },
    "video": {
      title: "The Pre-QP Scramble",
      content: "**Title:** The Pre-QP Scramble\n**Scene:** An ADM (ANNA) is giving a last-minute briefing to her Minister (MINISTER DUPUIS) in his office.\n**(Video shows a busy, high-stakes environment.)**\n**Minister Dupuis:** \"Anna, what do I need to know on the new procurement file? Opposition will be asking.\"\n**Anna:** \"Minister, our **assessment** of the bids is complete. The **recommendation** is to proceed with Company X, based on their superior **evaluation**. There is some **criticism** regarding the **selection** process, but our **justification** is robust. The **announcement** is scheduled for Friday. Your key message is the **modernization** of our procurement system and the **realization** of significant cost savings.\""
    },
    "strategy": {
      title: "Nominalization for Formal Writing",
      content: "**Title:** Nominalization for Formal Writing\n\nNominalization is the process of turning a verb or adjective into a noun. It is a key feature of formal, bureaucratic, and academic writing. It allows you to be more concise and abstract.\n\n**How it works:**\n- *Verb -> Noun:* \"We **assessed** the bids.\" -> \"Our **assessment** of the bids...\"\n- *Verb -> Noun:* \"We **recommend** Company X.\" -> \"Our **recommendation** is Company X.\"\n- *Adjective -> Noun:* \"The project is **complex**.\" -> \"The **complexity** of the project...\"\n\n**Common Nominalization Suffixes:**\n- **-tion / -sion:** recommendation, justification, decision\n- **-ment:** assessment, announcement, development\n- **-ance / -ence:** performance, existence, reliance\n- **-ity:** complexity, priority, responsibility\n- **-al:** approval, refusal, arrival\n\n**Why use it?**\n- It sounds more formal and authoritative.\n- It allows you to pack more information into a sentence.\n- It focuses on the concept (the noun) rather than the action (the verb).\n\n**Caution:** Overuse of nominalization can make your writing dense and hard to read. Use it strategically."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Rewrite the following informal sentences into formal, concise briefing note points using nominalization.\n\n1.  \"We decided to cancel the project because it was too complex.\"\n2.  \"We need to approve the new policy quickly.\"\n3.  \"The way they implemented the program was criticized.\"\n4.  \"We will announce the results tomorrow.\"\n5.  \"The economy is growing, which is good.\"\n\n**Your Response:**\n\n> 1.  The **decision** to cancel the project was based on its **complexity**.\n> 2.  Quick **approval** of the new policy is required.\n> 3.  There was **criticism** of the program's **implementation**.\n> 4.  The **announcement** of the results is scheduled for tomorrow.\n> 5.  Economic **growth** is a positive development."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are briefing your Director General on a sensitive HR issue. Record a 1-minute summary of the situation, using at least three nominalizations.\n\n**Example starter:** \"DG, I need to provide you with an update. Following our **investigation** into the complaint, our **finding** is that there was a violation of the code of conduct. My **recommendation** is to proceed with disciplinary action...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  Which of the following is a nominalization of the verb \"to justify\"?\n    a) Justifiable\n    b) Justification\n    c) Justifying\n2.  Nominalization generally makes writing sound:\n    a) More informal and personal.\n    b) More formal and authoritative.\n    c) More exciting and dynamic.\n3.  Rewrite \"The project failed\" using nominalization.\n    a) \"The project was a failure.\"\n    b) \"The project was failing.\"\n    c) \"The project will fail.\"\n4.  Which suffix is NOT typically used for nominalization?\n    - a) -tion\n    - b) -ly\n    - c) -ment\n5.  Overusing nominalization can make writing difficult to understand.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-b, 3-a, 4-b, 5-a"
    },
    "coaching": {
      title: "The BLUF Principle",
      content: "**Title:** The BLUF Principle\n\nWhen briefing senior executives, always use the BLUF principle: **B**ottom **L**ine **U**p **F**ront. Start with your conclusion or recommendation, then provide the justification. Executives are time-poor. They need the most important information first. Don't build up to your conclusion like a story. State it, then defend it. This is the core of effective executive communication."
    },
  },
  "22.2": {
    "hook": {
      title: "The Memorandum to Cabinet (MC) is the primary instrument for bringing proposals to Cabinet for a decision. Writing one is a core competency for any executive in the public service. It requires a unique style: formal, impersonal, and evidence-based.",
      content: "**Hook:** The Memorandum to Cabinet (MC) is the primary instrument for bringing proposals to Cabinet for a decision. Writing one is a core competency for any executive in the public service. It requires a unique style: formal, impersonal, and evidence-based.\n**Objective:** By the end of this lesson, you will be able to use impersonal constructions, including the passive voice, to write in the formal style required for Cabinet documents."
    },
    "video": {
      title: "The MC Review",
      content: "**Title:** The MC Review\n**Scene:** A Director General (DAVID) is reviewing a draft MC with a manager (CHLOE).\n**(Video shows them in an office, looking at a document on screen.)**\n**David:** \"Chloe, this is a good start, but it's too personal. Phrases like 'We believe' or 'I think' have no place in an MC. It needs to be more objective.\"\n**Chloe:** \"Okay, so how do I rephrase this sentence: 'We recommend that the Minister seek policy approval for Option B.'?\"\n**David:** \"Simple. 'It is recommended that the Minister seek policy approval for Option B.' The recommendation stands on its own, based on the evidence presented. **It is understood** that this is the department's position. The analysis **was conducted** by the team, but the MC speaks with a single, institutional voice.\""
    },
    "strategy": {
      title: "Impersonal Constructions & The Passive Voice",
      content: "**Title:** Impersonal Constructions & The Passive Voice\n\nCabinet documents use an impersonal, objective tone. This is achieved through specific grammatical structures.\n\n**1. The Passive Voice:** The passive voice focuses on the action, not the actor. This is perfect for institutional writing where the process is more important than the person who did it.\n   - *Active:* \"Our team conducted the analysis.\" -> *Passive:* \"The analysis **was conducted**.\"\n   - *Active:* \"We will implement the policy next year.\" -> *Passive:* \"The policy **will be implemented** next year.\"\n\n**2. \"It is...\" Constructions:** Using \"It is...\" with a passive verb is a very common way to make a recommendation or state a fact impersonally.\n   - *Personal:* \"We recommend that...\" -> *Impersonal:* \"**It is recommended that...**\"\n   - *Personal:* \"We expect that...\" -> *Impersonal:* \"**It is expected that...**\"\n   - *Personal:* \"We understand that...\" -> *Impersonal:* \"**It is understood that...**\"\n\n**3. Nominalizations (from last lesson):** Using nouns instead of verbs also contributes to an impersonal tone.\n   - *Personal:* \"We decided...\" -> *Impersonal:* \"The **decision** was made...\"\n\n**The Goal:** Remove personal pronouns (I, we, our team) and create a voice that is formal, objective, and institutional."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Rewrite the following personal sentences into the formal, impersonal style of a Memorandum to Cabinet.\n\n1.  \"I think this is the best option.\"\n2.  \"We consulted with stakeholders.\"\n3.  \"Our team will monitor the situation closely.\"\n4.  \"We concluded that the risks are manageable.\"\n5.  \"We want the Minister to approve this.\"\n\n**Your Response:**\n\n> 1.  **It is considered** that this is the preferred option.\n> 2.  Consultations with stakeholders **were undertaken**.\n> 3.  The situation **will be closely monitored**.\n> 4.  **It was concluded** that the risks are manageable. / The **conclusion** was that the risks are manageable.\n> 5.  **It is recommended that** the Minister approve this course of action."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are at a meeting presenting the key recommendations from your MC. Record a 1-minute summary of your recommendations, using the formal, impersonal language you've learned.\n\n**Example starter:** \"Thank you. The purpose of this presentation is to outline the recommendations of the Memorandum to Cabinet. Firstly, it is recommended that funding for the program be renewed for five years. Secondly, it is proposed that the eligibility criteria be expanded...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  Which sentence is most appropriate for an MC?\n    a) \"We did a great job on the analysis.\"\n    b) \"The analysis was conducted by our team.\"\n    c) \"An analysis was conducted.\"\n2.  The passive voice is often used in formal writing to:\n    a) Make it more personal.\n    b) Focus on the actor.\n    c) Focus on the action.\n3.  How would you rephrase \"We believe the policy is effective\" for an MC?\n    a) \"It is our belief that the policy is effective.\"\n    b) \"The policy is considered to be effective.\"\n    c) \"We are sure the policy is effective.\"\n4.  The phrase \"It is recommended that...\" is an example of:\n    a) An active construction.\n    b) A personal construction.\n    c) An impersonal construction.\n5.  The tone of a Memorandum to Cabinet should be subjective and personal.\n    a) True\n    b) False\n\n**Answers:** 1-c, 2-c, 3-b, 4-c, 5-b"
    },
    "coaching": {
      title: "The Doctrine of Cabinet Confidence",
      content: "**Title:** The Doctrine of Cabinet Confidence\n\nCabinet documents are among the most sensitive in government. They are protected by the doctrine of Cabinet confidence, meaning they are secret, often for 20 years or more. This is to allow for full, frank, and fearless debate among ministers. When you write an MC, you are writing a secret document that will shape a government decision. This requires the utmost professionalism, objectivity, and discretion. The impersonal style is not just a stylistic choice; it is a reflection of the gravity of the process."
    },
  },
  "22.3": {
    "hook": {
      title: "\"If the opposition had been in power, would they have made the same choice?\" Answering hypothetical questions from a parliamentary committee is a minefield. The conditional perfect is your shield.",
      content: "**Hook:** \"If the opposition had been in power, would they have made the same choice?\" Answering hypothetical questions from a parliamentary committee is a minefield. The conditional perfect is your shield.\n**Objective:** By the end of this lesson, you will be able to use the conditional perfect tense to answer hypothetical questions accurately and strategically during a parliamentary committee appearance."
    },
    "video": {
      title: "The Committee Grilling",
      content: "**Title:** The Committee Grilling\n**Scene:** A Deputy Minister (MR. CARTER) is testifying before a parliamentary committee.\n**(Video shows a formal committee room. An opposition MP is questioning Mr. Carter.)**\n**MP:** \"Mr. Carter, your department spent $50 million on this project, which ultimately failed. If you had known from the start that it would fail, **would you have approved** the funding?\"\n**Mr. Carter:** \"Thank you for the question, Member. It is a hypothetical one. All decisions were based on the information available at the time. If we **had had** perfect foresight, of course, different decisions **would have been made**. But in the real world, we must act on the best available evidence.\"\n**MP:** \"So you admit you made a mistake?\"\n**Mr. Carter:** \"I admit that if the circumstances **had been** different, the outcome **would have been** different. That is the nature of risk in public administration.\""
    },
    "strategy": {
      title: "The Conditional Perfect (Third Conditional)",
      content: "**Title:** The Conditional Perfect (Third Conditional)\n\nThe conditional perfect, also known as the third conditional, is used to talk about hypothetical situations in the past that did not happen.\n\n**Structure:**\n**If + Past Perfect, ... would have + Past Participle**\n\n- **If clause (the condition):** `If + subject + had + past participle`\n  - *Example:* \"If we **had known**...\"\n- **Main clause (the result):** `subject + would have + past participle`\n  - *Example:* \"...we **would have chosen** a different path.\"\n\n**Examples:**\n- \"If the department **had received** more funding, it **would have been able** to expand the program.\"\n- \"The crisis **would not have happened** if the proper procedures **had been followed**.\"\n\n**Key Strategy for Committees:**\n- **Acknowledge the hypothetical:** Start by saying \"That is a hypothetical question.\"\n- **Use the conditional perfect:** Answer the question using the correct grammar.\n- **Pivot back to reality:** Immediately return to what actually happened and why the decision was made based on the information available at the time."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are preparing your Deputy Minister for a committee appearance. Write a 150-word response to the following anticipated question: \"If your department had consulted more widely, would you have avoided this public backlash?\"\n\n**Your Response:**\n\n> Thank you for the question. It is, of course, a hypothetical one.\n>\n> If we **had conducted** even more extensive consultations, it is possible that we **would have received** a different range of feedback. However, the consultations that were undertaken were robust and in line with Treasury Board guidelines. The decision was made based on a thorough analysis of the input that **had been gathered**. We believe that even if the consultation process **had been** different, the fundamental policy challenge **would have remained** the same."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are a senior official at a parliamentary committee. An MP asks you: \"If you had to do it all over again, would you have launched the program in the same way?\" Record your 1-minute response.\n\n**Example starter:** \"Thank you, Member. That requires me to speculate. If we were launching the program today, with the benefit of hindsight, of course we would have done some things differently. For example, we would have allocated more resources to communications...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  Which tense is used in the \"if\" clause of the conditional perfect?\n    a) Simple Past\n    b) Past Perfect\n    c) Present Perfect\n2.  Complete the sentence: \"If I had known, I ___ you.\"\n    a) would tell\n    b) will have told\n    c) would have told\n3.  The conditional perfect is used for hypothetical situations in the __.\n    a) past\n    b) present\n    c) future\n4.  When answering a hypothetical question in committee, you should first:\n    a) Answer directly.\n    b) Acknowledge that it is hypothetical.\n    c) Refuse to answer.\n5.  \"If the report would have been ready, we would have sent it.\" Is this sentence grammatically correct?\n    a) Yes\n    b) No\n\n**Answers:** 1-b, 2-c, 3-a, 4-b, 5-b (Correct: \"If the report had been ready...\")"
    },
    "coaching": {
      title: "Never Speculate",
      content: "**Title:** Never Speculate\n\nThe golden rule of appearing before a parliamentary committee is \"Never speculate.\" Do not guess about what might have been or what might happen in the future. Stick to the facts. The conditional perfect is a grammatical tool to answer a hypothetical question, but your strategy should always be to pivot back to what you know and what was done. Answer the hypothetical briefly, then return to solid ground. Your job is to inform the committee, not to write fiction with them."
    },
  },
  "22.4": {
    "hook": {
      title: "You can have the best policy idea in the world, but if you can't communicate it clearly and persuasively in writing, it will go nowhere. Executive writing is not about fancy words; it's about clarity, precision, and impact. It's the final step in mastering your executive presence.",
      content: "**Hook:** You can have the best policy idea in the world, but if you can't communicate it clearly and persuasively in writing, it will go nowhere. Executive writing is not about fancy words; it's about clarity, precision, and impact. It's the final step in mastering your executive presence.\n**Objective:** By the end of this lesson, you will be able to synthesize various advanced writing techniques to produce a clear, concise, and persuasive piece of executive writing."
    },
    "video": {
      title: "The Final Polish",
      content: "**Title:** The Final Polish\n**Scene:** A Deputy Minister is giving final feedback on a key document to her executive team.\n**(Video shows the DM and two directors in a modern office.)**\n**DM:** \"This is a solid draft. The analysis is there. But it's not... executive. It's too wordy. Let's tighten it up. Instead of 'It is the recommendation of the department that...', just say 'The department recommends...'. Active voice. And this paragraph here—what's the bottom line? Put that first. BLUF. Finally, the tone. It's a bit dry. Let's add a stronger concluding sentence that reinforces the 'why'. Remember, we're not just informing; we're persuading.\""
    },
    "strategy": {
      title: "The Executive Writing Checklist",
      content: "**Title:** The Executive Writing Checklist\n\nThis lesson synthesizes everything you've learned about writing. Before you send any document to a senior executive, run it through this checklist.\n\n**1. BLUF (Bottom Line Up Front):** Is your main point or recommendation in the first paragraph? An executive should be able to understand your key message in the first 30 seconds.\n\n**2. Active Voice:** Have you used the active voice wherever possible? It's more direct and powerful. (e.g., \"The team recommends...\" instead of \"It is recommended by the team...\"). Reserve the passive voice for when the action is truly more important than the actor (as in formal MCs).\n\n**3. Conciseness (The 30% Rule):** Can you cut 30% of the words without losing any meaning? Eliminate jargon, redundant phrases (\"basic fundamentals\"), and weak verbs. Replace \"in order to\" with \"to\". Replace \"due to the fact that\" with \"because\".\n\n**4. Clear Structure:** Does the document have a logical flow? Use headings, subheadings, and bullet points to guide the reader. Each paragraph should have a clear topic sentence.\n\n**5. Audience-Focused:** Is the language tailored to your audience? Are you answering the questions they will have? Are you anticipating their concerns?\n\n**6. Persuasive Tone:** Is your writing just informative, or is it persuasive? Does it convey confidence and authority? Does it end with a clear call to action or a memorable concluding thought?"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** The following paragraph is poorly written for an executive audience. Rewrite it using the Executive Writing Checklist.\n\n> It has come to our attention that, due to the fact that the implementation of the new software system has been experiencing some significant delays, there is a general consensus that a review of the project plan should be undertaken in order to determine the root causes of the aforementioned issues. It is the recommendation of the project management team that this review be initiated as soon as possible.\n\n**Your Response:**\n\n> **Recommendation:** Initiate an immediate review of the new software project plan.\n>\n> The project is experiencing significant implementation delays. A review is required to determine the root causes and develop a recovery plan."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You need to send a quick voice note to your ADM to update her on a file. You have 30 seconds. Record a message that is a masterclass in BLUF and conciseness.\n\n**Example:** \"Hi ADM. Quick update on the Phoenix file. We've identified the root cause of the pay issue. It's a data transfer problem. The fix will take two weeks. I'll send a one-pager with the full details this afternoon. Thanks.\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  What does BLUF stand for?\n    a) Be Loud, Use Force\n    b) Bottom Line Up Front\n    c) Be Long, Use Footnotes\n2.  For executive writing, which voice is generally preferred?\n    a) Active Voice\n    b) Passive Voice\n    c) A mix of both\n3.  The \"30% Rule\" refers to:\n    a) Giving a 30% discount.\n    b) Cutting 30% of the words to improve conciseness.\n    c) Ensuring your document is 30% shorter than the previous one.\n4.  Which phrase is more concise?\n    a) \"In order to\"\n    b) \"To\"\n5.  Good executive writing is primarily informative, not persuasive.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-a, 3-b, 4-b, 5-b"
    },
    "coaching": {
      title: "Read What the Leaders Read",
      content: "**Title:** Read What the Leaders Read\n\nTo write like an executive, you need to read like an executive. Pay close attention to the documents that land on your desk from senior management. How are they structured? What kind of language do they use? How do they make an argument? Also, read high-quality journalism, like *The Economist*, *The Wall Street Journal*, or the *Globe and Mail*'s Report on Business. These publications are masters of clear, concise, and impactful writing for a busy audience. Absorb their style, analyze, and emulate."
    },
  },
  "23.1": {
    "hook": {
      title: "You are on stage, the spotlight is on you, and 500 people are waiting to hear your message. A keynote address is more than a speech; it's a performance. It's your opportunity to shape the conversation and establish yourself as a thought leader.",
      content: "**Hook:** You are on stage, the spotlight is on you, and 500 people are waiting to hear your message. A keynote address is more than a speech; it's a performance. It's your opportunity to shape the conversation and establish yourself as a thought leader.\n**Objective:** By the end of this lesson, you will be able to structure a compelling keynote address and use advanced rhetorical devices to engage and persuade an audience."
    },
    "video": {
      title: "The Vision Speech",
      content: "**Title:** The Vision Speech\n**Scene:** A Director General delivers the opening keynote at a major industry conference.\n**(Video shows the DG on a large stage, speaking with confidence and passion.)**\n**DG:** \"Friends, colleagues, innovators! We stand at a crossroads. A moment of profound change. Some see uncertainty; I see opportunity. Some see challenges; I see a call to action. This is not merely a new chapter for our sector; it is a new book. And we, all of us, are its authors. The question is not *if* we will adapt, but *how*. The question is not *if* we will succeed, but *what* our success will look like.\""
    },
    "strategy": {
      title: "Rhetorical Mastery",
      content: "**Title:** Rhetorical Mastery\n\nRhetorical devices are techniques used to make speech more persuasive and memorable.\n\n**1. Anaphora:** Repeating a word or phrase at the beginning of successive clauses.\n   - *Example:* \"**We will not** tire. **We will not** falter. **We will not** fail.\"\n\n**2. Epistrophe:** Repeating a word or phrase at the end of successive clauses.\n   - *Example:* \"Government of the people, by the people, for the people.\"\n\n**3. Antithesis:** Juxtaposing contrasting ideas in a balanced phrase.\n   - *Example:* \"Ask not what your country can do for you; ask what you can do for your country.\"\n   - *Example:* \"It was the best of times, it was the worst of times.\"\n\n**4. Rhetorical Question:** A question asked for effect, not to get an answer.\n   - *Example:* \"And is not this the kind of country we want to build?\"\n\n**5. The Rule of Three:** Presenting ideas in groups of three.\n   - *Example:* \"Our goals are simple: a stronger economy, a healthier society, and a more secure nation.\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are writing the opening for a keynote address on the future of public service. Write a 150-word opening paragraph that uses at least two different rhetorical devices.\n\n**Your Response:**\n\n> Colleagues, public servants, nation-builders.\n>\n> We are here today not to talk about the public service of yesterday, but the public service of tomorrow. Some say our institution is too slow to change. I say we are steady. Some say we are risk-averse. I say we are prudent. The challenge before us is not to abandon our principles, but to adapt them. The challenge is not to lose our way, but to find a new one. So I ask you: are we ready to build that future? Are we ready to lead that change?"
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are delivering the closing of your keynote address. You want to leave the audience inspired. Record a 1-minute closing statement that uses the rule of three and anaphora.\n\n**Example starter:** \"So let us leave here today with a renewed sense of purpose. Let us leave here ready to innovate. Let us leave here ready to lead. Let us build a public service that is more agile, more digital, and more inclusive...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  Repeating a phrase at the beginning of clauses is called:\n    a) Epistrophe\n    b) Anaphora\n    c) Antithesis\n2.  \"To err is human; to forgive, divine\" is an example of:\n    a) Antithesis\n    b) Rule of Three\n    c) Rhetorical Question\n3.  The main purpose of rhetorical devices is to:\n    a) Make your speech longer.\n    b) Confuse the audience.\n    c) Make your speech more persuasive and memorable.\n4.  Which is an example of a rhetorical question?\n    a) \"What time is it?\"\n    b) \"Shall we compare this day to a winter's morning?\"\n    c) \"Do you agree?\"\n5.  Presenting ideas in groups of three makes them less impactful.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-a, 3-c, 4-b, 5-b"
    },
    "coaching": {
      title: "It's All About the Story",
      content: "**Title:** It's All About the Story\n\nA great keynote is not a list of facts; it's a story. It has a beginning (the hook), a middle (the argument), and an end (the call to action). It has characters (you and the audience), a conflict (the problem you are trying to solve), and a resolution (your proposed solution). Before you write a single word, think about the story you want to tell. What is the journey you want to take your audience on? A good story is what they will remember long after they have forgotten your data points.\n_"
    },
  },
  "23.2": {
    "hook": {
      title: "You are not the main speaker, but you control the conversation. Moderating a panel of experts is a delicate balancing act. It requires you to be a facilitator, a diplomat, and a synthesizer, all at once. Your role is to make the panelists shine and the audience feel enlightened.",
      content: "**Hook:** You are not the main speaker, but you control the conversation. Moderating a panel of experts is a delicate balancing act. It requires you to be a facilitator, a diplomat, and a synthesizer, all at once. Your role is to make the panelists shine and the audience feel enlightened.\n**Objective:** By the end of this lesson, you will be able to moderate a high-level panel discussion, manage different personalities, and synthesize complex ideas in real-time."
    },
    "video": {
      title: "Herding the Experts",
      content: "**Title:** Herding the Experts\n**Scene:** An Assistant Deputy Minister (ADM) moderates a panel on the future of artificial intelligence in government.\n**(Video shows the ADM at a table with four diverse panelists.)**\n**ADM:** \"Thank you, Dr. Evans, for that insightful point on data ethics. I'd like to bring in Ms. Chen now. As someone who has implemented AI in the private sector, how do you see us overcoming these adoption barriers in a public service context?\"\n**(One panelist tries to interrupt.)**\n**ADM:** \"An excellent point, Mr. Harris, and I promise we'll come back to the legislative angle in a moment. But first, let's hear Ms. Chen's operational perspective.\""
    },
    "strategy": {
      title: "The Art of Moderation",
      content: "**Title:** The Art of Moderation\n\nEffective moderation is about guiding, not dominating. It rests on three core skills:\n\n**1. The 3 Ps of Moderation:**\n   - **Preparation:** Know your topic and your panelists. Prepare thoughtful, open-ended questions. Have a clear agenda with time allocations.\n   - **Pivoting:** Master the art of the transition. Connect one panelist's point to the next question. Smoothly change topics. For example: \"That's a great point about policy. Let's pivot to the implementation side...\"\n   - **Punch:** End each segment and the overall discussion with a concise, powerful summary of the key takeaways.\n\n**2. Managing Personalities:**\n   - **The Monopolizer:** Interject politely but firmly. \"Thank you, that's a very comprehensive view. To ensure we get multiple perspectives, I'd like to bring in...\"\n   - **The Shy Expert:** Draw them out with a direct, specific question you know they are qualified to answer. \"Dr. Leblanc, your research on this is groundbreaking. Could you elaborate on...?\"\n   - **The Disruptor:** Acknowledge their point, but steer the conversation back on track. \"I appreciate that perspective, and it's a valid concern for another discussion. For the sake of our agenda today, let's focus on...\"\n\n**3. Synthesizing on the Fly:** Your most important job. Listen for themes, connections, and disagreements. Periodically summarize: \"So, it seems we have a consensus on X, but some divergence on Y. Let's explore that divergence...\""
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are moderating a panel on \"Digital Transformation in the Public Sector.\" Write a 150-word opening script that introduces the topic, briefly introduces the three panelists (a tech CEO, a senior public servant, and an academic), and poses the first question.\n\n**Your Response:**\n\n> Welcome, everyone, to what promises to be a fascinating discussion on one of the most critical challenges of our time: the digital transformation of our public institutions. We are privileged to have three leading voices with us today. From the private sector, we have the innovative CEO of TechForward, Ms. Anya Sharma. From within government, the seasoned experience of Mr. David Chen, a Director General at Treasury Board. And from academia, the critical perspective of Dr. Emily Tremblay from the University of Ottawa. We have technology, policy, and research all at one table. So let's dive right in. My first question is for all of you: Beyond the buzzwords, what does 'digital transformation' truly mean for the average public servant and the citizens they serve? Anya, perhaps we could start with you?"
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** One of your panelists, the tech CEO, has been dominating the conversation for the last three minutes. Record a 30-second intervention where you politely interrupt them and redirect the question to the academic on the panel.\n\n**Example starter:** \"Fascinating points, Anya. You've given us a lot to think about regarding the speed of innovation. I want to pause on that thought and bring in Dr. Tremblay. Emily, from your research perspective, what are the risks if we move too fast?...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  The \"3 Ps\" of moderation are:\n    a) Passion, Personality, Punch\n    b) Preparation, Pivoting, Punch\n    c) Prepare, Present, Persuade\n2.  When dealing with a \"monopolizer,\" you should:\n    a) Let them speak to maintain the flow.\n    b) Politely interject and redirect the conversation.\n    c) Ask them a very difficult question.\n3.  Synthesizing on the fly means:\n    a) Taking detailed notes.\n    b) Identifying and summarizing key themes during the discussion.\n    c) Making sure everyone speaks for the same amount of time.\n4.  A good opening for a panel discussion should:\n    a) State your own opinion on the topic.\n    b) Introduce the topic and panelists, and pose the first question.\n    c) Ask each panelist to introduce themselves.\n5.  The primary role of a moderator is to be the star of the show.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-b, 3-b, 4-b, 5-b"
    },
    "coaching": {
      title: "Be the Host, Not the Hero",
      content: "**Title:** Be the Host, Not the Hero\n\nYour job as a moderator is to be the host of a great dinner party. You want to make sure every guest feels welcome, contributes to the conversation, and has a good time. You guide the discussion, but you don't dominate it. You make your guests—the panelists—look good. The best moderators are almost invisible; they make the conversation seem effortless. Resist the urge to show how much you know. Instead, focus all your energy on listening actively and making connections. When your panelists shine, you shine.\n_"
    },
  },
  "23.3": {
    "hook": {
      title: "You are addressing an audience of 2,000 employees in a live-streamed town hall. How do you connect with them? How do you make every single person feel like you are speaking directly to them? Speaking at scale is not just about being louder; it's about creating a sense of shared experience.",
      content: "**Hook:** You are addressing an audience of 2,000 employees in a live-streamed town hall. How do you connect with them? How do you make every single person feel like you are speaking directly to them? Speaking at scale is not just about being louder; it's about creating a sense of shared experience.\n**Objective:** By the end of this lesson, you will learn techniques to project authority, build rapport, and deliver a powerful message to a large audience, both in-person and virtually."
    },
    "video": {
      title: "The All-Hands Address",
      content: "**Title:** The All-Hands Address\n**Scene:** A Deputy Minister (DM) is on a large stage, addressing all employees of her department. The atmosphere is a mix of anticipation and skepticism.\n**(Video shows the DM moving across the stage, making eye contact with different sections of the audience.)**\n**DM:** \"I know there's been a lot of talk about the changes ahead. I've read the emails. I've heard the chatter in the hallways. And I want to speak to you today, not as your DM, but as a fellow public servant who believes in our mission. (She pauses, moving to one side of the stage). To the team in the regions, I see you. I know the unique challenges you face. (She moves to the other side). To our policy analysts burning the midnight oil, I see you. Your work is the bedrock of everything we do. This isn't about top-down directives; this is about our shared journey forward.\""
    },
    "strategy": {
      title: "Commanding the Large Stage",
      content: "**Title:** Commanding the Large Stage\n\nEngaging a large audience requires a different set of tools than small-group communication.\n\n**1. The Power of the Pause:** In a large room or a virtual setting, silence is amplified. Use strategic pauses to build suspense, emphasize a key point, or allow the audience to absorb a complex idea. Don't be afraid of the silence; own it.\n\n**2. The \"Triangle\" Gaze:** Don't just scan the audience. Divide the room into three zones: left, center, and right. Make sustained eye contact with one person in each zone, one after the other. This creates the illusion that you are speaking to everyone in that section.\n\n**3. Vocal Dynamics:** A monotone voice gets lost in a large space. Vary your pitch, pace, and volume.\n   - **Pitch:** Use a higher pitch for excitement, a lower pitch for seriousness.\n   - **Pace:** Speak more slowly to emphasize a key point, more quickly to build energy.\n   - **Volume:** Project from your diaphragm, but also use a quieter, more confidential tone to draw the audience in.\n\n**4. Purposeful Movement:** Every step you take on stage should have a purpose. Move to a different spot to signal a transition to a new topic. Walk towards the audience to create a more intimate connection. Avoid nervous pacing."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are preparing for a department-wide town hall to announce a new strategic plan. Write a 150-word segment where you acknowledge employee concerns and transition to a message of optimism. Include stage directions for your movement and pauses.\n\n**Your Response:**\n\n> (Standing center stage). I want to start by acknowledging what I know is on many of your minds: uncertainty. Change is never easy, and with this new strategic plan, it's natural to have questions and concerns. (Pause for 3 seconds, making eye contact with the center section). I want you to know that we hear you. Your feedback has been invaluable. (Walk slowly to the left side of the stage). But today, I want to talk about the other side of change: opportunity. This plan is not just a document; it's a roadmap to a more innovative, more agile, and more impactful organization. It's a future we will build together."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Record the segment you wrote above. Focus on using vocal dynamics and pauses to convey both empathy and confidence. Imagine you are speaking to a large, silent auditorium.\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  The \"Triangle\" Gaze involves:\n    a) Looking at the back wall.\n    b) Making eye contact with one person in three different zones.\n    c) Scanning the audience from left to right continuously.\n2.  A strategic pause is used to:\n    a) Catch your breath.\n    b) Check your notes.\n    c) Emphasize a point and allow the audience to reflect.\n3.  Varying your pitch, pace, and volume is known as:\n    a) Vocal dynamics.\n    b) Vocal fry.\n    c) Vocal projection.\n4.  When speaking to a large audience, your movement should be:\n    a) Spontaneous and random.\n    b) Minimized to show you are in control.\n    c) Purposeful and linked to your message.\n5.  The main challenge of speaking at scale is making the experience feel personal and connected.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-c, 3-a, 4-c, 5-a"
    },
    "coaching": {
      title: "From One to Many, Back to One",
      content: "**Title:** From One to Many, Back to One\n\nWhen you're speaking to thousands, it's easy to feel disconnected. The secret is to find one person in the audience and speak directly to them. Tell your story to that one person. Share your idea with that one person. Then, find another person in a different section and do the same. By connecting with individuals, one by one, you create a web of connection that covers the entire room. You are not speaking to a crowd; you are having a series of one-on-one conversations, simultaneously. That is the art of intimacy at scale.\n_"
    },
  },
  "23.4": {
    "hook": {
      title: "Your ideas are powerful, but their impact is limited to those you can speak to directly. How do you scale your influence beyond the room? By publishing. An article, a blog post, or a white paper can carry your message to thousands, shaping the discourse long after you've spoken.",
      content: "**Hook:** Your ideas are powerful, but their impact is limited to those you can speak to directly. How do you scale your influence beyond the room? By publishing. An article, a blog post, or a white paper can carry your message to thousands, shaping the discourse long after you've spoken.\n**Objective:** By the end of this lesson, you will understand how to translate your expertise into a compelling written piece, navigate the publishing process, and use the written word to build your professional influence."
    },
    "video": {
      title: "The Influential Article",
      content: "**Title:** The Influential Article\n**Scene:** A Director General is in her office, on a video call with a journalist from a major public policy magazine.\n**(Video shows the DG and the journalist on a split screen.)**\n**Journalist:** \"Your article on 'The Future of Regulation' has generated a significant amount of buzz, Director General. It's one of our most-read pieces this month. Can you tell us what prompted you to write it?\"\n**DG:** \"I felt the conversation on this topic was becoming too polarized. We were stuck in a debate between 'more regulation' and 'less regulation.' I wanted to reframe the issue. The question isn't about quantity; it's about quality. It's about smarter, more agile, more data-driven regulation. I wrote the article to introduce that third option into the debate.\""
    },
    "strategy": {
      title: "From Idea to Impactful Text",
      content: "**Title:** From Idea to Impactful Text\n\nPublishing is a strategic way to establish thought leadership. Here’s how to approach it:\n\n**1. The \"So What?\" Test:** Before you write a word, ask yourself: \"So what?\" Why should a busy person care about this? What is the single most important message you want them to take away? Your core argument must be clear, concise, and relevant to your target audience.\n\n**2. Structuring Your Argument:** A strong article is a well-structured one.\n   - **The Hook:** Start with a surprising statistic, a provocative question, or a compelling anecdote.\n   - **The Thesis:** Clearly state your main argument in the first or second paragraph.\n   - **The Evidence:** Support your thesis with 3-4 key points, each backed by data, examples, or expert opinion.\n   - **The Counter-Argument:** Acknowledge and respectfully refute the opposing viewpoint. This shows intellectual honesty and strengthens your own case.\n   - **The Conclusion:** Summarize your argument and end with a powerful call to action or a forward-looking statement.\n\n**3. Writing with Clarity and Authority:**\n   - **Use the active voice:** \"We recommend...\" is stronger than \"It is recommended that...\"\n   - **Cut the jargon:** Write to be understood, not to impress. If you must use a technical term, explain it.\n   - **Use strong verbs and concrete nouns:** Avoid vague, bureaucratic language.\n\n**4. Choosing Your Platform:** Where you publish matters. Consider:\n   - **Internal Blogs/Wikis:** Good for sharing ideas within your organization.\n   - **Industry Journals (e.g., Canadian Public Administration):** Good for reaching a specialized, academic audience.\n   - **Mainstream Publications (e.g., Policy Options, The Globe and Mail):** Good for influencing the broader public debate."
    },
    "written": {
      title: "In the private sector, \"fail fast, fail forward\" is a celebrated mantra. In the public service, failure is a four-letter word. But what if our aversion to failure is the single biggest obstacle to innovation?",
      content: "**Task:** You want to write an article arguing that the public service needs to embrace failure as a learning opportunity. Write a 200-word outline that includes a hook, a thesis statement, three supporting points, and a concluding thought.\n\n**Your Response:**\n\n> **Hook:** In the private sector, \"fail fast, fail forward\" is a celebrated mantra. In the public service, failure is a four-letter word. But what if our aversion to failure is the single biggest obstacle to innovation?\n>\n> **Thesis:** To build a truly agile and responsive public service, we must fundamentally shift our culture from one that fears failure to one that learns from it.\n>\n> **Point 1: The Innovation Killer.** Our current system of accountability, while well-intentioned, discourages risk-taking. We reward predictability, not creativity. (Example: A pilot project that shows mixed results is deemed a \"failure\" and cancelled, instead of being iterated upon).\n>\n> **Point 2: The Data Goldmine.** Failure is data. When a project doesn't work as planned, it provides invaluable information about what to do differently next time. We need to create safe spaces for \"intelligent failures\" and a systematic process for extracting lessons learned.\n>\n> **Point 3: The Leadership Mandate.** This culture shift must start at the top. Leaders need to model vulnerability, openly discuss their own setbacks, and reward teams for smart risk-taking, not just for successful outcomes.\n>\n> **Conclusion:** The public service of the future won't be one that never fails; it will be one that is the best in the world at learning from failure."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are pitching your article idea to an editor. Record a 1-minute \"elevator pitch\" that summarizes your argument and explains why it is timely and important for their readers.\n\n**Example starter:** \"I'm proposing an article titled 'The Permission to Fail.' It argues that our public service's fear of failure is stifling innovation. At a time when we face unprecedented challenges, from climate change to digital disruption, we can no longer afford to play it safe...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  The \"So What?\" test is designed to:\n    a) Check your grammar.\n    b) Ensure your argument is relevant and important.\n    c) See if your topic is controversial.\n2.  A strong written argument should always include:\n    a) A lot of technical jargon.\n    b) A personal opinion.\n    c) A clear thesis and supporting evidence.\n3.  Acknowledging the counter-argument in your writing:\n    a) Weakens your position.\n    b) Strengthens your position by showing intellectual honesty.\n    c) Is only necessary in academic papers.\n4.  The active voice is generally preferred in professional writing because it is:\n    a) More formal.\n    b) More direct and authoritative.\n    c) Easier to write.\n5.  The choice of publishing platform depends on your communication goals and target audience.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-c, 3-b, 4-b, 5-a"
    },
    "coaching": {
      title: "Your Writing is Your Digital Body Language",
      content: "**Title:** Your Writing is Your Digital Body Language\n\nIn a virtual world, your writing is often the first impression you make. It is your digital body language. Clear, confident, and well-structured writing signals a clear, confident, and well-structured mind. Messy, jargon-filled, and poorly organized writing signals the opposite. Before you hit \"send\" or \"submit,\" read your work aloud. Does it sound like you? Is it a voice you would trust? Every piece of writing you put out into the world is a brick in the foundation of your professional reputation. Build it well.\n_"
    },
  },
  "24.1": {
    "hook": {
      title: "You've reached the pinnacle of your career. Now what? Your most enduring legacy will not be the policies you passed or the projects you managed, but the leaders you developed. Mentoring the next generation of executives is the ultimate act of leadership.",
      content: "**Hook:** You've reached the pinnacle of your career. Now what? Your most enduring legacy will not be the policies you passed or the projects you managed, but the leaders you developed. Mentoring the next generation of executives is the ultimate act of leadership.\n**Objective:** By the end of this lesson, you will learn the principles of effective executive mentorship, including how to ask powerful questions, provide constructive feedback, and guide a protégé’s career development."
    },
    "video": {
      title: "The Protégé's Dilemma",
      content: "**Title:** The Protégé's Dilemma\n**Scene:** A seasoned Deputy Minister (DM) has a coffee with her protégé, a newly appointed Director General (DG).\n**(Video shows the two sitting in a quiet corner of a café.)**\n**DG:** \"I have a major problem. My two best directors are constantly at odds. It's affecting the entire team's morale. I've tried everything, and I'm tempted to just move one of them to another team.\"\n**DM:** (Nods slowly, takes a sip of coffee) \"That's a tough situation. And moving one of them is certainly an option. Before you do that, though, let me ask you this: what does each director *really* want? Beyond the surface-level disagreements, what is their underlying interest? And what outcome would be a true win for the organization, not just a temporary peace treaty?\""
    },
    "strategy": {
      title: "The Mentor's Toolkit",
      content: "**Title:** The Mentor's Toolkit\n\nMentoring is not about giving answers; it's about asking the right questions. It's about guiding, not directing.\n\n**1. The GROW Model for Mentoring Conversations:**\n   - **Goal:** What do you want to achieve? (e.g., \"I want to improve my presentation skills.\")\n   - **Reality:** Where are you now? What have you tried? (e.g., \"I get nervous and tend to rush.\")\n   - **Options:** What *could* you do? What are the possibilities? (e.g., \"I could join Toastmasters, work with a coach, practice more...\")\n   - **Will (or Way Forward):** What *will* you do? What is your first step? (e.g., \"I will record myself practicing and review it this week.\")\n\n**2. The Art of the Powerful Question:** A powerful question is open-ended, thought-provoking, and challenges assumptions.\n   - Instead of: \"Have you tried talking to them?\"\n   - Ask: \"What would a truly courageous conversation about this look like?\"\n   - Instead of: \"Is this your top priority?\"\n   - Ask: \"If you could only accomplish one thing this year, what would it be?\"\n\n**3. Feedback vs. Advice:**\n   - **Advice** is telling someone what to do (\"You should...\"). It can be useful, but it can also create dependency.\n   - **Feedback** is sharing your observations and their impact on you (\"When you did X, I felt Y...\"). It is data that the protégé can choose how to use. It is empowering."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** Your protégé, a new EX-01, is struggling with work-life balance. They feel overwhelmed and are thinking of stepping back from a major project. Using the GROW model, write a 150-word script for how you would open the conversation to guide them towards a solution.\n\n**Your Response:**\n\n> \"Thanks for reaching out. It sounds like you're in a really challenging spot right now. Let's talk it through. First, let's focus on the **Goal**. When you think about your professional and personal life a year from now, what does ideal work-life balance look like for you? Let's get a clear picture of the destination.\n>\n> Now, let's look at the **Reality**. Can you walk me through a typical week? Where is most of your time and energy going? What have you already tried to do to manage the workload?\n>\n> Once we have that, we can brainstorm some **Options**. We won't decide anything yet, just explore all the possibilities, from the conventional to the radical. And finally, we can land on what you **Will** do. What's one small step you can commit to this week?\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Your protégé tells you, \"I'm not good at networking.\" Record a 1-minute response where you use powerful questions to challenge this limiting belief and help them reframe the issue.\n\n**Example starter:** \"That's interesting. Tell me more about that. What does 'networking' mean to you? What's your evidence for the belief that you're not good at it? What if we replaced the word 'networking' with 'building relationships'? Does that change anything for you?... \"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  The \"G\" in the GROW model stands for:\n    a) Guidance\n    b) Goal\n    c) Growth\n2.  \"What is the assumption you are making here?\" is an example of:\n    a) A closed question\n    b) A leading question\n    c) A powerful question\n3.  The main difference between feedback and advice is:\n    a) Feedback is more critical.\n    b) Advice tells someone what to do; feedback provides data for them to interpret.\n    c) Advice is for junior employees; feedback is for executives.\n4.  An effective mentor primarily provides:\n    a) Answers and solutions.\n    b) Questions and guidance.\n    c) Career opportunities.\n5.  The ultimate goal of mentorship is to make the protégé independent, not dependent.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-c, 3-b, 4-b, 5-a"
    },
    "coaching": {
      title: "Plant a Tree You'll Never See",
      content: "**Title:** Plant a Tree You'll Never See\n\nA mentor-protégé relationship is a long-term investment. The seeds you plant today may not bear fruit for years to come. You may not be there to see your protégé become a DM, but your guidance will be a part of their journey. The Greek proverb says, \"A society grows great when old men plant trees whose shade they know they shall never sit in.\" Mentoring is your opportunity to plant those trees. It is your legacy. It is the final, and perhaps most important, chapter of your leadership story.\n_"
    },
  },
  "24.2": {
    "hook": {
      title: "You can have the best strategy in the world, but as the saying goes, \"culture eats strategy for breakfast.\" As a senior executive, you are not just a manager of tasks; you are a steward of culture. Your words and actions ripple through the organization, shaping the \"way we do things around here.\"",
      content: "**Hook:** You can have the best strategy in the world, but as the saying goes, \"culture eats strategy for breakfast.\" As a senior executive, you are not just a manager of tasks; you are a steward of culture. Your words and actions ripple through the organization, shaping the \"way we do things around here.\"\n**Objective:** By the end of this lesson, you will be able to identify the key levers for shaping organizational culture and develop a strategy to foster a more positive, high-performing work environment."
    },
    "video": {
      title: "The Story of the \"Failed\" Project",
      content: "**Title:** The Story of the \"Failed\" Project\n**Scene:** At a town hall, a new ADM is asked about a high-profile project that was recently cancelled.\n**(Video shows the ADM on stage, looking thoughtful.)**\n**Employee (from audience):** \"The 'Future Forward' project was just cancelled after a year of work. What does this say about our commitment to innovation?\"\n**ADM:** \"That's an excellent and important question. I wouldn't say the project 'failed.' I would say it taught us some very valuable lessons. We learned that the technology wasn't mature enough, and we learned that we need to engage our stakeholders earlier in the process. We are celebrating the team that worked on it for their courage in trying something new. And we are taking those lessons and applying them to our next innovation project. To me, that's a success. That's the culture we want to build: one where we take smart risks, we learn, and we adapt.\""
    },
    "strategy": {
      title: "The 3 Levers of Culture Change",
      content: "**Title:** The 3 Levers of Culture Change\n\nCulture is shaped by a combination of what leaders say, what they do, and what they measure.\n\n**1. Storytelling:** Humans are wired for stories. The stories you tell, the heroes you celebrate, and the language you use all send powerful signals about what is valued.\n   - **Celebrate \"good failures\":** Tell stories of projects that didn't work out but produced valuable learning.\n   - **Create a new language:** Instead of \"employees,\" say \"colleagues.\" Instead of \"headquarters,\" say \"support centre.\"\n\n**2. Symbols:** People look to your actions and symbolic gestures to understand what really matters.\n   - **Your calendar:** Where do you spend your time? Is it in budget meetings or in meetings with frontline staff? Your calendar is a political document.\n   - **Your questions:** What questions do you ask in meetings? Do you ask about deadlines and budgets, or do you ask about learning and collaboration?\n\n**3. Systems:** These are the formal and informal processes that reinforce or undermine the desired culture.\n   - **Hiring and Promotion:** Do you hire and promote people who are technical experts but poor collaborators? Or do you prioritize emotional intelligence and teamwork?\n   - **Performance Management:** Do you only measure \"what\" people achieve, or do you also measure \"how\" they achieve it? Is collaboration part of the performance evaluation?"
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You want to foster a more collaborative culture in your branch. Currently, teams work in silos. Write a 150-word plan outlining one specific action you will take in each of the three lever areas: Storytelling, Symbols, and Systems.\n\n**Your Response:**\n\n> To break down our silos and foster a more collaborative culture, I will take a three-pronged approach.\n>\n> **Storytelling:** At our next all-staff meeting, I will dedicate a segment called \"Collaboration in Action,\" where I will publicly celebrate a team that successfully collaborated with another group on a recent project. I will tell the story of *how* they did it.\n>\n> **Symbols:** I will start dedicating the first 30 minutes of my weekly management meeting to a \"collaboration roundtable,\" where we only discuss cross-functional issues and opportunities. This signals that collaboration is my top priority.\n>\n> **Systems:** I will work with HR to introduce a new \"collaboration\" objective into the performance agreements of all my executives, making it a formal part of their evaluation."
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** You are at a management meeting. One of your directors presents a project that is behind schedule. Instead of focusing on the delay, you want to use this as an opportunity to reinforce a culture of learning and support. Record a 1-minute response to the director.\n\n**Example starter:** \"Thank you for your transparency. This is exactly the kind of open conversation we need to have. Instead of focusing on the timeline, let's talk about the learning. What have been the biggest challenges? What have you learned that we can apply to other projects? And most importantly, what does the team need from us, as a leadership team, to help them move forward?\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  The three key levers for shaping culture are:\n    a) Strategy, Structure, and Staff\n    b) Storytelling, Symbols, and Systems\n    c) Vision, Mission, and Values\n2.  Telling the story of a \"good failure\" helps to create a culture of:\n    a) Accountability\n    b) Innovation and learning\n    c) Compliance\n3.  An executive's calendar is a powerful symbol because:\n    a) It shows how busy they are.\n    b) It shows what they truly value.\n    c) It helps them stay organized.\n4.  Changing the performance management system to include \"how\" work gets done is an example of using which lever?\n    a) Storytelling\n    b) Symbols\n    c) Systems\n5.  Culture change is a quick and easy process.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-b, 3-b, 4-c, 5-b"
    },
    "coaching": {
      title: "You Are the Chief Culture Officer",
      content: "**Title:** You Are the Chief Culture Officer\n\nNo matter your official title, if you are a senior leader, you are the Chief Culture Officer of your organization. People are constantly watching you for clues about what is acceptable, what is rewarded, and what is important. They listen to your words, but they trust your actions. You can give a hundred speeches about the importance of collaboration, but if you consistently reward the \"brilliant jerk\" who works alone, your words are meaningless. Culture is not what you say it is; it's what you do. Be intentional about the culture you are creating. It is your most important legacy.\n_"
    },
  },
  "24.3": {
    "hook": {
      title: "You are in a bilateral meeting with a foreign delegation. The stakes are high. Your words do not just represent you; they represent Canada. How do you navigate cultural differences, advocate for your country's interests, and build bridges, all at the same time?",
      content: "**Hook:** You are in a bilateral meeting with a foreign delegation. The stakes are high. Your words do not just represent you; they represent Canada. How do you navigate cultural differences, advocate for your country's interests, and build bridges, all at the same time?\n**Objective:** By the end of this lesson, you will learn the key principles of international representation, including cross-cultural communication, diplomatic language, and how to effectively represent Canada on the world stage."
    },
    "video": {
      title: "The Delicate Negotiation",
      content: "**Title:** The Delicate Negotiation\n**Scene:** A Canadian ADM is in a meeting with her counterpart from another country to discuss a trade issue.\n**(Video shows the two officials sitting at a formal meeting table.)**\n**Foreign Counterpart:** \"Your new environmental regulations, while admirable, are creating significant barriers for our exporters. We see this as a form of protectionism.\"\n**Canadian ADM:** \"I understand your concern for your exporters, and I want to assure you that our intent is not to create trade barriers. Canada is, and has always been, a trading nation. Our goal is to balance our commitment to free and fair trade with our equally strong commitment to protecting the environment. Perhaps we can explore some creative solutions that would allow us to achieve both our objectives. For example, could we establish a joint task force to share best practices on green technology?\""
    },
    "strategy": {
      title: "The Diplomat's Craft",
      content: "**Title:** The Diplomat's Craft\n\nRepresenting Canada abroad requires a unique blend of tact, firmness, and cultural intelligence.\n\n**1. High-Context vs. Low-Context Communication:**\n   - **Low-Context Cultures (e.g., Canada, Germany, USA):** Communication is direct, explicit, and literal. \"Yes\" means yes. The focus is on the words themselves.\n   - **High-Context Cultures (e.g., Japan, China, Arab countries):** Communication is indirect, nuanced, and relational. \"Yes\" might mean \"I hear you,\" not \"I agree.\" The focus is on the context, non-verbal cues, and the relationship.\n   - **Your Strategy:** When working with high-context cultures, pay close attention to non-verbal cues, avoid being too direct, and invest time in building relationships. When working with low-context cultures, be clear, direct, and focus on the substance of the issue.\n\n**2. The Art of Diplomatic Language:**\n   - **Use \"I\" statements:** \"I am concerned that...\" is less confrontational than \"You are wrong.\"\n   - **Acknowledge their position:** \"I understand your perspective...\" or \"I appreciate your point of view...\" before stating your own.\n   - **Reframe, don't reject:** Instead of \"I disagree,\" try \"An alternative way to look at this is...\"\n   - **Focus on shared interests:** Find common ground before tackling areas of disagreement.\n\n**3. Representing \"Team Canada\":**\n   - **Know your mandate:** Be crystal clear on Canada's position and your negotiating mandate.\n   - **Consult, consult, consult:** Before and during international meetings, consult with Global Affairs Canada, your own department's international affairs branch, and other relevant stakeholders.\n   - **The \"One Voice\" principle:** While abroad, you represent the Government of Canada as a whole. Maintain a unified front with your colleagues."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** You are in an international meeting, and your counterpart from a high-context culture has just given a long, ambiguous response to your proposal. You are not sure if they agree or disagree. Write a 100-word response that seeks clarity without causing them to lose face.\n\n**Your Response:**\n\n> \"Thank you for sharing your initial thoughts on our proposal. I very much appreciate the care and consideration you are giving this important issue. To ensure that I have a clear understanding of your perspective, could you perhaps elaborate on the part of the proposal that you feel requires the most careful study? This would help us to focus our efforts on finding a mutually beneficial path forward.\""
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** Your counterpart from a low-context culture has just very directly criticized a Canadian policy, calling it \"misguided.\" Record a 1-minute response that is firm in defending Canada's position but also seeks to maintain a constructive relationship.\n\n**Example starter:** \"I appreciate your directness. It's clear you have strong views on this. From our perspective, this policy is a critical part of our domestic agenda. However, I want to understand the specific impacts you are concerned about. Can you walk me through the practical consequences for your country? Perhaps if we understand the problem in detail, we can find a way to mitigate the negative impacts...\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FORMATIF (7 min)",
      content: "1.  In a high-context culture, communication is generally:\n    a) Direct and explicit.\n    b) Indirect and nuanced.\n    c) Very informal.\n2.  Which of the following is an example of good diplomatic language?\n    a) \"Your argument makes no sense.\"\n    b) \"I see things differently.\"\n    c) \"Let me explain why you are wrong.\"\n3.  The \"One Voice\" principle in international representation means:\n    a) Only one person should speak in a meeting.\n    b) All Canadian representatives should present a unified position.\n    c) You should speak in a monotone voice.\n4.  When dealing with a direct criticism from a low-context counterpart, you should:\n    a) Become defensive and emotional.\n    b) Acknowledge their point and firmly state your own, while seeking to understand their concerns.\n    c) Immediately apologize to avoid conflict.\n5.  Building personal relationships is generally more important in low-context cultures than in high-context cultures.\n    a) True\n    b) False\n\n**Answers:** 1-b, 2-b, 3-b, 4-b, 5-b"
    },
    "coaching": {
      title: "You Are a Bridge",
      content: "**Title:** You Are a Bridge\n\nWhen you represent Canada abroad, you are more than a functionary; you are a bridge. You are a bridge between cultures, between governments, and between peoples. A good bridge is strong, stable, and can bear a lot of weight. It is built with care, precision, and an understanding of the terrain on both sides. Your job is not just to transport your own message across, but to allow for traffic in both directions. It is to foster understanding, build trust, and create a connection that can withstand the political storms. Be a good bridge.\n_"
    },
  },
  "24.4": {
    "hook": {
      title: "This is the culmination of your journey. You have mastered the nuances of executive communication, from strategic leadership to international representation. Now, it is time to consolidate your skills and prove your mastery at the highest level of the Second Language Evaluation (SLE).",
      content: "**Hook:** This is the culmination of your journey. You have mastered the nuances of executive communication, from strategic leadership to international representation. Now, it is time to consolidate your skills and prove your mastery at the highest level of the Second Language Evaluation (SLE).\n**Objective:** By the end of this lesson, you will review the key competencies of the C2 level, practice advanced SLE-style test questions, and complete a final self-assessment to confirm your readiness for the C2+ level."
    },
    "video": {
      title: "The C2+ Simulation",
      content: "**Title:** The C2+ Simulation\n**Scene:** A candidate is in the final part of their oral proficiency test. The assessor is posing a complex, abstract question.\n**(Video shows the candidate and assessor in a formal testing environment.)**\n**Assessor:** \"Thank you. For the final question, I'd like you to consider the following. Some argue that in an age of globalization, the concept of the nation-state is becoming obsolete. To what extent do you agree or disagree with this statement, and what do you see as the future of national identity in a country as diverse as Canada?\"\n**Candidate:** (Pauses thoughtfully) \"That is a profoundly important question. While it's true that globalization has eroded some of the traditional functions of the nation-state, particularly in economic terms, I would argue that its role as a source of identity and a guarantor of rights is more critical than ever. The statement presents a false dichotomy. The future is not a choice between globalism and nationalism, but rather a complex negotiation between the two. In Canada, for instance, our national identity is precisely our ability to manage diversity and multiple allegiances, which in a way makes us a model for a globalized world...\""
    },
    "strategy": {
      title: "Mastering the C2+ Level",
      content: "**Title:** Mastering the C2+ Level\n\nThe C2 level is about more than just fluency; it's about precision, nuance, and the ability to handle complex, abstract ideas with ease and sophistication.\n\n**Key Competencies for C2+:**\n\n1.  **Argumentation & Persuasion:**\n    - Can develop an argument systematically with appropriate highlighting of significant points and relevant supporting detail.\n    - Can handle hostile questioning confidently, defending your position with persuasive arguments.\n\n2.  **Abstract & Hypothetical Thinking:**\n    - Can discuss complex, hypothetical, and counter-factual situations, exploring consequences and speculating on possibilities.\n    - Can understand and discuss fine shades of meaning and abstract concepts (e.g., justice, sovereignty, culture).\n\n3.  **Linguistic Finesse:**\n    - Has a good command of a very broad lexical repertoire including idiomatic expressions and colloquialisms; shows awareness of connotative levels of meaning.\n    - Can vary formulation to avoid repetition and use complex sentence structures to convey fine shades of meaning.\n    - Maintains consistent grammatical control of complex language, even while attention is otherwise engaged.\n\n**Final Review Strategy:**\n- **Review your notes** from all 24 lessons, paying special attention to the \"Point-Stratégie\" sections.\n- **Practice under pressure:** Time yourself answering complex questions.\n- **Focus on your \"legacy\" message:** What are the key ideas you want to be able to communicate as a leader? Practice articulating them."
    },
    "written": {
      title: "PRATIQUE ÉCRITE (15 min)",
      content: "**Task:** This is a simulation of the C2 Written Expression test. You have 15 minutes to write a 250-word response to the following prompt:\n\n\"The increasing use of artificial intelligence in the workplace presents both opportunities and challenges for the public service. Discuss the most significant challenge and propose a strategy for how public service leaders should address it.\"\n\n**(Write your response below. Focus on structure, argumentation, and sophisticated vocabulary.)**"
    },
    "oral": {
      title: "PRATIQUE ORALE (10 min)",
      content: "**Task:** This is a simulation of the C2 Oral Proficiency test. You have 2 minutes to prepare your answer to the following question, and then you will have 3 minutes to deliver your response. Record your full, 3-minute response.\n\n\"In your view, what is the single most important quality for a senior leader in the 21st-century public service, and why?\"\n\n**(Record your response using the tool below.)**"
    },
    "quiz": {
      title: "QUIZ FINAL (PATH VI) (7 min)",
      content: "This quiz covers concepts from all four modules of Path VI.\n\n1.  The \"Triangle Gaze\" is a technique for:\n    a) Negotiating a contract.\n    b) Engaging a large audience.\n    c) Mentoring a protégé.\n2.  Acknowledging a counter-argument in a written piece serves to:\n    a) Weaken your own argument.\n    b) Strengthen your credibility.\n    c) Fill space.\n3.  The GROW model is a framework for:\n    a) Cultural change.\n    b) International negotiations.\n    c) Mentoring conversations.\n4.  An executive's calendar is a powerful \"symbol\" in shaping organizational culture because it shows:\n    a) How organized they are.\n    b) What they truly value.\n    c) Who they report to.\n5.  In a high-context culture, it is important to:\n    a) Be as direct as possible.\n    b) Pay close attention to non-verbal cues and relationships.\n    c) Focus only on the literal meaning of words.\n\n**Answers:** 1-b, 2-b, 3-c, 4-b, 5-b"
    },
    "coaching": {
      title: "The End of the Beginning",
      content: "**Title:** The End of the Beginning\n\nCongratulations. You have completed the final lesson of this program. But this is not the end of your language journey; it is the end of the beginning. You have built a powerful foundation of skills, strategies, and knowledge. The challenge now is to use them, to practice them, and to continue to grow. Language is a living thing. It must be nurtured. Continue to read widely, to engage in challenging conversations, and to seek out opportunities to use your second language at the highest levels. You are not just a language learner anymore; you are a language leader. Go forth and lead.\n_"
    },
  },
};
