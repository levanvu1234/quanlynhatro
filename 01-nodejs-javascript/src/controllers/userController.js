const { createUserService, LoginService, GetUserService, updateUserService,getUserByIdService,deleteUserService,restoreUserService   } = require("../services/UserService");

//xử lý đăng ký
const createUser = async (req, res) => {
    const{name, email, password, phonenumber, activity}=req.body;

    const data = await createUserService(name,email,phonenumber,activity,password)
    if (data.EC === 0) {
      return res.status(200).json(data); // Thành công
    } else if (data.EC === 1) {
      return res.status(400).json(data); // Trùng số điện thoại
    } else {
      return res.status(500).json(data); // Lỗi hệ thống
    }
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
//
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { deleteCode } = req.body;

  const data = await deleteUserService(id, deleteCode);

  if (data.EC === 0) {
    return res.status(200).json(data);
  } else if (data.EC === 1) {
    return res.status(400).json(data); // mã xác nhận sai
  } else if (data.EC === 2) {
    return res.status(404).json(data); // người dùng không tồn tại
  } else {
    return res.status(500).json(data); // lỗi hệ thống
  }
};
const restoreUser = async (req, res) => {
  const { id } = req.params;

  const data = await restoreUserService(id);
  if (data.EC === 0) {
    return res.status(200).json(data);
  } else if (data.EC === 2) {
    return res.status(404).json(data);
  } else {
    return res.status(500).json(data);
  }
};


module.exports = {
    createUser, HandleLogin, GetUser, GetAccount,updateUser ,getUserById,deleteUser,restoreUser

}