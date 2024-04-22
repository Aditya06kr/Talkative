import React, { useContext } from "react";
import RegisterOrLogin from "./components/RegisterOrLogin";
import Chat from "./components/Chat";
import { UserContext } from "./UserContext";

const Routes = () => {
  const {userInfo} = useContext(UserContext);
  const username = userInfo?.username;
  if (username) {
    console.log("Login Done");
    return <Chat />;
  } else {
    return <RegisterOrLogin />;
  }
};

export default Routes;
