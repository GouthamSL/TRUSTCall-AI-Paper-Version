import AuthLayout from "../layouts/AuthLayout";
import LeftPanel from "../components/auth/LeftPanel";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <AuthLayout
      leftContent={<LeftPanel />}
      rightContent={<LoginForm />}
    />
  );
}

export default Login;