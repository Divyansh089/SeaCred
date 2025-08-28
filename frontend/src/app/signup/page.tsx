"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Leaf, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import MetaMaskConnect from "@/components/ui/MetaMaskConnect";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "project_authority" as "project_authority",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const { signup } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength when password changes
    if (name === "password") {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = "";

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    if (score === 0) feedback = "Very weak";
    else if (score === 1) feedback = "Weak";
    else if (score === 2) feedback = "Fair";
    else if (score === 3) feedback = "Good";
    else if (score === 4) feedback = "Strong";
    else feedback = "Very strong";

    return { score, feedback };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Enhanced validation
    if (!formData.name.trim()) {
      addNotification({
        type: "error",
        title: "Name required",
        message: "Please enter your full name.",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      addNotification({
        type: "error",
        title: "Email required",
        message: "Please enter your email address.",
      });
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addNotification({
        type: "error",
        title: "Invalid email",
        message: "Please enter a valid email address.",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      addNotification({
        type: "error",
        title: "Password required",
        message: "Please enter a password.",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      addNotification({
        type: "error",
        title: "Password too short",
        message: "Password must be at least 8 characters long.",
      });
      setIsLoading(false);
      return;
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      addNotification({
        type: "error",
        title: "Password too weak",
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        type: "error",
        title: "Password mismatch",
        message: "Passwords do not match. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const success = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (success) {
        addNotification({
          type: "success",
          title: "Account created successfully",
          message: `Welcome to SeaCred, ${formData.name}!`,
        });
        router.push("/dashboard");
      } else {
        addNotification({
          type: "error",
          title: "Signup failed",
          message: "An error occurred during signup. Please try again.",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Signup error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
    project_authority: "Create and manage carbon credit projects",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Signup Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2">
              <Leaf className="h-10 w-10 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">SeaCred</h1>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Create Project Authority Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Register as a Project Authority to create and manage carbon credit
              projects
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <div className="mt-1">
                  <div className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700 shadow-sm sm:text-sm">
                    Project Authority
                  </div>
                  <input type="hidden" name="role" value="project_authority" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {roleDescriptions.project_authority}
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 1
                              ? "bg-red-500"
                              : passwordStrength.score <= 2
                              ? "bg-orange-500"
                              : passwordStrength.score <= 3
                              ? "bg-yellow-500"
                              : passwordStrength.score <= 4
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must contain at least 8 characters, including
                      uppercase, lowercase, number, and special character.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Creating Project Authority account..."
                    : "Create Project Authority Account"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* MetaMask Connection */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or connect with MetaMask
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <MetaMaskConnect />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Join SeaCred</h2>
              <p className="text-xl mb-8">Become a Project Authority</p>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Project Authority</h3>
                  <p className="text-sm">
                    Create and manage carbon credit projects
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <ul className="text-sm text-left space-y-1">
                    <li>• 80% share of project credits</li>
                    <li>• Secure blockchain storage</li>
                    <li>• Transparent verification process</li>
                    <li>• Professional project management tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
