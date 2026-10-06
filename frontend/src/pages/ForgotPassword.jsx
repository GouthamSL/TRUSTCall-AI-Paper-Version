import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LeftPanel from "../components/auth/LeftPanel";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleResetLink = async () => {
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      alert("Password reset email has been sent.");

      navigate("/login");

    } catch (error) {
      console.log("Firebase Error:", error);
      console.log("Error Code:", error.code);
      console.log("Error Message:", error.message);

      alert(error.code + "\n" + error.message);

      switch (error.code) {
        case "auth/user-not-found":
          alert("No account found with this email.");
          break;

        case "auth/invalid-email":
          alert("Invalid email address.");
          break;

        default:
          alert(error.message);
      }
    }
  };

  return (
    <AuthLayout
      leftContent={<LeftPanel />}
      rightContent={
        <ForgotPasswordForm
          email={email}
          setEmail={setEmail}
          handleResetLink={handleResetLink}
        />
      }
    />
  );
}

export default ForgotPassword;