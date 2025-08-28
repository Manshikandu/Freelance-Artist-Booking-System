
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/CloudinaryConfig.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // Map form field name to folder
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
      
      resource_type: 'auto', // auto detects image, video, etc.
      // public_id: `${Date.now()}-${file.originalname}`,
      folder,
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf'],
    };
  },
});

const parser = multer({ storage });

export default parser;



// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from '../utils/CloudinaryConfig.js';

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'artist_media', // your folder in Cloudinary
//     allowed_formats: ['jpg', 'png', 'mp4', 'mov'],
//   },
// });

// const parser = multer({ storage: storage });

// export default parser;
 