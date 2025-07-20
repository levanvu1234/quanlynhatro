require("dotenv").config() //lay ma jwt secret
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const saltRounds =10;


const createUserService = async (name,email,phonenumber,activity,password) => {
    try {
        //kiem tra co lap phonenumber khong 
        const user = await User.findOne({phonenumber}); // neu can kiem tra da ton tai chi phonenumber maf khong can gan mot gia trij vd nhu Email1
        if(user) {
            console.log(`Số điện thoại trung da ton tai, vui long chon so dien thoai khac ${phonenumber} `)
            return null;
        }
        //ma hoa mat khau
        const hashPassword = await bcrypt.hash(password, saltRounds)

        let result = await User.create({
            name: name,
            phonenumber: phonenumber,
            email: email,
            password: hashPassword,
            role: "User",
            activity: activity,

        })
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}

const LoginService = async (phonenumber1,password) => {
    try {
        //fetch user by phonenumber
        const user =await User.findOne({phonenumber:phonenumber1});
        if(user) {//compare password
            
            const isMathPassword = await bcrypt.compare(password, user.password)
            if(!isMathPassword){
                return{
                    EC: 2, //EC(Error code)   //sai mat khau
                    EM: "Email or password is incorrect" // //EM(error message)
                }
            }else{
                    //create access token
                    const payload = {
                        phonenumber: user.phonenumber,
                        name: user.name,
                        role: user.role,
                        _id: user._id,
                    }
                    const access_token = jwt.sign(
                        payload,
                        process.env.JWT_SECRET,{
                            expiresIn: process.env.JWT_EXPIRE
                        }
                    );    

                    return {//đăng nhập thành công 
                        EC: 0,
                        access_token, // access_ken này bao gồm email và name
                        user: {
                            phonenumber: user.phonenumber,
                            name: user.name,
                            role: user.role,
                            _id: user._id,
                        }
                    }
                }
        }else{
            return{
                    EC: 1, //EC(Error code) //sai phonenumber ko ton tai
                    EM: "phonenumber or password is incorrect" // //EM(error message)
                }
        }
        
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}
const GetUserService = async () => {
  try {
    const result = await User.find()
    .select("-password")
    .populate({
        path: "rooms",
        populate: {
        path: "building",
        select: "name"
        }
    });

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserByIdService = async (id) => {
  try {
    const user = await User.findById(id).select('-password')
    .populate({
        path: "rooms",
        select: "name building",    
        populate: {
          path: "building",
          select: "name"
        }
      });
    if (!user) {
      return {
        EC: 1,
        EM: "Người dùng không tồn tại",
      };
    }
    return {
      EC: 0,
      EM: "Lấy thông tin người dùng thành công",
      user,
    };
  } catch (error) {
    console.error(error);
    return {
      EC: -1,
      EM: "Lỗi server",
    };
  }
};


const updateUserService = async (id, updatedData) => {
    try {
        // Nếu có password mới thì mã hóa
        if (updatedData.password) {
            updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
        }

        const user = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-password');
        if (!user) {
            return {
                EC: 1,
                EM: "Người dùng không tồn tại"
            };
        }

        return {
            EC: 0,
            EM: "Cập nhật thành công",
            user
        };

    } catch (error) {
        console.error(error);
        return {
            EC: -1,
            EM: "Lỗi server"
        };
    }
};
module.exports = {
    createUserService, LoginService ,GetUserService,updateUserService,getUserByIdService
}