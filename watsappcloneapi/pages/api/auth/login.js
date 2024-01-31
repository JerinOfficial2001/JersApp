import connectToDatabase from '@/api/lib/db';
import Auth from '@/api/model/auth';
import jwt from 'jsonwebtoken';
import {Server} from 'socket.io';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY; // Replace with the same secret key used for signing tokens
// const corsMiddleware = cors({
//   origin: 'https://next-api-ruby.vercel.app', // Replace with the actual origin of your client app
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
// });

export default async function handler(req, res) {
  // const array = [];
  await connectToDatabase();
  // if (!res.socket.server.io) {
  //   // Create a new Socket.IO server if it doesn't exist
  //   const io = new Server(res.socket.server);
  //   res.socket.server.io = io;

  //   io.on('connection', socket => {
  //     console.log('Connected');
  //     socket.on('disconnect', () => {
  //       console.log('Disconnected');
  //     });
  //   });
  // }
  const {method} = req;

  switch (method) {
    case 'POST':
      try {
        const user = await Auth.findOne({mobNum: req.body.mobNum});
        if (!user) {
          res.status(200).json({status: 'error', message: 'User not found'});
        } else if (user && user.password == req.body.password) {
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
