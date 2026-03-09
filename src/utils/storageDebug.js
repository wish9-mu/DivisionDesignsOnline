import { supabase } from "../supabaseClient";

/**
 * Debug utility to test Supabase Storage setup
 * Run this in browser console: window.debugStorage()
 */
export async function debugStorage() {
  console.log("=== SUPABASE STORAGE DEBUG ===\n");

  // 1. Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  console.log("1. Authentication Status:");
  console.log("   User logged in:", !!user);
  if (user) {
    console.log("   User ID:", user.id);
    console.log("   User email:", user.email);
  } else {
    console.warn("   ⚠️ Not logged in! Storage upload requires authentication.");
  }
  console.log("");

  // 2. List buckets
  console.log("2. Storage Buckets:");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("   ❌ Error listing buckets:", bucketsError);
  } else {
    console.log("   Total buckets:", buckets.length);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`);
    });
    
    const productBucket = buckets.find(b => b.name === "product-images");
    if (productBucket) {
      console.log("   ✅ 'product-images' bucket exists");
      console.log("   Public:", productBucket.public);
      if (!productBucket.public) {
        console.warn("   ⚠️ Bucket is not public! Images may not be accessible.");
      }
    } else {
      console.error("   ❌ 'product-images' bucket NOT FOUND!");
      console.log("   You need to create it in Supabase Dashboard > Storage");
    }
  }
  console.log("");

  // 3. List files in product-images bucket
  console.log("3. Files in 'product-images' bucket:");
  const { data: files, error: filesError } = await supabase.storage
    .from("product-images")
    .list("products", {
      limit: 10,
      sortBy: { column: "created_at", order: "desc" }
    });
  
  if (filesError) {
    console.error("   ❌ Error listing files:", filesError);
  } else {
    console.log("   Total files in /products:", files.length);
    files.slice(0, 5).forEach(file => {
      const url = supabase.storage
        .from("product-images")
        .getPublicUrl(`products/${file.name}`).data.publicUrl;
      console.log(`   - ${file.name}`);
      console.log(`     URL: ${url}`);
    });
  }
  console.log("");

  // 4. Test upload
  console.log("4. Testing File Upload:");
  if (!user) {
    console.warn("   ⚠️ Skipped - Not logged in");
  } else {
    try {
      // Create a small test image
      const testBlob = new Blob(["test"], { type: "image/png" });
      const testFile = new File([testBlob], "test.png", { type: "image/png" });
      const fileName = `test-${Date.now()}.png`;
      const filePath = `products/${fileName}`;

      console.log("   Uploading test file:", fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, testFile);

      if (uploadError) {
        console.error("   ❌ Upload failed:", uploadError);
        console.error("   Error message:", uploadError.message);
      } else {
        console.log("   ✅ Upload successful!");
        console.log("   Path:", uploadData.path);
        
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        
        console.log("   Public URL:", publicUrl);
        
        // Clean up test file
        await supabase.storage.from("product-images").remove([filePath]);
        console.log("   Test file cleaned up");
      }
    } catch (e) {
      console.error("   ❌ Unexpected error:", e);
    }
  }
  console.log("");

  // 5. Summary
  console.log("=== SUMMARY ===");
  const issues = [];
  if (!user) issues.push("Not logged in");
  if (bucketsError) issues.push("Cannot list buckets");
  if (!buckets || !buckets.find(b => b.name === "product-images")) issues.push("'product-images' bucket missing");
  
  if (issues.length === 0) {
    console.log("✅ No major issues detected");
  } else {
    console.warn("⚠️ Issues found:");
    issues.forEach(issue => console.warn(`   - ${issue}`));
  }
  
  console.log("\nNext steps:");
  console.log("1. Make sure you're logged in as admin");
  console.log("2. Create 'product-images' bucket if missing");
  console.log("3. Set bucket to public");
  console.log("4. Configure storage policies (see SUPABASE_STORAGE_SETUP.md)");
}

// Make it available globally for console testing
if (typeof window !== "undefined") {
  window.debugStorage = debugStorage;
}
