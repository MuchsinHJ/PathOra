import { forwardRef } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, id, className, ...props }, ref) => {
        return (
            <div className={styles.inputWrapper}>
                {label && (
                    <label htmlFor={id} className={styles.label}>
                        {label}
                    </label>
                )}
                <input
                    id={id}
                    ref={ref}
                    className={`${styles.input} ${className || ""}`}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;