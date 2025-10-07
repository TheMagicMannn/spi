// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL or VITE_SUPABASE_URL environment variable");
}
if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}
if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "your_service_role_key_here") {
  console.error("\n\u26A0\uFE0F  WARNING: SUPABASE_SERVICE_ROLE_KEY is not set or is a placeholder!");
  console.error("Some features like file uploads and admin operations will not work.");
  console.error("Get your key from: Supabase Dashboard > Settings > API > service_role key\n");
}
var supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY !== "your_service_role_key_here" ? createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;
var supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

// server/db.ts
var SupabaseDB = class {
  // ==================== USER OPERATIONS ====================
  async getUser(userId) {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", userId).single();
    if (error) throw error;
    return data;
  }
  async getUserByEmail(email) {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  async updateUser(userId, updates) {
    const { data, error } = await supabaseAdmin.from("users").update(updates).eq("id", userId).select().single();
    if (error) throw error;
    return data;
  }
  // ==================== PROFILE OPERATIONS ====================
  async getProfile(profileId) {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", profileId).single();
    if (error) throw error;
    return data;
  }
  async getProfileByUserId(userId) {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  async createProfile(profile) {
    const { data, error } = await supabaseAdmin.from("profiles").insert(profile).select().single();
    if (error) throw error;
    return data;
  }
  async updateProfile(profileId, updates) {
    const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("id", profileId).select().single();
    if (error) throw error;
    return data;
  }
  async updateProfileByUserId(userId, updates) {
    const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("user_id", userId).select().single();
    if (error) throw error;
    return data;
  }
  async deleteProfile(profileId) {
    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", profileId);
    if (error) throw error;
  }
  async getVisibleProfiles(limit = 20, excludeUserIds = []) {
    let query = supabaseAdmin.from("profiles").select("*").eq("is_visible", true).eq("is_profile_complete", true).eq("verification_status", "verified").limit(limit);
    if (excludeUserIds.length > 0) {
      query = query.not("user_id", "in", `(${excludeUserIds.join(",")})`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  // ==================== COUPLE PROFILE OPERATIONS ====================
  async getCoupleProfile(profileId) {
    const { data, error } = await supabaseAdmin.from("couple_profiles").select("*").eq("profile_id", profileId).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  async createCoupleProfile(coupleProfile) {
    const { data, error } = await supabaseAdmin.from("couple_profiles").insert(coupleProfile).select().single();
    if (error) throw error;
    return data;
  }
  async updateCoupleProfile(profileId, updates) {
    const { data, error } = await supabaseAdmin.from("couple_profiles").update(updates).eq("profile_id", profileId).select().single();
    if (error) throw error;
    return data;
  }
  // ==================== PROFILE PHOTO OPERATIONS ====================
  async getProfilePhotos(profileId) {
    const { data, error } = await supabaseAdmin.from("profile_photos").select("*").eq("profile_id", profileId).order("order", { ascending: true });
    if (error) throw error;
    return data;
  }
  async getProfilePhoto(photoId) {
    const { data, error } = await supabaseAdmin.from("profile_photos").select("*").eq("id", photoId).single();
    if (error) throw error;
    return data;
  }
  async createProfilePhoto(photo) {
    const { data, error } = await supabaseAdmin.from("profile_photos").insert(photo).select().single();
    if (error) throw error;
    return data;
  }
  async updateProfilePhoto(photoId, updates) {
    const { data, error } = await supabaseAdmin.from("profile_photos").update(updates).eq("id", photoId).select().single();
    if (error) throw error;
    return data;
  }
  async deleteProfilePhoto(photoId) {
    const { error } = await supabaseAdmin.from("profile_photos").delete().eq("id", photoId);
    if (error) throw error;
  }
  async getProfilePicture(profileId) {
    const { data, error } = await supabaseAdmin.from("profile_photos").select("*").eq("profile_id", profileId).eq("is_profile", true).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  // ==================== INTEREST OPERATIONS ====================
  async getInterestCategories() {
    const { data, error } = await supabaseAdmin.from("interest_categories").select("*").order("order", { ascending: true });
    if (error) throw error;
    return data;
  }
  async getInterests() {
    const { data, error } = await supabaseAdmin.from("interests").select("*, interest_categories(*)").eq("is_active", true).order("name", { ascending: true });
    if (error) throw error;
    return data;
  }
  async getInterestsByCategory(categoryId) {
    const { data, error } = await supabaseAdmin.from("interests").select("*").eq("category_id", categoryId).eq("is_active", true).order("name", { ascending: true });
    if (error) throw error;
    return data;
  }
  async getProfileInterests(profileId) {
    const { data, error } = await supabaseAdmin.from("profile_interests").select("*, interests(*)").eq("profile_id", profileId);
    if (error) throw error;
    return data;
  }
  async addProfileInterest(profileId, interestId) {
    const { data, error } = await supabaseAdmin.from("profile_interests").insert({ profile_id: profileId, interest_id: interestId }).select().single();
    if (error) throw error;
    return data;
  }
  async addCustomInterest(profileId, customInterest) {
    const { data, error } = await supabaseAdmin.from("profile_interests").insert({ profile_id: profileId, custom_interest: customInterest }).select().single();
    if (error) throw error;
    return data;
  }
  async removeProfileInterest(profileInterestId) {
    const { error } = await supabaseAdmin.from("profile_interests").delete().eq("id", profileInterestId);
    if (error) throw error;
  }
  // ==================== PREFERENCES OPERATIONS ====================
  async getProfilePreferences(profileId) {
    const { data, error } = await supabaseAdmin.from("profile_preferences").select("*").eq("profile_id", profileId).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  async createProfilePreferences(preferences) {
    const { data, error } = await supabaseAdmin.from("profile_preferences").insert(preferences).select().single();
    if (error) throw error;
    return data;
  }
  async updateProfilePreferences(profileId, updates) {
    const { data, error } = await supabaseAdmin.from("profile_preferences").update(updates).eq("profile_id", profileId).select().single();
    if (error) throw error;
    return data;
  }
  // ==================== BOUNDARIES OPERATIONS ====================
  async getProfileBoundaries(profileId) {
    const { data, error } = await supabaseAdmin.from("profile_boundaries").select("*").eq("profile_id", profileId).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  async createProfileBoundaries(boundaries) {
    const { data, error } = await supabaseAdmin.from("profile_boundaries").insert(boundaries).select().single();
    if (error) throw error;
    return data;
  }
  async updateProfileBoundaries(profileId, updates) {
    const { data, error } = await supabaseAdmin.from("profile_boundaries").update(updates).eq("profile_id", profileId).select().single();
    if (error) throw error;
    return data;
  }
  // ==================== SAFE SEX OPERATIONS ====================
  async getProfileSafeSex(profileId) {
    const { data, error } = await supabaseAdmin.from("profile_safe_sex").select("*").eq("profile_id", profileId).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  async createProfileSafeSex(safeSex) {
    const { data, error } = await supabaseAdmin.from("profile_safe_sex").insert(safeSex).select().single();
    if (error) throw error;
    return data;
  }
  async updateProfileSafeSex(profileId, updates) {
    const { data, error } = await supabaseAdmin.from("profile_safe_sex").update(updates).eq("profile_id", profileId).select().single();
    if (error) throw error;
    return data;
  }
  // ==================== VERIFICATION OPERATIONS ====================
  async getUserVerifications(userId) {
    const { data, error } = await supabaseAdmin.from("user_verifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  async createUserVerification(verification) {
    const { data, error } = await supabaseAdmin.from("user_verifications").insert(verification).select().single();
    if (error) throw error;
    return data;
  }
  async updateUserVerification(verificationId, updates) {
    const { data, error } = await supabaseAdmin.from("user_verifications").update(updates).eq("id", verificationId).select().single();
    if (error) throw error;
    return data;
  }
  async getPendingVerifications(limit = 50) {
    const { data, error } = await supabaseAdmin.from("user_verifications").select("*, users(*)").eq("status", "pending").order("created_at", { ascending: true }).limit(limit);
    if (error) throw error;
    return data;
  }
  // ==================== BLOCK OPERATIONS ====================
  async getUserBlocks(userId) {
    const { data, error } = await supabaseAdmin.from("user_blocks").select("*").eq("blocker_id", userId);
    if (error) throw error;
    return data;
  }
  async createUserBlock(blockerId, blockedUserId) {
    const { data, error } = await supabaseAdmin.from("user_blocks").insert({ blocker_id: blockerId, blocked_user_id: blockedUserId }).select().single();
    if (error) throw error;
    return data;
  }
  async deleteUserBlock(blockerId, blockedUserId) {
    const { error } = await supabaseAdmin.from("user_blocks").delete().eq("blocker_id", blockerId).eq("blocked_user_id", blockedUserId);
    if (error) throw error;
  }
  async isUserBlocked(blockerId, blockedUserId) {
    const { data, error } = await supabaseAdmin.from("user_blocks").select("id").eq("blocker_id", blockerId).eq("blocked_user_id", blockedUserId).single();
    return !!data && !error;
  }
  // ==================== REPORT OPERATIONS ====================
  async createUserReport(reporterId, reportedUserId, reason, description) {
    const { data, error } = await supabaseAdmin.from("user_reports").insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      description
    }).select().single();
    if (error) throw error;
    return data;
  }
  async getPendingReports(limit = 50) {
    const { data, error } = await supabaseAdmin.from("user_reports").select("*, reporter:users!user_reports_reporter_id_fkey(*), reported:users!user_reports_reported_user_id_fkey(*)").eq("status", "pending").order("created_at", { ascending: true }).limit(limit);
    if (error) throw error;
    return data;
  }
  async updateReportStatus(reportId, status, reviewedBy, notes) {
    const { data, error } = await supabaseAdmin.from("user_reports").update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...notes && { description: notes }
    }).eq("id", reportId).select().single();
    if (error) throw error;
    return data;
  }
};
var db = new SupabaseDB();

// server/storage.ts
import { randomUUID } from "crypto";
var STORAGE_BUCKETS = {
  PROFILE_PHOTOS: "profile-photos",
  VERIFICATION_DOCUMENTS: "verification-documents"
};
var SupabaseStorage = class {
  // ==================== PROFILE PHOTOS ====================
  /**
   * Upload profile photo
   * @param userId - User ID (used for folder structure)
   * @param file - File buffer
   * @param fileName - Original file name
   * @param contentType - MIME type (image/jpeg, image/png, image/webp)
   * @returns Upload result with path and URL
   */
  async uploadProfilePhoto(userId, file, fileName, contentType) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid file type. Allowed types: ${validTypes.join(", ")}`);
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.length > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }
    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${uniqueFileName}`;
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).upload(filePath, file, {
      contentType,
      upsert: false
    });
    if (error) {
      throw new Error(`Failed to upload profile photo: ${error.message}`);
    }
    const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).getPublicUrl(data.path);
    return {
      path: data.path,
      url: urlData.publicUrl,
      fullPath: data.fullPath
    };
  }
  /**
   * Get profile photo public URL
   * @param path - Storage path
   * @returns Public URL
   */
  getProfilePhotoUrl(path3) {
    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).getPublicUrl(path3);
    return data.publicUrl;
  }
  /**
   * Delete profile photo
   * @param path - Storage path
   */
  async deleteProfilePhoto(path3) {
    const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).remove([path3]);
    if (error) {
      throw new Error(`Failed to delete profile photo: ${error.message}`);
    }
  }
  /**
   * List all profile photos for a user
   * @param userId - User ID
   * @returns List of file paths
   */
  async listProfilePhotos(userId) {
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).list(userId);
    if (error) {
      throw new Error(`Failed to list profile photos: ${error.message}`);
    }
    return data.map((file) => `${userId}/${file.name}`);
  }
  // ==================== VERIFICATION DOCUMENTS ====================
  /**
   * Upload verification document
   * @param userId - User ID (used for folder structure)
   * @param file - File buffer
   * @param fileName - Original file name
   * @param contentType - MIME type (image/jpeg, image/png, image/webp, application/pdf)
   * @returns Upload result with path and URL
   */
  async uploadVerificationDocument(userId, file, fileName, contentType) {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid file type. Allowed types: ${validTypes.join(", ")}`);
    }
    const maxSize = 20 * 1024 * 1024;
    if (file.length > maxSize) {
      throw new Error("File size exceeds 20MB limit");
    }
    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${uniqueFileName}`;
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS).upload(filePath, file, {
      contentType,
      upsert: false
    });
    if (error) {
      throw new Error(`Failed to upload verification document: ${error.message}`);
    }
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS).createSignedUrl(data.path, 3600);
    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
    }
    return {
      path: data.path,
      url: signedUrlData.signedUrl,
      fullPath: data.fullPath
    };
  }
  /**
   * Get verification document signed URL (valid for 1 hour)
   * @param path - Storage path
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL
   */
  async getVerificationDocumentUrl(path3, expiresIn = 3600) {
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS).createSignedUrl(path3, expiresIn);
    if (error) {
      throw new Error(`Failed to get verification document URL: ${error.message}`);
    }
    return data.signedUrl;
  }
  /**
   * Delete verification document
   * @param path - Storage path
   */
  async deleteVerificationDocument(path3) {
    const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS).remove([path3]);
    if (error) {
      throw new Error(`Failed to delete verification document: ${error.message}`);
    }
  }
  /**
   * List all verification documents for a user
   * @param userId - User ID
   * @returns List of file paths
   */
  async listVerificationDocuments(userId) {
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS).list(userId);
    if (error) {
      throw new Error(`Failed to list verification documents: ${error.message}`);
    }
    return data.map((file) => `${userId}/${file.name}`);
  }
  // ==================== BATCH OPERATIONS ====================
  /**
   * Delete multiple files from a bucket
   * @param bucket - Bucket name
   * @param paths - Array of file paths
   */
  async deleteMultipleFiles(bucket, paths) {
    const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
    if (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }
  /**
   * Delete all files for a user from both buckets
   * @param userId - User ID
   */
  async deleteAllUserFiles(userId) {
    try {
      const profilePhotos = await this.listProfilePhotos(userId);
      if (profilePhotos.length > 0) {
        await this.deleteMultipleFiles(STORAGE_BUCKETS.PROFILE_PHOTOS, profilePhotos);
      }
      const verificationDocs = await this.listVerificationDocuments(userId);
      if (verificationDocs.length > 0) {
        await this.deleteMultipleFiles(STORAGE_BUCKETS.VERIFICATION_DOCUMENTS, verificationDocs);
      }
    } catch (error) {
      console.error("Error deleting user files:", error);
      throw error;
    }
  }
  // ==================== HELPER METHODS ====================
  /**
   * Check if a file exists in storage
   * @param bucket - Bucket name
   * @param path - File path
   * @returns True if file exists
   */
  async fileExists(bucket, path3) {
    try {
      const { data, error } = await supabaseAdmin.storage.from(bucket).list(path3.split("/")[0], {
        search: path3.split("/")[1]
      });
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }
  /**
   * Get file metadata
   * @param bucket - Bucket name
   * @param path - File path
   * @returns File metadata
   */
  async getFileMetadata(bucket, path3) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(path3.split("/")[0], {
      search: path3.split("/")[1]
    });
    if (error || !data || data.length === 0) {
      throw new Error("File not found");
    }
    return data[0];
  }
  /**
   * Ensure storage bucket exists and is properly configured
   * @param bucketName - Name of the bucket to check/create
   */
  async ensureBucketExists(bucketName) {
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      if (listError) {
        console.error("Error listing buckets:", listError);
        throw new Error(`Failed to check storage buckets: ${listError.message}`);
      }
      const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} does not exist, creating...`);
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: bucketName === STORAGE_BUCKETS.PROFILE_PHOTOS,
          // Profile photos are public
          fileSizeLimit: bucketName === STORAGE_BUCKETS.PROFILE_PHOTOS ? 10485760 : 20971520,
          // 10MB or 20MB
          allowedMimeTypes: bucketName === STORAGE_BUCKETS.PROFILE_PHOTOS ? ["image/jpeg", "image/png", "image/webp"] : ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        });
        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError);
          throw new Error(`Failed to create storage bucket: ${createError.message}`);
        }
        console.log(`Successfully created bucket: ${bucketName}`);
      }
    } catch (error) {
      console.error("Bucket initialization error:", error);
      throw error;
    }
  }
};
var storage = new SupabaseStorage();

// server/routes.ts
import multer from "multer";
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.substring(7);
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/profile", authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("user_id", req.user.id).single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/profile", authenticateUser, async (req, res) => {
    try {
      console.log("[v0] Profile update request:", { userId: req.user.id, body: req.body });
      const cleanedBody = Object.entries(req.body).reduce((acc, [key, value]) => {
        if (value === "" || value === void 0) {
          acc[key] = null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
      console.log("[v0] Cleaned body:", cleanedBody);
      const { data: existingProfile, error: fetchError } = await supabaseAdmin.from("profiles").select("*").eq("user_id", req.user.id).single();
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("[v0] Error fetching profile:", fetchError);
        throw fetchError;
      }
      let result;
      if (existingProfile) {
        console.log("[v0] Updating existing profile:", existingProfile.id);
        const { data, error } = await supabaseAdmin.from("profiles").update({
          ...cleanedBody,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("user_id", req.user.id).select().single();
        if (error) {
          console.error("[v0] Profile update error:", error);
          throw error;
        }
        result = data;
      } else {
        console.log("[v0] Creating new profile for user:", req.user.id);
        const { data, error } = await supabaseAdmin.from("profiles").insert([
          {
            user_id: req.user.id,
            is_profile_complete: false,
            is_visible: false,
            verification_status: "unverified",
            ...cleanedBody
          }
        ]).select().single();
        if (error) {
          console.error("[v0] Profile creation error:", error);
          throw error;
        }
        result = data;
      }
      console.log("[v0] Profile operation successful:", result.id);
      res.json(result);
    } catch (error) {
      console.error("[v0] Profile operation failed:", error);
      res.status(500).json({
        error: error.message || "Failed to save profile",
        details: error.details || error.hint || "Unknown error"
      });
    }
  });
  app2.put("/api/profile", authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("profiles").update(req.body).eq("user_id", req.user.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/discovery", authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("profiles").select("*").neq("user_id", req.user.id).not(
        "id",
        "in",
        `(
          SELECT swiped_id FROM swipes WHERE swiper_id = '${currentProfile.id}'
        )`
      ).not(
        "id",
        "in",
        `(
          SELECT blocked_id FROM blocks WHERE blocker_id = '${currentProfile.id}'
        )`
      ).limit(20);
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/swipe", authenticateUser, async (req, res) => {
    try {
      const { swiped_id, action } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("swipes").insert([
        {
          swiper_id: currentProfile.id,
          swiped_id,
          action
        }
      ]).select().single();
      if (error) throw error;
      if (action === "like") {
        const { data: reverseSwipe } = await supabaseAdmin.from("swipes").select("*").eq("swiper_id", swiped_id).eq("swiped_id", currentProfile.id).eq("action", "like").single();
        if (reverseSwipe) {
          res.json({ ...data, isMatch: true });
          return;
        }
      }
      res.json({ ...data, isMatch: false });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/matches", authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("matches").select(`
          *,
          user1:profiles!matches_user1_id_fkey(*),
          user2:profiles!matches_user2_id_fkey(*)
        `).or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`).order("matched_at", { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/messages/:matchId", authenticateUser, async (req, res) => {
    try {
      const { matchId } = req.params;
      const { data, error } = await supabaseAdmin.from("messages").select("*").eq("match_id", matchId).order("created_at", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/messages", authenticateUser, async (req, res) => {
    try {
      const { match_id, content, type = "text" } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("messages").insert([
        {
          match_id,
          sender_id: currentProfile.id,
          content,
          type
        }
      ]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/messages/:messageId/read", authenticateUser, async (req, res) => {
    try {
      const { messageId } = req.params;
      const { data, error } = await supabaseAdmin.from("messages").update({ is_read: true }).eq("id", messageId).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/block", authenticateUser, async (req, res) => {
    try {
      const { blocked_id } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("blocks").insert([
        {
          blocker_id: currentProfile.id,
          blocked_id
        }
      ]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/block/:blockedId", authenticateUser, async (req, res) => {
    try {
      const { blockedId } = req.params;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { error } = await supabaseAdmin.from("blocks").delete().eq("blocker_id", currentProfile.id).eq("blocked_id", blockedId);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/report", authenticateUser, async (req, res) => {
    try {
      const { reported_id, reason } = req.body;
      const { data: currentProfile } = await supabaseAdmin.from("profiles").select("id").eq("user_id", req.user.id).single();
      if (!currentProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const { data, error } = await supabaseAdmin.from("reports").insert([
        {
          reporter_id: currentProfile.id,
          reported_id,
          reason
        }
      ]).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/interests", async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from("interests").select("*").order("category", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const upload = multer({ storage: multer.memoryStorage() });
  app2.post("/api/upload/profile-photo", authenticateUser, upload.single("photo"), async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          error: "File upload service is not configured. Please contact administrator."
        });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      console.log(`[v0] Processing photo upload for user: ${req.user.id}`);
      const profile = await db.getProfileByUserId(req.user.id);
      if (!profile) {
        console.error("[v0] Profile not found for user:", req.user.id);
        return res.status(404).json({ error: "Profile not found" });
      }
      console.log(`[v0] Found profile: ${profile.id}`);
      let uploadResult;
      try {
        uploadResult = await storage.uploadProfilePhoto(
          req.user.id,
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        console.log(`[v0] Storage upload successful:`, uploadResult);
      } catch (storageError) {
        console.error("[v0] Storage upload failed:", storageError);
        return res.status(500).json({
          error: storageError.message || "Failed to upload photo to storage"
        });
      }
      if (!uploadResult.url || !uploadResult.path) {
        console.error("[v0] Invalid upload result:", uploadResult);
        return res.status(500).json({
          error: "Upload succeeded but received invalid response from storage"
        });
      }
      try {
        const photoRecord = await db.createProfilePhoto({
          profile_id: profile.id,
          url: uploadResult.url,
          storage_path: uploadResult.path,
          is_profile: req.body.is_profile === "true",
          order: Number.parseInt(req.body.order || "0"),
          is_verified: false
        });
        console.log(`[v0] Photo record created in database:`, photoRecord.id);
        res.json({
          success: true,
          photo: photoRecord,
          message: "Profile photo uploaded successfully"
        });
      } catch (dbError) {
        console.error("[v0] Database save failed:", dbError);
        try {
          await storage.deleteProfilePhoto(uploadResult.path);
          console.log("[v0] Cleaned up uploaded file after database error");
        } catch (cleanupError) {
          console.error("[v0] Failed to clean up file:", cleanupError);
        }
        return res.status(500).json({
          error: `Failed to save photo metadata: ${dbError.message}`
        });
      }
    } catch (error) {
      console.error("[v0] Profile photo upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload photo" });
    }
  });
  app2.get("/api/profile-photos", authenticateUser, async (req, res) => {
    try {
      const profile = await db.getProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const photos = await db.getProfilePhotos(profile.id);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/profile-photos/:photoId", authenticateUser, async (req, res) => {
    try {
      const { photoId } = req.params;
      const photo = await db.getProfilePhoto(photoId);
      const profile = await db.getProfileByUserId(req.user.id);
      if (!profile || photo.profile_id !== profile.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      if (photo.storage_path) {
        await storage.deleteProfilePhoto(photo.storage_path);
      }
      await db.deleteProfilePhoto(photoId);
      res.json({ success: true, message: "Photo deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/upload/verification", authenticateUser, upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const { verification_type } = req.body;
      if (!verification_type) {
        return res.status(400).json({ error: "Verification type is required" });
      }
      const uploadResult = await storage.uploadVerificationDocument(
        req.user.id,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      const verification = await db.createUserVerification({
        user_id: req.user.id,
        verification_type,
        file_url: uploadResult.url,
        storage_path: uploadResult.path,
        status: "pending"
      });
      res.json({
        success: true,
        verification,
        message: "Verification document uploaded successfully"
      });
    } catch (error) {
      console.error("Verification upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/verifications", authenticateUser, async (req, res) => {
    try {
      const verifications = await db.getUserVerifications(req.user.id);
      const verificationsWithUrls = await Promise.all(
        verifications.map(async (v) => {
          if (v.storage_path) {
            try {
              const url = await storage.getVerificationDocumentUrl(v.storage_path);
              return { ...v, file_url: url };
            } catch {
              return v;
            }
          }
          return v;
        })
      );
      res.json(verificationsWithUrls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      log(`${req.method} ${path3} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
var server = await registerRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`);
  res.status(status).json({ error: message });
});
serveStatic(app);
var PORT = process.env.PORT || 5e3;
server.listen(PORT, () => {
  log(`\u{1F680} Server running on port ${PORT}`);
  log(`\u{1F4CA} Health check: http://localhost:${PORT}/api/health`);
});
var index_default = async (req, res) => {
  return app(req, res);
};
export {
  index_default as default
};
