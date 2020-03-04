import fs from 'fs';
import path from 'path';
import cloudinaryUtility from '../util/cloudinary';
/**
 * Venue Controller Initialization Function
 * @param  {Object} ControllerParams - Controller Parameters
 * @param  {Object} ControllerParams.venueModel - Venue Model
 * @param  {Object} ControllerParams.resourceModel - Resource Model
 * @returns {Object} ControllerObject
 */
export default ({venueModel, resourceModel}) => {
  /**
   * Get All Venues
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  const getVenues = async (req, res, next) => {
    try {
      const venues = await venueModel.findAll({
        include: [{model: resourceModel}],
      });
      return res.status(200).json({
        status: 'success',
        message: 'Venues Retrieved',
        data: venues,
      });
    } catch (error) {
      return next(error);
    }
  };
  /**
   * Custom Image Uploader for mutiple files
   * @param {Object} files - Request Files Object
   */
  const uploadImages = async files => {
    const {featureImage, ...otherImages} = files;
    const imageUploads = [];
    const imagePaths = [];
    const featureImagePath = path.resolve(`./temp/${featureImage.name}`);
    await featureImage.mv(featureImagePath);
    imageUploads.push(cloudinaryUtility.upload(featureImagePath));
    imagePaths.push(featureImagePath);
    for await (const imageKey of Object.keys(otherImages)) {
      const image = otherImages[imageKey];
      const imagePath = path.resolve(`./temp/${image.name}`);
      await image.mv(imagePath);
      imageUploads.push(cloudinaryUtility.upload(imagePath));
      imagePaths.push(imagePath);
    }
    return {imageUploads, imagePaths};
  };
  /**
   * Create a New Venue
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  const createVenue = async (req, res, next) => {
    try {
      const {title, address, capacity, resources, timeAllowed} = req.body;
      const uploadRes = await uploadImages(req.files);
      const results = await Promise.all(uploadRes.imageUploads);
      const [featureImageUrl, ...otherImageUrls] = results.map(imageResult => {
        return imageResult.secure_url;
      });
      uploadRes.imagePaths.forEach(imagePath => {
        fs.unlinkSync(imagePath, error => {
          if (error) throw new Error(error.message);
        });
      });
      const parsedTime = JSON.parse(timeAllowed);
      const venue = await venueModel.create({
        title,
        address,
        capacity,
        featureImage: featureImageUrl,
        otherImages: otherImageUrls,
        timeAllowed: parsedTime,
        adminId: req.user.id,
      });
      const venueObj = {
        ...venue.dataValues,
        resources: [],
      };
      const parsedResources = JSON.parse(resources);
      for await (const resource of parsedResources) {
        const resc = await resourceModel.create({
          name: resource.name,
          value: resource.value,
          venueId: venue.dataValues.id,
        });
        venueObj.resources.push({...resc.dataValues});
      }
      return res.status(201).json({
        status: 'success',
        message: 'Venue Created',
        data: venueObj,
      });
    } catch (error) {
      return next(error);
    }
  };
  const deleteImages = async urls => {
    const imageDeletions = urls.map(url => {
      return cloudinaryUtility.destroy(url);
    });
    return Promise.all(imageDeletions);
  };
  /**
   * Delete A Venue
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  const deleteVenue = async (req, res, next) => {
    try {
      const {id} = req.params;
      const venue = await venueModel.findOne({where: {id}});
      if (!venue) {
        return res.status(404).json({
          status: 'error',
          message: 'Venue Not Found',
        });
      }
      if (venue.adminId !== req.user.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }
      const urls = [
        venue.dataValues.featureImage,
        venue.dataValues.otherImages,
      ].flat();
      await deleteImages(urls);
      await venue.destroy();
      return res.status(200).json({
        status: 'success',
        message: 'Venue Deleted',
        data: venue.dataValues.id,
      });
    } catch (error) {
      return next(error);
    }
  };
  /**
   * Update a Venues Details
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  const updateVenue = async (req, res, next) => {
    try {
      const {id} = req.params;
      const venue = await venueModel.findOne({where: {id}});
      if (!venue) {
        return res.status(404).json({
          status: 'error',
          message: 'Venue Not Found',
        });
      }
      const {title, address, capacity, resources, timeAllowed} = req.body;
      const parsedTime = JSON.parse(timeAllowed);
      let featureImageUrl;
      let otherImageUrls = [];
      if (req.files) {
        const uploadRes = await uploadImages(req.files);
        const results = await Promise.all(uploadRes.imageUploads);
        const mappedUploadRes = results.map(imageResult => {
          return imageResult.secure_url;
        });
        uploadRes.imagePaths.forEach(imagePath => {
          fs.unlinkSync(imagePath, error => {
            if (error) throw new Error(error.message);
          });
        });
        featureImageUrl = mappedUploadRes.shift();
        otherImageUrls = mappedUploadRes;
        let urls = [];
        urls[0] = featureImageUrl ? venue.dataValues.featureImage : null;
        urls[1] = otherImageUrls.length > 0 ? venue.dataValues.otherImages : null;
        urls = urls.filter(Boolean).flat();
        if (urls.length > 0) await deleteImages(urls);
      }
      const updatedVenue = await venue.update({
        title: title || venue.dataValues.title,
        address: address || venue.dataValues.address,
        capacity: capacity || venue.dataValues.capacity,
        featureImage: featureImageUrl || venue.dataValues.featureImage,
        otherImages:
          otherImageUrls.length > 0 ? otherImageUrls : venue.dataValues.otherImages,
        timeAllowed: parsedTime || venue.dataValues.timeAllowed,
      });
      const venueObj = {
        ...updatedVenue.dataValues,
        resources: [],
      };
      if (resources) {
        venueObj.resources = [];
        await resourceModel.destroy({
          where: {venueId: venue.dataValues.id},
        });
        const parsedResources = JSON.parse(resources);
        for await (const resource of parsedResources) {
          const resc = await resourceModel.create({
            name: resource.name,
            value: resource.value,
            venueId: venue.dataValues.id,
          });
          venueObj.resources.push({...resc.dataValues});
        }
      } else {
        const rescs = await resourceModel.findAll({
          where: {venueId: venue.dataValues.id},
        });
        venueObj.resources = rescs.map(resc => {
          return {...resc.dataValues};
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Venue Updated',
        data: venueObj,
      });
    } catch (error) {
      return next(error);
    }
  };
  /**
   * Get A Single Venue
   * @param  {Object} req
   * @param  {Object} res
   * @param  {Function} next
   */
  const getSingleVenue = async (req, res, next) => {
    try {
      const {id} = req.params;
      const venue = await venueModel.findOne({
        where: {id},
        include: [{model: resourceModel}],
      });
      if (!venue) {
        return res.status(404).json({
          status: 'error',
          message: 'Venue Not Found',
        });
      }
      const resources = await resourceModel.findAll({where: {venueId: id}});
      const resourcesData = resources.map(resource => resource.dataValues);
      const venueObj = {
        ...venue.dataValues,
        resources: resourcesData,
      };
      return res.status(200).json({
        status: 'success',
        message: 'Venue Retrived',
        data: venueObj,
      });
    } catch (error) {
      return next(error);
    }
  };
  return {
    getVenues,
    createVenue,
    deleteVenue,
    updateVenue,
    getSingleVenue,
  };
};
