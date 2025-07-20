import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppService from './Appservice.jsx'
import './style/global.css'

import RegisterPage from './page/register.jsx'
import UserPage from './page/user.jsx'
import ReportPage from './page/home .jsx'
import LoginPage from './page/login.jsx'
import RoomPage from './page/room.jsx'
import BuildingPage from './page/building.jsx'
import MonthlyBillPage from './page/bill.jsx'
import DevicePage from './page/device.jsx'
import Hello from './page/Hello.jsx'
import RoomDetailPage from './customer/detail/roomdetail.jsx';
import BuildingListPage from './customer/serviceBuilding';
import BuildingDetailPage from './customer/detail/buildingdetail.jsx';
import UserDetailPage from './customer/detail/userdetail.jsx';
import BookingPage from './page/booking.jsx';
//tu "https://reactrouter.com/6.30.1/start/tutorial" huong trang sang cac file 
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthWrapper } from './component/context/auth.context.jsx'


const router = createBrowserRouter([
   {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/dashboard",
    element: <App />,
    children: [
      {
        index : true,
        element : <Hello />
      },
      {
        path : "report",
        element : <ReportPage/> 
      },
      {
        path: "user",
        element: <UserPage />
      },
      {
        path: "room",
        element: <RoomPage />
      },
      {
        path: "building",
        element: <BuildingPage />
      },
      {
        path: "bill",
        element: <MonthlyBillPage />
      },
      {
        path: "device",
        element: <DevicePage />
      },
      {
        path: "booking",
        element: <BookingPage />
      },
    ]
  },
  {
    path: "/",
    element: <AppService />,
    children: [
      {
        index : true,
        element: <BuildingListPage />,
      },
      {
        path: "building/:id",
        element: <BuildingDetailPage />,
      },
      {
        path: "/room/:id",
        element: <RoomDetailPage />,
      },
      {
        path: "/user/:id",
        element: <UserDetailPage />,
      },
    ]
  },
  {
    path: "register",
    element: <RegisterPage />
  },
  // {
  //   path: "/servicebuilding", 
  //   element: <BuildingList />,
  // }

  
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>   
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper> 
  </React.StrictMode>,
)
