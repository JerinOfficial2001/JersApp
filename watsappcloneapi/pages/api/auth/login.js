import connectToDatabase from '@/api/lib/db';
import Auth from '@/api/model/auth';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY; // Replace with the same secret key used for signing tokens
const corsMiddleware = cors({
  origin: 'https://next-api-ruby.vercel.app', // Replace with the actual origin of your client app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});

export default async function handler(req, res) {
  await connectToDatabase();

  // Use cors middleware by including headers in the response
  corsMiddleware(req, res, async () => {
    const {method} = req;

    switch (method) {
      case 'POST':
        try {
          const {mobNum, password} = req.body;
          const user = await Auth.findOne({mobNum});
          if (!user) {
            return res.json({error: 'User Not Found'});
          }
          if (password == user.password) {
            const token = jwt.sign({mobNum: user.mobNum}, SECRET_KEY, {
              expiresIn: 10,
            });

            if (res.status(201)) {
              return res.json({status: 'ok', data: token});
            } else {
              return res.json({status: 'error'});
            }
          }
          res.json({status: 'error', error: 'Invalid Password'});
        } catch (error) {
          console.error('Error:', error);
          res
            .status(401)
            .json({status: 'error', data: `Unauthorized - ${error.message}`});
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
  });
}
