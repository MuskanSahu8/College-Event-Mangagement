import React ,{useState}from 'react'
import ApiClient from '../apiClient/Interceptor';
import { useNavigate, useParams } from 'react-router-dom';

const RegisterEvent = () => {
    const {id} = useParams();
    const navigate =useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        className: "",
        universityRollno: "",
        email: "",
        phone: "",
        dept: "",
    })
    const [loading, setLoading] = useState(false);
  
    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
    })
        }

    const registerHandle= async(e)=>{
            e.preventDefault();
        try{
            setLoading(true);
            const response=await ApiClient.post(`register/register/${id}`,formData);
            console.log("Registration:", response.data);
            alert("registered successfully");
            navigate("/");
        }catch(error){
            console.error(
        "Registration error:",
        error.response?.data?.message || error.message
      );

      alert(
        error.response?.data?.message ||
          "Registration failed"
      );
        }finally {
      setLoading(false);
    }
    }
    return (
        <div className='register-page'>
            <h1>Event Registration</h1>
            <form onSubmit={registerHandle}>
                <div>
                    <label>Name</label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </div>

     
                <div>
                    <label>Class</label>

                    <input
                        type="text"
                        name="className"
                        value={formData.className}
                        onChange={handleChange}
                        placeholder="Enter your class"
                    />
                </div>

                <div>
                    <label>University Roll Number</label>

                    <input
                        type="text"
                        name="universityRollno"
                        value={formData.universityRollno}
                        onChange={handleChange}
                        placeholder="Enter university roll number"
                    />
                </div>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label>Phone</label>

                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                    />
                </div>

                <div>
                    <label>Department</label>

                    <input
                        type="text"
                        name="dept"
                        value={formData.dept}
                        onChange={handleChange}
                        placeholder="Enter your department"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Registering...":"Register"}
                </button>

            </form>

        </div>
    )
}

export default RegisterEvent
