const bcrypt=require("bcrypt");
const mongoose = require("mongoose");

const salt = bcrypt.genSaltSync(10);
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
      next();
  } catch (err) {
      return next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
