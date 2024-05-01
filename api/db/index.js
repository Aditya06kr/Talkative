import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      "\n MongoDB connected !! DB Host : ",
      connectionInstance.connection.host
    );
  } catch (err) {
    console.log("Error in Connecting MongoDB ", err);
    process.exit(1);
  }
};

export default connectDb;
