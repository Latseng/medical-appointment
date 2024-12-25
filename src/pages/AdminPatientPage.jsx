import { Layout, Table, Button } from "antd";
import { useState, useEffect } from "react";
import useRWD from "../hooks/useRWD";
import LoginButton from "../components/LoginButton";
import { getPatients } from "../api/patients";
import dayjs from "dayjs";

const { Content } = Layout;

const AdminPatientPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const isDesktop = useRWD();

  useEffect(() => {
    const getPatientDataAsync = async () => {
      try {
        const data = await getPatients()
        setPatients(data.data)
      } catch(error) {
        console.log(error);
      }
    }
    getPatientDataAsync();
  }, []);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "生日",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "聯絡方式",
      dataIndex: "contact",
      key: "contact",
    },
    {
      render: (_, record) => (
          <Button danger onClick={() => console.log("delete")}>
            刪除
          </Button>
      ),
    },
  ];

  const dataSource = patients.map((item) => ({
    key: item.id,
    id: item.id,
    name: item.name,
    age: dayjs(item.birthDate).format('YYYY-MM-DD'),
    contact: item.email
  }));

  return (
    <Content className="bg-gray-100 p-6">
      <h1 className="text-2xl mb-4">病患管理</h1>
      {isDesktop && <LoginButton />}
      <Table dataSource={dataSource} columns={columns} />
      {isLoading && <Table className="mt-12" loading={isLoading} />}
    </Content>
  );
}

export default AdminPatientPage;