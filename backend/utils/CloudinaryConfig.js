


import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: 'dq5rjqhnl',  
  api_key: '383859361246575',         
  api_secret : 'aAHQjExWTV-xe_gj83HEkZtCn5w',    
  secure: true,
});

export function generateSignedUrl(publicId, expiresInSeconds = 300) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  
  try {
    return cloudinary.url(publicId, {
      sign_url: true,
      expires_at: expiresAt,
      resource_type: 'raw',
      flags: 'attachment:false', 
      transformation: [
        { flags: 'attachment:false' }
      ]
    });
  } catch (err) {
    console.log('Falling back to image resource type for:', publicId);
    return cloudinary.url(publicId, {
      sign_url: true,
      expires_at: expiresAt,
      resource_type: 'image', 
      flags: 'attachment:false'
    });
  }
}
export default cloudinary;














