import bcrypt from "bcrypt";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
    try {
        //fetch
        const { name, email, password, role } = req.body;
        //validation
        if (!name || !email || !password || !role) {
              return res.status(400).json({
             message: "All fields are required"
    });
        }
        //check role
        if( !["student" ,"organizer"].includes(role)){
              return res.status(400).json({
                message: "Invalid role"
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }
        //hashed password
        const hashedPass = await bcrypt.hash(password, 10);
        //create object
        const user = await User.create({
            name,
            email,
            role:role || "student",
            password: hashedPass
        })
        console.log("signup successfully");
        res.status(201).json({
            message: "signup",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role,
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
}

const signin = async (req, res) => {
    try {
        //fetch
        const { email, password } = req.body;
        //validate
        if (!email || !password) {
            console.log("all fields are require");
        }
        //check email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("email not found");
        }
        console.log("ENTER PASS", password);
        console.log("STORED PASS", user.password);
        //compare password
        const matchPass = await bcrypt.compare(password, user.password)
        console.log("PASSWORD MATCH:", matchPass);
        if (!matchPass) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }
        //sucessful login generate token
        const token = jwt.sign({
            id: user._id,
            email: user.email,
        },
            process.env.SECRET_KEY,
            {
                expiresIn: "1d"
            }
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })
        console.log("signin successfully");
        res.status(201).json({
            message: "signin",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role,
                token,
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
}
const logout = async (req, res) => {
    try {
        // await User.findByIdAndDelete
        res.clearCookie("token");
        res.status(200).json({
            message: "logout successfully",
        })

    } catch (error) {
        res.status(500).json({
            message: "logout failure",
            error: error.message,
        })

    }
}
//to check cookie 

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      message: "user fetched successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export { signup, signin ,logout,getMe};