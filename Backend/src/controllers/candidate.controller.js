import { comparePassword, hashPassword } from "../config/bcrypt.config.js";
import { generateAccessAndRefreshToken } from "../config/jwt.config.js";
import { Candidate } from "../models/candidate.model.js";

export const candidateSignup = async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  if (!userName || !fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userExisted = await Candidate.findOne({ userName });

  if (userExisted) {
    return res.status(400).json({ message: "User already exists" });
  }

  const passwordHash = await hashPassword(password);

  const newUser = {
    userName,
    fullName,
    email,
    passwordHash,
  };

  const createdUser = await Candidate.create(newUser);

  if (!createdUser) {
    return res.status(400).json({ message: "Error creating user" });
  }

  return res
    .status(201)
    .json({ message: "User created successfully", user: createdUser });
};

export const candidateLogin = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await Candidate.findOne({ userName });

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const hashedPassword = user.passwordHash;
  const comparedPassword = await comparePassword(password, hashedPassword);

  if (!comparedPassword) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const planeUserId = user._id.toString();
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    planeUserId
  );

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const loggedInCandidate = await Candidate.findById(user._id).select(
    "-passwordHash -refreshToken -accessToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "Login successful",
      user: { loggedInCandidate, accessToken, refreshToken },
    });
};


