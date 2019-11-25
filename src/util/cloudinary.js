import {v2 as cloudinary} from 'cloudinary';

const init = () => {
  const {CLOUDINARY_URL} = process.env;
  const clouName = CLOUDINARY_URL.split('@')[1];
  const apiKey = CLOUDINARY_URL.slice(13, CLOUDINARY_URL.length).split(':')[0];
  const apiSecret = CLOUDINARY_URL.slice(13, CLOUDINARY_URL.length)
    .split(':')[1]
    .split('@')[0];
  cloudinary.config({
    cloud_name: clouName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
};

const upload = file => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const destroy = url => {
  const split = url.split('/');
  const id = split[split.length - 1].slice(0, -4);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(id, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export default {init, upload, destroy};
