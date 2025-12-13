"use client";

import { useState, forwardRef } from "react";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  showStrength?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      name,
      label,
      placeholder,
      value,
      onChange,
      error,
      required = true,
      showStrength = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onChange) {
        onChange(e);
      }

      if (showStrength) {
        calculatePasswordStrength(newValue);
      }
    };

    const calculatePasswordStrength = (password: string) => {
      let strength = 0;

      // Check for minimum length
      if (password.length >= 8) strength += 20;

      // Check for uppercase
      if (/[A-Z]/.test(password)) strength += 20;

      // Check for lowercase
      if (/[a-z]/.test(password)) strength += 20;

      // Check for numbers
      if (/[0-9]/.test(password)) strength += 20;

      // Check for special characters
      if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

      setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
      if (passwordStrength === 0) return "bg-gray-200";
      if (passwordStrength <= 40) return "bg-red-500";
      if (passwordStrength <= 60) return "bg-yellow-500";
      if (passwordStrength <= 80) return "bg-blue-500";
      return "bg-green-500";
    };

    const getStrengthText = () => {
      if (passwordStrength === 0) return "";
      if (passwordStrength <= 40) return "Weak";
      if (passwordStrength <= 60) return "Fair";
      if (passwordStrength <= 80) return "Good";
      return "Strong";
    };

    return (
      <div className="form-control">
        <label className="label py-1" htmlFor={id}>
          <span className="label-text font-semibold">{label}</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaKey className="text-base-content/50" />
          </div>
          <input
            id={id}
            ref={ref}
            type={showPassword ? "text" : "password"}
            name={name}
            className={`input input-bordered w-full pl-10 pr-12 h-10 sm:h-12 ${
              error ? "input-error" : ""
            }`}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            {...props}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
            ) : (
              <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
            )}
          </button>
        </div>

        {showStrength && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-base-content/70">
                Password strength:
              </span>
              <span className="text-xs font-medium">{getStrengthText()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStrengthColor()}`}
                style={{ width: `${passwordStrength}%` }}
              ></div>
            </div>
            <label className="label py-1">
              <span className="label-text-alt text-xs text-base-content/60 leading-tight">
                Must be 8+ characters with uppercase, lowercase, number, &
                special character
              </span>
            </label>
          </div>
        )}

        {error && (
          <label className="label py-1">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
