import axios from "axios";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

const apiUrl=import.meta.env.VITE_KEY;

function App() {
  axios.defaults.baseURL = `${apiUrl}`;
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  );
}

export default App;
