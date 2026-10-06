import { FaShieldAlt } from "react-icons/fa";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-purple-600 p-3 rounded-xl">
        <FaShieldAlt className="text-white text-2xl" />
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          TrustCall AI
        </h1>

        <p className="text-sm text-gray-300">
          Secure. Trusted. Intelligent.
        </p>
      </div>
    </div>
  );
}

export default Logo;