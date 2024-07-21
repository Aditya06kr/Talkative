import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import RegisterOrLogin from "./components/RegisterOrLogin";
import Chat from "./components/Chat";
import { UserContext } from "./UserContext";
import Loader from "./components/Loader.jsx";

const Routes = () => {
  const {userInfo}=useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const res=await axios.get("/ping");
        console.log(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Server is not ready yet, retrying...");
        setTimeout(checkServerStatus, 5000);
      }
    };

    checkServerStatus();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const username = userInfo?.username;
  return username ? <Chat /> : <RegisterOrLogin />;
};

export default Routes;
