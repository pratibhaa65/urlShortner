import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { Mail, Lock, Eye, EyeOff, Loader2, X } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-2">

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        <div className="hidden sm:flex sm:w-1/2 bg-linear-to-br from-indigo-950 via-blue-900 to-indigo-950 text-white p-8 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-14 mt-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-3xl">U</span>
              </div>
              <span className="text-3xl font-bold font-baskerville">UrlShortener</span>
            </div>

            <div>
              <p className="text-blue-100 text-sm leading-relaxed font-nunito">
                Access your shortened URLs, track analytics, and manage your links efficiently. Sign in to continue your URL shortening journey.
              </p>
            </div>
          </div>

          <div className="text-blue-200 text-sm">
            <p>© 2026 UrlShortener</p>
          </div>
        </div>

        <div className="w-full sm:w-1/2 flex flex-col justify-between p-8">
          <div className="w-full flex-1 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
              <p className="text-gray-600 text-sm">Login to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-start">
                <X className="w-4 h-4 mr-2" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) setValidationErrors({ ...validationErrors, email: "" });
                    }}
                    placeholder="user@gmail.com"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition focus:outline-none ${validationErrors.email
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-700"
                      }`}
                  />
                </div>
                {validationErrors.email && (
                  <div className="flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    <p className="mt-2 text-sm text-red-600">✕ {validationErrors.email}</p>
                  </div>
                )}
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-800">Password</label>
                  <Link
                    to="#"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) setValidationErrors({ ...validationErrors, password: "" });
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg transition focus:outline-none ${validationErrors.password
                      ? "border-red-300 bg-red-50 focus:border-red-600"
                      : "border-gray-300 focus:border-blue-700"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-700">✕ {validationErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Secure Login"
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-800 font-semibold hover:text-blue-600 transition">
                Sign up
              </Link>
            </p>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}