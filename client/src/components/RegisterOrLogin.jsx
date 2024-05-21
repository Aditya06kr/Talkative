import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterOrLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState(true);
  const { userInfo, setUserInfo } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await axios.post("/user" + (type ? "/register" : "/login"), {
      username,
      password,
    });
    if (res.status == 201) {
      toast.success(type ? "Registration Successfull" : "Login Successfull");
      setUserInfo(res);
    } else {
      toast.error(res.data);
    }
  }

  useEffect(() => {
    axios.get("/user/profile").then((res) => {
      setUserInfo(res.data);
    });
  }, [userInfo]);

  return (
    <>
      <div className="loginDesign flex justify-center w-full">
        <div className="container">
          <div className="top"></div>
          <div className="bottom"></div>
          <div className="center">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="inputBox"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="inputBox"
              />
              <div className="buttonDesign text-center">
                <div className="btn btn--svg js-animated-button">
                  <button className="btn--svg__label">
                    {type ? "Register" : "Login"}
                  </button>
                  <svg
                    width="190"
                    x="0px"
                    y="0px"
                    viewBox="0 0 60 60"
                    enableBackground="new 0 0 60 60"
                    className="btn--svg__circle"
                  >
                    <circle
                      fill="#5a65ca"
                      cx="30"
                      cy="30"
                      r="28.7"
                      className="js-discover-circle"
                    ></circle>
                  </svg>
                  <svg
                    x="0px"
                    y="0px"
                    preserveAspectRatio="none"
                    viewBox="2 29.3 56.9 13.4"
                    enableBackground="new 2 29.3 56.9 13.4"
                    width="190"
                    className="btn--svg__border"
                  >
                    <g
                      id="Calque_2"
                      class="btn--svg__border--left js-discover-left-border"
                    >
                      <path
                        fill="none"
                        stroke="#5a65ca"
                        strokeWidth="0.5"
                        strokeMiterlimit="1"
                        d="M30.4,41.9H9c0,0-6.2-0.3-6.2-5.9S9,30.1,9,30.1h21.4"
                      ></path>
                    </g>
                    <g
                      id="Calque_3"
                      class="btn--svg__border--right js-discover-right-border"
                    >
                      <path
                        fill="none"
                        stroke="#5a65ca"
                        strokeWidth="0.5"
                        strokeMiterlimit="1"
                        d="M30.4,41.9h21.5c0,0,6.1-0.4,6.1-5.9s-6-5.9-6-5.9H30.4"
                      ></path>
                    </g>
                  </svg>
                </div>
              </div>
              {type && (
                <div className="text-center">
                  <p>
                    Already a Member?{" "}
                    <button
                      onClick={(e) => setType(false)}
                      className="text-blue2"
                    >
                      Login
                    </button>
                  </p>
                </div>
              )}
              {!type && (
                <div className="text-center">
                  <p>
                    Not Registered Yet!{" "}
                    <button
                      onClick={(e) => setType(true)}
                      className="text-blue2"
                    >
                      Register
                    </button>
                  </p>
                </div>
              )}
              <h2>&nbsp;</h2>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterOrLogin;
