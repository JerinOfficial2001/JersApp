// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import connectToDatabase from '@/api/lib/db';
import Message from '@/api/model/message';

export default async function handler(req, res) {
  await connectToDatabase();
  const {method} = req;
  switch (method) {
    case 'GET':
      try {
        const response = await Message.find({});
        res.status(200).json({status: 'ok', data: response});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
    default:
      res.status(405).json({error: 'Method Not Allowed'});
      break;
  }
}
