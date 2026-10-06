import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

import { auth } from "../../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const provider = new GoogleAuthProvider();

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.displayName || "User",
          email: user.email,
          photo: user.photoURL,
        })
      );

      navigate("/select-role");
    } catch (error) {
      console.log(error);

      switch (error.code) {
        case "auth/invalid-credential":
          alert("Incorrect email or password.");
          break;

        case "auth/user-not-found":
          alert("No account found with this email.");
          break;

        case "auth/wrong-password":
          alert("Incorrect password.");
          break;

        case "auth/invalid-email":
          alert("Invalid email address.");
          break;

        default:
          alert(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        })
      );

      navigate("/select-role");
    } catch (error) {
      console.error("Google Error:", error);
      alert(error.code + "\n" + error.message);
    }
  };

  return (
    <div className="w-full max-w-md">

      <h1 className="text-5xl font-bold text-gray-900 mb-2">
        Welcome Back
      </h1>

      <p className="text-gray-500 text-lg mb-10">
        Sign in to your TrustCall AI account
      </p>

      <form onSubmit={handleEmailLogin}>

        {/* Email */}
        <div className="mb-6">

          <label className="block text-sm font-semibold mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

            <FaEnvelope className="text-gray-400 mr-3 text-lg" />

            <input
              type="email"
              name="login-email-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
              required
              spellCheck="false"
              className="w-full outline-none"
            />

          </div>

        </div>

        {/* Password */}
        <div className="mb-6">

          <label className="block text-sm font-semibold mb-2">
            Password <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

            <FaLock className="text-gray-400 mr-3 text-lg" />

            <input
              type={showPassword ? "text" : "password"}
              name="login-password-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
              className="w-full outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-purple-600"
            >
              {showPassword ? (
                <IoEyeOffOutline size={22} />
              ) : (
                <IoEyeOutline size={22} />
              )}
            </button>

          </div>

        </div>

        {/* Remember Me / Forgot Password */}
        <div className="flex items-center justify-between mb-8">

          <label className="flex items-center gap-2 cursor-pointer">

            <input
              type="checkbox"
              className="accent-purple-600"
            />

            <span className="text-gray-600 text-sm">
              Remember Me
            </span>

          </label>

          <Link
            to="/forgot-password"
            className="text-purple-600 text-sm hover:underline"
          >
            Forgot Password?
          </Link>

        </div>

        {/* Login */}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition duration-300 shadow-lg"
        >
          Login
        </button>

      </form>

      {/* Divider */}
      <div className="flex items-center my-8">

        <hr className="flex-1 border-gray-300" />

        <span className="mx-4 text-gray-400 font-medium">
          OR
        </span>

        <hr className="flex-1 border-gray-300" />

      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full border border-gray-300 rounded-xl py-4 flex items-center justify-center gap-3 hover:bg-gray-100 transition duration-300"
      >

        <FaGoogle className="text-red-500 text-xl" />

        <span className="font-medium text-gray-700">
          Continue with Google
        </span>

      </button>

      {/* Signup */}
      <p className="text-center mt-8 text-gray-600">

        Don't have an account?

        <Link
          to="/signup"
          className="text-purple-600 font-semibold ml-2 hover:underline"
        >
          Sign Up
        </Link>

      </p>

    </div>
  );
}

export default LoginForm;