import { cloudinaryInstance } from "../config/cloudinary.config.js";


const deleteImage = async (publicId) => {
    try {
        if(!publicId) {
            throw new Error('Cannot get the public key');
        }
        const response = await cloudinaryInstance.uploader.destroy(publicId)
        return response
    } catch (error) {
       throw new Error(error.message)
    }
}

export default deleteImage