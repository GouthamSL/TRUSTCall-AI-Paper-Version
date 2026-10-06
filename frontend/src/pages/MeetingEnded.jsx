import { useState } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
function MeetingEnded() {
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const handleSubmit = () => {
  if (rating === 0) {
    alert("Please select a star rating.");
    return;
  }

  const feedbackData = {
    meetingId: "TC-8453AB",
    duration: "00:45:28",
    rating,
    feedback,
  };

  console.log(feedbackData);

  alert("Thank you for your feedback!");

  navigate("/select-role");
};

  return (
  <div className="min-h-screen bg-[#0B0F19] flex justify-center items-center">
    <div className="w-full max-w-3xl bg-[#161B22] rounded-2xl shadow-2xl border border-gray-700 p-10">
        <h1 className="text-4xl font-bold text-center text-cyan-400">
    TRUSTCall AI
</h1>

<p className="text-center text-gray-400 mt-2">
    AI Powered Secure Interview Platform
</p>

<div className="flex justify-center mt-8">

<FaCheckCircle
className="text-green-500 text-7xl"/>

</div>
<h2 className="text-center text-white text-4xl font-bold mt-5">
Interview Ended
</h2>

<p className="text-center text-gray-400 mt-3">
Thank you for attending your interview.
</p>
{/* Meeting Details */}
<div className="mt-10 bg-[#111827] border border-gray-700 rounded-xl p-6">

  <div className="flex justify-between items-center border-b border-gray-700 pb-4">
    <span className="text-gray-400">Meeting ID</span>
    <span className="text-white font-semibold">TC-8453AB</span>
  </div>

  <div className="flex justify-between items-center pt-4">
    <span className="text-gray-400">Duration</span>
    <span className="text-white font-semibold">00:45:28</span>
  </div>
  
</div>
<h3 className="text-center text-white text-2xl font-semibold mt-10">
    Rate Your Interview Experience
</h3>
<div className="flex justify-center gap-3 mt-6">
  {[1, 2, 3, 4, 5].map((star) => (
    <FaStar
      key={star}
      size={40}
      className={`cursor-pointer transition-all duration-200 ${
        star <= (hover || rating)
          ? "text-yellow-400 scale-110"
          : "text-gray-500"
      }`}
      onClick={() => setRating(star)}
      onMouseEnter={() => setHover(star)}
      onMouseLeave={() => setHover(0)}
    />
  ))}
  <p className="text-center text-gray-400 mt-4">
  {rating === 0 && "Select your rating"}

  {rating === 1 && "⭐ Very Poor"}

  {rating === 2 && "⭐⭐ Poor"}

  {rating === 3 && "⭐⭐⭐ Average"}

  {rating === 4 && "⭐⭐⭐⭐ Good"}

  {rating === 5 && "⭐⭐⭐⭐⭐ Excellent"}
</p>
</div>
<textarea
    placeholder="Share your interview experience..."
    rows="4"
    className="w-full mt-8 bg-[#111827] border border-gray-700 rounded-xl p-4 text-white resize-none focus:outline-none"
/>
<div className="flex gap-4 mt-6">
  <button
    onClick={handleSubmit}
    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
  >
    Submit Feedback
  </button>

  <button
    onClick={() => navigate("/select-role")}
    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
  >
    Back to Role Selection
  </button>
</div>
</div>

  </div>
);
}

export default MeetingEnded;