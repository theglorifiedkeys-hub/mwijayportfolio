/**
 * @fileOverview Cloudinary utility for high-performance media delivery.
 * Optimized for Lighthouse 100: Extreme compression signals.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dna0pzzab';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'mwijay_unsigned';

/**
 * Constructs a high-performance Cloudinary image URL.
 */
export function getCloudinaryImageUrl(publicId: string, width = 1280, watermark = false): string {
  if (!publicId) return '';
  
  let baseUrl = '';
  let path = '';

  if (publicId.startsWith('http')) {
    if (publicId.includes('res.cloudinary.com')) {
      const parts = publicId.split('/upload/');
      baseUrl = parts[0] + '/upload/';
      path = parts[1];
    } else {
      return publicId;
    }
  } else {
    baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
    path = publicId;
  }

  let transforms = `f_auto,q_auto:eco,w_${width},c_limit`;
  if (watermark) {
    transforms += `,l_watermark_mwj,o_30,w_0.4,c_scale,g_center`;
  }

  return `${baseUrl}${transforms}/${path}`;
}

/**
 * Constructs a high-performance Cloudinary video URL with aggressive compression.
 * EXTREME: f_auto, q_auto:eco, vc_auto, w_1280.
 */
export function getCloudinaryVideoUrl(publicId: string): string {
  if (!publicId) return '';
  
  let baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`;
  let path = publicId;

  if (publicId.startsWith('http')) {
    if (publicId.includes('res.cloudinary.com')) {
      const parts = publicId.split('/upload/');
      if (parts.length === 2) {
        baseUrl = parts[0] + '/upload/';
        path = parts[1];
      }
    } else {
      return publicId;
    }
  }

  // Aggressive compression parameters for Lighthouse 100
  const transforms = 'f_auto,q_auto:eco,vc_auto,w_1280,c_limit';
  return `${baseUrl}${transforms}/${path}`;
}

/**
 * Performs an unsigned upload to Cloudinary.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'mwijay_portfolio'
): Promise<{ url: string; publicId: string }> {
  if (!file) throw new Error('No file provided for upload.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) throw new Error('Cloudinary upload failed');

  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id
  };
}