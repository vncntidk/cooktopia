import {v2 as cloudinary} from "cloudinary"
import {config} from "dotenv"

config()

const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
    console.log("Cloudinary configured successfully");
} else {
    console.warn("Cloudinary credentials not found. Image uploads will use local storage.");
}
 
const uploader = {
    upload: async (file, options = {}) => {
        if (!hasCloudinaryConfig) {
            console.warn("No Cloudinary config found, using mock URL");
            return {
                secure_url: file.startsWith('data:image') ? file : `/uploads/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`
            };
        }
        
        try {
            console.log("Starting Cloudinary upload with options:", options);
             
            if (typeof file === 'string' && file.startsWith('data:image')) {
                console.log("Uploading base64 image"); 
                const base64Data = file.split(',')[1] || file;
                const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, {
                    ...options,
                    resource_type: 'image'
                });
                console.log("Base64 upload result:", result);
                return result;
            }
             
            if (file instanceof Buffer || file.stream) {
                console.log("Uploading file stream");
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                        if (error) {
                            console.error("Stream upload error:", error);
                            reject(error);
                        } else {
                            console.log("Stream upload result:", result);
                            resolve(result);
                        }
                    });
                    
                    if (file instanceof Buffer) {
                        uploadStream.end(file);
                    } else {
                        file.stream.pipe(uploadStream);
                    }
                });
            }
             
            console.log("Attempting direct upload");
            const result = await cloudinary.uploader.upload(file, options);
            console.log("Direct upload result:", result);
            return result;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw error;
        }
    },
    
    destroy: async (publicId) => {
        if (!hasCloudinaryConfig) {
            console.warn("No Cloudinary config found, skipping destroy");
            return { result: 'ok' };
        }
        
        try {
            console.log("Destroying Cloudinary asset:", publicId);
            const result = await cloudinary.uploader.destroy(publicId);
            console.log("Destroy result:", result);
            return result;
        } catch (error) {
            console.error("Cloudinary destroy error:", error);
            throw error;
        }
    }
};

export { cloudinary, uploader };
export default cloudinary;
