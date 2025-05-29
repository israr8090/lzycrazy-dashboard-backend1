import app from './app.js';
import cloudinary from 'cloudinary';

// //-- Connect to Cloudinary
// cloudinary.v2.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     // secure: true,
//     // url: 'https://res.cloudinary.com/dw544t94z/image/upload/'
// });





app.listen(process.env.PORT, () => {
    console.log(`Server listening at port ${process.env.PORT}`);
});