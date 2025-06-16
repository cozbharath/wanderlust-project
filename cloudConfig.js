const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Fix 1: Typo in 'api_secret' line
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY, // Fix 2: should be `api_key`, not `cloud_key`
    api_secret: process.env.CLOUD_API_SECRET
});

// Fix 3: 'allowedFormats' (plural), not 'allowedFormat'
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV',
        allowed_formats: ['jpg', 'jpeg', 'png'], // Fix 4: no need for async here
    },
});

module.exports = {
    cloudinary,
    storage,
};
