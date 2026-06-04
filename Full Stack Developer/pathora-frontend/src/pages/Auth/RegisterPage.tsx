import AuthLayout from "../../components/layout/AuthLayout.tsx";
import RegisterForm from "../../components/auth/RegisterForm.tsx";
import { useAuth } from "../../hooks/useAuth.ts";

const RegisterPage = () => {
    const { register, isSubmitting, error } = useAuth();

    return (
        <AuthLayout title="Register" subtitle="Please enter your details to sign up your account">
            <RegisterForm onSubmit={register} isSubmitting={isSubmitting} error={error} />
        </AuthLayout>
    );
};

export default RegisterPage;