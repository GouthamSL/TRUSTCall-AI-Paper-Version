import AuthLayout from "../layouts/AuthLayout";
import LeftPanel from "../components/auth/LeftPanel";
import SignupForm from "../components/auth/SignupForm";

function Signup() {
  return (
    <AuthLayout
      leftContent={<LeftPanel />}
      rightContent={<SignupForm />}
    />
  );
}

export default Signup;