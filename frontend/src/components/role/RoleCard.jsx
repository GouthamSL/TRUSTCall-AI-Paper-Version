function RoleCard({
  icon,
  title,
  description,
  features,
  featureIcon,
  buttonText,
  buttonColor,
  onClick,
}) {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">

      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto text-purple-600 mb-6">
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-800">
        {title}
      </h2>

      {/* Description */}
      <p className="text-gray-500 text-center mt-4 mb-8">
        {description}
      </p>

      {/* Features */}
      <div className="space-y-2 mb-4">

        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
          >
            <span className="text-green-500 text-lg">
              {featureIcon}
            </span>

            <span className="text-gray-700">
              {feature}
            </span>
          </div>
        ))}

      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className={`w-full bg-gradient-to-r ${buttonColor} text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:scale-105 transition duration-300`}
      >
        {buttonText}
      </button>

    </div>
  );
}

export default RoleCard;