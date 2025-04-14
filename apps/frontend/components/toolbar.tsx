"use client"
import { useState,useEffect } from "react"
import {
  Lock,
  Square,
  Triangle,
  Circle,
  ArrowRight,
  Minus,
  Pen,
  Share,
  Trash2,
  Save,
  Eraser,
  Copy,
  Link,
  Play,
  LockIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-toggle"
import React from "react"
import { clearAll } from "@/components/ui/clearAll"
import { toast } from "./ui/use-toast"


export type Tool = "rectangle" | "triangle" | "circle" | "arrow" | "line" | "pen" | "eraser" |null

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
  thickness = "4",
  setThickness,
  saveAsImage,
}: DrawingToolbarProps) {
  const { theme } = useTheme()
  const [isLocked, setIsLocked] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [exportLinkDialogOpen, setExportLinkDialogOpen] = useState(false)

  const tools = [
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "triangle" as Tool, icon: Triangle, label: "Triangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "arrow" as Tool, icon: ArrowRight, label: "Arrow" },
    { id: "line" as Tool, icon: Minus, label: "Line" },
    { id: "pen" as Tool, icon: Pen, label: "Pen" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
  ]

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
      
      // Load stored thickness preference with default of 4
      const storedThickness = localStorage.getItem('thickness');
      if (storedThickness && storedThickness !== thickness) {
        setThickness(storedThickness);
      } else if (!storedThickness) {
        // Set default thickness if none is stored
        setThickness("4");
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

  const handleShareClick = () => {
    setShareDialogOpen(true)
  }

  const handleExportLinkClick = () => {
    setShareDialogOpen(false)
    setExportLinkDialogOpen(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard")
      })
      .catch((err) => {
        console.error("Error copying text: ", err)
      })
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
        {/* Lock Tool - Separated as independent entity */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "p-2 transition-colors",
                  "rounded-full",
                  isLocked
                    ? theme === "light"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-indigo-900 text-indigo-300"
                    : theme === "light"
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-400 hover:bg-gray-800",
                )}
                onClick={() => setIsLocked(!isLocked)}
              >
                <Lock size={18} />
                <span className="sr-only">Lock</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Lock Canvas</p>\\\
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className={cn("h-6 mx-2 border-l", theme === "light" ? "border-gray-300" : "border-gray-700")}></div>

        <TooltipProvider>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
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
                  disabled={isLocked}
                >
                  <tool.icon size={18} />
                  <span className="sr-only">{tool.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tool.label}</p>
              </TooltipContent>
            </Tooltip>
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
                    disabled={isLocked}
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
                    disabled={isLocked}
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

        {/* Stroke Width - Updated to be consistent size in toolbar */}
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
                    disabled={isLocked}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      <div
                        className={cn("rounded-full", theme === "light" ? "bg-black" : "bg-white")}
                        style={{
                          width: `${Math.min(Number(thickness), 8)}px`,
                          height: `${Math.min(Number(thickness), 8)}px`,
                        }}
                      ></div>
                    </div>
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Stroke Width</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className={cn("w-64 p-4", theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e24] border-gray-800")}>
            <div className="space-y-4">
              <h4 className={cn("font-medium text-sm mb-2", theme === "light" ? "text-gray-800" : "text-white")}>Stroke Thickness</h4>
              <div className="flex items-center justify-between">
                {[1, 2, 4, 6, 8].map((size) => (
                  <div key={size} className="flex flex-col items-center gap-1">
                    <button
                      className={cn(
                        "flex items-center justify-center rounded-md transition-colors",
                        thickness === size.toString() 
                          ? theme === "light"
                            ? "bg-indigo-500" 
                            : "bg-indigo-600"
                          : theme === "light"
                            ? "bg-transparent hover:bg-indigo-100"
                            : "bg-transparent hover:bg-indigo-900",
                        "w-10 h-10",
                      )}
                      onClick={() => setThickness(size.toString())}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        <div
                          className={cn("rounded-full", theme === "light" ? "bg-black" : "bg-white")}
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                          }}
                        ></div>
                      </div>
                    </button>
                    <span className="text-xs text-gray-400">{size}px</span>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

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
                  disabled={isLocked}
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
            onClick={handleShareClick}
          >
            <Share size={18} className="mr-2" />
            Share
          </Button>
        </div>
      </div>

      <p className={cn("text-sm mt-2 text-center", theme === "light" ? "text-gray-400" : "text-gray-700")}>Room ID: {roomId}</p>

      {/* Share Dialog - Updated to match the provided design */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className={cn(
          "sm:max-w-md border",
          theme === "light" 
            ? "bg-white text-gray-800 border-gray-200"
            : "bg-[#1e1e24] text-white border-gray-800"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              "text-2xl font-semibold text-center",
              theme === "light" ? "text-indigo-600" : "text-indigo-400"
            )}>Live collaboration</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center">
            <p className="mb-4">Invite people to collaborate on your drawing.</p>

            <p className={cn(
              "text-sm mb-6",
              theme === "light" ? "text-gray-600" : "text-gray-400"
            )}>
              Work together with your team in real-time. See changes as they happen and collaborate seamlessly.
            </p>

            <Button 
              className={cn(
                "w-48",
                theme === "light"
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700",
              )} 
              onClick={handleExportLinkClick}
            >
              <Link size={16} className="mr-2" />
              Export to Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Link Dialog - Updated to match the provided design */}
      <Dialog open={exportLinkDialogOpen} onOpenChange={setExportLinkDialogOpen}>
        <DialogContent className={cn(
          "sm:max-w-md border",
          theme === "light" 
            ? "bg-white text-gray-800 border-gray-200"
            : "bg-[#1e1e24] text-white border-gray-800"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              "text-2xl font-semibold mb-2",
              theme === "light" ? "text-indigo-600" : "text-indigo-400"
            )}>Shareable link</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="mb-2">
              <p className={cn(
                "text-sm mb-2",
                theme === "light" ? "text-gray-600" : "text-gray-300"
              )}>Link</p>
              <div className="flex gap-2">
                <Input
                  value={window.location.href}
                  readOnly
                  className={cn(
                    "flex-1",
                    theme === "light"
                      ? "bg-gray-50 border-gray-200 text-gray-700"
                      : "bg-[#2d2d36] border-gray-700 text-gray-300"
                  )}
                />
                <Button
                  className={cn(
                    "custom-selection",
                    theme === "light"
                    ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700",
                  )}
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Copy size={16} className="mr-2" />
                  Copy link
                </Button>
              </div>
            </div>

            <Separator className={theme === "light" ? "my-6 bg-gray-200" : "my-6 bg-gray-700"} />

            <div className="flex items-start gap-2 text-sm">
              <LockIcon size={16} className="mt-0.5 text-amber-500 shrink-0" />
              <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
                The upload has been secured with end-to-end encryption, which means that Drawloop server and third
                parties can't read the content.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
