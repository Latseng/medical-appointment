import useRWD from "../hooks/useRWD";
import Sidebar from "../components/Sidebar";
import { Layout, Button, Input, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSpecialties } from "../api/specialties";

const { Content } = Layout;
const { Search } = Input;
const gridStyle = {
  width: "25%",
  textAlign: "center",
};

const DepartmentPage = () => {
  const navigate = useNavigate();
  const isDesktop = useRWD();
  const [departments, setDepartments] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const warning = (value) => {
    messageApi.open({
      type: "warning",
      content: value,
    });
  };

  const getSpecialtiesAsnc = async () => {
    try {
      const specialties = await getSpecialties();

      setDepartments(specialties);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!searchValue) {
      getSpecialtiesAsnc();
    }
  }, [searchValue]);

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

  const handleClickSpecialties = (specialty) => {
    navigate("/departments/schedule", { state: { specialty: specialty } });
  };
  const handleSearch = (value, _, { source }) => {
    if (source === "clear") return;
    const filteredData = value.trim();
    if (filteredData.length === 0) return warning("請輸入有效關鍵字");
    const resultData = departments
      .filter((item) => {
        return item.specialties.some((specialty) =>
          specialty.includes(filteredData)
        );
      })
      .map((item) => {
        const newSpecialties = item.specialties.filter((special) =>
          special.includes(filteredData)
        );
        return { ...item, specialties: newSpecialties };
      });

    if (resultData.length === 0) return warning("查無此科別");

    setDepartments(resultData);
  };
  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <Layout className="min-h-screen">
      <Sidebar onClickPage={handleClickPage} onClickLogo={handleClickLogo} />
      <Content className="bg-gray-100 p-6">
        {isDesktop && (
          <button className="absolute right-8 top-4" onClick={handleClickLogin}>
            登入
          </button>
        )}
        <h1 className="text-2xl mb-4">門診科別</h1>
        {contextHolder}
        <div className="flex mb-4">
          <Search
            placeholder="搜尋科別"
            onSearch={handleSearch}
            onChange={(event) => handleChange(event)}
            allowClear
            style={{
              width: 200,
            }}
          />
        </div>

        {departments.map((s) => (
          <Card className="my-4" key={s.category} title={s.category}>
            {s.specialties.map((s) => (
              <Card.Grid key={s} style={gridStyle}>
                <Button onClick={() => handleClickSpecialties(s)}>{s}</Button>
              </Card.Grid>
            ))}
          </Card>
        ))}
      </Content>
    </Layout>
  );
};

export default DepartmentPage;
