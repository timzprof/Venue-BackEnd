import {v2 as cloudinary} from 'cloudinary';

const upload = imagePath => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(imagePath, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export default { upload };