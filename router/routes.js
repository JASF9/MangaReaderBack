const {Router} = require('express'); 
const router = Router();    

const userCtrl = require("../controllers/userController");
 
router.post('/login',userCtrl.loginUserByMail); 
router.post('/register',userCtrl.registerUser);  
router.get('/profile', userCtrl.verifyToken);
router.get('/user/mail',userCtrl.getUserByMail);
router.get('/user/nickname',userCtrl.getUserByNickname);
router.put('/update/user',userCtrl.updateUser);
router.delete('/delete/user/mail',userCtrl.deleteUserByMail);
router.delete('/delete/user/mail',userCtrl.deleteUserByNickname);

module.exports= router;   
 


