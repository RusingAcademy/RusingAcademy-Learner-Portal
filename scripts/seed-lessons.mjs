/**
 * Seed Script: Complete Lessons for Path Series™
 * 
 * Creates ~300 lessons across 54 modules for the 6 Path Series
 * Each module gets 5-6 lessons with varied content types
 * 
 * Content Types:
 * - video: Introduction/demonstration videos
 * - text: Theory and explanations
 * - quiz: Knowledge checks
 * - assignment: Practical exercises
 * - download: PDF resources
 */

import mysql from 'mysql2/promise';

// Lesson templates per module type
const lessonTemplates = {
  // Path I: A1 - Foundations
  pathI: {
    1: { // French Phonetics & Pronunciation
      title: "French Phonetics & Pronunciation",
      lessons: [
        { title: "Introduction to French Sounds", type: "video", duration: 15, desc: "Overview of the French phonetic system and how it differs from English." },
        { title: "Vowel Sounds in French", type: "text", duration: 20, desc: "Master the 16 vowel sounds of French with audio examples and practice exercises." },
        { title: "Consonant Pronunciation", type: "video", duration: 18, desc: "Learn to pronounce French consonants correctly, including the French 'r'." },
        { title: "Liaison and Enchaînement", type: "text", duration: 15, desc: "Understand how French words connect in speech for natural fluency." },
        { title: "Pronunciation Practice Quiz", type: "quiz", duration: 10, desc: "Test your understanding of French pronunciation rules." },
        { title: "Phonetics Reference Guide", type: "download", duration: 5, desc: "Downloadable PDF with IPA symbols and pronunciation tips." }
      ]
    },
    2: { // Essential Grammar Foundations
      title: "Essential Grammar Foundations",
      lessons: [
        { title: "French Sentence Structure", type: "video", duration: 12, desc: "Learn the basic Subject-Verb-Object structure in French." },
        { title: "Articles: Le, La, Les, Un, Une", type: "text", duration: 18, desc: "Master definite and indefinite articles with gender rules." },
        { title: "Present Tense: Regular Verbs", type: "video", duration: 20, desc: "Conjugate -er, -ir, and -re verbs in the present tense." },
        { title: "Common Irregular Verbs", type: "text", duration: 22, desc: "Learn être, avoir, aller, faire and other essential irregular verbs." },
        { title: "Negation in French", type: "text", duration: 15, desc: "Form negative sentences using ne...pas and other negative structures." },
        { title: "Grammar Foundations Quiz", type: "quiz", duration: 15, desc: "Comprehensive quiz on A1 grammar concepts." }
      ]
    },
    3: { // Workplace Vocabulary Basics
      title: "Workplace Vocabulary Basics",
      lessons: [
        { title: "Office Environment Vocabulary", type: "video", duration: 15, desc: "Learn essential vocabulary for the federal workplace." },
        { title: "Greetings and Introductions", type: "text", duration: 12, desc: "Professional greetings and how to introduce yourself in French." },
        { title: "Numbers and Dates", type: "video", duration: 18, desc: "Master numbers, dates, and time expressions for workplace use." },
        { title: "Email Vocabulary Basics", type: "text", duration: 15, desc: "Essential phrases for reading and writing simple emails." },
        { title: "Vocabulary Practice Exercises", type: "assignment", duration: 20, desc: "Interactive exercises to reinforce workplace vocabulary." }
      ]
    },
    4: { // Simple Conversations
      title: "Simple Conversations",
      lessons: [
        { title: "Starting a Conversation", type: "video", duration: 12, desc: "Learn polite ways to start conversations with colleagues." },
        { title: "Asking Simple Questions", type: "text", duration: 15, desc: "Form basic questions using est-ce que and inversion." },
        { title: "Responding to Questions", type: "video", duration: 14, desc: "Practice giving appropriate responses in workplace scenarios." },
        { title: "Small Talk Topics", type: "text", duration: 12, desc: "Safe topics for casual workplace conversations." },
        { title: "Conversation Role-Play", type: "assignment", duration: 25, desc: "Practice dialogues with audio recordings." }
      ]
    },
    5: { // Reading Comprehension Level A
      title: "Reading Comprehension Level A",
      lessons: [
        { title: "Reading Strategies for Beginners", type: "video", duration: 10, desc: "Techniques to understand French texts at the A1 level." },
        { title: "Understanding Simple Notices", type: "text", duration: 15, desc: "Read and comprehend workplace notices and announcements." },
        { title: "Email Comprehension", type: "text", duration: 18, desc: "Practice reading simple professional emails." },
        { title: "Forms and Documents", type: "assignment", duration: 20, desc: "Complete exercises on understanding basic forms." },
        { title: "Reading Comprehension Quiz", type: "quiz", duration: 15, desc: "Test your A1 reading skills." }
      ]
    },
    6: { // Assessment & Practice
      title: "Assessment & Practice",
      lessons: [
        { title: "A1 Level Overview", type: "video", duration: 10, desc: "Review of all A1 competencies covered in Path I." },
        { title: "Comprehensive Practice Test", type: "quiz", duration: 30, desc: "Full practice test covering all A1 skills." },
        { title: "Self-Assessment Checklist", type: "download", duration: 5, desc: "Track your progress with this A1 competency checklist." },
        { title: "Next Steps: Preparing for A2", type: "text", duration: 10, desc: "Guidance on continuing your French learning journey." }
      ]
    }
  },

  // Path II: A2 - Everyday Fluency
  pathII: {
    7: { // Conversation Fluency Basics
      title: "Conversation Fluency Basics",
      lessons: [
        { title: "Building Conversation Confidence", type: "video", duration: 15, desc: "Strategies to speak more fluently in everyday situations." },
        { title: "Common Conversation Patterns", type: "text", duration: 18, desc: "Learn frequently used phrases and expressions." },
        { title: "Expressing Opinions Simply", type: "video", duration: 14, desc: "Share your thoughts using basic opinion structures." },
        { title: "Handling Misunderstandings", type: "text", duration: 12, desc: "Phrases to clarify and ask for repetition." },
        { title: "Fluency Practice Exercises", type: "assignment", duration: 25, desc: "Timed speaking exercises to build fluency." }
      ]
    },
    8: { // Professional Vocabulary
      title: "Professional Vocabulary",
      lessons: [
        { title: "Government Department Vocabulary", type: "video", duration: 16, desc: "Learn vocabulary specific to federal departments." },
        { title: "Meeting Terminology", type: "text", duration: 15, desc: "Essential words and phrases for workplace meetings." },
        { title: "Project Management Terms", type: "text", duration: 18, desc: "Vocabulary for discussing projects and deadlines." },
        { title: "HR and Administrative Terms", type: "video", duration: 14, desc: "Common HR vocabulary for public servants." },
        { title: "Vocabulary Building Quiz", type: "quiz", duration: 12, desc: "Test your professional vocabulary knowledge." }
      ]
    },
    9: { // Listening Comprehension
      title: "Listening Comprehension",
      lessons: [
        { title: "Active Listening Techniques", type: "video", duration: 12, desc: "Develop strategies for better comprehension." },
        { title: "Understanding Announcements", type: "text", duration: 15, desc: "Practice with workplace announcements and messages." },
        { title: "Phone Conversations", type: "video", duration: 18, desc: "Understand and participate in phone calls." },
        { title: "Meeting Discussions", type: "assignment", duration: 20, desc: "Listen to meeting excerpts and answer questions." },
        { title: "Listening Comprehension Test", type: "quiz", duration: 15, desc: "Assess your A2 listening skills." }
      ]
    },
    10: { // Speaking with Confidence
      title: "Speaking with Confidence",
      lessons: [
        { title: "Overcoming Speaking Anxiety", type: "video", duration: 12, desc: "Tips to feel more confident when speaking French." },
        { title: "Pronunciation Refinement", type: "text", duration: 16, desc: "Fine-tune your pronunciation at the A2 level." },
        { title: "Intonation and Rhythm", type: "video", duration: 14, desc: "Master the musicality of French speech." },
        { title: "Self-Recording Practice", type: "assignment", duration: 25, desc: "Record yourself and compare with native speakers." },
        { title: "Speaking Assessment Prep", type: "quiz", duration: 15, desc: "Practice questions for oral assessments." }
      ]
    },
    11: { // Workplace Scenarios
      title: "Workplace Scenarios",
      lessons: [
        { title: "Coffee Break Conversations", type: "video", duration: 12, desc: "Navigate informal workplace interactions." },
        { title: "Requesting Information", type: "text", duration: 14, desc: "Politely ask for help and information." },
        { title: "Giving Simple Instructions", type: "video", duration: 15, desc: "Provide clear directions and instructions." },
        { title: "Handling Complaints", type: "text", duration: 16, desc: "Respond professionally to concerns." },
        { title: "Scenario Role-Plays", type: "assignment", duration: 25, desc: "Practice real workplace situations." }
      ]
    },
    12: { // Oral Interaction Strategies
      title: "Oral Interaction Strategies",
      lessons: [
        { title: "Turn-Taking in Conversations", type: "video", duration: 12, desc: "Learn when and how to interject politely." },
        { title: "Agreeing and Disagreeing", type: "text", duration: 14, desc: "Express agreement and polite disagreement." },
        { title: "Asking Follow-Up Questions", type: "video", duration: 13, desc: "Keep conversations going naturally." },
        { title: "Summarizing and Paraphrasing", type: "text", duration: 15, desc: "Confirm understanding by restating." },
        { title: "Interaction Practice", type: "assignment", duration: 20, desc: "Paired conversation exercises." }
      ]
    },
    13: { // Mock Oral Assessments
      title: "Mock Oral Assessments",
      lessons: [
        { title: "Understanding the Oral Test Format", type: "video", duration: 15, desc: "Overview of SLE oral evaluation criteria." },
        { title: "Common Test Topics", type: "text", duration: 18, desc: "Prepare for frequently tested scenarios." },
        { title: "Mock Test 1: Introduction", type: "assignment", duration: 20, desc: "Practice introducing yourself formally." },
        { title: "Mock Test 2: Workplace Scenario", type: "assignment", duration: 25, desc: "Respond to a workplace situation." },
        { title: "Self-Evaluation Guide", type: "download", duration: 5, desc: "Rubric to assess your own performance." }
      ]
    },
    14: { // Level B Oral Certification Prep
      title: "Level B Oral Certification Prep",
      lessons: [
        { title: "Level B Requirements Overview", type: "video", duration: 12, desc: "What you need to achieve Level B oral." },
        { title: "Final Review: Key Competencies", type: "text", duration: 20, desc: "Comprehensive review of A2 oral skills." },
        { title: "Practice Test: Full Simulation", type: "quiz", duration: 30, desc: "Complete oral test simulation." },
        { title: "Tips for Test Day", type: "text", duration: 10, desc: "Strategies for performing your best." },
        { title: "Certificate of Completion", type: "download", duration: 5, desc: "Path II completion certificate." }
      ]
    }
  },

  // Path III: B1 - Operational French
  pathIII: {
    15: { // Grammar Review & Enhancement
      title: "Grammar Review & Enhancement",
      lessons: [
        { title: "Past Tenses: Passé Composé vs Imparfait", type: "video", duration: 18, desc: "Master the distinction between these essential past tenses." },
        { title: "Future and Conditional", type: "text", duration: 20, desc: "Express future plans and hypothetical situations." },
        { title: "Subjunctive Mood Introduction", type: "video", duration: 22, desc: "When and how to use the subjunctive." },
        { title: "Complex Sentence Structures", type: "text", duration: 18, desc: "Build sophisticated sentences with conjunctions." },
        { title: "Grammar Enhancement Quiz", type: "quiz", duration: 15, desc: "Test your B1 grammar knowledge." }
      ]
    },
    16: { // Professional Email Writing
      title: "Professional Email Writing",
      lessons: [
        { title: "Email Structure and Format", type: "video", duration: 14, desc: "Professional email conventions in French." },
        { title: "Formal Salutations and Closings", type: "text", duration: 12, desc: "Appropriate greetings for different contexts." },
        { title: "Making Requests by Email", type: "text", duration: 16, desc: "Polite request formulations." },
        { title: "Responding to Emails", type: "video", duration: 15, desc: "Craft appropriate responses." },
        { title: "Email Writing Practice", type: "assignment", duration: 25, desc: "Write emails for various scenarios." },
        { title: "Email Templates", type: "download", duration: 5, desc: "Ready-to-use email templates." }
      ]
    },
    17: { // Report Writing Fundamentals
      title: "Report Writing Fundamentals",
      lessons: [
        { title: "Report Structure Overview", type: "video", duration: 15, desc: "Components of a professional report." },
        { title: "Executive Summaries", type: "text", duration: 18, desc: "Write clear and concise summaries." },
        { title: "Data Presentation in French", type: "text", duration: 16, desc: "Describe statistics and trends." },
        { title: "Conclusions and Recommendations", type: "video", duration: 14, desc: "End reports effectively." },
        { title: "Report Writing Exercise", type: "assignment", duration: 30, desc: "Draft a short report." }
      ]
    },
    18: { // Briefing Notes & Memos
      title: "Briefing Notes & Memos",
      lessons: [
        { title: "Briefing Note Format", type: "video", duration: 12, desc: "Standard format for federal briefing notes." },
        { title: "Key Messages and Recommendations", type: "text", duration: 15, desc: "Communicate clearly to decision-makers." },
        { title: "Internal Memos", type: "text", duration: 14, desc: "Write effective internal communications." },
        { title: "Briefing Note Practice", type: "assignment", duration: 25, desc: "Create a briefing note from a scenario." },
        { title: "Templates and Examples", type: "download", duration: 5, desc: "Sample briefing notes and memos." }
      ]
    },
    19: { // Style & Tone
      title: "Style & Tone",
      lessons: [
        { title: "Formal vs Informal Register", type: "video", duration: 14, desc: "Choose the appropriate tone for your audience." },
        { title: "Diplomatic Language", type: "text", duration: 16, desc: "Express sensitive information tactfully." },
        { title: "Active vs Passive Voice", type: "text", duration: 15, desc: "When to use each voice in professional writing." },
        { title: "Conciseness and Clarity", type: "video", duration: 12, desc: "Write clearly without unnecessary words." },
        { title: "Style Practice Quiz", type: "quiz", duration: 12, desc: "Identify appropriate style choices." }
      ]
    },
    20: { // Editing & Proofreading
      title: "Editing & Proofreading",
      lessons: [
        { title: "Common Errors in French Writing", type: "video", duration: 15, desc: "Avoid frequent mistakes made by anglophones." },
        { title: "Gender and Agreement Checks", type: "text", duration: 18, desc: "Systematic approach to agreement errors." },
        { title: "Punctuation in French", type: "text", duration: 14, desc: "French punctuation rules and conventions." },
        { title: "Self-Editing Techniques", type: "video", duration: 12, desc: "Review your own work effectively." },
        { title: "Proofreading Exercise", type: "assignment", duration: 20, desc: "Find and correct errors in sample texts." }
      ]
    },
    21: { // Writing Assessment Preparation
      title: "Writing Assessment Preparation",
      lessons: [
        { title: "SLE Written Test Overview", type: "video", duration: 15, desc: "Understanding the written evaluation format." },
        { title: "Time Management Strategies", type: "text", duration: 12, desc: "Complete writing tasks within time limits." },
        { title: "Mock Written Test 1", type: "assignment", duration: 45, desc: "Full-length practice test." },
        { title: "Mock Written Test 2", type: "assignment", duration: 45, desc: "Additional practice with different scenarios." },
        { title: "Answer Key and Explanations", type: "download", duration: 10, desc: "Review your practice test responses." }
      ]
    },
    22: { // Level B Written Certification
      title: "Level B Written Certification",
      lessons: [
        { title: "Level B Writing Standards", type: "video", duration: 12, desc: "Requirements for Level B written proficiency." },
        { title: "Final Writing Review", type: "text", duration: 18, desc: "Comprehensive review of B1 writing skills." },
        { title: "Full Simulation Test", type: "quiz", duration: 60, desc: "Complete written test simulation." },
        { title: "Path III Completion", type: "download", duration: 5, desc: "Certificate and next steps." }
      ]
    }
  },

  // Path IV: B2 - Strategic Expression
  pathIV: {
    23: { // Advanced Grammar Mastery
      title: "Advanced Grammar Mastery",
      lessons: [
        { title: "Subjunctive in Complex Clauses", type: "video", duration: 20, desc: "Advanced subjunctive usage patterns." },
        { title: "Conditional Sentences", type: "text", duration: 18, desc: "Si clauses and hypothetical scenarios." },
        { title: "Relative Pronouns", type: "video", duration: 16, desc: "Qui, que, dont, où, lequel and their uses." },
        { title: "Reported Speech", type: "text", duration: 18, desc: "Transform direct speech to indirect speech." },
        { title: "Advanced Grammar Quiz", type: "quiz", duration: 20, desc: "Test your B2 grammar mastery." }
      ]
    },
    24: { // Nuanced Vocabulary
      title: "Nuanced Vocabulary",
      lessons: [
        { title: "Synonyms and Nuances", type: "video", duration: 15, desc: "Choose the right word for precise meaning." },
        { title: "Idiomatic Expressions", type: "text", duration: 18, desc: "Common idioms in professional French." },
        { title: "False Friends (Faux Amis)", type: "text", duration: 14, desc: "Avoid common vocabulary traps." },
        { title: "Specialized Terminology", type: "video", duration: 16, desc: "Domain-specific vocabulary for your field." },
        { title: "Vocabulary Expansion Exercises", type: "assignment", duration: 20, desc: "Build your advanced vocabulary." }
      ]
    },
    25: { // Persuasive Communication
      title: "Persuasive Communication",
      lessons: [
        { title: "Argumentation Structures", type: "video", duration: 18, desc: "Build convincing arguments in French." },
        { title: "Rhetorical Devices", type: "text", duration: 16, desc: "Use rhetoric effectively in professional contexts." },
        { title: "Presenting Proposals", type: "video", duration: 15, desc: "Pitch ideas persuasively." },
        { title: "Handling Objections", type: "text", duration: 14, desc: "Respond to counterarguments professionally." },
        { title: "Persuasion Practice", type: "assignment", duration: 25, desc: "Develop and present a persuasive argument." }
      ]
    },
    26: { // Meeting Facilitation
      title: "Meeting Facilitation",
      lessons: [
        { title: "Opening and Closing Meetings", type: "video", duration: 12, desc: "Professional meeting management phrases." },
        { title: "Managing Discussions", type: "text", duration: 15, desc: "Guide conversations and maintain focus." },
        { title: "Summarizing and Action Items", type: "video", duration: 14, desc: "Conclude meetings effectively." },
        { title: "Handling Difficult Situations", type: "text", duration: 16, desc: "Navigate conflicts and disagreements." },
        { title: "Meeting Simulation", type: "assignment", duration: 30, desc: "Lead a mock meeting scenario." }
      ]
    },
    27: { // Presentation Skills
      title: "Presentation Skills",
      lessons: [
        { title: "Structuring Presentations", type: "video", duration: 15, desc: "Organize content for maximum impact." },
        { title: "Visual Aid Language", type: "text", duration: 12, desc: "Describe charts, graphs, and slides." },
        { title: "Engaging Your Audience", type: "video", duration: 14, desc: "Techniques to maintain attention." },
        { title: "Q&A Handling", type: "text", duration: 15, desc: "Respond to questions confidently." },
        { title: "Presentation Practice", type: "assignment", duration: 30, desc: "Deliver a short presentation." },
        { title: "Presentation Templates", type: "download", duration: 5, desc: "Slide templates and phrase banks." }
      ]
    },
    28: { // Negotiation Language
      title: "Negotiation Language",
      lessons: [
        { title: "Negotiation Vocabulary", type: "video", duration: 14, desc: "Key terms for professional negotiations." },
        { title: "Making and Responding to Offers", type: "text", duration: 16, desc: "Phrases for negotiation exchanges." },
        { title: "Finding Common Ground", type: "video", duration: 15, desc: "Language for compromise and agreement." },
        { title: "Closing Negotiations", type: "text", duration: 14, desc: "Conclude discussions professionally." },
        { title: "Negotiation Role-Play", type: "assignment", duration: 25, desc: "Practice a negotiation scenario." }
      ]
    },
    29: { // Complex Document Analysis
      title: "Complex Document Analysis",
      lessons: [
        { title: "Reading Policy Documents", type: "video", duration: 16, desc: "Navigate complex government documents." },
        { title: "Legal and Regulatory Language", type: "text", duration: 20, desc: "Understand formal legal terminology." },
        { title: "Critical Analysis Skills", type: "text", duration: 18, desc: "Evaluate arguments and evidence." },
        { title: "Document Summary Practice", type: "assignment", duration: 25, desc: "Summarize complex documents." },
        { title: "Analysis Quiz", type: "quiz", duration: 15, desc: "Test your document analysis skills." }
      ]
    },
    30: { // Advanced Writing Projects
      title: "Advanced Writing Projects",
      lessons: [
        { title: "Policy Brief Writing", type: "video", duration: 18, desc: "Create professional policy briefs." },
        { title: "Position Papers", type: "text", duration: 20, desc: "Develop well-argued position papers." },
        { title: "Strategic Communications", type: "text", duration: 16, desc: "Write for different stakeholders." },
        { title: "Writing Project", type: "assignment", duration: 45, desc: "Complete a comprehensive writing project." },
        { title: "Writing Samples", type: "download", duration: 5, desc: "Examples of excellent B2 writing." }
      ]
    },
    31: { // Oral Assessment Preparation
      title: "Oral Assessment Preparation",
      lessons: [
        { title: "Level C Oral Requirements", type: "video", duration: 15, desc: "Understanding CBC oral standards." },
        { title: "Complex Scenario Practice", type: "text", duration: 18, desc: "Prepare for advanced oral scenarios." },
        { title: "Mock Oral Test 1", type: "assignment", duration: 30, desc: "Full oral test simulation." },
        { title: "Mock Oral Test 2", type: "assignment", duration: 30, desc: "Additional practice scenario." },
        { title: "Feedback and Improvement", type: "download", duration: 10, desc: "Self-assessment rubric." }
      ]
    },
    32: { // Level C Certification Prep
      title: "Level C Certification Prep",
      lessons: [
        { title: "CBC Level Overview", type: "video", duration: 12, desc: "What it takes to achieve Level C." },
        { title: "Final Comprehensive Review", type: "text", duration: 25, desc: "Review all B2 competencies." },
        { title: "Full Practice Examination", type: "quiz", duration: 60, desc: "Complete B2 assessment simulation." },
        { title: "Path IV Completion", type: "download", duration: 5, desc: "Certificate and advancement guidance." }
      ]
    }
  },

  // Path V: C1 - Professional Mastery
  pathV: {
    33: { // Expert Grammar
      title: "Expert Grammar",
      lessons: [
        { title: "Literary Tenses", type: "video", duration: 18, desc: "Passé simple, plus-que-parfait, and literary forms." },
        { title: "Advanced Subjunctive", type: "text", duration: 20, desc: "Subjunctive in all its complexity." },
        { title: "Stylistic Inversions", type: "video", duration: 15, desc: "Elegant sentence constructions." },
        { title: "Register Mastery", type: "text", duration: 18, desc: "Navigate all levels of formality." },
        { title: "Expert Grammar Assessment", type: "quiz", duration: 20, desc: "Test your C1 grammar expertise." }
      ]
    },
    34: { // Sophisticated Vocabulary
      title: "Sophisticated Vocabulary",
      lessons: [
        { title: "Abstract Concepts", type: "video", duration: 16, desc: "Express complex ideas precisely." },
        { title: "Bureaucratic Language", type: "text", duration: 18, desc: "Master administrative French." },
        { title: "Colloquialisms and Register", type: "text", duration: 15, desc: "Understand informal expressions." },
        { title: "Technical Terminology", type: "video", duration: 17, desc: "Specialized vocabulary for your field." },
        { title: "Vocabulary Mastery Quiz", type: "quiz", duration: 15, desc: "Test your sophisticated vocabulary." }
      ]
    },
    35: { // Executive Communication
      title: "Executive Communication",
      lessons: [
        { title: "Communicating with Executives", type: "video", duration: 15, desc: "Adapt your style for senior leadership." },
        { title: "Strategic Messaging", type: "text", duration: 18, desc: "Craft messages with maximum impact." },
        { title: "Crisis Communication", type: "video", duration: 16, desc: "Handle sensitive situations professionally." },
        { title: "Stakeholder Management", type: "text", duration: 17, desc: "Communicate with diverse audiences." },
        { title: "Executive Brief Practice", type: "assignment", duration: 30, desc: "Write an executive-level brief." }
      ]
    },
    36: { // Advanced Presentations
      title: "Advanced Presentations",
      lessons: [
        { title: "High-Stakes Presentations", type: "video", duration: 18, desc: "Present to senior decision-makers." },
        { title: "Data Storytelling", type: "text", duration: 16, desc: "Transform data into compelling narratives." },
        { title: "Handling Tough Questions", type: "video", duration: 15, desc: "Respond to challenging questions." },
        { title: "Virtual Presentation Skills", type: "text", duration: 14, desc: "Excel in online presentations." },
        { title: "Presentation Project", type: "assignment", duration: 35, desc: "Deliver a professional presentation." }
      ]
    },
    37: { // Complex Negotiations
      title: "Complex Negotiations",
      lessons: [
        { title: "Multi-Party Negotiations", type: "video", duration: 17, desc: "Navigate complex negotiation scenarios." },
        { title: "Cultural Considerations", type: "text", duration: 15, desc: "Negotiate across cultural differences." },
        { title: "Conflict Resolution", type: "video", duration: 16, desc: "Resolve disputes professionally." },
        { title: "Agreement Drafting", type: "text", duration: 18, desc: "Document negotiation outcomes." },
        { title: "Negotiation Simulation", type: "assignment", duration: 30, desc: "Complex negotiation role-play." }
      ]
    },
    38: { // Policy Writing
      title: "Policy Writing",
      lessons: [
        { title: "Policy Document Structure", type: "video", duration: 16, desc: "Components of effective policy documents." },
        { title: "Evidence-Based Writing", type: "text", duration: 18, desc: "Support arguments with research." },
        { title: "Recommendations and Options", type: "text", duration: 17, desc: "Present alternatives clearly." },
        { title: "Policy Review Process", type: "video", duration: 14, desc: "Navigate the approval process." },
        { title: "Policy Writing Project", type: "assignment", duration: 45, desc: "Draft a policy document." }
      ]
    },
    39: { // Media and Public Communication
      title: "Media and Public Communication",
      lessons: [
        { title: "Media Interview Preparation", type: "video", duration: 15, desc: "Prepare for media interactions." },
        { title: "Key Messages Development", type: "text", duration: 16, desc: "Craft clear public messages." },
        { title: "Social Media Communication", type: "text", duration: 14, desc: "Professional social media presence." },
        { title: "Public Speaking", type: "video", duration: 18, desc: "Address public audiences effectively." },
        { title: "Media Simulation", type: "assignment", duration: 25, desc: "Practice a media scenario." }
      ]
    },
    40: { // Translation and Adaptation
      title: "Translation and Adaptation",
      lessons: [
        { title: "Translation Principles", type: "video", duration: 15, desc: "Translate meaning, not just words." },
        { title: "Cultural Adaptation", type: "text", duration: 17, desc: "Adapt content for French audiences." },
        { title: "Common Translation Pitfalls", type: "text", duration: 16, desc: "Avoid typical translation errors." },
        { title: "Revision and Quality Control", type: "video", duration: 14, desc: "Ensure translation quality." },
        { title: "Translation Exercise", type: "assignment", duration: 30, desc: "Translate a professional document." }
      ]
    },
    41: { // CCC Level Preparation
      title: "CCC Level Preparation",
      lessons: [
        { title: "CCC Requirements Overview", type: "video", duration: 15, desc: "Understanding Level C standards." },
        { title: "Comprehensive Skills Review", type: "text", duration: 25, desc: "Review all C1 competencies." },
        { title: "Mock CCC Test - Written", type: "assignment", duration: 60, desc: "Full written test simulation." },
        { title: "Mock CCC Test - Oral", type: "assignment", duration: 45, desc: "Full oral test simulation." },
        { title: "Performance Analysis", type: "download", duration: 10, desc: "Detailed feedback rubric." }
      ]
    },
    42: { // Professional Mastery Certification
      title: "Professional Mastery Certification",
      lessons: [
        { title: "Final Assessment Overview", type: "video", duration: 12, desc: "Prepare for your certification." },
        { title: "Comprehensive Final Review", type: "text", duration: 30, desc: "Complete C1 competency review." },
        { title: "Full Certification Simulation", type: "quiz", duration: 90, desc: "Complete C1 assessment." },
        { title: "Path V Completion", type: "download", duration: 5, desc: "Certificate and career guidance." }
      ]
    }
  },

  // Path VI: SLE Accelerator
  pathVI: {
    43: { // SLE Test Overview
      title: "SLE Test Overview",
      lessons: [
        { title: "Understanding the SLE", type: "video", duration: 15, desc: "Complete overview of the Second Language Evaluation." },
        { title: "Test Components Explained", type: "text", duration: 18, desc: "Reading, Writing, and Oral components." },
        { title: "Scoring and Levels", type: "text", duration: 14, desc: "How A, B, C, and E levels are determined." },
        { title: "Test Day Preparation", type: "video", duration: 12, desc: "What to expect on test day." },
        { title: "SLE Overview Quiz", type: "quiz", duration: 10, desc: "Test your understanding of the SLE." }
      ]
    },
    44: { // Reading Comprehension Strategies
      title: "Reading Comprehension Strategies",
      lessons: [
        { title: "SLE Reading Test Format", type: "video", duration: 14, desc: "Understanding the reading component." },
        { title: "Skimming and Scanning", type: "text", duration: 16, desc: "Efficient reading techniques." },
        { title: "Inference and Analysis", type: "text", duration: 18, desc: "Read between the lines." },
        { title: "Time Management", type: "video", duration: 12, desc: "Complete the test within time limits." },
        { title: "Reading Practice Test 1", type: "assignment", duration: 30, desc: "Full reading comprehension practice." },
        { title: "Reading Practice Test 2", type: "assignment", duration: 30, desc: "Additional reading practice." }
      ]
    },
    45: { // Written Expression Mastery
      title: "Written Expression Mastery",
      lessons: [
        { title: "SLE Writing Test Format", type: "video", duration: 15, desc: "Understanding the writing component." },
        { title: "Planning Your Response", type: "text", duration: 14, desc: "Organize your thoughts quickly." },
        { title: "Grammar Under Pressure", type: "text", duration: 18, desc: "Maintain accuracy in timed conditions." },
        { title: "Common Writing Errors", type: "video", duration: 16, desc: "Avoid typical mistakes." },
        { title: "Writing Practice Test 1", type: "assignment", duration: 45, desc: "Full writing test simulation." },
        { title: "Writing Practice Test 2", type: "assignment", duration: 45, desc: "Additional writing practice." }
      ]
    },
    46: { // Oral Interaction Excellence
      title: "Oral Interaction Excellence",
      lessons: [
        { title: "SLE Oral Test Format", type: "video", duration: 15, desc: "Understanding the oral component." },
        { title: "Spontaneous Speaking", type: "text", duration: 16, desc: "Respond naturally without preparation." },
        { title: "Pronunciation and Fluency", type: "video", duration: 18, desc: "Sound natural and confident." },
        { title: "Complex Scenarios", type: "text", duration: 17, desc: "Handle challenging oral situations." },
        { title: "Oral Practice Test 1", type: "assignment", duration: 30, desc: "Full oral test simulation." },
        { title: "Oral Practice Test 2", type: "assignment", duration: 30, desc: "Additional oral practice." }
      ]
    },
    47: { // Level B Intensive
      title: "Level B Intensive",
      lessons: [
        { title: "Level B Requirements", type: "video", duration: 12, desc: "What you need for Level B." },
        { title: "B-Level Reading Skills", type: "text", duration: 18, desc: "Reading competencies for Level B." },
        { title: "B-Level Writing Skills", type: "text", duration: 18, desc: "Writing competencies for Level B." },
        { title: "B-Level Oral Skills", type: "video", duration: 16, desc: "Oral competencies for Level B." },
        { title: "Level B Practice Exam", type: "quiz", duration: 60, desc: "Complete Level B simulation." }
      ]
    },
    48: { // Level C Intensive
      title: "Level C Intensive",
      lessons: [
        { title: "Level C Requirements", type: "video", duration: 14, desc: "What you need for Level C." },
        { title: "C-Level Reading Skills", type: "text", duration: 20, desc: "Advanced reading competencies." },
        { title: "C-Level Writing Skills", type: "text", duration: 20, desc: "Advanced writing competencies." },
        { title: "C-Level Oral Skills", type: "video", duration: 18, desc: "Advanced oral competencies." },
        { title: "Level C Practice Exam", type: "quiz", duration: 90, desc: "Complete Level C simulation." }
      ]
    },
    49: { // Test-Taking Strategies
      title: "Test-Taking Strategies",
      lessons: [
        { title: "Managing Test Anxiety", type: "video", duration: 12, desc: "Stay calm under pressure." },
        { title: "Time Allocation Strategies", type: "text", duration: 14, desc: "Optimize your time on each section." },
        { title: "Guessing Strategies", type: "text", duration: 12, desc: "Make educated guesses when needed." },
        { title: "Review Techniques", type: "video", duration: 13, desc: "Check your work efficiently." },
        { title: "Strategy Practice", type: "assignment", duration: 20, desc: "Apply strategies in practice." }
      ]
    },
    50: { // Mock Exam: Reading
      title: "Mock Exam: Reading",
      lessons: [
        { title: "Pre-Test Preparation", type: "video", duration: 10, desc: "Get ready for your mock exam." },
        { title: "Mock Reading Exam", type: "quiz", duration: 60, desc: "Full-length reading test." },
        { title: "Answer Review", type: "text", duration: 20, desc: "Detailed explanations for each answer." },
        { title: "Performance Analysis", type: "download", duration: 10, desc: "Analyze your results." }
      ]
    },
    51: { // Mock Exam: Writing
      title: "Mock Exam: Writing",
      lessons: [
        { title: "Writing Exam Preparation", type: "video", duration: 10, desc: "Final tips before your mock exam." },
        { title: "Mock Writing Exam", type: "assignment", duration: 60, desc: "Full-length writing test." },
        { title: "Sample Responses", type: "text", duration: 20, desc: "Compare your work to model answers." },
        { title: "Writing Feedback Guide", type: "download", duration: 10, desc: "Self-assessment rubric." }
      ]
    },
    52: { // Mock Exam: Oral
      title: "Mock Exam: Oral",
      lessons: [
        { title: "Oral Exam Preparation", type: "video", duration: 10, desc: "Final tips for oral success." },
        { title: "Mock Oral Exam", type: "assignment", duration: 45, desc: "Full-length oral test simulation." },
        { title: "Model Responses", type: "text", duration: 18, desc: "Examples of excellent oral responses." },
        { title: "Oral Feedback Guide", type: "download", duration: 10, desc: "Self-assessment for oral skills." }
      ]
    },
    53: { // Final Review and Preparation
      title: "Final Review and Preparation",
      lessons: [
        { title: "Comprehensive Skills Review", type: "video", duration: 20, desc: "Review all SLE competencies." },
        { title: "Common Mistakes to Avoid", type: "text", duration: 18, desc: "Last-minute tips and warnings." },
        { title: "Day Before Checklist", type: "text", duration: 12, desc: "Prepare everything for test day." },
        { title: "Confidence Building", type: "video", duration: 10, desc: "Mental preparation for success." },
        { title: "Final Checklist", type: "download", duration: 5, desc: "Complete preparation checklist." }
      ]
    },
    54: { // SLE Success Certification
      title: "SLE Success Certification",
      lessons: [
        { title: "Path VI Completion", type: "video", duration: 10, desc: "Congratulations on completing the SLE Accelerator." },
        { title: "Next Steps After the SLE", type: "text", duration: 15, desc: "What to do after your test." },
        { title: "Maintaining Your Skills", type: "text", duration: 14, desc: "Keep your French sharp." },
        { title: "Certificate of Completion", type: "download", duration: 5, desc: "Your Path VI completion certificate." }
      ]
    }
  }
};

async function seedLessons() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("🚀 Starting lesson seeding...\n");
  
  let totalLessons = 0;
  let moduleCount = 0;
  
  // Process all paths
  for (const [pathKey, modules] of Object.entries(lessonTemplates)) {
    console.log(`\n📚 Processing ${pathKey}...`);
    
    for (const [moduleId, moduleData] of Object.entries(modules)) {
      moduleCount++;
      console.log(`  Module ${moduleId}: ${moduleData.title}`);
      
      for (let i = 0; i < moduleData.lessons.length; i++) {
        const lesson = moduleData.lessons[i];
        const sortOrder = i + 1;
        
        // Determine courseId based on moduleId
        let courseId;
        if (parseInt(moduleId) <= 6) courseId = 1;
        else if (parseInt(moduleId) <= 14) courseId = 2;
        else if (parseInt(moduleId) <= 22) courseId = 3;
        else if (parseInt(moduleId) <= 32) courseId = 4;
        else if (parseInt(moduleId) <= 42) courseId = 5;
        else courseId = 6;
        
        try {
          await conn.query(`
            INSERT INTO lessons (
              moduleId, courseId, title, description, contentType,
              estimatedMinutes, sortOrder, isPreview, isMandatory
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            parseInt(moduleId),
            courseId,
            lesson.title,
            lesson.desc,
            lesson.type,
            lesson.duration,
            sortOrder,
            i === 0 ? 1 : 0, // First lesson is preview
            lesson.type === 'download' ? 0 : 1 // Downloads are optional
          ]);
          
          totalLessons++;
        } catch (error) {
          console.error(`    ❌ Error inserting lesson: ${lesson.title}`, error.message);
        }
      }
      
      console.log(`    ✅ ${moduleData.lessons.length} lessons created`);
    }
  }
  
  console.log(`\n✨ Seeding complete!`);
  console.log(`   Total modules processed: ${moduleCount}`);
  console.log(`   Total lessons created: ${totalLessons}`);
  
  await conn.end();
}

seedLessons().catch(console.error);
