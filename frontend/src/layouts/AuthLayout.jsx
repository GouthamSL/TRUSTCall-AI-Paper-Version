function AuthLayout({ leftContent, rightContent }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section */}
      <div className="bg-gradient-to-br from-purple-700 to-indigo-900 text-white flex items-center justify-center p-12">
        {leftContent}
      </div>

      {/* Right Section */}
      <div className="bg-white flex items-center justify-center px-16 py-20">
        {rightContent}
      </div>
    </div>
  );
}

export default AuthLayout;