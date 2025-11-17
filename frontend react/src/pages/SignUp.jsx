import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import Loader from "./components/Loader";
import logo from "./assets/images/logo.png";
import gif from "./assets/images/screenshots/UniPath.jpeg";
import { serverlink } from "./utils/constant";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(""); // Clear error on input change
  };

  const validateForm = () => {
    const { firstname, lastname, email, password, confirmPassword, role } = formData;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gehu|geu)\.ac\.in$/;

    if (!firstname || !lastname || !email || !password || !confirmPassword || !role) {
      setError("All fields are required.");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid gehu/geu email ID.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    // Add more validations as needed
    return true;
  };
  const [sendbuttonfreeze, setSendButtonFreeze] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSendButtonFreeze(true);

    try {
      fetch(`${serverlink}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.firstname,
          last_name: formData.lastname,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        })
      })
        .then(response => response.json())
        .then(data => {
          // console.log('Success:', data);
          if (data.success) {
            setSendButtonFreeze(false);
            setError("");
            localStorage.setItem("email", formData.email);
            setSuccessMessage("User Created, Email not verified. OTP sent to your email.");
            toast.success(data.message);
            setTimeout(() => {
              window.location.href = "/otp";
            }, 2000);
          } else {
            setSendButtonFreeze(false);
            setSuccessMessage("");
            setError(data.errors || "Something went wrong.");
          }
        }).catch(error => {
          setSendButtonFreeze(false);
          console.error('out of service.. ~_~  @_@', error);
        });
    } catch (err) {
      setError("Failed to register. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col w-full h-screen lg:flex-row">
      <Toaster />
      {/* Left Section with cover photo */}
      <div className="relative hidden lg:block lg:w-3/5">
        <img src={gif} className="object-contain w-full h-full p-20 " alt="Cover Photo" />
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center flex-grow p-6 bg-white rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Register Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{"Register to UniPath™"}</h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-6">
              {/* First and Last Name */}
              <div className="flex flex-row lg:gap-4 ">
                <div className="">
                  <label
                    htmlFor="firstname"
                    className="block mb-1 text-sm font-semibold"
                  >
                    First Name
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    id="firstname"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </div>

                <div className="">
                  <label
                    htmlFor="lastname"
                    className="block mb-1 text-sm font-semibold"
                  >
                    Last Name
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    id="lastname"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-semibold"
                >
                  Email <span className="text-xs text-gray-500 ">{"gehu & geu email ID only"}</span>
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block mb-1 text-sm font-semibold"
                >
                  Role
                </label>
                <select
                  id="role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select your role</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-semibold"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 flex items-center text-gray-500 right-3"
                  >
                    {showPassword ?
                      <FaEyeSlash className="w-5 h-5" /> :
                      <FaEye className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-1 text-sm font-semibold"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 flex items-center text-gray-500 right-3"
                  >
                    {
                      showPassword ?
                        <FaEyeSlash className="w-5 h-5" /> :
                        <FaEye className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              <div className="h-2 my-2 font-semibold">
                {<p className="text-sm text-red-500">{error}</p>}
                {<p className="text-sm text-green-500">{successMessage}</p>}
              </div>

              {/* Buttons */}
              <button
                type="submit"
                disabled={sendbuttonfreeze}
                className={`flex w-full justify-center items-center py-3 px-4 rounded-full gap-2 text-white font-bold ${sendbuttonfreeze ? "cursor-not-allowed bg-gray-400" : "bg-primary hover:cursor-pointer hover:bg-primary-dark"}`}
              >
                <span>Sign Up</span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-md">
              <span>Already have an account?</span>{" "}
              <a href="/signin">
                <span className="font-bold text-primary">Sign In</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
