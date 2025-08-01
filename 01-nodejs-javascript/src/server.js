require('dotenv').config();
const express = require('express'); //commonjs
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors =require('cors');

const app = express();
const port = process.env.PORT || 8888;

//config cors
app.use(cors());
//config req.body
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data
app.use('/uploads', express.static('uploads'));

//config template engine
configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/",getHomepage)
//khai báo route
app.use('/', webAPI);
app.use('/v1/api/', apiRoutes);


//ket noi database
(async () => {
    try {
        //using mongoose
        await connection();

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`)
        })
    } catch (error) {
        console.log(">>> Error connect to DB: ", error)
    }
})()
