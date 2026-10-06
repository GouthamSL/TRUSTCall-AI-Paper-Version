import logo from "../../assets/logos/logo1.png";
import { FaShieldAlt } from "react-icons/fa";

function CandidateNavbar() {
  return (
    <nav className="bg-white shadow-sm px-8 py-3 flex justify-between items-center">

      <div className="flex items-center gap-3">

        <img
          src={logo}
          alt="TrustCall AI"
          className="w-12 h-12"
        />

        <h1 className="text-3xl font-bold">
          TrustCall <span className="text-purple-600">AI</span>
        </h1>

      </div>

      <div className="flex items-center gap-2 text-purple-600">

        <FaShieldAlt />

        <span className="font-medium">
          End-to-End Encrypted
        </span>

      </div>

    </nav>
  );
}

export default CandidateNavbar;