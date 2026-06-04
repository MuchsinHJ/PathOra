import styles from "./Button.module.css";

interface ButtonProps{
    children: string;
    type?: "button" | "submit" | "reset";
    className?: string;
    onClick?: () => void;
    color?: "primary" | "secondary" | "danger";
    disabled?: boolean;
}

const Button=(props: ButtonProps)=>{
    const {children, type="button", className, onClick, color, disabled} = props;
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[color || "primary"]} ${className || ""}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}{" "}
        </button>
    );
};

export default Button;