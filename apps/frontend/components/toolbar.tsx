"use client"

import { useState } from "react"
import { Circle, Square, Type, Minus, Eraser, Trash2, Check, PenTool, Save, Undo, Redo, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { clearAll } from "@/components/ui/clearAll"
import { toast } from "./ui/use-toast"

type Tool = "pen" | "line" | "circle" | "rectangle" | "eraser" | "text" | null

interface ColorOption {
  name: string
  value: string
  textColor: string
}

interface DrawingToolbarProps {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
    selectedColor: string,
    setSelectedColor: (color: string) => void,
    clear: boolean,
    setclear: (clear: boolean) => void,
    roomId: string,
    selectedbgColor :string,
    setSelectedbgColor : (color:string)=>void,
    thickness : string,
    setThickness : (thickness : string)=>void
  }


const colorOptions: ColorOption[] = [
  { name: "Black", value: "#000000", textColor: "white" },
  { name: "White", value: "#FFFFFF", textColor: "black" },
  { name: "Red", value: "#FF0000", textColor: "white" },
  { name: "Green", value: "#00FF00", textColor: "black" },
  { name: "Blue", value: "#0000FF", textColor: "white" },
  { name: "Yellow", value: "#FFFF00", textColor: "black" },
  { name: "Magenta", value: "#FF00FF", textColor: "white" },
  { name: "Cyan", value: "#00FFFF", textColor: "black" },
  { name: "Orange", value: "#FFA500", textColor: "black" },
  { name: "Purple", value: "#800080", textColor: "white" },
  { name: "Pink", value: "#FFC0CB", textColor: "black" },
  { name: "Brown", value: "#A52A2A", textColor: "white" },
  { name: "Gray", value: "#808080", textColor: "white" },
  { name: "Teal", value: "#008080", textColor: "white" },
  { name: "Lime", value: "#32CD32", textColor: "black" },
  { name: "Navy", value: "#000080", textColor: "white" },
]

// Map thickness names to actual pixel values
const thicknessValues = {
  thin: 1,
  medium: 3,
  thick: 6,
}

export default function PillToolbar({ selectedTool, setSelectedTool, selectedColor, setSelectedColor, clear, setclear, roomId ,selectedbgColor,setSelectedbgColor ,thickness,setThickness}: DrawingToolbarProps) {
//   const [selectedTool, setSelectedTool] = useState<Tool>("pen")
//   const [selectedColor, setSelectedColor] = useState("#000000")
  const [customStrokeColor, setCustomStrokeColor] = useState("#000000")
//   const [selectedbgColor, setSelectedbgColor] = useState("#FFFFFF")
  const [customBgColor, setCustomBgColor] = useState("#FFFFFF")
  // const [thickness, setThickness] = useState<StrokeThickness>("medium")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>([])

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

  const handleClearAll = async() => {
    try {
        setclear(true);
        await clearAll(roomId);
        setSelectedTool(null);
        setCanUndo(false)
        setCanRedo(false)
        console.log("Clear all successful");
    } catch (error) {
        console.error("Failed to clear canvas:", error);
        toast({
            variant : "error",
            title :"Failed to clear canvas",
            description :"Please try again"
        })
    } finally {
        setclear(false);
    }
  }

  const handleUndo = () => {
    console.log("Undo action")
    setCanRedo(true)
    // setCanUndo(Math.random() > 0.3)
    setCanUndo(false)
  }

  const handleRedo = () => {
    console.log("Redo action")
    // setCanRedo(Math.random() > 0.7)
    setCanRedo(false) // Set to a deterministic value instead

  }

  const handleSave = () => {
    console.log("Save drawing")
  }

  // Claymorphism styles
  const clayContainer = "bg-[#f0f0f5] shadow-[6px_6px_12px_#d1d1db,-6px_-6px_12px_#ffffff] p-2.5 rounded-full"
  const claySection = "bg-[#f0f0f5] shadow-[4px_4px_8px_#d1d1db,-4px_-4px_8px_#ffffff] p-1.5 rounded-full"
  const clayButton =
    "bg-[#f0f0f5] shadow-[2px_2px_4px_#d1d1db,-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1db,inset_-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1db,inset_-3px_-3px_6px_#ffffff]"
  const clayButtonActive =
    "shadow-[inset_4px_4px_8px_#d1d1db,inset_-4px_-4px_8px_#ffffff] bg-[#e6e6f0] scale-95 border-2 border-[#7f7f82]"
  const clayPopover = "bg-[#f0f0f5] shadow-[6px_6px_12px_#d1d1db,-6px_-6px_12px_#ffffff] rounded-2xl border-none"
  const clayColorSwatch =
    "shadow-[2px_2px_4px_#d1d1db,-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1db,inset_-2px_-2px_4px_#ffffff]"
  const clayColorSwatchActive = "shadow-[inset_3px_3px_6px_#d1d1db,inset_-3px_-3px_6px_#ffffff]"
  const clayInput = "bg-[#f0f0f5] shadow-[inset_2px_2px_4px_#d1d1db,inset_-2px_-2px_4px_#ffffff] border-none"

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`inline-flex items-center gap-2 ${clayContainer} overflow-x-auto max-w-full`}>
        {/* Drawing Tools */}
        <div className={`flex items-center gap-1 ${claySection}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  selectedTool === "pen" && clayButtonActive,
                  selectedTool === "pen" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => handleToolClick("pen")}
              >
                <PenTool className={cn("w-4 h-4", selectedTool === "pen" && "w-5 h-5")} />
                <span className="sr-only">Pen</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Pen</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  selectedTool === "line" && clayButtonActive,
                  selectedTool === "line" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => handleToolClick("line")}
              >
                <Minus className={cn("w-4 h-4", selectedTool === "line" && "w-5 h-5")} />
                <span className="sr-only">Line</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Line</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  selectedTool === "circle" && clayButtonActive,
                  selectedTool === "circle" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => handleToolClick("circle")}
              >
                <Circle className={cn("w-4 h-4", selectedTool === "circle" && "w-5 h-5")} />
                <span className="sr-only">Circle</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Circle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  selectedTool === "rectangle" && clayButtonActive,
                  selectedTool === "rectangle" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => handleToolClick("rectangle")}
              >
                <Square className={cn("w-4 h-4", selectedTool === "rectangle" && "w-5 h-5")} />
                <span className="sr-only">Rectangle</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Rectangle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  selectedTool === "text" && clayButtonActive,
                  selectedTool === "text" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => handleToolClick("text")}
              >
                <Type className={cn("w-4 h-4", selectedTool === "text" && "w-5 h-5")} />
                <span className="sr-only">Text</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Text</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  selectedTool === "eraser" && clayButtonActive,
                  selectedTool === "eraser" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => handleToolClick("eraser")}
              >
                <Eraser className={cn("w-4 h-4", selectedTool === "eraser" && "w-5 h-5")} />
                <span className="sr-only">Eraser</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Eraser</TooltipContent>
          </Tooltip>
        </div>

        {/* Thickness Buttons */}
        <div className={`flex items-center gap-1 ${claySection}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-200",
                  clayButton,
                  thickness === "1" && clayButtonActive,
                  thickness === "1" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => setThickness("1")}
              >
                <div className={cn("w-4 h-0.5 bg-current rounded-full", thickness === "1" && "bg-[#5c5c5c]")} />
                <span className="sr-only">Thin</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Thin</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-200",
                  clayButton,
                  thickness === "3" && clayButtonActive,
                  thickness === "3" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => setThickness("3")}
              >
                <div className={cn("w-4 h-1 bg-current rounded-full", thickness === "3" && "bg-[#5c5c5c]")} />
                <span className="sr-only">Medium</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Medium</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-200",
                  clayButton,
                  thickness === "6" && clayButtonActive,
                  thickness === "6" && "text-[#5c5c5c] font-bold",
                )}
                onClick={() => setThickness("6")}
              >
                <div className={cn("w-4 h-2 bg-current rounded-full", thickness === "5" && "bg-[#5c5c5c]")} />
                <span className="sr-only">Thick</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Thick</TooltipContent>
          </Tooltip>
        </div>

        {/* Color Pickers */}
        <div className={`flex items-center gap-1 ${claySection}`}>
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-9 w-9 p-0 rounded-full relative transition-all duration-200", clayButton)}
                  >
                    <div className="absolute inset-0 m-2 rounded-full" style={{ backgroundColor: selectedColor }} />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent className={clayPopover}>Stroke Color</TooltipContent>
            </Tooltip>
            <PopoverContent className={`w-72 p-0 rounded-3xl border-none ${clayPopover}`} align="start">
              {/* Header */}
              <div className="p-4 border-b border-[#e8e8f0]">
                <h3 className="font-medium text-sm text-gray-700 mb-3">Stroke Color</h3>
                <div className={`flex items-center gap-3 p-2 rounded-2xl ${clayInput}`}>
                  <div className={`w-12 h-12 rounded-xl ${clayColorSwatch}`} style={{ backgroundColor: selectedColor }} />
                  <div className="text-sm font-mono text-gray-700">{selectedColor.toUpperCase()}</div>
                </div>
              </div>

              {/* Recent Colors */}
              {recentColors.length > 0 && (
                <div className="p-4 border-b border-[#e8e8f0]">
                  <h4 className="text-xs font-medium mb-3 text-gray-500">Recent Colors</h4>
                  <div className="flex gap-2">
                    {recentColors.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                          clayColorSwatch,
                          selectedColor === color && clayColorSwatchActive,
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handleStrokeColorChange(color)}
                      >
                        {selectedColor === color && (
                          <Check
                            className={cn(
                              "w-4 h-4",
                              ["#FFFFFF", "#FFFF00", "#00FF00", "#00FFFF", "#FFC0CB", "#32CD32"].includes(color)
                                ? "text-black"
                                : "text-white",
                            )}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Palette */}
              <div className="p-4">
                <h4 className="text-xs font-medium mb-3 text-gray-500">Color Palette</h4>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={cn(
                        "group relative h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200",
                        clayColorSwatch,
                        selectedColor === color.value && clayColorSwatchActive,
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleStrokeColorChange(color.value)}
                    >
                      {selectedColor === color.value && <Check className={`w-5 h-5 text-${color.textColor}`} />}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 right-0 text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity",
                          color.textColor === "white" ? "bg-black/50 text-white" : "bg-white/70 text-black",
                        )}
                      >
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div className="p-4 border-t border-[#e8e8f0]">
                <h4 className="text-xs font-medium mb-3 text-gray-500">Custom Color</h4>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={customStrokeColor}
                      onChange={(e) => setCustomStrokeColor(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div
                      className={`w-12 h-12 rounded-xl ${clayColorSwatch}`}
                      style={{ backgroundColor: customStrokeColor }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={customStrokeColor.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^#([A-Fa-f0-9]{0,6})$/.test(value)) {
                          setCustomStrokeColor(value)
                        }
                      }}
                      className={`px-3 py-2 text-sm font-mono rounded-xl ${clayInput}`}
                      placeholder="#000000"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleStrokeColorChange(customStrokeColor)}
                      className={`rounded-xl ${clayButton} hover:${clayButtonActive} bg-[#f0f0f5] text-gray-700`}
                    >
                      Apply Color
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-9 w-9 p-0 rounded-full relative transition-all duration-200", clayButton)}
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
              </TooltipTrigger>
              <TooltipContent className={clayPopover}>Background Color</TooltipContent>
            </Tooltip>
            <PopoverContent className={`w-72 p-0 rounded-3xl border-none ${clayPopover}`} align="start">
              {/* Header */}
              <div className="p-4 border-b border-[#e8e8f0]">
                <h3 className="font-medium text-sm text-gray-700 mb-3">Background Color</h3>
                <div className={`flex items-center gap-3 p-2 rounded-2xl ${clayInput}`}>
                  <div
                    className={`w-12 h-12 rounded-xl ${clayColorSwatch} border border-gray-300`}
                    style={{ backgroundColor: selectedbgColor }}
                  />
                  <div className="text-sm font-mono text-gray-700">{selectedbgColor.toUpperCase()}</div>
                </div>
              </div>

              {/* Recent Colors */}
              {recentColors.length > 0 && (
                <div className="p-4 border-b border-[#e8e8f0]">
                  <h4 className="text-xs font-medium mb-3 text-gray-500">Recent Colors</h4>
                  <div className="flex gap-2">
                    {recentColors.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center border border-gray-300 transition-all duration-200",
                          clayColorSwatch,
                          selectedbgColor === color && clayColorSwatchActive,
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handleBgColorChange(color)}
                      >
                        {selectedbgColor === color && (
                          <Check
                            className={cn(
                              "w-4 h-4",
                              ["#FFFFFF", "#FFFF00", "#00FF00", "#00FFFF", "#FFC0CB", "#32CD32"].includes(color)
                                ? "text-black"
                                : "text-white",
                            )}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Palette */}
              <div className="p-4">
                <h4 className="text-xs font-medium mb-3 text-gray-500">Color Palette</h4>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={cn(
                        "group relative h-14 rounded-xl flex items-center justify-center overflow-hidden border border-gray-300 transition-all duration-200",
                        clayColorSwatch,
                        selectedbgColor === color.value && clayColorSwatchActive,
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleBgColorChange(color.value)}
                    >
                      {selectedbgColor === color.value && <Check className={`w-5 h-5 text-${color.textColor}`} />}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 right-0 text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity",
                          color.textColor === "white" ? "bg-black/50 text-white" : "bg-white/70 text-black",
                        )}
                      >
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div className="p-4 border-t border-[#e8e8f0]">
                <h4 className="text-xs font-medium mb-3 text-gray-500">Custom Background</h4>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div
                      className={`w-12 h-12 rounded-xl border border-gray-300 ${clayColorSwatch}`}
                      style={{ backgroundColor: customBgColor }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={customBgColor.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^#([A-Fa-f0-9]{0,6})$/.test(value)) {
                          setCustomBgColor(value)
                        }
                      }}
                      className={`px-3 py-2 text-sm font-mono rounded-xl ${clayInput}`}
                      placeholder="#FFFFFF"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleBgColorChange(customBgColor)}
                      className={`rounded-xl ${clayButton} hover:${clayButtonActive} bg-[#f0f0f5] text-gray-700`}
                    >
                      Apply Background
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-1 ml-auto ${claySection}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <Undo className="w-4 h-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  clayButton,
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <Redo className="w-4 h-4" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Redo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={cn("h-9 w-9 p-0 rounded-full transition-all duration-200", clayButton)}
              >
                <Save className="w-4 h-4" />
                <span className="sr-only">Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Save</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className={cn("h-9 w-9 p-0 rounded-full transition-all duration-200", clayButton)}
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Clear All</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className={clayPopover}>Clear All</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
