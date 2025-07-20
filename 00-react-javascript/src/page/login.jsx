import React, { useContext } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { LoginApi } from '../util/api';
import { useNavigate } from 'react-router-dom';
import{AuthContext} from '../component/context/auth.context'
import { Link } from 'react-router-dom';
import '../style/register.css'; // Import your CSS styles
const LoginPage = () => {
    const navigate =useNavigate();
    const {setAuth} = useContext(AuthContext);
    const onFinish = async(values) => {
        const {  phonenumber, password} =values;
        const res = await LoginApi( phonenumber, password);
        console.log(" API RES:", res);

        if(res && res.EC ===0){
            localStorage.setItem("access_token",res.access_token )
            notification.success({
                message: "Login USER",
                description: "Successful"
            });
            setAuth({   
                isAuthenticated :true,
                user:{ 
                    name:res?.user?.name ?? "",
                    phonenumber:res?.user?.phonenumber ?? "",
                    role:res?.user?.role ?? "",
                }
            });
            console.log(" AUTH SET", {
                phonenumber: res?.user?.phonenumber ?? "", 
                name: res?.user?.name ?? "",
                role: res?.user?.role ?? "",
                });
            const role = (res?.user?.role ?? "").trim();
            if (role === "Admin") {
            navigate("/dashboard");
            } else {
                navigate("/");
            }
            // navigate("/dashboard");
            
        }else{
            notification.error({
                message: "Login USER",
                description: res?.EM?? "Eror"
            })
        }
    };
    const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
    };
    return(
        <div className="register-container">
            <div className="register-box">
                <h2>Đăng nhập tài khoản</h2>
                <Form
                    name="basic"
                    //initialValues={{ remember: true }} //checkbox
                    onFinish={onFinish}
                    //onFinishFailed={onFinishFailed} // bao loi khi dien sai
                    autoComplete="off" //tat tu dong dien tuw trinh duyet
                    layout = "vertical"
                >
                    <Form.Item
                    label="Phonenumber"
                    name="phonenumber"
                    rules={[{ required: true, message: 'Please input your phonenumber!' }]}
                    >
                    <Input />
                    </Form.Item>

                    <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    >   
                    <Input.Password />
                    </Form.Item>

                    {/* <Form.Item name="remember" style={{ marginLeft: 200 }} valuePropName="checked" label={null}>
                    <Checkbox>Remember me</Checkbox>
                    </Form.Item> */}

                    <Form.Item label={null} >
                    <Button type="primary" htmlType="submit">
                        Login
                    </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                        Bạn chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
                    </div>
                </Form>
            </div>
        </div>
    )
}
export default LoginPage;
