import { FaSuitcaseMedical } from "react-icons/fa6";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { login, adminLogin, thirdPartyLogin, CSRF_request } from "../api/auth";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "../store/authSlice";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isAdminLoginForm, setIsAdminLoginForm] = useState(false);
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();

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
    if(data === "帳號或密碼錯誤") {
      error()
      return;
    }
    messageApi.destroy()
    const CSRF_token = await CSRF_request()
    const expiresIn = 3600; //設定登入時效為一小時 = 3600秒
    dispatch(
      setLogin({
        user: data.data.user,
        role: "patient",
        CSRF_token: CSRF_token.data.csrfToken,
        expiresIn: expiresIn
      })
    );
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
      return
    }
    messageApi.destroy();
    const CSRF_token = await CSRF_request();
    const expiresIn = 3600;
    dispatch(
      setLogin({
        user: data.data.user,
        role: data.data.user.role,
        CSRF_token: CSRF_token.data.csrfToken,
        expiresIn: expiresIn,
      })
    );
    navigate("/admin/departments");
  };

  const handleThirdPartyLogin = async () => {
    await thirdPartyLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {contextHolder}
      {isAdminLoginForm ? (
        <Form
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={handleAdminLogin}
          className="bg-white mb-8 p-16 flex flex-col md:w-1/3 rounded-2xl text-center"
        >
          <button
            onClick={() => navigate("/*")}
            className="mx-auto mb-10 flex items-center text-mainColor text-6xl"
          >
            <FaSuitcaseMedical className="mr-2" />
            <h1>MA</h1>
          </button>
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
            <Input />
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
          <button
            onClick={() => navigate("/*")}
            className="mx-auto mb-10 flex items-center text-mainColor text-6xl"
          >
            <FaSuitcaseMedical className="mr-2" />
            <h1>MA</h1>
          </button>
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
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              className="w-full h-10 mb-4"
              type="primary"
              htmlType="submit"
            >
              登入
            </Button>
            <Button onClick={() => handleThirdPartyLogin("google")}>
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
  );
};

export default LoginPage;
