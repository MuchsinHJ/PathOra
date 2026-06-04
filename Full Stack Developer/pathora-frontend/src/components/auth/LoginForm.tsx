import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormInput } from "../../utils/validation.ts";
import Input from "../ui/Input/Input.tsx";
import Button from "../ui/Button/Button.tsx";

interface LoginFormProps {
    onSubmit: (data: LoginFormInput) => void;
    isSubmitting: boolean;
    error: string | null;
}

const LoginForm = ({ onSubmit, isSubmitting, error }: LoginFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInput>({
        resolver: zodResolver(loginSchema),
    });

    return (
        <>
            {/* Global Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Input Email */}
                <Input
                    type="email"
                    id="email"
                    label="EMAIL"
                    placeholder="Enter Your Email"
                    className={`focus:ring-blue-500 ${
                        errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                    }`}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs -mt-3 mb-2">{errors.email.message}</p>
                )}

                {/* Input Password */}
                <Input
                    type="password"
                    id="password"
                    label="PASSWORD"
                    placeholder="••••••••"
                    className={`focus:ring-blue-500 ${
                        errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                    }`}
                    {...register("password")}
                />
                {errors.password && (
                    <p className="text-red-500 text-xs -mt-3 mb-2">{errors.password.message}</p>
                )}

                <div className="pt-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                         className="w-full bg-black text-white hover:bg-gray-800 py-2"
                        color="primary"
                    >
                        {isSubmitting ? "Processing..." : "SIGN IN"}
                    </Button>
                </div>
            </form>

            <p className="text-center text-xs text-gray-600 mt-3">
                Don't Have an Account?{" "}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">
                    Sign Up Now
                </Link>
            </p>
        </>
    );
};

export default LoginForm;
