"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Leaf } from "lucide-react";
import { CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import MetaMaskConnect from "@/components/ui/MetaMaskConnect";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        addNotification({
          type: "success",
          title: "Login successful",
          message: "Welcome to SeaCred!",
        });
        router.push("/dashboard");
      } else {
        addNotification({
          type: "error",
          title: "Login failed",
          message: "Invalid email or password. Please try again.",
        });
      }
    } catch {
      addNotification({
        type: "error",
        title: "Login error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@seacred.com", role: "Admin", password: "password123" },
    {
      email: "officer@seacred.com",
      role: "Verification Officer",
      password: "password123",
    },
    {
      email: "project@seacred.com",
      role: "Project Authority",
      password: "password123",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2">
              <Leaf className="h-10 w-10 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">SeaCred</h1>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Carbon Credit Management Platform
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Demo Accounts
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="w-full text-left rounded-md border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {account.role}
                    </div>
                    <div className="text-sm text-gray-500">{account.email}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign up
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
              <h2 className="text-4xl font-bold mb-4">Welcome to SeaCred</h2>
              <p className="text-xl mb-8">
                Managing Carbon Credits for a Sustainable Future
              </p>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Project Management</h3>
                  <p className="text-sm">
                    Track and manage carbon credit projects
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Verification System</h3>
                  <p className="text-sm">Comprehensive verification workflow</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Credit Distribution</h3>
                  <p className="text-sm">
                    Secure blockchain-based credit distribution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
