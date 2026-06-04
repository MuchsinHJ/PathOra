import AuthLayout from "../../components/layout/AuthLayout.tsx";
import LoginForm from "../../components/auth/LoginForm.tsx";
import { useAuth } from "../../hooks/useAuth.ts";

const LoginPage = () => {
    const { login, isSubmitting, error } = useAuth();

    return (
        <AuthLayout title="Login" subtitle="Please enter your details to sign in your account">
            <LoginForm onSubmit={login} isSubmitting={isSubmitting} error={error} />
        </AuthLayout>
    );
};

export default LoginPage;
