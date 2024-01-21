const {Chat} = require('../model/chat');

exports.addChat = async (req, res, next) => {
  try {
    const response = await Chat.create(req.body);
    res.status(200).json({status: 'ok', data: response});
  } catch (error) {
    next(error);
  }
};
exports.getChatByID = async (req, res, next) => {
  // const user_id = req.params.user_id;
  const receiver_id = req.params.receiver_id;
  try {
    const response = await Chat.find({
      // user: user_id,
      receiver: receiver_id,
    });
    res.send(response);
  } catch (error) {
    next(error);
  }
};
