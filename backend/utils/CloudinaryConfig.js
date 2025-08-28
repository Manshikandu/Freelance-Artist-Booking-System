
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//   CLOUD_NAME: 'dq5rjqhnl',    // from dashboard
//   API_KEY: '383859361246575',          // from dashboard
//   API_SECRET : 'aAHQjExWTV-xe_gj83HEkZtCn5w',    // from dashboard
//   secure: true,
// });
// console.log("Cloudinary config loaded:", cloudinary.config()); 
// export default cloudinary;



import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: 'dq5rjqhnl',    // from dashboard
  api_key: '383859361246575',          // from dashboard
  api_secret : 'aAHQjExWTV-xe_gj83HEkZtCn5w',    // from dashboard
  secure: true,
});
/**
 * Generate a signed URL for a given Cloudinary public ID (file path)
 * @param {string} publicId - The Cloudinary public ID (e.g. 'contracts/contract-abc123.pdf')
 * @param {number} expiresInSeconds - URL expiration time in seconds (default 300 = 5 minutes)
 * @returns {string} Signed URL string
 */
export function generateSignedUrl(publicId, expiresInSeconds = 300) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  // Try 'raw' first (correct for PDFs), then fallback to 'image' for older uploads
  try {
    return cloudinary.url(publicId, {
      sign_url: true,
      expires_at: expiresAt,
      resource_type: 'raw', // Correct for PDFs
      flags: 'attachment:false', // This ensures inline viewing instead of download
      transformation: [
        { flags: 'attachment:false' }
      ]
    });
  } catch (err) {
    console.log('Falling back to image resource type for:', publicId);
    return cloudinary.url(publicId, {
      sign_url: true,
      expires_at: expiresAt,
      resource_type: 'image', // Fallback for older uploads
      flags: 'attachment:false'
    });
  }
}
// console.log("Cloudinary config loaded:", cloudinary.config()); 
export default cloudinary;














