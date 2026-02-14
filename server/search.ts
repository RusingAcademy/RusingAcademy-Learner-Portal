/**
 * Search functionality for RusingAcademy Ecosystem
 * Provides unified search across coaches, courses, and content
 */

import { getDb } from "./db";
import { coachProfiles, users, courses } from "../drizzle/schema";
import { eq, and, or, like, sql, desc, inArray } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export type SearchResultType = "coach" | "course" | "page" | "faq";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  score: number;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";
export type CourseCategory = "sle_oral" | "sle_written" | "sle_reading" | "sle_complete" | "exam_prep" | "grammar" | "vocabulary";

export interface SearchFilters {
  types?: SearchResultType[];
  language?: "en" | "fr" | "both";
  limit?: number;
  // Course-specific filters
  courseLevel?: CourseLevel | CourseLevel[];
  courseCategory?: CourseCategory | CourseCategory[];
  priceRange?: { min?: number; max?: number };
  freeOnly?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  suggestions: string[];
}

// ============================================================================
// STATIC CONTENT INDEX
// ============================================================================

// Static pages that can be searched
const STATIC_PAGES: SearchResult[] = [
  {
    id: "page-how-it-works",
    type: "page",
    title: "How It Works",
    description: "Learn how RusingAcademy connects you with expert SLE coaches for personalized language training.",
    url: "/how-it-works",
    score: 0,
  },
  {
    id: "page-become-coach",
    type: "page",
    title: "Become a Coach",
    description: "Join our network of expert language coaches and help Canadian public servants achieve their SLE goals.",
    url: "/become-coach",
    score: 0,
  },
  {
    id: "page-pricing",
    type: "page",
    title: "Pricing",
    description: "Flexible pricing options for SLE coaching sessions. Find the right package for your learning journey.",
    url: "/pricing",
    score: 0,
  },
  {
    id: "page-about",
    type: "page",
    title: "About Us",
    description: "RusingAcademy is Canada's premier marketplace for GC/SLE language preparation.",
    url: "/about",
    score: 0,
  },
  {
    id: "page-contact",
    type: "page",
    title: "Contact Us",
    description: "Get in touch with our team for questions about coaching, partnerships, or support.",
    url: "/contact",
    score: 0,
  },
  {
    id: "page-for-departments",
    type: "page",
    title: "For Departments",
    description: "Enterprise solutions for government departments seeking SLE training for their teams.",
    url: "/for-departments",
    score: 0,
  },
  {
    id: "page-curriculum",
    type: "page",
    title: "Curriculum",
    description: "Explore our comprehensive SLE preparation curriculum designed for Canadian public servants.",
    url: "/curriculum",
    score: 0,
  },
  {
    id: "page-coaches",
    type: "page",
    title: "Find a Coach",
    description: "Browse our network of certified SLE coaches and find the perfect match for your learning style.",
    url: "/coaches",
    score: 0,
  },
  {
    id: "page-courses",
    type: "page",
    title: "Courses",
    description: "Self-paced online courses for SLE preparation. Learn at your own pace with expert-designed content.",
    url: "/courses",
    score: 0,
  },
  {
    id: "page-ai-coach",
    type: "page",
    title: "AI Coach",
    description: "Practice your French with our AI-powered conversation partner. Available 24/7 for unlimited practice.",
    url: "/ai-coach",
    score: 0,
  },
  {
    id: "page-community",
    type: "page",
    title: "Community",
    description: "Join our community of learners and coaches. Share tips, resources, and support each other.",
    url: "/community",
    score: 0,
  },
  {
    id: "page-blog",
    type: "page",
    title: "Blog",
    description: "Tips, strategies, and insights for SLE preparation from our expert coaches.",
    url: "/blog",
    score: 0,
  },
  {
    id: "page-faq",
    type: "page",
    title: "FAQ",
    description: "Frequently asked questions about SLE exams, coaching, and our platform.",
    url: "/faq",
    score: 0,
  },
];

// FAQ items for search
const FAQ_ITEMS: SearchResult[] = [
  {
    id: "faq-sle-levels",
    type: "faq",
    title: "What are the SLE levels (A, B, C)?",
    description: "The SLE has three proficiency levels: A (beginner), B (intermediate), and C (advanced). Most positions require B or C levels.",
    url: "/faq#sle-levels",
    score: 0,
  },
  {
    id: "faq-exam-format",
    type: "faq",
    title: "What is the format of the SLE exam?",
    description: "The SLE consists of three tests: Reading Comprehension, Written Expression, and Oral Interaction.",
    url: "/faq#exam-format",
    score: 0,
  },
  {
    id: "faq-coaching-sessions",
    type: "faq",
    title: "How do coaching sessions work?",
    description: "Sessions are conducted via video call. You'll work one-on-one with your coach on areas you need to improve.",
    url: "/faq#coaching-sessions",
    score: 0,
  },
  {
    id: "faq-booking",
    type: "faq",
    title: "How do I book a session?",
    description: "Browse our coaches, select one that matches your needs, and book directly through their profile page.",
    url: "/faq#booking",
    score: 0,
  },
  {
    id: "faq-cancellation",
    type: "faq",
    title: "What is the cancellation policy?",
    description: "You can cancel or reschedule up to 24 hours before your session for a full refund.",
    url: "/faq#cancellation",
    score: 0,
  },
  {
    id: "faq-payment",
    type: "faq",
    title: "What payment methods are accepted?",
    description: "We accept all major credit cards through our secure Stripe payment system.",
    url: "/faq#payment",
    score: 0,
  },
  {
    id: "faq-trial-session",
    type: "faq",
    title: "Is there a trial session available?",
    description: "Many coaches offer discounted trial sessions so you can find the right fit before committing.",
    url: "/faq#trial-session",
    score: 0,
  },
];

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Calculate relevance score based on query match
 */
function calculateScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  
  let score = 0;
  
  // Exact match bonus
  if (lowerText.includes(lowerQuery)) {
    score += 100;
  }
  
  // Word matches
  for (const word of words) {
    if (lowerText.includes(word)) {
      score += 20;
      // Title match bonus
      if (lowerText.startsWith(word)) {
        score += 30;
      }
    }
  }
  
  return score;
}

/**
 * Search coaches in the database
 */
export async function searchCoaches(query: string, limit: number = 10): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const searchPattern = `%${query}%`;
    
    const results = await db
      .select({
        id: coachProfiles.id,
        slug: coachProfiles.slug,
        headline: coachProfiles.headline,
        bio: coachProfiles.bio,
        photoUrl: coachProfiles.photoUrl,
        languages: coachProfiles.languages,
        specializations: coachProfiles.specializations,
        averageRating: coachProfiles.averageRating,
        userName: users.name,
        userAvatar: users.avatarUrl,
      })
      .from(coachProfiles)
      .innerJoin(users, eq(coachProfiles.userId, users.id))
      .where(
        and(
          eq(coachProfiles.status, "approved"),
          or(
            like(users.name, searchPattern),
            like(coachProfiles.headline, searchPattern),
            like(coachProfiles.bio, searchPattern)
          )
        )
      )
      .limit(limit);
    
    return results.map(coach => ({
      id: `coach-${coach.id}`,
      type: "coach" as SearchResultType,
      title: coach.userName || "Coach",
      description: coach.headline || coach.bio?.substring(0, 150) || "Expert SLE Coach",
      url: `/coaches/${coach.slug}`,
      imageUrl: coach.photoUrl || coach.userAvatar || undefined,
      metadata: {
        languages: coach.languages,
        specializations: coach.specializations,
        rating: coach.averageRating,
      },
      score: calculateScore(`${coach.userName} ${coach.headline} ${coach.bio}`, query),
    }));
  } catch (error) {
    console.error("[Search] Error searching coaches:", error);
    return [];
  }
}

/**
 * Search static pages
 */
export function searchPages(query: string, limit: number = 10): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  return STATIC_PAGES
    .map(page => ({
      ...page,
      score: calculateScore(`${page.title} ${page.description}`, query),
    }))
    .filter(page => page.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Search FAQ items
 */
export function searchFAQ(query: string, limit: number = 10): SearchResult[] {
  return FAQ_ITEMS
    .map(faq => ({
      ...faq,
      score: calculateScore(`${faq.title} ${faq.description}`, query),
    }))
    .filter(faq => faq.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Search courses in the database with optional filters
 */
export async function searchCourses(
  query: string,
  filters: SearchFilters = {},
  limit: number = 10
): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const searchPattern = `%${query}%`;
    
    // Build conditions array
    const conditions: any[] = [
      eq(courses.status, "published"),
      or(
        like(courses.title, searchPattern),
        like(courses.description, searchPattern),
        like(courses.shortDescription, searchPattern),
        like(courses.category, searchPattern)
      )
    ];
    
    // Apply level filter
    if (filters.courseLevel) {
      const levels = Array.isArray(filters.courseLevel) 
        ? filters.courseLevel 
        : [filters.courseLevel];
      conditions.push(inArray(courses.level, levels));
    }
    
    // Apply category filter
    if (filters.courseCategory) {
      const categories = Array.isArray(filters.courseCategory)
        ? filters.courseCategory
        : [filters.courseCategory];
      conditions.push(inArray(courses.category, categories));
    }
    
    // Apply free only filter
    if (filters.freeOnly) {
      conditions.push(eq(courses.price, 0));
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        conditions.push(sql`${courses.price} >= ${filters.priceRange.min}`);
      }
      if (filters.priceRange.max !== undefined) {
        conditions.push(sql`${courses.price} <= ${filters.priceRange.max}`);
      }
    }
    
    const results = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        shortDescription: courses.shortDescription,
        thumbnailUrl: courses.thumbnailUrl,
        category: courses.category,
        level: courses.level,
        price: courses.price,
        totalModules: courses.totalModules,
        totalLessons: courses.totalLessons,
        totalDurationMinutes: courses.totalDurationMinutes,
        averageRating: courses.averageRating,
        totalEnrollments: courses.totalEnrollments,
        instructorName: courses.instructorName,
      })
      .from(courses)
      .where(and(...conditions))
      .orderBy(desc(courses.totalEnrollments))
      .limit(limit);
    
    return results.map(course => {
      // Map category to SLE level display
      const levelDisplay = mapCategoryToLevel(course.category);
      
      return {
        id: `course-${course.id}`,
        type: "course" as SearchResultType,
        title: course.title,
        description: course.shortDescription || course.description?.substring(0, 150) || "",
        url: `/courses/${course.slug}`,
        imageUrl: course.thumbnailUrl || undefined,
        metadata: {
          category: course.category,
          level: course.level,
          sleLevel: levelDisplay,
          price: course.price,
          priceFormatted: course.price === 0 ? "Free" : `$${(course.price! / 100).toFixed(2)}`,
          totalModules: course.totalModules,
          totalLessons: course.totalLessons,
          duration: course.totalDurationMinutes,
          durationFormatted: formatDuration(course.totalDurationMinutes || 0),
          rating: course.averageRating,
          enrollments: course.totalEnrollments,
          instructor: course.instructorName,
        },
        score: calculateScore(`${course.title} ${course.description} ${course.category}`, query),
      };
    });
  } catch (error) {
    console.error("[Search] Error searching courses:", error);
    return [];
  }
}

/**
 * Map course category to SLE level display (A, B, C)
 */
function mapCategoryToLevel(category: string | null): string | null {
  if (!category) return null;
  
  // Extract level from category name if present
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes("beginner") || categoryLower.includes("_a")) return "A";
  if (categoryLower.includes("intermediate") || categoryLower.includes("_b")) return "B";
  if (categoryLower.includes("advanced") || categoryLower.includes("_c")) return "C";
  
  // Map specific categories
  const categoryMap: Record<string, string> = {
    "sle_oral": "Oral",
    "sle_written": "Written",
    "sle_reading": "Reading",
    "sle_complete": "Complete",
    "exam_prep": "Exam Prep",
    "grammar": "Grammar",
    "vocabulary": "Vocabulary",
  };
  
  return categoryMap[category] || category;
}

/**
 * Format duration in minutes to human-readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Generate search suggestions based on query
 */
export function generateSuggestions(query: string): string[] {
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Common search terms
  const commonTerms = [
    "SLE coaching",
    "French coach",
    "English coach",
    "oral exam preparation",
    "written exam preparation",
    "reading comprehension",
    "level C preparation",
    "level B preparation",
    "trial session",
    "AI practice",
    "online courses",
    "group sessions",
  ];
  
  for (const term of commonTerms) {
    if (term.toLowerCase().includes(lowerQuery) && term.toLowerCase() !== lowerQuery) {
      suggestions.push(term);
    }
  }
  
  return suggestions.slice(0, 5);
}

/**
 * Unified search across all content types
 */
export async function search(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const { types, limit = 20 } = filters;
  
  if (!query || query.trim().length < 2) {
    return {
      results: [],
      total: 0,
      query,
      suggestions: generateSuggestions(query),
    };
  }
  
  const trimmedQuery = query.trim();
  const results: SearchResult[] = [];
  
  // Search each content type
  const searchTypes = types || ["coach", "course", "page", "faq"];
  
  if (searchTypes.includes("coach")) {
    const coachResults = await searchCoaches(trimmedQuery, limit);
    results.push(...coachResults);
  }
  
  if (searchTypes.includes("course")) {
    const courseResults = await searchCourses(trimmedQuery, filters, limit);
    results.push(...courseResults);
  }
  
  if (searchTypes.includes("page")) {
    const pageResults = searchPages(trimmedQuery, limit);
    results.push(...pageResults);
  }
  
  if (searchTypes.includes("faq")) {
    const faqResults = searchFAQ(trimmedQuery, limit);
    results.push(...faqResults);
  }
  
  // Sort all results by score
  results.sort((a, b) => b.score - a.score);
  
  // Limit total results
  const limitedResults = results.slice(0, limit);
  
  return {
    results: limitedResults,
    total: results.length,
    query: trimmedQuery,
    suggestions: generateSuggestions(trimmedQuery),
  };
}

/**
 * Get quick suggestions for autocomplete
 */
export async function getQuickSuggestions(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const suggestions: string[] = [];
  const trimmedQuery = query.trim().toLowerCase();
  
  // Add matching page titles
  for (const page of STATIC_PAGES) {
    if (page.title.toLowerCase().includes(trimmedQuery)) {
      suggestions.push(page.title);
    }
  }
  
  // Add matching FAQ titles
  for (const faq of FAQ_ITEMS) {
    if (faq.title.toLowerCase().includes(trimmedQuery)) {
      suggestions.push(faq.title);
    }
  }
  
  // Add generated suggestions
  suggestions.push(...generateSuggestions(query));
  
  // Remove duplicates and limit
  return [...new Set(suggestions)].slice(0, 8);
}
