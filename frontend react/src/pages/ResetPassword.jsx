import { useState, useEffect, KeyboardEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { LuSend } from "react-icons/lu";
import { Toaster, toast } from "react-hot-toast";
import gif from "./assets/images/screenshots/UniPath.jpeg";
import { serverlink } from "./utils/constant";

const ResetPassword = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;

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
                    email: email,
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

    const handleResetPassword = async () => {
        setError(""); // Clear previous errors
        setLoading(true);

        const enteredOtp = otp.join("");

        if (!enteredOtp || enteredOtp.length < 6) {
            setError("Please enter the complete 6-digit OTP.");
            setLoading(false);
            return;
        }

        if (!password || !confirmPassword) {
            setError("Please enter both password and confirm password.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (!email) {
            setError("Email not found. Please try logging in again.");
            setLoading(false);
            return;
        }

        try {
            fetch(`${serverlink}/resetpasswordverify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    otp: enteredOtp,
                    email: email,
                    password: password,
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(otp.join(""), localStorage.getItem("email"),);
                    console.log('Success:', data);
                    if (data.success) {
                        toast.success("OTP verified successfully.");
                        localStorage.removeItem("email"); // Clear email from local storage
                        setError("");
                        setTimeout(() => {
                            window.location.href = "/signin";
                        }, 2000);
                    } else {
                        setError(data.errors || "Failed to reset password. Please try again.");
                    }
                }).catch(error => {
                    console.error('out of service.. ~_~  @_@', error);
                });
        } catch (err) {
            console.error(err);
            setError("An error occurred while resetting the password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);


    if (loading) {
        return (
            <div className="w-full h-[100vh] flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-screen lg:flex-row">
            <Toaster />
            <div className="relative hidden lg:block lg:w-3/5">
                <img src={gif} className="object-contain w-full h-full p-20 " alt="Cover Photo" />
            </div>

            <div className="flex items-center justify-center flex-grow p-6 bg-white rounded-l-3xl">
                <div className="w-full max-w-md">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                        <p className="text-sm text-center text-gray-600">
                            Enter the 6-digit code sent to your email and reset your password.
                        </p>

                        {<p className="h-2 text-sm font-semibold text-center text-red-500">{error}</p>}

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

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block mb-1 text-sm font-semibold">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 flex items-center text-gray-500 right-3"
                                >
                                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-semibold">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 flex items-center text-gray-500 right-3"
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Resend OTP Button */}
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

                        {/* Reset Password Button */}
                        <div>
                            <button
                                className={`flex w-full justify-center items-center py-3 px-4 rounded-full gap-2 text-white font-bold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
                                    }`}
                                onClick={handleResetPassword}
                                disabled={loading}
                            >
                                <HiOutlineMail className="w-5 h-5" />
                                <span>{loading ? "Resetting..." : "Reset Password"}</span>
                            </button>
                        </div>

                        {/* Back to signin */}
                        <div className="text-center text-md">
                            <span>Entered the wrong email?</span>{" "}
                            <a href="/signin">
                                <span className="font-bold text-primary">Go back to Sign In page</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ResetPassword;
