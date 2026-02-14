import { z } from "zod";
import { getDb } from "./db";
import { 
  ecosystemLeads, 
  ecosystemLeadActivities, 
  ecosystemLeadNotes,
  ecosystemCrossSellOpportunities,
  users 
} from "../drizzle/schema";
import { eq, desc, and, like, or, sql, inArray, gte, lte } from "drizzle-orm";

// Input schemas
export const createLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(100).optional(),
  source: z.enum(["lingueefy", "rusingacademy", "barholex", "ecosystem_hub", "external"]),
  formType: z.string().max(50),
  leadType: z.enum(["individual", "organization", "government", "enterprise"]).optional(),
  message: z.string().optional(),
  interests: z.array(z.string()).optional(),
  budget: z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  preferredLanguage: z.enum(["en", "fr"]).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  referrer: z.string().max(500).optional(),
});

export const updateLeadSchema = z.object({
  id: z.number(),
  status: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "nurturing"]).optional(),
  assignedTo: z.number().nullable().optional(),
  leadScore: z.number().optional(),
  qualificationNotes: z.string().optional(),
  leadType: z.enum(["individual", "organization", "government", "enterprise"]).optional(),
});

export const getLeadsSchema = z.object({
  source: z.enum(["lingueefy", "rusingacademy", "barholex", "ecosystem_hub", "external", "all"]).optional(),
  status: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "nurturing", "all"]).optional(),
  leadType: z.enum(["individual", "organization", "government", "enterprise", "all"]).optional(),
  search: z.string().optional(),
  assignedTo: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export const addNoteSchema = z.object({
  leadId: z.number(),
  content: z.string().min(1),
  isPinned: z.boolean().optional(),
});

export const createCrossSellSchema = z.object({
  leadId: z.number(),
  sourcePlatform: z.enum(["lingueefy", "rusingacademy", "barholex", "ecosystem_hub", "external"]),
  targetPlatform: z.enum(["lingueefy", "rusingacademy", "barholex", "ecosystem_hub", "external"]),
  opportunityType: z.string().max(100),
  description: z.string().optional(),
  estimatedValue: z.number().optional(),
});

// Create a new lead
export async function createLead(data: z.infer<typeof createLeadSchema>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [lead] = await db.insert(ecosystemLeads).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    company: data.company,
    jobTitle: data.jobTitle,
    source: data.source,
    formType: data.formType,
    leadType: data.leadType || "individual",
    message: data.message,
    interests: data.interests ? JSON.stringify(data.interests) : null,
    budget: data.budget,
    timeline: data.timeline,
    preferredLanguage: data.preferredLanguage || "en",
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    referrer: data.referrer,
  }).$returningId();

  // Log creation activity
  await db.insert(ecosystemLeadActivities).values({
    leadId: lead.id,
    activityType: "created",
    description: `Lead created from ${data.source} via ${data.formType} form`,
  });

  // Auto-detect cross-sell opportunities based on interests
  if (data.interests && data.interests.length > 0) {
    const platforms = ["lingueefy", "rusingacademy", "barholex"];
    const otherPlatforms = platforms.filter(p => p !== data.source);
    
    for (const interest of data.interests) {
      for (const targetPlatform of otherPlatforms) {
        if (shouldCreateCrossSell(interest, targetPlatform)) {
          await db.insert(ecosystemCrossSellOpportunities).values({
            leadId: lead.id,
            sourcePlatform: data.source,
            targetPlatform: targetPlatform as any,
            opportunityType: `Interest in ${interest}`,
            description: `Lead expressed interest in ${interest} which aligns with ${targetPlatform} offerings`,
          });
          
          await db.insert(ecosystemLeadActivities).values({
            leadId: lead.id,
            activityType: "cross_sell_identified",
            description: `Cross-sell opportunity identified for ${targetPlatform}`,
          });
        }
      }
    }
  }

  return lead;
}

// Helper to determine if cross-sell should be created
function shouldCreateCrossSell(interest: string, targetPlatform: string): boolean {
  const interestLower = interest.toLowerCase();
  
  if (targetPlatform === "lingueefy") {
    return interestLower.includes("coaching") || 
           interestLower.includes("sle") || 
           interestLower.includes("language") ||
           interestLower.includes("bilingual");
  }
  
  if (targetPlatform === "rusingacademy") {
    return interestLower.includes("training") || 
           interestLower.includes("team") || 
           interestLower.includes("corporate") ||
           interestLower.includes("government") ||
           interestLower.includes("department");
  }
  
  if (targetPlatform === "barholex") {
    return interestLower.includes("video") || 
           interestLower.includes("design") || 
           interestLower.includes("web") ||
           interestLower.includes("creative") ||
           interestLower.includes("media");
  }
  
  return false;
}

// Get leads with filtering
export async function getLeads(params: z.infer<typeof getLeadsSchema>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [];
  
  if (params.source && params.source !== "all") {
    conditions.push(eq(ecosystemLeads.source, params.source));
  }
  
  if (params.status && params.status !== "all") {
    conditions.push(eq(ecosystemLeads.status, params.status));
  }
  
  if (params.leadType && params.leadType !== "all") {
    conditions.push(eq(ecosystemLeads.leadType, params.leadType));
  }
  
  if (params.assignedTo) {
    conditions.push(eq(ecosystemLeads.assignedTo, params.assignedTo));
  }
  
  if (params.search) {
    const searchTerm = `%${params.search}%`;
    conditions.push(
      or(
        like(ecosystemLeads.firstName, searchTerm),
        like(ecosystemLeads.lastName, searchTerm),
        like(ecosystemLeads.email, searchTerm),
        like(ecosystemLeads.company, searchTerm)
      )
    );
  }
  
  if (params.startDate) {
    conditions.push(gte(ecosystemLeads.createdAt, new Date(params.startDate)));
  }
  
  if (params.endDate) {
    conditions.push(lte(ecosystemLeads.createdAt, new Date(params.endDate)));
  }

  const leads = await db
    .select({
      lead: ecosystemLeads,
      assignedUser: users,
    })
    .from(ecosystemLeads)
    .leftJoin(users, eq(ecosystemLeads.assignedTo, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ecosystemLeads.createdAt))
    .limit(params.limit || 50)
    .offset(params.offset || 0);

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecosystemLeads)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    leads: leads.map(l => ({
      ...l.lead,
      assignedUser: l.assignedUser ? {
        id: l.assignedUser.id,
        name: l.assignedUser.name,
        email: l.assignedUser.email,
      } : null,
    })),
    total: countResult?.count || 0,
  };
}

// Get single lead with details
export async function getLeadById(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [lead] = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId));

  if (!lead) return null;

  // Get activities
  const activities = await db
    .select({
      activity: ecosystemLeadActivities,
      performer: users,
    })
    .from(ecosystemLeadActivities)
    .leftJoin(users, eq(ecosystemLeadActivities.performedBy, users.id))
    .where(eq(ecosystemLeadActivities.leadId, leadId))
    .orderBy(desc(ecosystemLeadActivities.createdAt))
    .limit(50);

  // Get notes
  const notes = await db
    .select({
      note: ecosystemLeadNotes,
      author: users,
    })
    .from(ecosystemLeadNotes)
    .leftJoin(users, eq(ecosystemLeadNotes.authorId, users.id))
    .where(eq(ecosystemLeadNotes.leadId, leadId))
    .orderBy(desc(ecosystemLeadNotes.createdAt));

  // Get cross-sell opportunities
  const crossSellOpps = await db
    .select()
    .from(ecosystemCrossSellOpportunities)
    .where(eq(ecosystemCrossSellOpportunities.leadId, leadId));

  return {
    ...lead,
    activities: activities.map(a => ({
      ...a.activity,
      performer: a.performer ? {
        id: a.performer.id,
        name: a.performer.name,
      } : null,
    })),
    notes: notes.map(n => ({
      ...n.note,
      author: n.author ? {
        id: n.author.id,
        name: n.author.name,
      } : null,
    })),
    crossSellOpportunities: crossSellOpps,
  };
}

// Update lead
export async function updateLead(data: z.infer<typeof updateLeadSchema>, performedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [currentLead] = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, data.id));

  if (!currentLead) throw new Error("Lead not found");

  const updates: any = {};
  const activities: any[] = [];

  if (data.status !== undefined && data.status !== currentLead.status) {
    updates.status = data.status;
    activities.push({
      leadId: data.id,
      activityType: "status_changed",
      previousValue: currentLead.status,
      newValue: data.status,
      description: `Status changed from ${currentLead.status} to ${data.status}`,
      performedBy,
    });
    
    if (data.status === "won") {
      updates.convertedAt = new Date();
      activities.push({
        leadId: data.id,
        activityType: "converted",
        description: "Lead converted to customer",
        performedBy,
      });
    }
  }

  if (data.assignedTo !== undefined && data.assignedTo !== currentLead.assignedTo) {
    updates.assignedTo = data.assignedTo;
    activities.push({
      leadId: data.id,
      activityType: "assigned",
      previousValue: currentLead.assignedTo?.toString() || "unassigned",
      newValue: data.assignedTo?.toString() || "unassigned",
      description: `Lead ${data.assignedTo ? 'assigned' : 'unassigned'}`,
      performedBy,
    });
  }

  if (data.leadScore !== undefined) {
    updates.leadScore = data.leadScore;
  }

  if (data.qualificationNotes !== undefined) {
    updates.qualificationNotes = data.qualificationNotes;
  }

  if (data.leadType !== undefined) {
    updates.leadType = data.leadType;
  }

  if (Object.keys(updates).length > 0) {
    await db
      .update(ecosystemLeads)
      .set(updates)
      .where(eq(ecosystemLeads.id, data.id));
  }

  if (activities.length > 0) {
    await db.insert(ecosystemLeadActivities).values(activities);
  }

  return getLeadById(data.id);
}

// Add note to lead
export async function addLeadNote(data: z.infer<typeof addNoteSchema>, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [note] = await db.insert(ecosystemLeadNotes).values({
    leadId: data.leadId,
    content: data.content,
    isPinned: data.isPinned || false,
    authorId,
  }).$returningId();

  await db.insert(ecosystemLeadActivities).values({
    leadId: data.leadId,
    activityType: "note_added",
    description: "Note added to lead",
    performedBy: authorId,
  });

  return note;
}

// Create cross-sell opportunity
export async function createCrossSellOpportunity(data: z.infer<typeof createCrossSellSchema>, performedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [opp] = await db.insert(ecosystemCrossSellOpportunities).values({
    leadId: data.leadId,
    sourcePlatform: data.sourcePlatform,
    targetPlatform: data.targetPlatform,
    opportunityType: data.opportunityType,
    description: data.description,
    estimatedValue: data.estimatedValue?.toString(),
  }).$returningId();

  await db.insert(ecosystemLeadActivities).values({
    leadId: data.leadId,
    activityType: "cross_sell_identified",
    description: `Cross-sell opportunity for ${data.targetPlatform}: ${data.opportunityType}`,
    performedBy,
  });

  return opp;
}

// Get CRM analytics
export async function getCRMAnalytics(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conditions = [];
  if (startDate) conditions.push(gte(ecosystemLeads.createdAt, startDate));
  if (endDate) conditions.push(lte(ecosystemLeads.createdAt, endDate));

  // Total leads by source
  const leadsBySource = await db
    .select({
      source: ecosystemLeads.source,
      count: sql<number>`count(*)`,
    })
    .from(ecosystemLeads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(ecosystemLeads.source);

  // Total leads by status
  const leadsByStatus = await db
    .select({
      status: ecosystemLeads.status,
      count: sql<number>`count(*)`,
    })
    .from(ecosystemLeads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(ecosystemLeads.status);

  // Conversion rate
  const [totalLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecosystemLeads)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [convertedLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecosystemLeads)
    .where(
      conditions.length > 0 
        ? and(...conditions, eq(ecosystemLeads.status, "won"))
        : eq(ecosystemLeads.status, "won")
    );

  // Cross-sell opportunities
  const [crossSellCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecosystemCrossSellOpportunities);

  const [convertedCrossSell] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ecosystemCrossSellOpportunities)
    .where(eq(ecosystemCrossSellOpportunities.status, "converted"));

  return {
    totalLeads: totalLeads?.count || 0,
    convertedLeads: convertedLeads?.count || 0,
    conversionRate: totalLeads?.count 
      ? ((convertedLeads?.count || 0) / totalLeads.count * 100).toFixed(1)
      : "0",
    leadsBySource,
    leadsByStatus,
    crossSellOpportunities: crossSellCount?.count || 0,
    convertedCrossSell: convertedCrossSell?.count || 0,
  };
}

// Log contact activity
export async function logContactActivity(leadId: number, activityType: "contacted" | "email_sent" | "call_made" | "meeting_scheduled" | "proposal_sent", description: string, performedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(ecosystemLeadActivities).values({
    leadId,
    activityType,
    description,
    performedBy,
  });

  await db
    .update(ecosystemLeads)
    .set({ lastContactedAt: new Date() })
    .where(eq(ecosystemLeads.id, leadId));
}
