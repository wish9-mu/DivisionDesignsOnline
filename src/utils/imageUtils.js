/**
 * Parse product image_url which can be:
 * - null/undefined (no images)
 * - A single URL string
 * - A JSON array of URLs
 * 
 * Returns an array of image URLs (empty array if no images)
 */
export function parseProductImages(imageUrl) {
  if (!imageUrl) return [];

  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [imageUrl];
  } catch {
    // Not JSON, treat as single URL
    return [imageUrl];
  }
}

/**
 * Get the first/primary image from a product
 * Returns null if no images available
 */
export function getProductPrimaryImage(product) {
  const images = parseProductImages(product.image_url);
  return images.length > 0 ? images[0] : null;
}
