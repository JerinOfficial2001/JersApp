// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import connectToDatabase from '@/api/lib/db';
import Auth from '@/api/model/auth';

export default async function handler(req, res) {
  await connectToDatabase();
  const {method} = req;
  switch (method) {
    case 'POST':
      try {
        const {mobNum, password, name} = req.body;
        const allData = await Auth.find({});
        const particularData = allData.find(i => i.mobNum == mobNum);
        if (particularData) {
          res.status(500).json({status: 'error', data: 'User Already Exists'});
        } else {
          const response = await Auth.create({
            mobNum,
            password,
            name,
          });
          res.status(200).json({status: 'ok', data: response});
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
