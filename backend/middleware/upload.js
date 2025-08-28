
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/CloudinaryConfig.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const folderMap = {
      profilePicture: 'artist_profile_pics',
      citizenshipImage: 'artist_kyc/citizenship',
      livePhoto: 'artist_kyc/livePhotos',
      'guardianInfo[idDocument]': 'artist_kyc/guardianDocs',
      media: 'artist_media',
      default: 'artist_misc',
    };

    const folder = folderMap[file.fieldname] || folderMap.default;

    return {
      
      resource_type: 'auto', 
      folder,
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf'],
    };
  },
});

const parser = multer({ storage });

export default parser;



