import { FaSuitcaseMedical } from "react-icons/fa6";
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import DatePicker from "../components/DatePicker";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

const handleClick = () => {
navigate("/admin/departments");
}

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Form
        form={form}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="bg-white mb-8 p-12 flex flex-col md:w-1/2 rounded-2xl text-center"
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
          <Input />
        </Form.Item>

        <Form.Item label="生日">
          <DatePicker />
        </Form.Item>
        <Form.Item>
          <Button className="w-1/2" type="primary" htmlType="submit">
            登入
          </Button>
        </Form.Item>
      </Form>
      <Button onClick={handleClick}>管理員登入</Button>
    </div>
  );
};

export default LoginPage;
