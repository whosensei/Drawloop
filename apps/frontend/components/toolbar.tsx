"use client"

import { useState } from "react"
import { Circle, Square, Minus, Eraser, Trash2, Check, PenTool, Save, Undo, Redo, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { clearAll } from "@/components/ui/clearAll"
import { toast } from "./ui/use-toast"

type Tool = "pen" | "line" | "circle" | "rectangle" | "eraser" | null

type StrokeThickness = "1" | "3" | "6"

interface ColorOption {
  name: string
  value: string
}

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

const colorOptions: ColorOption[] = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#00FF00" },
  { name: "Blue", value: "#0000FF" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Magenta", value: "#FF00FF" },
  { name: "Cyan", value: "#00FFFF" },
  { name: "Orange", value: "#FFA500" },
  { name: "Purple", value: "#800080" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Brown", value: "#A52A2A" },
]

const backgroundOptions: ColorOption[] = [
  { name: "Light Gray", value: "#f0f0f5" },
  { name: "Light Blue", value: "#e8f4f8" },
  { name: "Light Beige", value: "#f5f0e8" },
  { name: "Light Purple", value: "#f0e8f4" },
  { name: "Light Green", value: "#e8f0e8" },
  { name: "Dark Gray", value: "#2d2d30" },
  { name: "Dark Blue", value: "#1a2b3c" },
  { name: "Dark Purple", value: "#2d1a3c" },
  { name: "Dark Green", value: "#1a3c2d" },
]

export default function PillToolbar({
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
  //   const [selectedTool, setSelectedTool] = useState<Tool>("pen")
  //   const [selectedColor, setSelectedColor] = useState("#000000")
  const [customStrokeColor, setCustomStrokeColor] = useState("#000000")
  //   const [selectedbgColor, setSelectedbgColor] = useState("#FFFFFF")
  const [customBgColor, setCustomBgColor] = useState("#FFFFFF")
  // const [thickness, setThickness] = useState<StrokeThickness>("medium")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Make toolbar slightly darker than background
  const toolbarBgColor = darkenColor(selectedbgColor, 0.08)

  // Generate shadow colors based on toolbar background color
  const shadowDark = darkenColor(toolbarBgColor, 0.15)
  const shadowLight = lightenColor(toolbarBgColor, 0.15)
  const isLight = isLightColor(toolbarBgColor)
  const iconColor = isLight ? "#333333" : "#f0f0f0"
  const textColor = isLight ? "#000000" : "#ffffff"

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool)
  }

  const handleStrokeColorChange = (color: string) => {
    setSelectedColor(color)
    setCustomStrokeColor(color)
    addToRecentColors(color)
  }

  const handleBgColorChange = (color: string) => {
    setSelectedbgColor(color)
    setCustomBgColor(color)
    addToRecentColors(color)
  }

  const addToRecentColors = (color: string) => {
    setRecentColors((prev) => {
      // Remove if already exists
      const filtered = prev.filter((c) => c !== color)
      // Add to beginning and limit to 5 colors
      return [color, ...filtered].slice(0, 5)
    })
  }

  const handleClearAll = async () => {
    try {
      setclear(true)
      await clearAll(roomId)
      setSelectedTool(null)
      setCanUndo(false)
      setCanRedo(false)
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

  const handleUndo = () => {
    console.log("Undo action")
    setCanRedo(true)
    setCanUndo(Math.random() > 0.3)
  }

  const handleRedo = () => {
    console.log("Redo action")
    setCanRedo(Math.random() > 0.7)
  }

  const handleSave = () => {
    if (saveAsImage) {
      saveAsImage()
    }
    console.log("Save drawing")
  }

  // Dynamic neumorphic styles
  // const topGlowStyle = withTopGlow ? `, 0px -8px 15px rgba(255, 255, 255, ${isLight ? "0.8" : "0.3"})` : ""

  return (
    <div
      className="inline-flex items-center gap-2 p-2.5 rounded-full overflow-x-auto max-w-full"
      style={{
        backgroundColor: toolbarBgColor,
        color: iconColor,
        boxShadow: `6px 6px 12px ${shadowDark}, -6px -6px 12px ${shadowLight}`,
        transition: "all 0.3s ease",
      }}
    >
      {/* Drawing Tools */}
      <div
        className="flex items-center gap-1 p-1.5 rounded-full"
        style={{
          backgroundColor: toolbarBgColor,
          boxShadow: `4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight}`,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105",
            selectedTool === "pen" && "scale-95",
          )}
          onClick={() => handleToolClick("pen")}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow:
              selectedTool === "pen"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: selectedTool === "pen" ? `2px solid ${shadowDark}` : "none",
          }}
        >
          <PenTool className={cn("w-4 h-4", selectedTool === "pen" && "w-5 h-5")} />
          <span className="sr-only">Pen</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105",
            selectedTool === "line" && "scale-95",
          )}
          onClick={() => handleToolClick("line")}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow:
              selectedTool === "line"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: selectedTool === "line" ? `2px solid ${shadowDark}` : "none",
          }}
        >
          <Minus className={cn("w-4 h-4", selectedTool === "line" && "w-5 h-5")} />
          <span className="sr-only">Line</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105",
            selectedTool === "circle" && "scale-95",
          )}
          onClick={() => handleToolClick("circle")}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow:
              selectedTool === "circle"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: selectedTool === "circle" ? `2px solid ${shadowDark}` : "none",
          }}
        >
          <Circle className={cn("w-4 h-4", selectedTool === "circle" && "w-5 h-5")} />
          <span className="sr-only">Circle</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105",
            selectedTool === "rectangle" && "scale-95",
          )}
          onClick={() => handleToolClick("rectangle")}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow:
              selectedTool === "rectangle"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: selectedTool === "rectangle" ? `2px solid ${shadowDark}` : "none",
          }}
        >
          <Square className={cn("w-4 h-4", selectedTool === "rectangle" && "w-5 h-5")} />
          <span className="sr-only">Rectangle</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105",
            selectedTool === "eraser" && "scale-95",
          )}
          onClick={() => handleToolClick("eraser")}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow:
              selectedTool === "eraser"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: selectedTool === "eraser" ? `2px solid ${shadowDark}` : "none",
          }}
        >
          <Eraser className={cn("w-4 h-4", selectedTool === "eraser" && "w-5 h-5")} />
          <span className="sr-only">Eraser</span>
        </Button>
      </div>

      {/* Thickness Buttons */}
      <div
        className="flex items-center gap-1 p-1.5 rounded-full"
        style={{
          backgroundColor: toolbarBgColor,
          boxShadow: `4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight}`,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-200",
            thickness === "1" && "scale-95",
          )}
          onClick={() => setThickness("1")}
          style={{
            backgroundColor: toolbarBgColor,
            boxShadow:
              thickness === "1"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: thickness === "1" ? `2px solid ${shadowDark}` : "none",
            transition: "all 0.2s ease",
          }}
        >
          <div className="w-4 h-0.5 rounded-full bg-current" />
          <span className="sr-only">Thin</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-200",
            thickness === "3" && "scale-95",
          )}
          onClick={() => setThickness("3")}
          style={{
            backgroundColor: toolbarBgColor,
            boxShadow:
              thickness === "3"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: thickness === "3" ? `2px solid ${shadowDark}` : "none",
            transition: "all 0.2s ease",
          }}
        >
          <div className="w-4 h-1 rounded-full bg-current" />
          <span className="sr-only">Medium</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-200",
            thickness === "6" && "scale-95",
          )}
          onClick={() => setThickness("6")}
          style={{
            backgroundColor: toolbarBgColor,
            boxShadow:
              thickness === "6"
                ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
            border: thickness === "6" ? `2px solid ${shadowDark}` : "none",
            transition: "all 0.2s ease",
          }}
        >
          <div className="w-4 h-2 rounded-full bg-current" />
          <span className="sr-only">Thick</span>
        </Button>
      </div>

      {/* Color Pickers */}
      <div
        className="flex items-center gap-1 p-1.5 rounded-full"
        style={{
          backgroundColor: toolbarBgColor,
          boxShadow: `4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight}`,
        }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full relative transition-all duration-200"
              style={{
                backgroundColor: toolbarBgColor,
                boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
              }}
            >
              <div className="absolute inset-0 m-2 rounded-full" style={{ backgroundColor: selectedColor }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-0 rounded-2xl border-none"
            align="start"
            style={{
              backgroundColor: toolbarBgColor,
              boxShadow: `8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight}`,
              transition: "all 0.3s ease",
            }}
          >
            {/* Color Palette */}
            <div className="p-3">
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: color.value,
                      boxShadow:
                        selectedColor === color.value
                          ? `inset 3px 3px 6px ${shadowDark}, inset -3px -3px 6px ${shadowLight}`
                          : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
                    }}
                    onClick={() => {
                      handleStrokeColorChange(color.value)
                      const button = document.activeElement as HTMLElement
                      if (button) {
                        button.style.transform = "scale(0.9)"
                        setTimeout(() => {
                          button.style.transform = "scale(1)"
                        }, 150)
                      }
                    }}
                  >
                    {selectedColor === color.value && (
                      <Check
                        className={cn(
                          "w-5 h-5",
                          ["#FFFFFF", "#FFFF00", "#00FF00", "#00FFFF", "#FFC0CB"].includes(color.value)
                            ? "text-black"
                            : "text-white",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={customStrokeColor}
                    onChange={(e) => setCustomStrokeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{
                      backgroundColor: customStrokeColor,
                      boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStrokeColorChange(customStrokeColor)}
                  className="rounded-lg flex-1"
                  style={{
                    backgroundColor: toolbarBgColor,
                    color: textColor,
                    boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full relative transition-all duration-200"
              style={{
                backgroundColor: toolbarBgColor,
                boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
              }}
            >
              <div
                className="absolute inset-0 m-2 rounded-full border border-gray-300"
                style={{ backgroundColor: selectedbgColor }}
              />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center border border-gray-300">
                <Palette className="w-1.5 h-1.5 text-gray-500" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-0 rounded-2xl border-none"
            align="start"
            style={{
              backgroundColor: toolbarBgColor,
              boxShadow: `8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight}`,
              transition: "all 0.3s ease",
            }}
          >
            {/* Color Palette */}
            <div className="p-3">
              <div className="grid grid-cols-4 gap-2">
                {backgroundOptions.map((color: ColorOption) => (
                  <button
                    key={color.value}
                    className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 transition-all duration-200"
                    style={{
                      backgroundColor: color.value,
                      boxShadow:
                        selectedbgColor === color.value
                          ? `inset 3px 3px 6px ${shadowDark}, inset -3px -3px 6px ${shadowLight}`
                          : `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
                    }}
                    onClick={() => {
                      handleBgColorChange(color.value)
                      const button = document.activeElement as HTMLElement
                      if (button) {
                        button.style.transform = "scale(0.9)"
                        setTimeout(() => {
                          button.style.transform = "scale(1)"
                        }, 150)
                      }
                    }}
                  >
                    {selectedbgColor === color.value && (
                      <Check
                        className={cn(
                          "w-5 h-5",
                          ["#FFFFFF", "#FFFF00", "#00FF00", "#00FFFF", "#FFC0CB"].includes(color.value)
                            ? "text-black"
                            : "text-white",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-300"
                    style={{
                      backgroundColor: customBgColor,
                      boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleBgColorChange(customBgColor)}
                  className="rounded-lg flex-1"
                  style={{
                    backgroundColor: toolbarBgColor,
                    color: textColor,
                    boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center gap-1 ml-auto p-1.5 rounded-full"
        style={{
          backgroundColor: toolbarBgColor,
          boxShadow: `4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight}`,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
          }}
        >
          <Undo className="w-4 h-4" />
          <span className="sr-only">Undo</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={!canRedo}
          className={cn(
            "h-9 w-9 p-0 rounded-full transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
          }}
        >
          <Redo className="w-4 h-4" />
          <span className="sr-only">Redo</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="h-9 w-9 p-0 rounded-full transition-all duration-200"
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
          }}
        >
          <Save className="w-4 h-4" />
          <span className="sr-only">Save</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-9 w-9 p-0 rounded-full transition-all duration-200"
          style={{
            backgroundColor: toolbarBgColor,
            color: iconColor,
            boxShadow: `2px 2px 4px ${shadowDark}, -2px -2px 4px ${shadowLight}`,
          }}
        >
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Clear All</span>
        </Button>
      </div>
    </div>
  )
}

// Helper functions
function darkenColor(color: string, amount: number): string {
  return adjustColor(color, -amount)
}

function lightenColor(color: string, amount: number): string {
  return adjustColor(color, amount)
}

function adjustColor(color: string, amount: number): string {
  // Remove the # if present
  const hex = color.replace("#", "")

  // Convert to RGB
  let r = Number.parseInt(hex.substring(0, 2), 16)
  let g = Number.parseInt(hex.substring(2, 4), 16)
  let b = Number.parseInt(hex.substring(4, 6), 16)

  // Lighten or darken
  r = Math.min(255, Math.max(0, Math.round(r + amount * 255)))
  g = Math.min(255, Math.max(0, Math.round(g + amount * 255)))
  b = Math.min(255, Math.max(0, Math.round(b + amount * 255)))

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

function isLightColor(color: string): boolean {
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Calculate perceived brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

  return brightness > 0.5
}
