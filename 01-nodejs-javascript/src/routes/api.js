const express = require('express');
const { createUser,HandleLogin ,GetUser,GetAccount,updateUser,getUserById} = require('../controllers/usercontroller');
const roomController = require('../controllers/roomController'); 
const buildingController = require('../controllers/buildingController'); 
const monthlyBillController = require('../controllers/monthlybillController');
const deviceController = require('../controllers/devicecontroller');
const bookingController = require('../controllers/bookingController');
const auth = require('../midlleware/auth');
const { uploadTemp, uploadForUpdate, uploadBuildingImages } = require('../midlleware/upload');
const routerAPI = express.Router();



//room
routerAPI.post("/room",uploadTemp.array('images', 10), roomController.create);
routerAPI.get("/room", roomController.getAll);
routerAPI.put("/room/:id",uploadForUpdate, roomController.update);
routerAPI.get("/room/:id", roomController.getById);
//building
routerAPI.get("/building", buildingController.getAll);
routerAPI.post("/building", uploadBuildingImages.array('images', 10), buildingController.create);
routerAPI.put("/building/:id", uploadBuildingImages.array('images', 10), buildingController.update);
routerAPI.get("/building/report/revenue", buildingController.getRevenue);
routerAPI.get("/building/:id", buildingController.getById);
//booking
routerAPI.post('/booking', bookingController.createBooking);
routerAPI.get('/booking', bookingController.getAllBookings); 
routerAPI.patch('/booking/:id/status', bookingController.updateBookingStatus);


routerAPI.all("*",auth) // xac thuc qua middleware
routerAPI.get("/",(req,res)=>{
    return res.status(200).json("hello word create user")
})  
routerAPI.post("/register",createUser)
routerAPI.post("/login",HandleLogin)
routerAPI.get("/user", GetUser)
routerAPI.get("/account", GetAccount)
routerAPI.put("/users/:id", updateUser);
routerAPI.get('/user/:id', getUserById);


//bill
routerAPI.get('/bill', monthlyBillController.getAll);
routerAPI.post('/bill', monthlyBillController.create);
routerAPI.put("/bill/:id", monthlyBillController.update);

//device
routerAPI.post('/device', deviceController.create);
routerAPI.get('/device', deviceController.getAll);
routerAPI.put('/device/:id', deviceController.update);


module.exports = routerAPI; //export default