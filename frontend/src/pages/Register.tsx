import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): { valid: boolean; issues: string[] } => {
    const issues = [];
    if (password.length < 8) issues.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) issues.push("One uppercase letter");
    if (!/[a-z]/.test(password)) issues.push("One lowercase letter");
    if (!/[0-9]/.test(password)) issues.push("One number");
    return { valid: issues.length === 0, issues };
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else {
      const validation = validatePassword(password);
      if (!validation.valid) {
        errors.password = `Password must have: ${validation.issues.join(", ")}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Create Account</h1>
            <p className="text-center text-gray-600">Join us to shorten your URLs</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
              <span className="mr-3">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) setValidationErrors({ ...validationErrors, email: "" });
                }}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border-2 rounded-lg transition focus:outline-none ${
                  validationErrors.email
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">✕</span> {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors({ ...validationErrors, password: "" });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition focus:outline-none ${
                    validationErrors.password
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">✕</span> {validationErrors.password}
                </p>
              )}

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-600">Password strength:</div>
                  <div className="grid grid-cols-4 gap-1">
                    <div
                      className={`h-1 rounded-full transition ${
                        password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`h-1 rounded-full transition ${
                        /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`h-1 rounded-full transition ${
                        /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`h-1 rounded-full transition ${
                        /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {passwordValidation.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className="mr-1">{passwordValidation.valid ? "✓" : "○"}</span>
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⌛</span> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-600 text-xs mt-4">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}