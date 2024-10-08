import { Layout, Form, Card, Input, Flex, Checkbox, Button, Modal, List, message,} from "antd";
import Sidebar from "../components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import useRWD from "../hooks/useRWD";
import { useState, useEffect } from "react";
import { getAppointments } from "../api/appointments";
import { FaRegUser } from "react-icons/fa";
import DatePicker from "../components/DatePicker";
import { patchAppointment } from "../api/schedules";
import dayjs from "dayjs";


const { Content } = Layout;



const QueryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useRWD();
  const [form] = Form.useForm();
  
  const [appointments, setAppointments] = useState([])
  const [appointmentState, setAppointmentState] = useState(location.state || "");
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false)
  
  const handleshowModal = () => {
    setIsModalOpen(true);
  };


  const handleModalCancel = () => {
    setIsModalOpen(false);
  };


  // useEffect(() => {
  //   const getAppointmentData = async () => {
  //     try {
  //      const response = await getAppointments();
  //      console.log(response.data)
  //      setAppointments(response.data)
       
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  //   getAppointmentData()
  //   if(appointmentState === 'success') {
  //     messageApi.open({
  //       type: "success",
  //       content: "掛號成功",
  //     });
  //     setAppointmentState("")
  //   }
  // }, []);


  const handleClickLogin = () => {
    navigate("/login");
  };
  const handleClickLogo = () => {
    navigate("/*");
  };
  const handleClickPage = (e) => {
    switch (e.key) {
      case "1":
        navigate("/departments");
        break;
      case "2":
        navigate("/query");
        break;
      case "3":
        navigate("/records");
        break;
      case "4":
        navigate("/doctors");
        break;
      default:
        break;
    }
  };

const handleFinish = (values) => {
  const birthDate = new Date(
    Date.UTC(values.year, values.month - 1, values.day)
  ).toISOString();
  const requestData = {
    idNumber: values.idNumber,
    birthDate: birthDate, 
    recaptchaResponse: "test_recaptcha", 
  };
  const getAppointmentsDataAsync = async () => {
    try {
      const patientAppointments = await getAppointments(requestData)
      const weekDay = ["日", "一", "二", "三", "四", "五", "六"];
      const organizedAppointments = patientAppointments.data.map((p) => {
       const formattedDate = dayjs(p.date).format("M/D") + '（' +weekDay[dayjs(p.date).day()] + "）"
       const formattedSlot = p.scheduleSlot.includes("Morning") ? "上午診" : "下午診"
        return { ...p, date: formattedDate, scheduleSlot: formattedSlot };
      })
      setAppointments(organizedAppointments);
      
    } catch(error) {
      console.error(error);
    }
    
}
getAppointmentsDataAsync();
setIsVerified(true)
}

const idNumberValidation = async (_, value) => {
    function validateIdNumber(idNumber) {
      const regex = /^[A-Z][12]\d{8}$/;

      if (!regex.test(idNumber)) {
        return false;
      }

      const letterMapping = {
        A: 10,
        B: 11,
        C: 12,
        D: 13,
        E: 14,
        F: 15,
        G: 16,
        H: 17,
        I: 34,
        J: 18,
        K: 19,
        L: 20,
        M: 21,
        N: 22,
        O: 35,
        P: 23,
        Q: 24,
        R: 25,
        S: 26,
        T: 27,
        U: 28,
        V: 29,
        W: 32,
        X: 30,
        Y: 31,
        Z: 33,
      };

      const firstLetterValue = letterMapping[idNumber[0]];

      const n1 = Math.floor(firstLetterValue / 10);

      const n2 = firstLetterValue % 10;

      const n3 = parseInt(idNumber[1]);

      const n4 = parseInt(idNumber[2]);

      const n5 = parseInt(idNumber[3]);

      const n6 = parseInt(idNumber[4]);

      const n7 = parseInt(idNumber[5]);

      const n8 = parseInt(idNumber[6]);

      const n9 = parseInt(idNumber[7]);

      const n10 = parseInt(idNumber[8]);

      const n11 = parseInt(idNumber[9]);

      const total =
        n1 * 1 +
        n2 * 9 +
        n3 * 8 +
        n4 * 7 +
        n5 * 6 +
        n6 * 5 +
        n7 * 4 +
        n8 * 3 +
        n9 * 2 +
        n10 * 1 +
        n11 * 1;

      return total % 10 === 0;
    }
    const isValid = validateIdNumber(value);
    return Promise.resolve().then(() => {
    if(!isValid) {
    return Promise.reject(new Error("身分證字號格式錯誤"));
    }
    })
  }


  return (
    <Layout className="min-h-screen">
      {contextHolder}
      <Sidebar onClickPage={handleClickPage} onClickLogo={handleClickLogo} />

      {isDesktop && (
        <button className="absolute right-8 top-4" onClick={handleClickLogin}>
          登入
        </button>
      )}
      <Content className="bg-gray-100 p-6">
        {isVerified ? (
          appointments ? (
            <>
              <h1 className="text-2xl mb-6">您的看診時段</h1>
              <List bordered className="bg-white px-8 py-4">
                {appointments.map((a) => (
                  <List.Item key={a.appointmentId}>
                    <p>{a.date + a.scheduleSlot}</p>
                    <p>{a.doctorSpecialty}</p>
                    <p>醫師：{a.doctorName}</p>
                    <p>看診號碼：{a.consultationNumber}</p>
                    <Button>
                      {a.status === "CONFIRMED" ? "取消掛號" : "重新掛號"}
                    </Button>
                  </List.Item>
                ))}
                {/* <Card
                title="目前看診進度"
                bordered={false}
                style={{ width: 300 }}
              >
                <p>門診尚未開始</p>
              </Card>
              <Button className="mt-6" onClick={handleshowModal}>
                取消掛號
              </Button>
              <Modal
                title="您確定要取消掛號？"
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
              >
                <p className="my-6">
                  若取消掛號，再次看診必須重新掛號、重新候診。
                </p>
                <Button
                  className="w-full"
                  // onClick={() => handleDelete(appointment.id)}
                  danger
                >
                  確定取消
                </Button>
              </Modal> */}
              </List>
            </>
          ) : (
            <h1 className="text-2xl mb-6">您目前沒有看診掛號</h1>
          )
        ) : (
          <Form
            name="login"
            initialValues={{
              remember: true,
            }}
            style={{
              maxWidth: 360,
            }}
            onFinish={handleFinish}
          >
            <h1 className="text-2xl mb-6">查詢您的掛號資訊</h1>
            <Form.Item
              label="身份證字號"
              name="idNumber"
              validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: "請輸入身份證字號",
                },

                {
                  validator: idNumberValidation,
                },
              ]}
            >
              <Input prefix={<FaRegUser />} placeholder="身份證字號" />
            </Form.Item>
            <Form.Item label="生日">
              <DatePicker form={form}></DatePicker>
            </Form.Item>

            <Form.Item>
              <Button block type="primary" htmlType="submit">
                查詢
              </Button>
              或
              <Button size="large" type="link">
                註冊
              </Button>
              以方便您利用本系統
            </Form.Item>
          </Form>
        )}
      </Content>
    </Layout>
  );
};

export default QueryPage;
