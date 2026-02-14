import { Router } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import * as crypto from "crypto";
import argon2 from "argon2";

const router = Router();

// Secure migration endpoint - requires MIGRATION_SECRET
router.post("/run-rbac-migration", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    console.log("🚀 Starting RBAC migration...\n");
    const results: string[] = [];

    // Step 1: Create tables
    results.push("📦 Creating RBAC tables...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        displayName VARCHAR(100) NOT NULL,
        description TEXT,
        level INT NOT NULL DEFAULT 0,
        isSystem BOOLEAN DEFAULT FALSE,
        maxUsers INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    results.push("  ✅ roles table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        module VARCHAR(50) NOT NULL,
        submodule VARCHAR(50) NOT NULL,
        action ENUM('view', 'create', 'edit', 'delete', 'export') NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_permission (module, submodule, action)
      )
    `);
    results.push("  ✅ permissions table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roleId INT NOT NULL,
        permissionId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_permission (roleId, permissionId)
      )
    `);
    results.push("  ✅ role_permissions table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        permissionId INT NOT NULL,
        granted BOOLEAN DEFAULT TRUE,
        grantedBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_permission (userId, permissionId)
      )
    `);
    results.push("  ✅ user_permissions table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        tokenHash VARCHAR(255) NOT NULL,
        type ENUM('reset', 'setup') NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        usedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push("  ✅ password_reset_tokens table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_invitations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(320) NOT NULL,
        roleId INT NOT NULL,
        invitedBy INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expiresAt TIMESTAMP NOT NULL,
        acceptedAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push("  ✅ admin_invitations table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        targetType VARCHAR(50),
        targetId INT,
        details TEXT,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push("  ✅ audit_log table created");

    // Add columns to users table
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN roleId INT`);
      results.push("  ✅ Added roleId column to users");
    } catch (e: any) {
      if (!e.message?.includes("Duplicate column")) {
        results.push(`  ⚠️ roleId: ${e.message}`);
      }
    }

    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN isOwner BOOLEAN DEFAULT FALSE`);
      results.push("  ✅ Added isOwner column to users");
    } catch (e: any) {
      if (!e.message?.includes("Duplicate column")) {
        results.push(`  ⚠️ isOwner: ${e.message}`);
      }
    }

    // Update role enum
    try {
      await db.execute(sql`ALTER TABLE users MODIFY COLUMN role ENUM('owner', 'admin', 'hr_admin', 'coach', 'learner', 'user') DEFAULT 'user'`);
      results.push("  ✅ Updated role enum in users table");
    } catch (e: any) {
      results.push(`  ⚠️ Role enum: ${e.message}`);
    }

    // Step 2: Seed default roles
    results.push("\n📋 Seeding default roles...");
    const DEFAULT_ROLES = [
      { name: "owner", displayName: "Owner", description: "Super-admin with full platform access", level: 100, isSystem: true, maxUsers: 1 },
      { name: "admin", displayName: "Administrator", description: "Full platform access, can manage users and content", level: 80, isSystem: true, maxUsers: 20 },
      { name: "hr_admin", displayName: "HR Administrator", description: "B2B/B2G focused - cohorts, reporting, licenses", level: 60, isSystem: true, maxUsers: null },
      { name: "coach", displayName: "Coach", description: "Teaching role - sessions, learners, content", level: 40, isSystem: true, maxUsers: null },
      { name: "learner", displayName: "Learner", description: "Learning role - courses, progress, certificates", level: 20, isSystem: true, maxUsers: null },
    ];

    for (const role of DEFAULT_ROLES) {
      await db.execute(sql`
        INSERT INTO roles (name, displayName, description, level, isSystem, maxUsers)
        VALUES (${role.name}, ${role.displayName}, ${role.description}, ${role.level}, ${role.isSystem}, ${role.maxUsers})
        ON DUPLICATE KEY UPDATE displayName = VALUES(displayName), description = VALUES(description)
      `);
      results.push(`  ✅ Role: ${role.displayName}`);
    }

    // Step 3: Seed permissions
    results.push("\n🔐 Seeding permissions...");
    const PERMISSIONS = [
      { module: "products", submodule: "courses", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "products", submodule: "coaching", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "products", submodule: "community", actions: ["view", "create", "edit", "delete"] },
      { module: "sales", submodule: "payments", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "sales", submodule: "offers", actions: ["view", "create", "edit", "delete"] },
      { module: "sales", submodule: "invoices", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "sales", submodule: "coupons", actions: ["view", "create", "edit", "delete"] },
      { module: "website", submodule: "pages", actions: ["view", "create", "edit", "delete"] },
      { module: "website", submodule: "blog", actions: ["view", "create", "edit", "delete"] },
      { module: "marketing", submodule: "email", actions: ["view", "create", "edit", "delete"] },
      { module: "marketing", submodule: "contacts", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "insights", submodule: "analytics", actions: ["view", "export"] },
      { module: "insights", submodule: "reports", actions: ["view", "create", "export"] },
      { module: "people", submodule: "users", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "people", submodule: "admins", actions: ["view", "create", "edit", "delete"] },
      { module: "people", submodule: "coaches", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "people", submodule: "learners", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "people", submodule: "cohorts", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "settings", submodule: "general", actions: ["view", "edit"] },
      { module: "settings", submodule: "billing", actions: ["view", "edit", "delete"] },
      { module: "settings", submodule: "integrations", actions: ["view", "create", "edit", "delete"] },
    ];

    let permCount = 0;
    for (const perm of PERMISSIONS) {
      for (const action of perm.actions) {
        try {
          await db.execute(sql`
            INSERT INTO permissions (module, submodule, action)
            VALUES (${perm.module}, ${perm.submodule}, ${action})
            ON DUPLICATE KEY UPDATE module = VALUES(module)
          `);
          permCount++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    results.push(`  ✅ Created ${permCount} permissions`);

    results.push("\n✅ RBAC migration completed successfully!");

    return res.json({ 
      success: true, 
      message: "RBAC migration completed",
      results 
    });
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create owner account endpoint
router.post("/create-owner", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    console.log(`🚀 Creating Owner account for ${email}...`);

    // Get the owner role ID
    const [roleRows] = await db.execute(sql`SELECT id FROM roles WHERE name = 'owner'`);
    const ownerRoleId = (roleRows as any)[0]?.id;
    
    if (!ownerRoleId) {
      return res.status(400).json({ error: "Owner role not found. Please run RBAC migration first." });
    }

    // Check if owner already exists
    const [existingUser] = await db.execute(sql`SELECT id FROM users WHERE email = ${email}`);
    let userId: number;

    if ((existingUser as any).length > 0) {
      userId = (existingUser as any)[0].id;
      
      // Update to owner role
      await db.execute(sql`
        UPDATE users 
        SET role = 'owner', roleId = ${ownerRoleId}, isOwner = TRUE, name = ${name}
        WHERE id = ${userId}
      `);
    } else {
      // Create new user
      const openId = `owner_${crypto.randomBytes(16).toString("hex")}`;
      
      await db.execute(sql`
        INSERT INTO users (openId, email, name, role, roleId, isOwner, loginMethod, emailVerified)
        VALUES (${openId}, ${email}, ${name}, 'owner', ${ownerRoleId}, TRUE, 'email', TRUE)
      `);
      
      const [newUser] = await db.execute(sql`SELECT id FROM users WHERE email = ${email}`);
      userId = (newUser as any)[0].id;
    }

    // Generate password setup token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Delete any existing tokens for this user
    await db.execute(sql`DELETE FROM password_reset_tokens WHERE userId = ${userId}`);
    
    // Hash the token for storage
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await db.execute(sql`
      INSERT INTO password_reset_tokens (userId, tokenHash, type, expiresAt)
      VALUES (${userId}, ${tokenHash}, 'setup', ${expiresAt})
    `);

    // Generate the setup URL
    const baseUrl = process.env.VITE_APP_URL || "https://www.rusingacademy.ca";
    const setupUrl = `${baseUrl}/set-password?token=${token}`;

    return res.json({
      success: true,
      message: "Owner account created successfully",
      email,
      name,
      setupUrl,
      expiresIn: "7 days"
    });
  } catch (error: any) {
    console.error("❌ Failed to create owner account:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Promote existing user to owner (Option A - for users who already signed up)
router.post("/promote-to-owner", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`🚀 Promoting user ${email} to Owner...`);

    // Check if user exists
    const [existingUser] = await db.execute(sql`SELECT id, name, role, isOwner FROM users WHERE email = ${email}`);
    
    if ((existingUser as any).length === 0) {
      return res.status(404).json({ 
        error: "User not found. Please sign up first at /signup" 
      });
    }

    const user = (existingUser as any)[0];

    // Get the owner role ID
    const [roleRows] = await db.execute(sql`SELECT id FROM roles WHERE name = 'owner'`);
    let ownerRoleId = (roleRows as any)[0]?.id;
    
    // If owner role doesn't exist, create it
    if (!ownerRoleId) {
      console.log("Owner role not found, creating it...");
      await db.execute(sql`
        INSERT INTO roles (name, displayName, description, level, isSystem, maxUsers)
        VALUES ('owner', 'Owner', 'Super-admin with full platform access', 100, TRUE, 1)
        ON DUPLICATE KEY UPDATE displayName = 'Owner'
      `);
      const [newRole] = await db.execute(sql`SELECT id FROM roles WHERE name = 'owner'`);
      ownerRoleId = (newRole as any)[0]?.id;
    }

    // Update user to owner role
    await db.execute(sql`
      UPDATE users 
      SET role = 'owner', roleId = ${ownerRoleId}, isOwner = TRUE, emailVerified = TRUE
      WHERE id = ${user.id}
    `);

    // Log the action
    try {
      await db.execute(sql`
        INSERT INTO audit_log (userId, action, targetType, targetId, details)
        VALUES (${user.id}, 'user.promote_to_owner', 'user', ${user.id}, ${JSON.stringify({ email, previousRole: user.role })})
      `);
    } catch (e) {
      console.log("Audit log not available, skipping");
    }

    return res.json({
      success: true,
      message: "User promoted to Owner successfully",
      user: {
        id: user.id,
        email,
        name: user.name,
        role: "owner",
        isOwner: true,
        previousRole: user.role
      },
      howToTest: [
        "1. Go to https://www.rusingacademy.ca/login",
        "2. Login with your email and password",
        "3. You should now have full admin access",
        "4. Access /admin to see the admin dashboard"
      ]
    });
  } catch (error: any) {
    console.error("❌ Failed to promote user to owner:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Run HR tables migration
router.post("/run-hr-migration", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    console.log("🚀 Starting HR tables migration...\n");
    const results: string[] = [];

    // Create cohorts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cohorts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organizationId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        department VARCHAR(200),
        manager VARCHAR(255),
        managerEmail VARCHAR(320),
        targetLevel JSON,
        targetDate TIMESTAMP NULL,
        status ENUM('active', 'inactive', 'completed', 'archived') DEFAULT 'active',
        memberCount INT DEFAULT 0,
        avgProgress INT DEFAULT 0,
        completionRate INT DEFAULT 0,
        createdBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);
    results.push("✅ cohorts table created");

    // Create cohort_members table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cohort_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cohortId INT NOT NULL,
        userId INT NOT NULL,
        role ENUM('member', 'lead') DEFAULT 'member',
        currentProgress INT DEFAULT 0,
        lastActiveAt TIMESTAMP NULL,
        status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
        addedBy INT,
        addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cohortId) REFERENCES cohorts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cohort_member (cohortId, userId)
      )
    `);
    results.push("✅ cohort_members table created");

    // Create course_assignments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS course_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organizationId INT NOT NULL,
        cohortId INT,
        userId INT,
        courseId INT,
        pathId INT,
        assignmentType ENUM('required', 'optional', 'recommended') DEFAULT 'required',
        priority INT DEFAULT 0,
        startDate TIMESTAMP NULL,
        dueDate TIMESTAMP NULL,
        targetLevel ENUM('BBB', 'CBC', 'CCC'),
        status ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
        assignedBy INT,
        assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completedAt TIMESTAMP NULL,
        notes TEXT,
        FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);
    results.push("✅ course_assignments table created");

    // Create hr_audit_log table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hr_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organizationId INT NOT NULL,
        userId INT NOT NULL,
        action ENUM('cohort_created', 'cohort_updated', 'cohort_deleted', 'member_added', 'member_removed', 'course_assigned', 'course_unassigned', 'report_exported', 'learner_invited', 'settings_changed') NOT NULL,
        targetType VARCHAR(50),
        targetId INT,
        details JSON,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);
    results.push("✅ hr_audit_log table created");

    // Add HR-specific permissions
    const HR_PERMISSIONS = [
      { module: "hr", submodule: "cohorts", actions: ["view", "create", "edit", "delete", "export"] },
      { module: "hr", submodule: "assignments", actions: ["view", "create", "edit", "delete"] },
      { module: "hr", submodule: "reports", actions: ["view", "export"] },
      { module: "hr", submodule: "learners", actions: ["view", "create", "edit", "export"] },
      { module: "hr", submodule: "compliance", actions: ["view", "export"] },
    ];

    let permCount = 0;
    for (const perm of HR_PERMISSIONS) {
      for (const action of perm.actions) {
        try {
          await db.execute(sql`
            INSERT INTO permissions (module, submodule, action)
            VALUES (${perm.module}, ${perm.submodule}, ${action})
            ON DUPLICATE KEY UPDATE module = VALUES(module)
          `);
          permCount++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    results.push(`✅ Created ${permCount} HR permissions`);

    // Assign HR permissions to hr_admin role
    const [hrRole] = await db.execute(sql`SELECT id FROM roles WHERE name = 'hr_admin'`);
    if ((hrRole as any).length > 0) {
      const hrRoleId = (hrRole as any)[0].id;
      const [hrPerms] = await db.execute(sql`SELECT id FROM permissions WHERE module = 'hr'`);
      for (const perm of hrPerms as unknown as any[]) {
        try {
          await db.execute(sql`
            INSERT INTO role_permissions (roleId, permissionId)
            VALUES (${hrRoleId}, ${perm.id})
            ON DUPLICATE KEY UPDATE roleId = VALUES(roleId)
          `);
        } catch (e) {
          // Ignore duplicates
        }
      }
      results.push("✅ Assigned HR permissions to hr_admin role");
    }

    results.push("\n✅ HR migration completed successfully!");

    return res.json({ 
      success: true, 
      message: "HR migration completed",
      results 
    });
  } catch (error: any) {
    console.error("❌ HR Migration failed:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create HR admin for an organization
router.post("/create-hr-admin", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    const { email, organizationId } = req.body;
    
    if (!email || !organizationId) {
      return res.status(400).json({ error: "Email and organizationId are required" });
    }

    console.log(`🚀 Creating HR Admin for ${email} in org ${organizationId}...`);

    // Check if user exists
    const [existingUser] = await db.execute(sql`SELECT id, name, role FROM users WHERE email = ${email}`);
    
    if ((existingUser as any).length === 0) {
      return res.status(404).json({ 
        error: "User not found. Please sign up first at /signup" 
      });
    }

    const user = (existingUser as any)[0];

    // Check if organization exists
    const [org] = await db.execute(sql`SELECT id, name FROM organizations WHERE id = ${organizationId}`);
    if ((org as any).length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Get the hr_admin role ID
    const [roleRows] = await db.execute(sql`SELECT id FROM roles WHERE name = 'hr_admin'`);
    const hrRoleId = (roleRows as any)[0]?.id;
    
    if (!hrRoleId) {
      return res.status(400).json({ error: "HR Admin role not found. Please run RBAC migration first." });
    }

    // Update user to hr_admin role
    await db.execute(sql`
      UPDATE users 
      SET role = 'hr_admin', roleId = ${hrRoleId}
      WHERE id = ${user.id}
    `);

    // Add user as admin in organization_members
    await db.execute(sql`
      INSERT INTO organization_members (organizationId, userId, role, status, joinedAt)
      VALUES (${organizationId}, ${user.id}, 'admin', 'active', NOW())
      ON DUPLICATE KEY UPDATE role = 'admin', status = 'active'
    `);

    return res.json({
      success: true,
      message: "HR Admin created successfully",
      user: {
        id: user.id,
        email,
        name: user.name,
        role: "hr_admin",
        organizationId,
        organizationName: (org as any)[0].name
      },
      howToTest: [
        "1. Go to https://www.rusingacademy.ca/login",
        "2. Login with your email and password",
        "3. You should be redirected to /dashboard/hr",
        "4. You can manage cohorts, assignments, and view reports for your organization"
      ]
    });
  } catch (error: any) {
    console.error("❌ Failed to create HR admin:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/// Direct password reset for admin use
router.post("/reset-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    // Hash password with Argon2id (matching auth.ts config)
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    // Update user password
    const result = await db.execute(sql`
      UPDATE users 
      SET passwordHash = ${passwordHash}, emailVerified = TRUE 
      WHERE email = ${email.toLowerCase()}
    `);

    if ((result as any)[0].affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      message: `Password reset successfully for ${email}`,
    });
  } catch (error: any) {
    console.error("❌ Failed to reset password:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// List users for debugging
router.get("/list-users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const migrationSecret = process.env.MIGRATION_SECRET || process.env.CRON_SECRET;
    
    if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    const users = await db.execute(sql`SELECT id, email, name, role, isOwner FROM users LIMIT 50`);

    return res.json({
      success: true,
      users: users[0],
    });
  } catch (error: any) {
    console.error("❌ Failed to list users:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
