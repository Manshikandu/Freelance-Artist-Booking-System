import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api", // or your backend URL
  withCredentials: true, // to send cookies
});

export default instance;
