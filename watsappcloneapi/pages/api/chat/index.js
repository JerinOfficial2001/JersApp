// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import connectToDatabase from '@/api/lib/db';
import Chats from '@/api/model/chats';

export default async function handler(req, res) {
  await connectToDatabase();
  const { method } = req;
  switch (method) {
    case 'POST':
      const {receiver, sender} = req.body;
      try {
        const filterIDs = [receiver, sender];
        const checkDatas = await Chats.find({});
        const filteredData = checkDatas.find(i =>
          filterIDs.every(id => id == i.sender || id == i.receiver),
        );
        // res.status(200).json({status: 'ok', message: filtered});

        if (filteredData) {
          return res.status(200).json({
            status: 'ok',
            message: 'already created',
          });
        }
        const response = await Chats.create({receiver, sender});
        res.status(200).json({status: 'ok', message: response});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
      break;
    case 'GET':
      const { receiverID, senderID } = req.query
     
      try {
        const response = await Chats.find({});
        const chatIDs = [receiverID, senderID];
         
      const filteredChats = response.find(i =>
        chatIDs.every(id => i.sender == id || i.receiver == id),
        );
        
      if (filteredChats) {
        return res.status(200).json({status: 'ok', data: filteredChats});
      }
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
      }
    default:
      res.status(405).json({error: 'Method Not Allowed'});
      break;
  }
}
