const {Contact} = require('../model/contact');

exports.addContact = async (req, res, next) => {
  try {
    const particularData = await Contact.findOne({
      user_id: req.body.user_id,
    });

    if (particularData && req.body.name === particularData.name) {
      res.status(500).json({status: 'error', data: 'Already Exists'});
    } else {
      const response = await Contact.create(req.body);
      res.status(200).json({status: 'ok', data: response});
    }
  } catch (error) {
    next(error);
  }
};
exports.getContactByID = async (req, res, next) => {
  try {
    const response = await Contact.find({
      user_id: req.params.id,
    });
    res.send(response);
  } catch (error) {
    next(error);
  }
};
