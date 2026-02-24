"use client";
import React, { useState } from "react";
import Head from "next/head";
import { loginUser } from "@/components/api";

const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminHint, setAdminHint] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            alert("Please enter both username and password");
            return;
        }
        setIsLoading(true);
        try {
            const data = await loginUser({ username, password });
            if (data?.user?.role === "admin") {
                alert(`Welcome, ${data.user.username}! (Admin)`);
                setIsLoading(false);
                window.location.href = "/pages/admin";
            } else {
                alert(`Welcome, ${data.user.username}!`);
                setIsLoading(false);
                window.location.href = "/pages/cashier";
            }
        } catch {
            alert("Login failed. Please check your credentials.");
            setIsLoading(false);
        }
    };

    const handleAdminLogin = async () => {
        setShowAdminLogin(true);
        setIsLoading(true);
        try {
            const data = await loginUser({ username, password });
            if (data?.user?.role === "admin") {
                setAdminHint(true);
                alert("Admin Mode Activated");
                setIsLoading(false);
                window.location.href = "/pages/admin";
            } else {
                alert("You do not have admin access.");
                setIsLoading(false);
            }
        } catch {
            alert("Login failed. Please check your credentials.");
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>RelyOn POS - Login</title>
            </Head>
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-deep-charcoal via-slate-grey to-light-grey relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-maroon rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-40 h-40 bg-light-maroon rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-slate-grey rounded-full blur-3xl"></div>
                </div>

                {/* Admin Login Button */}
                {!showAdminLogin && (
                    <button
                        className="absolute top-8 right-8 flex items-center gap-2 px-6 py-3 rounded-full bg-maroon/20 hover:bg-maroon/30 transition backdrop-blur-md shadow-lg border border-maroon/30"
                        onClick={handleAdminLogin}
                    >
                        <span className="text-2xl">👑</span>
                        <span className="text-off-white font-semibold">Admin Access</span>
                    </button>
                )}

                {/* Login Card */}
                <form
                    onSubmit={handleLogin}
                    className="relative z-10 w-full max-w-md bg-slate-grey/80 rounded-3xl shadow-2xl p-8 backdrop-blur-md border border-light-grey/20"
                >
                    {/* Header */}
                    <div className="relative flex flex-col items-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-maroon to-light-maroon flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-3xl font-bold text-off-white">POS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-off-white text-center mb-1">RelyOn POS</h1>
                        <p className="text-warm-grey text-center text-sm">Professional Point of Sale System</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-5 mb-6">
                        <div className="flex items-center bg-deep-charcoal/50 rounded-xl px-4 py-2 border border-light-grey/20">
                            <span className="mr-3 text-lg text-maroon">👤</span>
                            <input
                                className="bg-transparent outline-none text-off-white placeholder-warm-grey flex-1 py-2"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex items-center bg-deep-charcoal/50 rounded-xl px-4 py-2 border border-light-grey/20">
                            <span className="mr-3 text-lg text-maroon">🔒</span>
                            <input
                                className="bg-transparent outline-none text-off-white placeholder-warm-grey flex-1 py-2"
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                isLoading
                                    ? "bg-warm-grey cursor-not-allowed"
                                    : "btn-primary hover:scale-105"
                            } text-off-white shadow-lg`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In <span className="text-lg">→</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-warm-grey text-xs">
                        💡 Tip: Contact admin for account access
                        {adminHint && (
                            <div className="mt-3 bg-gradient-to-r from-maroon to-light-maroon rounded-xl px-4 py-2 text-off-white font-bold shadow">
                                ✨ Admin Mode Ready
                            </div>
                        )}
                    </div>
                </form>

                {/* Branding */}
                <div className="absolute bottom-10 flex flex-col items-center">
                    <div className="bg-slate-grey/50 rounded-xl px-6 py-2 text-xs text-warm-grey mb-2 shadow border border-light-grey/20">
                        Powered by RelyOn POS Systems
                    </div>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-maroon/60 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-maroon/60 animate-pulse delay-200" />
                        <span className="w-2 h-2 rounded-full bg-maroon/60 animate-pulse delay-400" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginScreen;

