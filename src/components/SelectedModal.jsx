import { Modal, Avatar, Form, Flex, Button, Input, message } from "antd";
import DatePicker from "./DatePicker";
import ReCAPTCHA from "react-google-recaptcha";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { createAppointment, createFirstAppointment } from "../api/appointments";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DoctorSchedulesTable from "./DoctorSchedulesTable";
import { formattedDate } from "../helper/dateUtils";


const SelectedModal = ({
  selectedDoctor,
  isModalOpen,
  isFirstCreateAppointment,
  isModalLoading,
  isSubmitLoading,
  setIsSubmitLoading,
  setIsFirstCreateAppointment,
  setSelectedDoctor,
  setIsModalOpen,
  scheduleData,
  getAppointmentsDataAsync,
}) => {
  const [form] = Form.useForm();
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(false);
  const { isAuthenticated, role, CSRF_token } = useSelector(
    (state) => state.auth
  );
  const isPatientLogin = isAuthenticated && role === "patient";
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [recaptcha, setRecaptcha] = useState("");
  const [recaptchaError, setRecaptchaError] = useState("");
  const [selectedAppointmentData, setSelectedAppointmentData] = useState(null);
  const { idNumber, birthDate } = useSelector((state) => state.tempUser);
  const [error, setError] = useState("");
  const [prevModalState, setPrevModalState] = useState(null)

  const handlerecaptchaChange = (value) => {
    setRecaptcha(value);
    setRecaptchaError("");
  };
  
  const handleCancel = (value) => {
    setIsSubmitLoading(false);
    if(value === "doctor") {
      setSelectedAppointmentData(null);
      setSelectedDoctor(prevModalState)
      form.resetFields();
      setError("");
      return
    }
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedAppointmentData(null);
    form.resetFields();
    setError("")
  };

  //使用者未登入掛號
  const handleSubmit = async (values) => {
    if (recaptcha === "") {
      return setRecaptchaError("請驗證reCaptcha");
    }
    if (location.pathname === "/query"){
      if (
        values.idNumber !== idNumber ||
        new Date(
          Date.UTC(values.year, values.month - 1, values.day)
        ).toISOString() !== birthDate
      ) {
        //使用者掛號輸入的資料不一致
        return setError("身份資料輸入錯誤，請檢查身份證字號或生日是否正確");
      }
    }
    setIsSubmitLoading(true);

    let requestData = {
      idNumber: values.idNumber,
      birthDate: new Date(
        Date.UTC(values.year, values.month - 1, values.day)
      ).toISOString(),
      recaptchaResponse: recaptcha,
      doctorScheduleId: selectedAppointmentData.doctorScheduleId,
    };

    if (isFirstCreateAppointment) {
      requestData = {
        idNumber: values.idNumber,
        birthDate: birthDate,
        recaptchaResponse: recaptcha,
        doctorScheduleId: selectedAppointmentData.doctorScheduleId,
        name: values.name,
      };

      await createFirstAppointment(requestData);
      setIsSubmitLoading(false);
      //掛號成功
      //頁面導向，並帶入新掛號建立成功true
      navigate("/query?appointmentStatus=success", {
        state: {
          requestPayload: {
            idNumber: values.idNumber,
            birthDate: birthDate,
          },
        },
      });
      form.resetFields();
      return;
    }
    
    const result = await createAppointment(requestData);

    if (result === "You have already booked this time slot.") {
      messageApi.open({
        type: "warning",
        content: "重複掛號",
      });
      setIsSubmitLoading(false);
      return;
    }
    if (typeof result === "string" && result.includes("初診")) {
      setIsSubmitLoading(false);
      setIsFirstCreateAppointment(true);
      messageApi.open({
        type: "warning",
        content: "您為初次掛號，請填寫以下資料",
      });
      return;
    }
    //掛號成功
    //頁面導向，並帶入新掛號建立成功true
    if (result.status === "success") {
      setIsAppointmentLoading(false);
      setIsModalOpen(false);
      //如果不在查詢頁面則導向查詢頁面，並帶入新掛號建立成功
      if (location.pathname !== "/query") {
        navigate("/query?appointmentStatus=success", {
          state: {
            requestPayload: requestData,
          },
        });
      } else {
        //重新呼叫API資料，觸發重新渲染
        await getAppointmentsDataAsync(
          requestData
        );
        setSelectedAppointmentData(null);
        messageApi.open({
          type: "success",
          content: "掛號成功",
        });
      }
    }
    setIsSubmitLoading(false)
    form.resetFields();
  };

  //使用者登入後的掛號
  const handleAppointmentLogin = async () => {
    setIsAppointmentLoading(true);
    const requestData = {
      doctorScheduleId: selectedAppointmentData.doctorScheduleId,
      isAuthenticated,
      CSRF_token,
    };
    const result = await createAppointment(requestData);

    if (result === "You have already booked this time slot.") {
      messageApi.open({
        type: "warning",
        content: "重複掛號",
      });
      setIsAppointmentLoading(false);
      return;
    }
    //掛號成功
    if (result.status === "success") {
      setIsAppointmentLoading(false);
      setIsModalOpen(false);
      //如果不在查詢頁面則導向查詢頁面，並帶入新掛號建立成功
      if (location.pathname !== "/query") {
        navigate("/query?appointmentStatus=success");
      } else {
        //重新呼叫API資料，觸發重新渲染
        await getAppointmentsDataAsync({
          isAuthenticated,
          CSRF_token,
        });
        setSelectedAppointmentData(null)
        messageApi.open({
          type: "success",
          content: "掛號成功",
        });
      }
    }
  };

  const handleAppointment = (schedule) => {
    setPrevModalState(selectedDoctor);
    setSelectedDoctor(null);
    setSelectedAppointmentData({
      specialty: schedule.specialty,
      date: formattedDate(schedule.date),
      doctorName: schedule.doctorName,
      time: schedule.scheduleSlot.includes("Morning") ? "上午診" : "下午診",
      doctorScheduleId: schedule.doctorScheduleId,
    });
  };

  useEffect(() => {
    if (scheduleData) {
      setSelectedAppointmentData({
        specialty: scheduleData.specialty,
        date: formattedDate(scheduleData.date),
        doctorName: scheduleData.doctorName,
        time: scheduleData.scheduleSlot.includes("Morning")
          ? "上午診"
          : "下午診",
        doctorScheduleId: scheduleData.doctorScheduleId,
      });
    }
  }, [scheduleData, selectedDoctor]);

  return (
    <Modal
      open={isModalOpen}
      loading={isModalLoading}
      title={isModalLoading && "醫師資訊"}
      onCancel={handleCancel}
      footer={null}
    >
      {contextHolder}
      {selectedDoctor && (
        <div className="p-4">
          <h3 className="text-2xl">{selectedDoctor.name} 醫師</h3>
          <Avatar
            shape="square"
            size={100}
            src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${selectedDoctor.id}`}
            alt={`${selectedDoctor.name}照片`}
            style={{ width: "100px", marginBottom: "10px" }}
          />
          <div className="my-4 text-base">
            <p>科別： {selectedDoctor.specialty}</p>
            <p>專長：{JSON.parse(selectedDoctor.description).join("、")}</p>
          </div>
          <DoctorSchedulesTable
            handleAppointment={handleAppointment}
            doctorId={selectedDoctor.id}
          />
        </div>
      )}
      {selectedAppointmentData &&
        (isPatientLogin ? (
          <div className="text-center">
            <h1 className="text-xl font-bold">掛號資訊</h1>
            <div className="my-4 text-base">
              <p>科別：{selectedAppointmentData.specialty}</p>
              <p>日期：{selectedAppointmentData.date}</p>
              <p>時段：{selectedAppointmentData.time}</p>
              <p>醫師：{selectedAppointmentData.doctorName}</p>
            </div>
            <p className="my-4">將幫您預約以上門診，確定要掛號嗎？</p>
            <Button
              loading={isAppointmentLoading}
              onClick={handleAppointmentLogin}
              className="w-1/2"
              type="primary"
            >
              確定
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-center text-xl font-bold">掛號資訊</h1>
            <div className="my-8 ml-20 text-lg">
              <p>科別：{selectedAppointmentData.specialty}</p>
              <p>日期：{selectedAppointmentData.date}</p>
              <p>時段：{selectedAppointmentData.time}</p>
              <p>醫師：{selectedAppointmentData.doctorName}</p>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              labelCol={{ span: 8 }}
              className="w-full max-w-md"
            >
              <Form.Item
                label="身分證字號"
                name="idNumber"
                rules={[{ required: true, message: "請輸入身分證字號" }]}
              >
                <Input placeholder="請輸入身分證字號" />
              </Form.Item>
              <Form.Item label="生日" name="birthday">
                <DatePicker form={form} />
              </Form.Item>
              {isFirstCreateAppointment && (
                <>
                  <h4 className="m-4 text-center text-base text-red-500">
                    您為初次掛號，請填寫以下資料
                  </h4>
                  <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{ required: true, message: "請輸入姓名" }]}
                  >
                    <Input placeholder="請輸入姓名" />
                  </Form.Item>
                </>
              )}
              {error !== "" && (
                <span className="text-red-500 ml-20">{error}</span>
              )}
              {recaptchaError !== "" && (
                <span className="text-red-500 ml-20">{recaptchaError}</span>
              )}
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handlerecaptchaChange}
                />
              </div>
              <Form.Item>
                <Flex className="mt-4" gap="middle" justify="center">
                  <Button onClick={() => handleCancel("doctor")}>返回</Button>

                  <Button
                    type="primary"
                    loading={isSubmitLoading}
                    htmlType="submit"
                  >
                    送出
                  </Button>
                </Flex>
              </Form.Item>
            </Form>
          </>
        ))}
    </Modal>
  );
};
SelectedModal.propTypes = {
  selectedDoctor: PropTypes.object,
  isModalOpen: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func,
  isFirstCreateAppointment: PropTypes.bool,
  isModalLoading: PropTypes.bool,
  isSubmitLoading: PropTypes.bool,
  setIsSubmitLoading: PropTypes.func,
  setIsFirstCreateAppointment: PropTypes.func,
  setSelectedDoctor: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  scheduleData: PropTypes.object,
  getAppointmentsDataAsync: PropTypes.func
};

export default SelectedModal;
