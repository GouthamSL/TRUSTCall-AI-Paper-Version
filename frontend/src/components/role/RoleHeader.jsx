import logo from "../../assets/logos/logo1.png";// your logo

function RoleHeader() {
  return (
    <div className="text-center mb-16">

      <img
        src={logo}
        alt="TrustCall AI"
        className="w-15 mx-auto mb-6"
      />

      <h1 className="text-4xl font-bold text-gray-900">
        Select Your Role
      </h1>

      <p className="text-gray-500 text-4xl mt-4">
        Choose how you want to continue with TrustCall AI
      </p>

    </div>
  );
}

export default RoleHeader;