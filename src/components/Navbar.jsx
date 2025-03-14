import { Layout, Button, Dropdown, Space } from "antd";
import useRWD from "../hooks/useRWD";
import { IoMenu } from "react-icons/io5";
import { FaSuitcaseMedical, FaCircleUser } from "react-icons/fa6";
import PropTypes from "prop-types";
import { logoutReqest } from "../api/auth";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const { Header } = Layout;

const Navbar = ({ handleClick, currentPage }) => {
  const isDesktop = useRWD();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = isAuthenticated
    ? [
        {
          label: <a className="text-mainColorLight">使用者資訊</a>,
          key: "0",
        },
        {
          label: (
            <a
              className="text-mainColorLight"
              onClick={() => handleClick("query")}
            >
              掛號查詢
            </a>
          ),
          key: "1",
        },
        {
          label: (
            <a
              className="text-mainColorLight"
              onClick={() => handleClick("doctors")}
            >
              醫師專長查詢
            </a>
          ),
          key: "2",
        },
        {
          label: (
            <a
              className="text-mainColorLight"
            >
              登出
            </a>
          ),
          key: "3",
        },
      ]
    : [
        {
          label: (
            <a
              className="text-mainColorLight"
              onClick={() => handleClick("query")}
            >
              掛號查詢
            </a>
          ),
          key: "0",
        },
        {
          label: (
            <a
              className="text-mainColorLight"
              onClick={() => handleClick("doctors")}
            >
              醫師專長查詢
            </a>
          ),
          key: "1",
        },
        {
          label: (
            <a
              className="text-mainColorLight"
              onClick={() => handleClick("login")}
            >
              登入
            </a>
          ),
          key: "2",
        },
      ];

 const handleLogout = async () => {
   const res = await logoutReqest();
   if (res.status === "success") {
     dispatch(setLogout());
   }
 };

  const dropdownItems = [
    {
      label: <a>使用者資訊</a>,
      key: "0",
    },
    {
      type: "divider",
    },
    {
      label: <button>登出</button>,
      key: "1",
    },
  ];
  
  return (
    <>
      {currentPage === "mainPage" ? (
        <Header className="w-screen flex justify-center md:grid md:grid-cols-12 md:gap-1 md:grid-rows-1  bg-mainColor px-8">
          <div className="flex items-center mx-auto text-white text-2xl col-start-6 col-end-9 md:col-start-1 md:col-end-3 row-span-1">
            <FaSuitcaseMedical className="mr-2 size-6" />
            <h1>MA</h1>
          </div>
          {isDesktop ? (
            <>
              <Button
                className="my-auto md:col-start-9 md:col-end-10 md:row-span-1"
                type="primary"
                size="large"
                onClick={() => handleClick("query")}
              >
                掛號查詢
              </Button>
              <Button
                className="my-auto md:col-start-10 md:col-end-12 md:row-span-1"
                type="primary"
                size="large"
                onClick={() => handleClick("doctors")}
              >
                醫師專長查詢
              </Button>
              {isAuthenticated ? (
                <Dropdown
                  menu={{
                    items: dropdownItems,
                    onClick: (items) => {
                      switch (items.key) {
                        case "0":
                          navigate("/user");
                          break;
                        case "1":
                          handleLogout();
                          break;
                        default:
                          break;
                      }
                    },
                  }}
                  trigger={["click"]}
                >
                  <Button
                    type="primary"
                    className="my-auto md:col-start-12 md:col-end-13 md:row-span-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    <FaCircleUser size={28} />
                  </Button>
                </Dropdown>
              ) : (
                <Button
                  className="my-auto md:col-start-12 md:col-end-13 md:row-span-1"
                  type="primary"
                  onClick={() => handleClick("login")}
                >
                  登入
                </Button>
              )}
            </>
          ) : (
            <Dropdown
              menu={{
                items,
                onClick: (items) => {
                  switch (items.key) {
                    case "0":
                      navigate("/user");
                      break;
                    case "3":
                      handleLogout();
                      break;
                    default:
                      break;
                  }
                },
              }}
              trigger={["click"]}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <button className="text-white">
                    <IoMenu className="size-8 mt-4" />
                  </button>
                </Space>
              </a>
            </Dropdown>
          )}
        </Header>
      ) : (
        <Header className="px-4 bg-mainColor grid grid-cols-5 grid-rows-1">
          <div className="flex items-center col-start-1 col-end-2">
            <button onClick={() => navigate("/")} className="text-white ">
              <FaHome className="size-6 md:size-8" />
            </button>
          </div>
          <div className="flex justify-center items-center col-start-3 col-end-4 text-white">
            <FaSuitcaseMedical className="mr-2 size-6" />
            <span className="text-xl md:text-2xl">MA</span>
          </div>
        </Header>
      )}
    </>
  );
};

Navbar.propTypes = {
  handleClick: PropTypes.func,
  currentPage: PropTypes.string,
};

export default Navbar;
