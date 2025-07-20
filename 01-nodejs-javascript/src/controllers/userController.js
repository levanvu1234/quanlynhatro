const { createUserService, LoginService, GetUserService, updateUserService,getUserByIdService   } = require("../services/UserService");

//xử lý đăng ký
const createUser = async (req, res) => {
    const{name, email, password, phonenumber, activity}=req.body;

    const data = await createUserService(name,email,phonenumber,activity,password)
    return res.status(200).json(data)
}
//Xử lý đăng nhập
const HandleLogin = async (req, res) => {
    const{ phonenumber, password}=req.body;

    const data = await LoginService(phonenumber,password)
    return res.status(200).json(data)
}
const getUserById = async (req, res) => {
  const { id } = req.params;
  const data = await getUserByIdService(id);
  if (data.EC === 0) {
    return res.status(200).json(data);
  } else if (data.EC === 1) {
    return res.status(404).json(data);
  } else {
    return res.status(500).json(data);
  }
};
//lấy danh sách người dùng
const GetUser = async (req, res) => {
    const data = await GetUserService()
    return res.status(200).json(data)
}

//sử lý đồng bồ trang khi load mạng 
const GetAccount = async (req, res) => {
    return res.status(200).json(req.user)
}
const updateUser = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    const data = await updateUserService(id, updatedData);
    return res.status(200).json(data);
};
module.exports = {
    createUser, HandleLogin, GetUser, GetAccount,updateUser ,getUserById

}