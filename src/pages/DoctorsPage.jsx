import { Layout, List, message, Button, Input, Table, Avatar, Modal } from "antd";
import useRWD from "../hooks/useRWD";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { getDoctors } from "../api/doctors";

const { Content } = Layout;
const { Search } = Input;



const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = dayjs().add(i, "day");
    const formattedDate = `${date.format("M/D")}（${"日一二三四五六".charAt(
      date.day()
    )}）`;

    dates.push(formattedDate);
  }
  return dates;
};
const dates = generateDates();

const columns = [
  {
    title: "時間",
    dataIndex: "time",
    key: "time",
    fixed: "left",
  },
  ...dates.map((date, index) => ({
    title: date,
    dataIndex: `date${index}`,
    key: `date${index}`,
    // render: (_, record) => {
    //   const doctorSlot = record[`date${index}`];
    //   return doctorSlot.map(({ numOfPatients, isFull }, idx) => (
    //     <Button
    //       // onClick={() =>
    //       //   handleAppointment({ date: date, doctor: doctor, time: record.time })
    //       // }
    //       key={idx}
    //       type="link"
    //       disabled={isFull}
    //     >
    //       <br /> {isFull ? "額滿" : `掛號人數: ${numOfPatients}`}
    //     </Button>
    //   ));
    // },
  })),
];
const dataSource = [
  {
    key: "morning",
    time: "上午診",
    // ...doctorSchedule.morning,
  },
  {
    key: "afternoon",
    time: "下午診",
    // ...doctorSchedule.afternoon,
  },
];

const DoctorsPage = () => {
  const isDesktop = useRWD();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchValue, setSearchValue] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const getDoctorsData = async () => {
      try {
        setIsLoading(true)
        const response = await getDoctors()
        setDoctors(response.data)
        setIsLoading(false)
        
      } catch(error) {
        console.error(error);
        
      }
    }
     if (!searchValue) {
       getDoctorsData();
     }
   
  }, [searchValue])

  const data = doctors.map((d, i) => ({
    href: "https://ant.design",
    title: `${d.name} 醫師`,
    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
    description: d.specialty,
    content: `專長： ${JSON.parse(d.description).join('、')}`,
  }));

  const showDoctorInfo = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
  const handleClickLogin = () => {
    navigate("/login");
  };
  const warning = (value) => {
    messageApi.open({
      type: "warning",
      content: value,
    });
  }
  
  const handleSearch = (value, _, {source}) => {
    if(source === "clear") return;
    const filteredData = value.trim();
    if(filteredData.length === 0) return warning("請輸入有效關鍵字")
    const resultData = doctors.filter(
      (d) =>
        d.name.includes(filteredData) ||
        d.specialty.includes(filteredData) ||
        JSON.parse(d.description).some((item) => item.includes(filteredData))
    );
    if (resultData.length === 0) return warning("查無此醫師");
    setDoctors(resultData)
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };
  
  // const handleSearch = (value, _, { source }) => {
  //   if (source === "clear") return;
  //   const filteredData = value.trim();
  //   if (filteredData.length === 0) return warning("請輸入有效關鍵字");
  //   const resultData = schedules.filter((s) =>
  //     s.doctorName.includes(filteredData)
  //   );
  //   if (resultData.length === 0) return warning("查無此醫師");
  //   setSchedules(resultData);
  // };
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
        <h1 className="text-2xl mb-6">醫師專長查詢</h1>
        <Search
          className="mb-2"
          placeholder="醫師搜尋"
          allowClear
          onSearch={handleSearch}
          onChange={(event) => handleSearchChange(event)}
          style={{
            width: 200,
          }}
        />

        <List
          className="bg-white pb-4"
          itemLayout="vertical"
          size="large"
          loading={isLoading}
          pagination={{
            pageSize: 5,
          }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item className="relative" key={item.title}>
              <Avatar shape="square" size={64} src={item.avatar} />
              <div className="absolute left-24 top-10 flex flex-wrap items-center w-6/12">
                <h4 className="text-lg">{item.title}</h4>
                <p className="text-black text-base mx-8">{item.description}</p>
              </div>
              <Button
                className="absolute right-8 top-8"
                onClick={() => showDoctorInfo(item)}
              >
                詳細資訊
              </Button>
            </List.Item>
          )}
        />
        {selectedDoctor && (
          <Modal open={isModalOpen} onCancel={handleCancel} footer={null}>
            <div className="p-4">
              <h2 className="text-2xl">{selectedDoctor.title}</h2>
              <Avatar
                shape="square"
                size={100}
                src={selectedDoctor.avatar}
                alt={`${selectedDoctor.title}照片`}
                style={{ width: "100px", marginBottom: "10px" }}
              />
              <div className="my-4 text-base">
                <p>科別： {selectedDoctor.description}</p>
                <p>{selectedDoctor.content}</p>
              </div>
              <h4 className="text-lg my-4">可看診時間:</h4>
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                />
                {/* <ul>
                {selectedDoctor.availableTimes.map((time, index) => (
                  <li key={index}>{time}</li>
                ))}
              </ul> */}
              </div>
            </div>
          </Modal>
        )}
      </Content>
    </Layout>
  );
};

export default DoctorsPage;
