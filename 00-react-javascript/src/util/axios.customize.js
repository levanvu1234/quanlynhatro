import axios from "axios";
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
    
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    config.headers.Authorization =  `Bearer ${localStorage.getItem("access_token")}` ;
    
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
  const contentType = response.headers['content-type'];
  // ✅ Nếu là PDF hoặc blob, không động chạm
  if (contentType && contentType.includes("application/pdf")) {
    return response;
  }

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    //if goi chi lay data, bo phan thua khoong can thiet
    if(response && response.data ){
        return response.data
    }
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log("check loi ", error)
    if(error?.response?.data) return error?.response?.data
    
    return Promise.reject(error);
  });
export default instance;