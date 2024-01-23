const {Auth} = require('../model/auth');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
exports.login = async (req, res) => {
  const data = req.body;
  try {
    const user = await Auth.findOne({mobNum: data.mobNum});
    if (!user) {
      res.status(200).json({status: 'error', message: 'User not found'});
    } else if (user && user.password == data.password) {
      const token = jwt.sign({userId: user._id}, SECRET_KEY, {
        expiresIn: '24h',
      });

      res.status(200).json({status: 'ok', data: {token}});
    } else {
      res.status(401).json({status: 'error', data: 'Invalid credentials'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.register = async (req, res) => {
  const data = req.body;
  try {
    const user = await Auth.findOne({mobNum: data.mobNum});
    if (!user) {
      const response = await Auth.create(data);
      res.status(200).json({status: 'ok', data: response});
    } else if (user.mobNum == req.body.mobNum) {
      res.status(401).json({status: 'error', data: 'User already exists'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const response = await Auth.find({});
    res.status(200).json({status: 'ok', data: response});
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getUserData = async (req, res) => {
  try {
    // Extract token from the request headers or cookies
    const token = req.headers.authorization?.replace('Bearer ', ''); // Adjust this according to your token handling

    if (!token) {
      return res
        .status(401)
        .json({status: 'error', data: 'Unauthorized - Missing Token'});
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Retrieve user data based on the decoded information
    const user = await Auth.findById(decoded.userId);

    if (user) {
      res.status(200).json({status: 'ok', data: {user}});
    } else {
      res.status(404).json({status: 'error', data: 'User not found'});
    }
  } catch (error) {
    console.error('Error:', error);
    res
      .status(401)
      .json({status: 'error', data: 'Unauthorized - Invalid Token'});
  }
};
