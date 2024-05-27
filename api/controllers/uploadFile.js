import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const uploadFile = async (req, res) => {
  const filePath = req.file?.path;
  const prevFile = req.body.prevFile;

  // Check whether the file exist or not and Delete if exist
  if (prevFile!=="null") {
    try {
      const res = await deleteFromCloudinary(prevFile);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  // Upload on Cloudinary
  if (filePath) {
    const fileUploaded = await uploadOnCloudinary(filePath);
    res.json({ url: fileUploaded.url, name: fileUploaded.original_filename });
  } else {
    console.log("File haven't uploaded locally\n");
  }
};

export default uploadFile;
