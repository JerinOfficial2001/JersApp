// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import connectToDatabase from '@/api/lib/db';
import Auth from '@/api/model/auth';

export default async function handler(req, res) {
  await connectToDatabase();
  const {method} = req;
  switch (method) {
    case 'GET':
      try {
        const allData = await Auth.find({});
        if (allData) {
          res.status(200).json({status: 'ok', data: allData});
        }
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
      break;
    default:
      res.status(405).json({error: 'Method Not Allowed'});
      break;
  }
}
