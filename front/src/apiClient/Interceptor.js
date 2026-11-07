import axios from "axios"
const ApiClient = axios.create({
    baseURL:" https://college-event-mangagement.onrender.com/api",
    withCredentials:true
})
export default ApiClient;