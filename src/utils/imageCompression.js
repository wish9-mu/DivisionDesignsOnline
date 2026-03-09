/**
 * Image compression utility for optimizing product images before upload
 */

/**
 * Compress an image file to reduce size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    format = 'webp', // 'webp', 'jpeg', or 'png'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = maxWidth;
              height = maxWidth / aspectRatio;
            } else {
              height = maxHeight;
              width = maxHeight * aspectRatio;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          const mimeType = format === 'webp' 
            ? 'image/webp' 
            : format === 'png' 
              ? 'image/png' 
              : 'image/jpeg';

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }

              // Create new file with compressed blob
              const originalName = file.name.split('.')[0];
              const extension = format === 'webp' ? 'webp' : format === 'png' ? 'png' : 'jpg';
              const compressedFile = new File(
                [blob],
                `${originalName}.${extension}`,
                { type: mimeType }
              );

              // Log compression stats
              const originalSizeKB = (file.size / 1024).toFixed(2);
              const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);
              const reductionPercent = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1);

              console.log('Image compression stats:');
              console.log(`  Original: ${originalSizeKB} KB`);
              console.log(`  Compressed: ${compressedSizeKB} KB`);
              console.log(`  Reduction: ${reductionPercent}%`);
              console.log(`  Dimensions: ${width}x${height}`);

              resolve(compressedFile);
            },
            mimeType,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if the browser supports WebP format
 * @returns {Promise<boolean>}
 */
export function supportsWebP() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    canvas.toBlob(
      (blob) => {
        resolve(blob !== null);
      },
      'image/webp'
    );
  });
}

/**
 * Get optimal compression format based on browser support
 * @returns {Promise<string>} - 'webp' or 'jpeg'
 */
export async function getOptimalFormat() {
  const hasWebP = await supportsWebP();
  return hasWebP ? 'webp' : 'jpeg';
}
