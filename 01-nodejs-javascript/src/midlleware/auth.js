const jwt = require("jsonwebtoken");
require("dotenv").config() //lay ma jwt secret


const auth = (req,res,next) =>{
    const white_lists = ["/","/register","/login"]; // resgister va login khong can xac thuc de truy cap toi
    if(white_lists.find(item => '/v1/api' + item ===req.originalUrl)){
        next();
    }
    else{
        if(req.headers && req.headers.authorization){
            const token = req.headers.authorization.split(' ')[1];
            //xac thuc thong qua ma token
            try {
                const decoded = jwt.verify(token,process.env.JWT_SECRET)  
                req.user ={
                    phonenumber: decoded.phonenumber,
                    name: decoded.name,
                    role: decoded.role,
                    _id: decoded._id,
                }        
                console.log("check token", decoded)
                next();
            } catch (error) {
                return res.status(401).json({
                message:" Token sai  /  het han"
            })
            }

            
        }else{
            //
            return res.status(401).json({
                message:"ban chua chuyen Access token o header / hoac token het han"
            })
        }
    }
     
}
module.exports = auth;