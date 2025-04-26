"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { useToast } from "@/components/ui/use-toast"
import { BackendNote } from "./ui/backendnote"
import axios from "axios"


export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [redirectUrl, setRedirectUrl] = useState("")
    const { toast } = useToast()

    // Read URL parameters on component mount
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const redirectParam = queryParams.get('redirectUrl');
        
        if (redirectParam) {
            setRedirectUrl(redirectParam);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate registration delay
        setTimeout(async () => {
            setIsLoading(false)
            try{
                const message = await axios.post('/api/signup',{
                    email :email,
                    username :username,
                    password: password
                })

                if(message.status === 200){
                    toast({
                        variant: "success",
                        title: message.data.message,
                        description: "Welcome to Drawloop",
                      })
                      
                      try {
                        const signInResponse = await axios.post('/api/signin', {
                          email: email,
                          password: password
                        });
                        
                        if (signInResponse.status === 200) {
                          const token = signInResponse.data.token;
                          localStorage.setItem("token", token);
                          
                          setTimeout(() => {
                            if (redirectUrl) {
                              window.location.href = redirectUrl;
                            } else {
                              window.location.href = "/dashboard";
                            }
                          }, 1000);
                        }
                      } catch (signInError) {
                        console.error("Auto sign-in failed:", signInError);
                        setTimeout(() => {
                          if (redirectUrl) {
                            window.location.href = `/signin?redirectUrl=${encodeURIComponent(redirectUrl)}`;
                          } else {
                            window.location.href = "/signin";
                          }
                        }, 1000);
                      }
                    }
            }catch(error){

                if(password.length<8){
                    toast({
                        variant: "error",
                        title: "Signup Failed",
                        description: "password should be minimum 8 characters",
                    })
                }
                else if (axios.isAxiosError(error)) {
                    const errorMessage = error.response?.data?.message || "Failed to sign up";

                    toast({
                        variant: "error",
                        title: "Signup Failed",
                        description: errorMessage,
                    })
                    
                } else {
                    toast({
                        variant: "error",
                        title: "Something went wrong",
                        description: "Please try again later.",
                    })

                }
            } finally {
                setIsLoading(false)
            }
        }, 1000)
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
                            Create Account
                        </span>
                    </h1>
                    <p className="text-white/40">Sign up to start collaborating</p>
                </motion.div>

                <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
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
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
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
                            <p className="text-xs text-white/40 mt-1">Password must be at least 8 characters long</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-none",
                                isLoading && "opacity-70 cursor-not-allowed",
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>
                    <BackendNote message="Sign-up"/>
                </motion.div>

                <motion.div
                    custom={3}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 text-center"
                >
                    <p className="text-white/40 text-sm">
                        Already have an account?{" "}
                        <Link 
                            href={redirectUrl ? `/signin?redirectUrl=${encodeURIComponent(redirectUrl)}` : "/signin"} 
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    )
}

