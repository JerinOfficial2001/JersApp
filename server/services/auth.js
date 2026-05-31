const { JersApp_Auth } = require("../model/auth");

exports.getImage = async (id) => {
  try {
    const userData = await JersApp_Auth.findById(id);
    if (userData && userData.image) {
      return userData.image;
    } else {
      return null;
    }
  } catch (error) {
    console.log("getImage Err");
  }
};
