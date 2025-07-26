import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import { createUserApi } from '../util/api';
import { useNavigate } from 'react-router-dom';
import '../style/register.css';
import { Link } from 'react-router-dom'; // Import your CSS styles
const RegisterPage = () => {
    const navigate =useNavigate();
    const onFinish = async (values) => {
        const { name, email, phonenumber, password } = values;

        try {
            const res = await createUserApi(name, email, phonenumber, password);

            if (res.EC === 0) {
                notification.success({
                    message: "Đăng ký thành công",
                    description: res.EM || "Tài khoản đã được tạo.",
                });
                navigate("/login");
            } else {
                notification.error({
                    message: "Lỗi đăng ký",
                    description: res.EM || "Không thể tạo tài khoản.",
                });
            }
        } catch (error) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error.response?.data?.EM || "Không thể kết nối đến máy chủ.",
            });
        }
    };
    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };
    return(
        <div className="register-container">
            <div className="register-box">
                <h2>Đăng ký tài khoản</h2>
                <Form
                    name="basic"
                    className="form-center"
                    //initialValues={{ remember: true }} //checkbox
                    onFinish={onFinish}
                    //onFinishFailed={onFinishFailed} // bao loi khi dien sai
                    autoComplete="off" //tat tu dong dien tuw trinh duyet
                    layout = "vertical"
                >
                <Form.Item
                    label="Username"
                    name="name"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                >
                <Input />
                </Form.Item>

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
                        Submit
                    </Button>
                </Form.Item>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                    Bạn đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
                </div>
            </Form>
            </div>
        </div>
    )
}
export default RegisterPage;
