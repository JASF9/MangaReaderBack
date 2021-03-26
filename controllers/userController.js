const pool = require("../models/database")
const wjt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt'); 

exports.verifyToken = (req, res) => {

    // console.log(req.headers.authorization)
    if (!req.headers.authorization) {
       return  res.status(401).send('Request rejected'); 
    }
    //console.log(req.headers.authorization)
   
    const token= req.headers.authorization.split(' ')[1]; 
    if (token===null) {
        return  res.status(401).send('Request rejected');  
    }

    const payload = wjt.verify(token,'secretkey'); 
    //console.log(payload)

    req.body.mail= payload.mail; 
    res.send(`${req.body.mail}`);
}

exports.registerUser= async (req,res)=>{
   
    const {nickname, mail, password, password2} = req.body; 
    const token = wjt.sign({mail:mail},'secretkey');
    const errors=[]; 

    if(!nickname||!mail||!password||!password2){
        errors.push({message:'Empty field detected.'});
    }

    if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(mail)){
    } 
    else {
        errors.push({message:'Invalid mail.'});
    }

    if(password.length<6){
        errors.push({message:'Password must contain min 6 chars.'});
    }

    if (password!==password2) {
        errors.push({message:'Passwords do not match.'});
    }

    if(errors.length>0){
        res.send({errors})
    }
    else {
        const hashPassword = await bcrypt.hash(password,10);  

        pool.query( `SELECT * FROM users WHERE mail='${mail}'`, (err,results)=>{
            if(err){                     
                throw err
            }
            if(results.rows.length>0){
                errors.push({message:'Mail is already in use.'}); 
                res.send({errors})
            }
            else{
                pool.query(`SELECT * FROM users WHERE nickname='${nickname}`, (err,results) => {
                    if(err){                     
                        throw err
                    }
                    if(results.rows.length>0){
                        errors.push({message:'Nickname is already in use.'}); 
                        res.send({errors})
                    }
                    else{
                        pool.query(`INSERT INTO users (nickname,mail,password,role)
                        VALUES ('${nickname}','${mail}','${hashPassword}',2) RETURNING *`);
                        return res.json({token:token});;
                    }    
                }) 
            }
       })
    }
}; 

exports.loginUserByMail= async (req, res)=>{
    const {mail, password} = req.body; 
    const hashPassword = await bcrypt.hash(password,10);
   
    const token = wjt.sign({mail:mail},'secretkey');

    const errors = []; 

    if(!email||!password){
    errors.push({message:'Empty field detected'});
    }

    const response = pool.query( `SELECT mail FROM users WHERE mail='${mail}'`, (err,results)=>{
        if(err){                    
            throw err
        }
        const consult = results.rows[0].mail;   
        if(consult<0){
            errors.push({message:'User not registered'});
        }
        else{        
            if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(mail)){
                console.log('Valid mail')
            }  
            else {
                errors.push({message:'Invalid mail.'});
            }
            if(password.length<6){
                errors.push({message:'Password have at least 6 chars.'});
            }
            if(errors.length>0){
                res.send({errors})
            }
            else {      
                const response =  pool.query( `SELECT password FROM users WHERE mail='${mail}'`, (err,results)=>{
                    if(err){                    
                        throw err
                    }
                    const consulta=results.rows[0].password;   
                    if(bcrypt.compareSync(hashPassword, consulta)){
                        res.status(200).send(`Token :  ${token}`)
                    }
                    else{                     
                    errors.push({message:'Invalid password'});    
                    }
                })    
            }     
        }
    })
}


exports.getUserByMail = async (req,res) => {
    try{
        const mail = req.body.mail;
        if(isEmpty(mail)){
            return res.json({message:"No mail was given."})
        }
        const result = await pool.query(`SELECT * FROM usera WHERE mail='${mail}'`);
        return res.json(result.rows[0]);
    }
    catch(error){
        return res.json(error);
    }
}

exports.getUserByNickname = async (req,res) => {
    try{
        const nickname = req.body.nickname;
        if(isEmpty(nickname)){
            return res.json({message:"No nickname was given."})
        }
        const result = await pool.query(`SELECT * FROM usera WHERE mail='${nickname}'`);
        return res.json(result.rows[0]);
    }
    catch(error){
        return res.json(error);
    }
}

exports.updateUser = async (req,res) => {
    try{
        const oldmail = req.body.oldmail;
        const nickname = req.body.nickname;
        const mail = req.body.mail;
        const password = req.body.password;
        if(isEmpty(oldmail)||isEmpty(nickname)||isEmpty(mail)||isEmpty(password)){
            return res.json({message:"Empty field detected."})
        }
        const hashPassword = await bcrypt.hash(password,10);
        const result = await pool.query(`UPDATE users SET nickname='${nickname}' , mail='${mail}' , password='${hashPassword}', 
        WHERE mail='${oldmail}' RETURNING *`);
        return res.json(result.rows[0]);
    }
    catch(error){
        return res.json(error);
    }
}

exports.deleteUserByMail = async (req,res) => {
    try{
        const mail = req.body.mail;
        if(isEmpty(mail)){
            return res.json({message:"No mail was given."})
        }
        await pool.query(`DELETE FROM users WHERE mail='${mail}'`);
        return res.json({message:"User deleted."});
    }
    catch(error){
        return res.json(error);
    }
}

exports.deleteUserByNickname = async (req,res) => {
    try{
        const nickname = req.body.nickname;
        if(isEmpty(nickname)){
            return res.json({message:"No nickname was given."})
        }
        await pool.query(`DELETE FROM users WHERE nickname='${nickname}'`);
        return res.json({message:"User deleted."});
    }
    catch(error){
        return res.json(error);
    }
}


