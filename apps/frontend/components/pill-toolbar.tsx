"use client"
import { useState, useEffect } from "react"
import {
  Lock,
  Square,
  Triangle,
  Circle,
  ArrowRight,
  Minus,
  Pen,
  Share,
  ChevronDown,
  Trash2,
  Save,
  Eraser,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme} from "./theme-toggle"
import React from "react"
import { clearAll } from "@/components/ui/clearAll"
import { toast } from "./ui/use-toast"

export type Tool = "lock" | "rectangle" | "triangle" | "circle" | "arrow" | "line" | "pen" | "eraser" | null

interface DrawingToolbarProps {
  selectedTool: Tool
  setSelectedTool: (tool: Tool) => void
  selectedColor: string
  setSelectedColor: (color: string) => void
  clear: boolean
  setclear: (clear: boolean) => void
  roomId: string
  selectedbgColor: string
  setSelectedbgColor: (color: string) => void
  thickness: string
  setThickness: (thickness: string) => void
  saveAsImage?: () => void
}

export default function DrawingToolbar({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
  clear,
  setclear,
  roomId,
  selectedbgColor,
  setSelectedbgColor,
  thickness,
  setThickness,
  saveAsImage,
}: DrawingToolbarProps) {
  const { theme } = useTheme()

  const tools = [
    { id: "lock" as Tool, icon: Lock, label: "Lock" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "triangle" as Tool, icon: Triangle, label: "Triangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "arrow" as Tool, icon: ArrowRight, label: "Arrow" },
    { id: "line" as Tool, icon: Minus, label: "Line" },
    { id: "pen" as Tool, icon: Pen, label: "Pen" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
  ]

  const strokeWidths = ["1", "2", "4", "6", "8"]

  const colorOptions = [
    "#ffffff", // white
    "#000000", // black
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
  ]

  // useEffect(() => {
  //   // Update document theme if needed
  //   document.documentElement.classList.toggle("dark", theme === "dark");
  // }, [theme]);

  // Load initial preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load stored color preference for stroke
      const storedColor = localStorage.getItem('selectedColor');
      if (storedColor && storedColor !== selectedColor) {
        setSelectedColor(storedColor);
      }
      
      // Load stored color preference for background
      const storedBgColor = localStorage.getItem('selectedbgColor');
      if (storedBgColor && storedBgColor !== selectedbgColor) {
        setSelectedbgColor(storedBgColor);
      }
      
      // Load stored thickness preference
      const storedThickness = localStorage.getItem('thickness');
      if (storedThickness && storedThickness !== thickness) {
        setThickness(storedThickness);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedColor', selectedColor);
    }
  }, [selectedColor]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedbgColor', selectedbgColor);
    }
  }, [selectedbgColor]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('thickness', thickness);
    }
  }, [thickness]);

  const handleClearAll = async () => {
    try {
      setclear(true)
      await clearAll(roomId)
      setSelectedTool(null)
      console.log("Clear all successful")
    } catch (error) {
      console.error("Failed to clear canvas:", error)
      toast({
        variant: "error",
        title: "Failed to clear canvas",
        description: "Please try again",
      })
    } finally {
      // Use setTimeout to ensure the UI updates before clearing the flag
      setTimeout(() => {
        setclear(false)
      }, 100)
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-4 py-2",
          "rounded-full",
          "shadow-lg",
          theme === "light"
            ? "bg-white border border-gray-200 shadow-gray-200/50"
            : "bg-[#2e2d39] border border-gray-800 shadow-black/30",
        )}
      >
        <TooltipProvider>
          {tools.map((tool, index) => (
            <React.Fragment key={tool.id}>
              {index === 1 && (
                <div
                  className={cn("h-6 mx-2 border-l", theme === "light" ? "border-gray-300" : "border-gray-700")}
                ></div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "p-2 transition-colors",
                      "rounded-full",
                      selectedTool === tool.id
                        ? theme === "light"
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-indigo-900 text-indigo-300"
                        : theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-400 hover:bg-gray-800",
                    )}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <tool.icon size={18} />
                    <span className="sr-only">{tool.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          ))}
        </TooltipProvider>

        {/* Color and Stroke Options */}
        <div className={cn("h-6 mx-2 border-l", theme === "light" ? "border-gray-300" : "border-gray-700")}></div>

        {/* Stroke Color */}
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "p-2 flex items-center justify-center",
                      "rounded-full",
                      theme === "light" ? "border border-gray-200" : "border border-gray-700",
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Stroke Color</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-64 p-2">
            <Tabs defaultValue="preset">
              <TabsList className="w-full mb-2">
                <TabsTrigger value="preset" className="flex-1">
                  Presets
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">
                  Custom
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preset" className="grid grid-cols-6 gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border",
                      color === selectedColor ? "ring-2 ring-offset-2 ring-blue-500" : "",
                      theme === "light" ? "border-gray-300" : "border-gray-600",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  ></button>
                ))}
              </TabsContent>
              <TabsContent value="custom">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Custom Color</label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-8"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Fill Color */}
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "p-2 flex items-center justify-center",
                      "rounded-full",
                      theme === "light" ? "border border-gray-200" : "border border-gray-700",
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ backgroundColor: selectedbgColor }}
                    ></div>
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Fill Color</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-64 p-2">
            <Tabs defaultValue="preset">
              <TabsList className="w-full mb-2">
                <TabsTrigger value="preset" className="flex-1">
                  Presets
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">
                  Custom
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preset" className="grid grid-cols-6 gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border",
                      color === selectedbgColor ? "ring-2 ring-offset-2 ring-blue-500" : "",
                      theme === "light" ? "border-gray-300" : "border-gray-600",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedbgColor(color)}
                  ></button>
                ))}
              </TabsContent>
              <TabsContent value="custom">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Custom Color</label>
                  <input
                    type="color"
                    value={selectedbgColor}
                    onChange={(e) => setSelectedbgColor(e.target.value)}
                    className="w-full h-8"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Stroke Width */}
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "p-2 flex items-center justify-center gap-1",
                      "rounded-full",
                      theme === "light"
                        ? "border border-gray-200 text-gray-700"
                        : "border border-gray-700 text-gray-300",
                    )}
                  >
                    <div
                      className="rounded-full bg-current"
                      style={{
                        width: `${Number.parseInt(thickness) * 2}px`,
                        height: `${Number.parseInt(thickness)}px`,
                      }}
                    ></div>
                    <ChevronDown size={12} />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Stroke Width</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end">
            {strokeWidths.map((width) => (
              <DropdownMenuItem key={width} className="flex items-center gap-3" onClick={() => setThickness(width)}>
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${Number.parseInt(width) * 3}px`, height: `${Number.parseInt(width)}px` }}
                ></div>
                <span>{width}px</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={cn("h-6 mx-2 border-l", theme === "light" ? "border-gray-300" : "border-gray-700")}></div>

        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "p-2 transition-colors rounded-full",
                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-400 hover:bg-gray-800",
                  )}
                  onClick={handleClearAll}
                >
                  <Trash2 size={18} />
                  <span className="sr-only">Clear Canvas</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {saveAsImage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "p-2 transition-colors rounded-full",
                      theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-400 hover:bg-gray-800",
                    )}
                    onClick={saveAsImage}
                  >
                    <Save size={18} />
                    <span className="sr-only">Save Image</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Save Image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            className={cn(
              "rounded-full",
              theme === "light"
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700",
            )}
          >
            <Share size={18} className="mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
