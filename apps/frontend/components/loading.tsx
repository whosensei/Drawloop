"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
  className?: string
}

const Loading = memo(({ 
  text = "Loading...", 
  size = "md", 
  fullScreen = false,
  className = ""
}: LoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const content = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${sizeClasses[size]} text-indigo-400`} />
      </motion.div>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-white/60 ${textSizeClasses[size]}`}
      >
        {text}
      </motion.p>
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {content}
        </div>
      </div>
    )
  }

  return content
})

Loading.displayName = "Loading"

export default Loading 