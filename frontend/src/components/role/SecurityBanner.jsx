import { FaShieldAlt, FaLock } from "react-icons/fa";

function SecurityBanner() {
  return (
    <div className="max-w-6xl mx-auto mt-16 bg-white rounded-2xl shadow-lg border border-purple-100 p-6">

      <div className="flex flex-col md:flex-row items-center justify-between">

        {/* Left Side */}
        <div className="flex items-center gap-5">

          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
            <FaShieldAlt className="text-purple-600 text-3xl" />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-gray-800">
              Your Security, Our Priority
            </h2>

            <p className="text-gray-500 mt-2">
              All communications are end-to-end encrypted and AI analysis
              is performed locally to ensure maximum privacy.
            </p>

          </div>

        </div>

        {/* Right Side */}
        <div className="mt-6 md:mt-0">

          <div className="flex items-center gap-2 bg-purple-50 px-5 py-3 rounded-full">

            <FaLock className="text-purple-600" />

            <span className="font-semibold text-purple-700">
              Secure & Private
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SecurityBanner;