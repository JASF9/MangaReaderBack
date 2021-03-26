const express= require('express'); 
const app=express(); 
const cors= require('cors')
require("dotenv").config();

app.set('port',process.env.PORT || 4000)

app.use(cors()); 
//middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use('/api',require('./router/routes')); 

app.listen(app.get('port'), ()=>{
    console.log('Servidor montado')
}); 
