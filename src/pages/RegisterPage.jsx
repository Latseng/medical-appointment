import { Form, Input, Button } from "antd";
import { FaSuitcaseMedical } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import DatePicker  from "../components/DatePicker";
import { register, login, CSRF_request, getEmail } from "../api/auth";
import { useDispatch } from "react-redux";
import { setLogin } from "../store/authSlice";
import { useState, useEffect } from "react";

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const [idNumberError, setIdNumberError] = useState("")
  const [email, setEmail] = useState('')

  const onFinish = async (values) => {
     const birthDate = new Date(
       Date.UTC(values.year, values.month - 1, values.day)
     ).toISOString();
     const payload = {
       idNumber: values.idNumber,
       birthDate: birthDate,
       name: values.name,
       email: values.email || null,
       password: values.password,
     };

    const data = await register(payload)
    
  //  註冊成功，使用者直接登入、重導向頁面
    if (data.status === "success") {
      await login({idNumber: payload.idNumber, password: payload.password});
      const CSRF_token = await CSRF_request()
          dispatch(
            setLogin({
              user: data.data.user,
              role: "patient",
              CSRF_token: CSRF_token.data.csrfToken,
            })
          );
          navigate("/departments", { state: { register: "success" } });
    } else {
      if(data.includes("idNumber already exists")){
        setIdNumberError("身份證字號已註冊")
      }
    }
  };
  
    useEffect(() => {
      //第三方登入註冊
       const queryString = window.location.search;
       if(queryString.includes("pendingUser=true")) {
        const getEmailAsync = async () => {
          try {
            const res = await getEmail();
            if (res.status === "success") {
            setEmail(res.data.email);
            form.setFieldsValue({ email: res.data.email });
            }
          } catch (error) {
            console.error(error);
          }
        };
        getEmailAsync()
       }
    },[form])

  return (
    <div className="p-8 flex flex-col items-center justify-center bg-gray-100">
      <button
        onClick={() => navigate("/*")}
        className="flex text-mainColor text-6xl"
      >
        <FaSuitcaseMedical className="mr-2" />
        <h1>MA</h1>
      </button>
      <Form
        className="bg-white my-8 p-4 md:p-12 flex flex-col w-full md:w-1/2 rounded-2xl text-center"
        form={form}
        onFinish={onFinish}
        layout="vertical"
      >
        <h2 className="text-2xl">會員註冊</h2>
        <Form.Item
          label="姓名"
          name="name"
          rules={[{ required: true, message: "請輸入姓名" }]}
        >
          <Input placeholder="姓名" />
        </Form.Item>
        <Form.Item label="生日" name="birthday">
          <DatePicker form={form} />
        </Form.Item>
        <Form.Item
          label="身份證字號（作帳號使用）"
          name="idNumber"
          rules={[
            { required: true, message: "請輸入身分證字號" },
            {
              pattern: /^[A-Z][0-9]{9}$/,
              message: "身份證字號格式錯誤，請輸入正確的身份證字號",
            },
          ]}
        >
          <Input autoComplete="true" />
        </Form.Item>
        <span className="text-red-500">{idNumberError}</span>
        <Form.Item
          label="密碼"
          name="password"
          rules={[{ required: true, message: "請輸入密碼" }]}
        >
          <Input.Password placeholder="密碼" />
        </Form.Item>
        <Form.Item
          label="確認密碼"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "請再次輸入密碼" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("密碼不一致"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="確認密碼" />
        </Form.Item>
        <Form.Item
          label="電子郵件"
          name="email"
          rules={[{ type: "email", message: "請輸入有效的電子郵件" }]}
        >
          <Input
            placeholder={email !== "" ? email : "請輸入電子信箱"}
            disabled={email !== ""}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            註冊
          </Button>
        </Form.Item>
        <Button onClick={() => navigate("/login")} type="text" block>
          取消
        </Button>
      </Form>
    </div>
  );
};

export default RegisterPage;
