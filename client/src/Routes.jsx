import React, { useContext } from "react";
import RegisterOrLogin from "./components/RegisterOrLogin";
import Chat from "./Chat";
import { UserContext } from "./UserContext";

const Routes = () => {
  const {userInfo} = useContext(UserContext);
  const username = userInfo?.username;
//   console.log(username);
  if (username) {
    return <Chat />;
  } else {
    return <RegisterOrLogin />;
  }
};

export default Routes;
