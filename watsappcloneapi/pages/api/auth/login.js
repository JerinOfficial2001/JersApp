import connectToDatabase from '@/api/lib/db';
import Auth from '@/api/model/auth';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY; // Replace with the same secret key used for signing tokens

export default async function handler(req, res) {
  await connectToDatabase();
  const {method} = req;

  switch (method) {
    case 'POST':
      try {
        const {mobNum, password} = req.body;
        const user = await Auth.findOne({mobNum});

        if (user && user.password === password) {
          // Generate JWT token
          const token = jwt.sign({userId: user._id}, SECRET_KEY, {
            expiresIn: '1h',
          });

          res.status(200).json({status: 'ok', data: {token}});
        } else {
          res.status(401).json({status: 'error', data: 'Invalid credentials'});
        }
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
      break;

    case 'GET':
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
      break;

    default:
      res.status(405).json({error: 'Method Not Allowed'});
      break;
  }
}
