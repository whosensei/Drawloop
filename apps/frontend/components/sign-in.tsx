"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Eye, EyeOff, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
// Add this new component for test credentials
function TestCredentials({ onUseTestAccount }: { onUseTestAccount: () => void }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-medium text-white">Demo Credentials</h3>
            </div>

            <div className="space-y-2 mb-4">
                <div className="grid grid-cols-[80px_1fr] text-sm">
                    <span className="text-white/60">Email:</span>
                    <code className="font-Open_Sans text-indigo-300">demo@sketchboard.com</code>
                </div>
                <div className="grid grid-cols-[80px_1fr] text-sm">
                    <span className="text-white/60">Password:</span>
                    <code className="font-Open_Sans text-indigo-300">demo1234</code>
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300"
                onClick={onUseTestAccount}
            >
                Use Test Account
            </Button>

            <p className="text-[11px] text-white/40 mt-3 text-center">For demonstration purposes only</p>
        </div>
    )
}

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [redirectUrl, setRedirectUrl] = useState("")
    // const [shareRoom, setShareRoom] = useState(false)
    const { toast } = useToast()

    // Read URL parameters on component mount
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const redirectParam = queryParams.get('redirectUrl');
        // const shareRoomParam = queryParams.get('shareRoom');
        
        if (redirectParam) {
            setRedirectUrl(redirectParam);
        }
        
        // if (shareRoomParam === 'true') {
        //     setShareRoom(true);
        // }
    }, []);

    // Add this function to handle using test credentials
    const handleUseTestAccount = () => {
        setEmail("demo@sketchboard.com")
        setPassword("demo1234")
        toast({
            variant: "info",
            title: "Test Account Applied",
            description: "Demo credentials have been filled automatically.",
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate authentication delay
        setTimeout(async () => {
            setIsLoading(false)

            // Show success toast
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/signin`, {
                    email: email,
                    password: password
                })
                if (res.status === 200) {
                    const token = res.data.token
                    localStorage.setItem("token",token)
                    toast({
                        variant: "success",
                        title: res.data.message,
                        description: "Welcome back to Sketch Board.",
                    })
                    
                    // Only redirect after successful authentication
                    setTimeout(() => {
                        window.location.href = redirectUrl || "/dashboard"
                    }, 1000)
                }
            } catch(error) {
                if (axios.isAxiosError(error)) {
                    // Get the error response data
                    const errorMessage = error.response?.data?.message || "Failed to sign in";

                    toast({
                        variant: "error",
                        title: "Authentication Failed",
                        description: errorMessage,
                    })

                    return

                } else {
                    // For non-axios errors
                    toast({
                        variant: "error",
                        title: "Something went wrong",
                        description: "Please try again later.",
                    })
                }
            } finally {
                setIsLoading(false)
            }
        },1000)
    }

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                delay: 0.1 + i * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] dark:bg-[#030303] text-white">
            <div className="absolute top-4 left-4 z-50">
                <Button variant="ghost" size="icon" asChild className="text-white/70 hover:text-white">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to home</span>
                    </Link>
                </Button>
            </div>

            <div className="absolute top-4 right-4 z-50">
                <Toggle />
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

            <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">

                <motion.div
                    custom={1}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                            Welcome Back
                        </span>
                    </h1>
                    <p className="text-white/40">Sign in to continue to your account</p>
                </motion.div>

                <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                    {/* Add the TestCredentials component here */}
                    <TestCredentials onUseTestAccount={handleUseTestAccount} />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-none",
                                isLoading && "opacity-70 cursor-not-allowed",
                            )}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </motion.div>

                <motion.div
                    custom={3}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 text-center"
                >
                    <p className="text-white/40 text-sm">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    )
}

