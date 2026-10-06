import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

function ForgotPasswordForm({
  email,
  setEmail,
  handleResetLink,
}) {
  return (
    <div className="w-full max-w-md">

      {/* Heading */}

      <h1 className="text-5xl font-bold text-gray-900 mb-2">
        Forgot Password?
      </h1>

      <p className="text-gray-500 text-lg mb-10">
        Enter your email address and we'll send you a password reset link.
      </p>

      {/* Email */}

      <div className="mb-8">

        <label className="block text-sm font-semibold mb-2">
          Email Address
        </label>

        <div className="flex items-center border border-gray-300 rounded-xl px-4 py-4 hover:border-purple-500 transition">

          <FaEnvelope className="text-gray-400 mr-3 text-lg" />

          <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  className="..."
   />
        </div>

      </div>

      {/* Button */}

      <button onClick={handleResetLink}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition duration-300 shadow-lg"
      >
        Send Reset Link
      </button>

      {/* Back to Login */}

      <p className="text-center mt-8 text-gray-600">

        Remember your password?

        <Link
          to="/"
          className="text-purple-600 font-semibold ml-2 hover:underline"
        >
          Back to Login
        </Link>

      </p>

    </div>
  );
}

export default ForgotPasswordForm;