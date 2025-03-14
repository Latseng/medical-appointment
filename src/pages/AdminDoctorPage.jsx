import {
  Layout,
  Button,
  Table,
  Flex,
  Modal,
  Form,
  Input,
  Space,
  message,
} from "antd";
import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import {
  getDoctors,
  getDoctorById,
  patchDoctorById,
  deleteDoctorById,
  createDoctor,
} from "../api/doctors";
import {
  MinusCircleOutlined,
  PlusOutlined,
  ExclamationCircleFilled,
  ScheduleOutlined
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import useRWD from "../hooks/useRWD";
import LoginButton from "../components/LoginButton";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Content } = Layout;

const AdminDoctorPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [isAddNewDoctorModalOpen, setIsAddNewDoctorModalOpen] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    id: null,
    name: "",
    specialty: "",
    description: [],
  });
  const [isDoctorModalLoading, setIsDoctorModalLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const isDesktop = useRWD();
  const [form] = Form.useForm();
  const navigate = useNavigate()
 const { CSRF_token } = useSelector(
   (state) => state.auth
 );

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "科別",
      dataIndex: "department",
    },
    {
      title: "門診",
      dataIndex: "schedules",
      render: (_, record) => (
        <Button
          className="text-center"
          type="text"
          onClick={() => handleClickSchedules(record)}
        >
          <ScheduleOutlined className="text-2xl -translate-y-0.5" />
        </Button>
      ),
    },
    {
      title: "編輯資料",
      dataIndex: "edit",
      render: (_, record) => (
        <Flex justify="space-around">
          <Button type="text" onClick={() => handleClick("edit", record.id)}>
            <FaEdit size={24} />
          </Button>
          <Button danger onClick={() => handleClick("delete", record.id)}>
            刪除
          </Button>
        </Flex>
      ),
    },
  ];

  const handleClickSchedules = (record) => {
    navigate(`/admin/doctors/schedules/${record.id}`, {
      state: {
        doctorId: record.id,
        doctorName: record.name
      },
    });
  };

  const handleEditDoctorInfo = async (id) => {
    setIsDoctorModalOpen(true);
    setIsDoctorModalLoading(true);
    const doctor = await getDoctorById(id);
    setDoctorInfo({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      description: JSON.parse(doctor.description).map((item) => ({
        id: uuidv4(),
        value: item,
      })),
    });
    setIsDoctorModalLoading(false);
  };
  const handleInputChange = (field, value) => {
    setDoctorInfo((prev) => ({ ...prev, [field]: value }));
  };
  const handleDescriptionChange = (index, value) => {
    setDoctorInfo((prev) => {
      const newDescription = [...prev.description];
      newDescription[index].value = value;
      return { ...prev, description: newDescription };
    });
  };
  const addDescriptionField = () => {
    setDoctorInfo((prev) => ({
      ...prev,
      description: [...prev.description, { id: uuidv4(), value: "" }],
    }));
  };
  const removeDescriptionField = (index) => {
    setDoctorInfo((prev) => {
      const newDescription = prev.description.filter((_, idx) => idx !== index);
      return { ...prev, description: newDescription };
    });
  };

  const handleCancel = () => {
    setIsDoctorModalOpen(false);
    setDoctorInfo({
      name: "",
      specialty: "",
      description: [],
    });
  };

  const getDoctorsData = async () => {
    try {
      setIsLoading(true);
      const response = await getDoctors();
      setDoctors(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setIsSubmitLoading(true);
    const updatedData = {
      ...doctorInfo,
      description: JSON.stringify(
        doctorInfo.description.map((item) => item.value)
      ),
    };
    const result = await patchDoctorById(doctorInfo.id, updatedData, CSRF_token);
    if (result === "success") {
      await getDoctorsData();
      setIsDoctorModalOpen(false);
      setIsSubmitLoading(false);
      messageApi.open({
        type: "success",
        content: "資料更新成功",
      });
      return;
    }
    messageApi.open({
      type: "error",
      content: "錯誤！資料更新失敗",
    });
  };

  const handleDelete = async () => {
     setIsDoctorModalLoading(true);
    const result = await deleteDoctorById(deleteDoctorId, CSRF_token);
    if (result === "success") {
      await getDoctorsData();
      setIsDeleteConfirmModalOpen(false);
      setIsDoctorModalLoading(false);
      messageApi.open({
        type: "success",
        content: "資料刪除成功",
      });
      return;
    }
    messageApi.open({
      type: "error",
      content: "錯誤！資料刪除失敗",
    });
  };

  const handleClick = (action, id) => {
    switch (action) {
      case "edit":
        handleEditDoctorInfo(id);
        break;
      case "delete":
        setIsDeleteConfirmModalOpen(true);
        setDeleteDoctorId(id);
        break;
      case "add":
        setIsAddNewDoctorModalOpen(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  const data = doctors.map((d) => ({
    key: d.id,
    id: d.id,
    name: `${d.name}`,
    department: d.specialty,
  }));

  const handleCreateDoctorData = async (values) => {
    setIsDoctorModalLoading(true)
    const data = await createDoctor(values, CSRF_token);
    if (data.status === "success") {
       await getDoctorsData();
      setIsAddNewDoctorModalOpen(false);
      messageApi.open({
        type: "success",
        content: "資料更新成功",
      });
      setIsDoctorModalLoading(false);
      return
    }
  };

  return (
    <Content className="bg-gray-100 p-6 relative">
      {contextHolder}
      <h1 className="text-2xl">醫師管理</h1>
      <Button onClick={() => handleClick("add")} className="my-4">
        新增醫師
      </Button>
      {isDesktop && <LoginButton />}
      <div className="overflow-x-auto bg-white">
        <Table loading={isLoading} columns={columns} dataSource={data} />
      </div>
      <Modal
        title="醫師資料編輯"
        open={isDoctorModalOpen}
        loading={isDoctorModalLoading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={isSubmitLoading}
            onClick={handleSave}
          >
            儲存
          </Button>,
        ]}
      >
        <Form className="p-8">
          <Form.Item label="姓名">
            <Input
              placeholder="請輸入姓名"
              defaultValue={doctorInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </Form.Item>
          <Form.Item label="科別">
            <Input
              placeholder="請輸入科別"
              defaultValue={doctorInfo.specialty}
              onChange={(e) => handleInputChange("specialty", e.target.value)}
            />
          </Form.Item>
          <Form.Item label="專長">
            {doctorInfo.description.map((item, index) => (
              <Space
                key={item.id}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Input
                  placeholder="請輸入專長"
                  defaultValue={item.value}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                />
                <Button
                  type="text"
                  danger
                  onClick={() => removeDescriptionField(index)}
                >
                  <MinusCircleOutlined />
                </Button>
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={addDescriptionField}
              icon={<PlusOutlined />}
            >
              新增專長
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="刪除醫師資料"
        open={isDeleteConfirmModalOpen}
        loading={isDoctorModalLoading}
        onOk={handleDelete}
        onCancel={() => setIsDeleteConfirmModalOpen(false)}
        okType="danger"
        cancelText="返回"
        okText="刪除"
      >
        <div className="flex p-8">
          <ExclamationCircleFilled className="text-yellow-500 text-2xl pr-2" />
          <p>將從資料庫中，刪除該筆醫師資料，確定要進行此一操作？</p>
        </div>
      </Modal>
      <Modal
        title="建立醫師資料"
        loading={isDoctorModalLoading}
        open={isAddNewDoctorModalOpen}
        onCancel={() => {
          setIsAddNewDoctorModalOpen(false);
        }}
        footer={null}
      >
        <Form
          className="p-4"
          form={form}
          layout="vertical"
          onFinish={handleCreateDoctorData}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: "請輸入醫師姓名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="科別"
            name="specialty"
            rules={[{ required: true, message: "請輸入醫師科別" }]}
          >
            <Input />
          </Form.Item>
          <Form.List
            name="description"
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 1) {
                    return Promise.reject(new Error("至少加入一項專長"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? "專長" : ""}
                    required={true}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "請輸入專長敘述",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="請輸入專長"
                        style={{
                          width: "60%",
                        }}
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className="ml-2 text-red-500"
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{
                      width: "60%",
                    }}
                    icon={<PlusOutlined />}
                  >
                    新增專長
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default AdminDoctorPage;
