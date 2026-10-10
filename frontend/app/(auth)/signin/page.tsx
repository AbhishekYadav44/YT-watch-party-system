
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { FaYoutube } from "react-icons/fa";
import { UserRound, Mail, Lock, Router } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignupPage() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log("Backend URL:", backend_url);
    const handlelogin = async () => {
        try {
            const email = emailRef.current?.value;
            const password = passwordRef.current?.value;

            if ( !email || !password) return
            setLoading(true)

            const res = await axios.post(`${backend_url}/user/signin`, {
                email,
                password,
            });
            const token = res.data.token;
             localStorage.setItem("token", token)
            router.push("/");
        } catch (err: any) {
            console.error("Error:", err.response?.data?.message || err.message);
        } finally {
            setLoading(false)
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
            <div className="absolute inset-0">
                <img
                    src="/bg.png"
                    alt="Watch Party background"
                    className="h-full w-full object-cover opacity-60"
                />
            </div>
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 w-full max-w-md rounded-4xl p-8 shadow-2xl backdrop-blur-xl">
                <Link
                    href="/"
                    className="mb-7 flex items-center justify-center gap-2"
                >
                    <FaYoutube size={36} className="text-red-600" />

                    <span className="font-serif text-2xl font-bold">
                        Watch-Party
                    </span>
                </Link>

                <div className="mb-7 text-center">
                    <h1 className="text-3xl font-bold">
                        Join the <span className="text-red-600">Party</span>
                    </h1>

                    <p className="mt-2 text-sm text-gray-300">
                        Different Places. One Shared Moment.
                    </p>
                </div>
                <div className="flex gap-2 flex-col">

                    <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-black/40 px-3 focus-within:border-red-600">
                        <Mail size={18} className="shrink-0 text-gray-400" />

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            ref={emailRef}
                            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-black/40 px-3 focus-within:border-red-600">
                            <Lock size={18} className="shrink-0 text-gray-400" />

                            <input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                ref={passwordRef}
                                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handlelogin}
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-red-600 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Please wait..." : "SignIn"}
                    </button>

                </div>

                <p className="mt-6 text-center text-sm text-gray-300">
                    Don't have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-red-500 hover:text-red-400"
                    >
                        signup
                    </Link>
                </p>
                <p className="mt-5 text-center text-sm text-gray-300">
                    <Link href="/" className="hover:text-white">
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </main >
    );
}
