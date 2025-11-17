import { KeyboardEvent, useEffect, useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { LuSend } from "react-icons/lu";
import { Toaster, toast } from "react-hot-toast";
import Loader from "./components/Loader";
import logo from "./assets/images/logo.png";
import gif from "./assets/images/screenshots/UniPath.jpeg";
import { serverlink } from "./utils/constant";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(0); // Timer for the countdown

  useEffect(() => {
    let interval = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);
  // Fetch email from local storage
  const email = localStorage.getItem("email");

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Ensure only one digit
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  const handleResendOTP = async () => {
    setError(""); // Clear previous errors
    setLoading(true);

    if (!email) {
      setError("Email not found. Please try logging in again.");
      setLoading(false);
      return;
    }

    try {
      fetch(`${serverlink}/resendotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: localStorage.getItem("email"),
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          if (data.success) {
            setError("");
            toast.success("OTP Resent successfully.");
            setTimer(300); // Start 5-minute timer (300 seconds)
          } else {
            setError(data.errors || "Failed to resend OTP. Please try again.");
            setTimer(20);
          }
        }).catch(error => {
          console.error('out of service.. ~_~  @_@', error);
        });
    } catch (err) {
      console.error(err);
      setError("An error occurred while resending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError(""); // Clear previous errors
    setLoading(true);

    const enteredOtp = otp.join("");

    if (!enteredOtp || enteredOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email not found. Please try logging in again.");
      setLoading(false);
      return;
    }

    try {
      fetch(`${serverlink}/verifyotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: otp.join(""),
          email: localStorage.getItem("email"),
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log(otp.join(""), localStorage.getItem("email"),);
          console.log('Success:', data);
          if (data.success) {
            toast.success("OTP verified successfully.");
            setError("");
            localStorage.removeItem("email"); // Clear email from local storage
            setTimeout(() => {
              window.location.href = "/signin";
            }, 2000);
          } else {
            setError(data.errors || "Failed to verify OTP. Re-Check you OTP.");
          }
        }).catch(error => {
          console.error('out of service.. ~_~  @_@', error);
        });

    } catch (err) {
      console.error(err);
      setError("An error occurred while verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="w-full h-[100vh] flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen lg:flex-row">
      {/* Left Section - Image */}
      <Toaster />
      <div className="relative hidden lg:block lg:w-3/5">
        <img src={gif} className="object-contain w-full h-full p-20 " alt="Cover Photo" />
      </div>

      {/* Right Section - Form */}
      <div className="flex items-center justify-center flex-grow p-6 bg-white rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              onClick={() => window.location.replace("/")}
              className="w-40 h-40 hover:cursor-pointer"
              src={logo}
              alt=""
            />
          </div>

          {/* OTP Verification Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Email Verification</h2>
            <p className="text-sm text-center text-gray-600">
              Enter the 6-digit code sent to your email.
            </p>

            {<p className="h-4 text-sm font-semibold text-center text-red-500">{error}</p>}

            {/* OTP Input */}
            <div className="flex justify-between gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="text-lg font-medium text-center border border-gray-300 rounded-md w-14 h-14 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div>
              <button
                className={`flex w-full justify-center items-center border-2 border-primary hover:bg-primary-dark py-3 px-4 rounded-full gap-2 text-primary font-bold ${timer > 0 || loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                onClick={handleResendOTP}
                disabled={timer > 0 || loading}
              >
                <LuSend className="w-5 h-5" />
                <span>{timer > 0 ? `Resend in ${timer}s` : loading ? "Resending..." : "Resend OTP"}</span>
              </button>
            </div>


            {/* Verify Button */}
            <div>
              <button
                className={`flex w-full justify-center items-center py-3 px-4 rounded-full gap-2 text-white font-bold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
                  }`}
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                <HiOutlineMail className="w-5 h-5" />
                <span>{loading ? "Verifying..." : "Verify OTP"}</span>
              </button>
            </div>

            {/* Back to signup */}
            <div className="flex items-center justify-center gap-2 text-center cursor-pointer text-md">
              <span>Entered wrong email?</span>{" "}
              <div onClick={() => {
                localStorage.removeItem("email")
                window.location.href = "/signup"
              }}>
                <span className="font-bold text-primary">Go back to Sign Up</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Otp;
