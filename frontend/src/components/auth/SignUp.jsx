import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import AnimatedBackground from "../ui/AnimatedBackground";
import { ALLOWED_DOMAINS } from "../../utils/constants";

const ROLES = ["student", "faculty", "staff"];

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    course: "",
    semester: "",
    section: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email) e.email = "Required";
    else if (!ALLOWED_DOMAINS.some((d) => form.email.endsWith("@" + d)))
      e.email = "Only @gehu.ac.in or @geu.ac.in";
    if (!form.password || form.password.length < 6)
      e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        course: form.course,
        semester: form.semester ? parseInt(form.semester) : 0,
        section: form.section,
      });
      toast.success("Account created! Welcome to UniPath 🗺️");
      navigate("/map");
    } catch (err) {
      toast.error(err.message || "Registration failed");
      setErrors({ general: err.message });
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}
          >
            <img src="/logo.png" alt="UniPath Logo" className="w-20 h-18" />
            {/* <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg> */}
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">UniPath</h1>
          <p className="text-gray-400 text-sm mt-1">Create your GEHU account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white" : "bg-white/10 text-gray-500"}`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`w-12 h-0.5 transition-all ${step >= 2 ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="glass p-8">
          {errors.general && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Account Details
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">
                      First Name
                    </label>
                    <input
                      id="reg-firstname"
                      type="text"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      placeholder="John"
                      className={`input-field ${errors.firstName ? "border-red-500/60" : ""}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">
                      Last Name
                    </label>
                    <input
                      id="reg-lastname"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      placeholder="Doe"
                      className={`input-field ${errors.lastName ? "border-red-500/60" : ""}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    University Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="yourname@gehu.ac.in"
                    className={`input-field ${errors.email ? "border-red-500/60" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Role
                  </label>
                  <select
                    id="reg-role"
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className="input-field"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min 6 characters"
                      className={`input-field pr-12 ${errors.password ? "border-red-500/60" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="reg-confirm"
                    type={showPass ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className={`input-field ${errors.confirmPassword ? "border-red-500/60" : ""}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={handleStep1}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2 mt-2"
                >
                  Next →
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Academic Details{" "}
                  <span className="text-sm text-gray-500 font-normal">
                    (Optional)
                  </span>
                </h2>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Course / Program
                  </label>
                  <input
                    id="reg-course"
                    type="text"
                    value={form.course}
                    onChange={(e) => set("course", e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">
                      Semester
                    </label>
                    <select
                      id="reg-semester"
                      value={form.semester}
                      onChange={(e) => set("semester", e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">
                      Section
                    </label>
                    <input
                      id="reg-section"
                      type="text"
                      value={form.section}
                      onChange={(e) =>
                        set("section", e.target.value.toUpperCase())
                      }
                      placeholder="A / B / C"
                      className="input-field"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1 h-12"
                  >
                    ← Back
                  </button>
                  <motion.button
                    id="reg-submit"
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex-1 h-12 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "🚀 Create Account"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Graphic Era Hill University, Dehradun
        </p>
      </motion.div>
    </div>
  );
}
