const express = require('express');
const {register} = require('../controllers/auth');
const {getAllUsers} = require('../controllers/auth');
const {login} = require('../controllers/auth');
const {getUserData} = require('../controllers/auth');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/', getAllUsers);
router.get('/getUserData', getUserData);
// router.get('/', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).send(products);
//   } catch (error) {
//     console.log(error);
//     res.send(500).send(error);
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     const id = req.params._id;
//     const allDatas = await AuthData.find({});
//     const temp = [...allDatas];
//     const prevValue = temp.find(i => i._id === id);
//     const newValue = req.body;
//     const db = await AuthData.deleteOne(prevValue, newValue);
//     res.json(req.body);
//   } catch (error) {
//     console.log(error);
//     res.send(500).send(error);
//   }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const id = req.params._id;
//     const allDatas = await AuthData.find({});
//     const temp = [...allDatas];
//     const prevValue = temp.find(i => i._id === id);
//     const newValue = req.body;
//     const db = await AuthData.updateOne(prevValue, newValue);
//     res.json(req.body);
//   } catch (error) {
//     console.log(error);
//     res.send(500).send(error);
//   }
// });

module.exports = router;
