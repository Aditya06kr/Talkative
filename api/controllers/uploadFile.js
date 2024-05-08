import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadFile = async (req, res) => {
  const filePath = req.file?.path;
  if (filePath) {
    const fileUploaded = await uploadOnCloudinary(filePath);
    res.json({ url: fileUploaded.url, name: fileUploaded.original_filename });
  } else {
    console.log("File haven't uploaded locally\n");
  }
};

export default uploadFile;