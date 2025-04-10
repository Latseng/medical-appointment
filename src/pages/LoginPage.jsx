import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { login, adminLogin, thirdPartyLogin, CSRF_request } from "../api/auth";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "../store/authSlice";
import { FcGoogle } from "react-icons/fc";
import Navbar from "../components/Navbar";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isAdminLoginForm, setIsAdminLoginForm] = useState(false);
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();
  const [isThirdPartyLoginLoading, setIsThirdPartyLoginLoading] = useState(
    false
  );

  const error = () => {
    messageApi.open({
      type: "error",
      content: "帳號或密碼錯誤",
    });
  };

  useEffect(() => {
    // 如果已登入
    if (isAuthenticated) {
      // 如果有管理者權限，導向使用者功能頁面
      if (role === "admin") {
        return navigate("/admin/departments");
      }
      return navigate("/departments");
    }
  }, [isAuthenticated, navigate, role]);

  const handlePatientLogin = async (value) => {
    messageApi.open({
      type: "loading",
      content: "登入中",
      duration: 0,
    });

    const data = await login(value);
    
    if (data === "帳號或密碼錯誤") {
      error();
      return;
    }

    messageApi.destroy();

    const result = await CSRF_request();
    
    const expiresIn = 3600; //設定登入時效為一小時 = 3600秒
    if (result.status === "success") {
      dispatch(
        setLogin({
          user: data.data.user,
          role: "patient",
          CSRF_token: result.data.csrfToken,
          expiresIn: expiresIn,
        })
      );
    } else {
      console.log("CSRF_Token錯誤");
    }
    navigate("/departments");
  };

  const handleAdminLogin = async (value) => {
    messageApi.open({
      type: "loading",
      content: "登入中",
      duration: 0,
    });
    const data = await adminLogin(value);
    if (data === "帳號或密碼錯誤") {
      error();
      return;
    }
    messageApi.destroy();
    const result = await CSRF_request();
    const expiresIn = 3600; //設定登入時效為一小時 = 3600秒
    if (result.status === "success") {
      dispatch(
        setLogin({
          user: data.data.user,
          role: "admin",
          CSRF_token: result.data.csrfToken,
          expiresIn: expiresIn,
        })
      );
    } else {
      console.log("CSRF_Token錯誤");
    }
    navigate("/admin/departments");
  };

  const handleThirdPartyLogin = async () => {
    setIsThirdPartyLoginLoading(true);
    await thirdPartyLogin();
    setIsThirdPartyLoginLoading(false)
  };

  return (
    <main className="bg-gray-100">
      <Navbar currentPage={"loginPage"} />
      <div className="mt-4 flex flex-col items-center justify-center h-screen">
        {contextHolder}
        {isAdminLoginForm ? (
          <Form
            form={form}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={handleAdminLogin}
            className="bg-white mb-8 p-12 flex flex-col md:w-1/3 rounded-2xl text-center"
          >
            <h1 className="mb-10 text-3xl">管理者登入</h1>
            <Form.Item
              label="帳號"
              name="account"
              rules={[{ required: true, message: "請輸入帳號" }]}
            >
              <Input autoComplete="true" />
            </Form.Item>
            <Form.Item
              label="密碼"
              name="password"
              rules={[{ required: true, message: "請輸入密碼" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full h-10 mb-4"
                type="primary"
                htmlType="submit"
              >
                登入
              </Button>
            </Form.Item>

            <Button
              className=" mx-auto"
              onClick={() => setIsAdminLoginForm(false)}
            >
              回病患登入
            </Button>
          </Form>
        ) : (
          <Form
            form={form}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={handlePatientLogin}
            className="bg-white mb-8 p-12 flex flex-col md:w-1/3 rounded-2xl text-center"
          >
            <h1 className="mb-10 text-3xl">會員登入</h1>
            <Form.Item
              label="身分證字號"
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
            <Form.Item
              className="md:ml-10"
              label="密碼"
              name="password"
              rules={[{ required: true, message: "請輸入密碼" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button
                className="w-full h-10 mb-4"
                type="primary"
                htmlType="submit"
              >
                登入
              </Button>
              <Button
                loading={isThirdPartyLoginLoading}
                onClick={() => handleThirdPartyLogin("google")}
              >
                <FcGoogle size={20} />
                Google登入
              </Button>
            </Form.Item>

            <p className="mb-4">
              還沒有帳號嗎？
              <Link
                to="/register"
                className="text-base mx-2 hover:text-mainColorLight"
              >
                立即註冊
              </Link>
              體驗更多便捷功能！
            </p>
            <Button
              className=" mx-auto"
              onClick={() => setIsAdminLoginForm(true)}
            >
              管理員登入
            </Button>
          </Form>
        )}
      </div>
    </main>
  );
};

export default LoginPage;
