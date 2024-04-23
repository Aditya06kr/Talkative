import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContext";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const RegisterOrLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState(true);
  const { userInfo,setUserInfo } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await axios.post(type ? "/register" : "/login", {
      username,
      password,
    });
    if (res.status == 201) {
      toast.success((type) ? "Registration successfull" : "Login Successfull");
      setUserInfo(res);
    } else { 
      toast.error(res.data);
    }
  }

  useEffect(()=>{
    axios.get("/profile").then(res=>{
      setUserInfo(res.data);
    })
  },[userInfo]);

  return (
    <div className="bg-pink-100 h-screen flex items-center">
      <form className="w-80 mx-auto" onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="block w-full p-2 mb-5 rounded-md"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="block w-full p-2 mb-5 rounded-md"
        />
        <button
          type="submit"
          className="bg-pink-400 text-slate-100 w-full p-2 rounded-md"
        >
          {type ? "Register" : "Login"}
        </button>

        {type && (
          <div className="text-center mt-2">
            <p>
              Already a Member?{" "}
              <button onClick={(e) => setType(false)} className="text-pink-500">
                Login
              </button>
            </p>
          </div>
        )}
        {!type && (
          <div className="text-center mt-2">
            <p>
              Not Registered Yet!{" "}
              <button onClick={(e) => setType(true)} className="text-pink-500">
                Register
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterOrLogin;
