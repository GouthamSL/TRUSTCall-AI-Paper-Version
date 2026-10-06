import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

import { auth } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

function SignupForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const provider = new GoogleAuthProvider();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please create a password.");
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    if (!termsAccepted) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: fullName,
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: fullName,
          email,
        })
      );

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          alert("Email already exists.");
          break;

        case "auth/weak-password":
          alert("Password should be at least 6 characters.");
          break;

        case "auth/invalid-email":
          alert("Invalid email.");
          break;

        default:
          alert(error.message);
      }
    }
  };

  const handleGoogleSignup = async () => {
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
      console.error(error);
      alert("Google Sign-Up Failed");
    }
  };

  return (
    <div className="w-full max-w-md">

      <h1 className="text-5xl font-bold text-gray-900 mb-2">
        Create Account
      </h1>

      <p className="text-gray-500 text-lg mb-10">
        Start your journey with TrustCall AI
      </p>

      <form onSubmit={handleSignup}>

        {/* Full Name */}
        <div className="mb-5">

          <label className="block text-sm font-semibold mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

            <FaUser className="text-gray-400 mr-3 text-lg" />

            <input
              type="text"
              name="signup-full-name-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="off"
              required
              spellCheck="false"
              className="w-full outline-none"
            />

          </div>

        </div>

        {/* Email */}
        <div className="mb-5">

          <label className="block text-sm font-semibold mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

            <FaEnvelope className="text-gray-400 mr-3 text-lg" />

            <input
              type="email"
              name="signup-email-field"
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
        <div className="mb-5">

          <label className="block text-sm font-semibold mb-2">
            Password <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

            <FaLock className="text-gray-400 mr-3 text-lg" />

            <input
              type={showPassword ? "text" : "password"}
              name="signup-password-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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

        {/* Confirm Password */}
        <div className="mb-5">

          <label className="block text-sm font-semibold mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

            <FaLock className="text-gray-400 mr-3 text-lg" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="signup-confirm-password-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              className="w-full outline-none"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="text-gray-400 hover:text-purple-600"
            >
              {showConfirmPassword ? (
                <IoEyeOffOutline size={22} />
              ) : (
                <IoEyeOutline size={22} />
              )}
            </button>

          </div>

        </div>

        <p className="text-sm text-gray-500 mb-5">
          Minimum 6 characters.
        </p>

        {/* Terms */}
        <div className="flex items-start gap-2 mb-8">

          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            className="accent-purple-600 mt-1"
          />

          <span className="text-sm text-gray-600">
            I agree to the
            <span className="text-purple-600">
              {" "}Terms of Service{" "}
            </span>
            and
            <span className="text-purple-600">
              {" "}Privacy Policy
            </span>
          </span>

        </div>

        {/* Create Account */}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition duration-300 shadow-lg"
        >
          Create Account
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
        onClick={handleGoogleSignup}
        className="w-full border border-gray-300 rounded-xl py-4 flex items-center justify-center gap-3 hover:bg-gray-100 transition duration-300"
      >

        <FcGoogle className="text-2xl" />

        <span className="font-medium text-gray-700">
          Sign up with Google
        </span>

      </button>

      {/* Login */}
      <p className="text-center mt-8 text-gray-600">

        Already have an account?

        <Link
          to="/login"
          className="text-purple-600 font-semibold ml-2 hover:underline"
        >
          Log In
        </Link>

      </p>

    </div>
  );
}

export default SignupForm;