function WelcomeSection() {
  return (
    <div className="flex justify-between items-start">

      <div>

        <h1 className="text-5xl font-bold">
          Welcome,
          <span className="text-purple-600"> Candidate 👋</span>
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          You're all set! Please check your devices and join the interview.
        </p>

      </div>

      <div className="bg-white rounded-2xl shadow p-6 w-80">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-green-500"></div>

          <div>

            <h3 className="font-semibold">
              Waiting for Interviewer
            </h3>

            <p className="text-gray-500 text-sm">
              The interviewer will join shortly.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default WelcomeSection;