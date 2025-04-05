"use client"

import { useState } from "react"
import { Circle, Square, Type, Minus, Eraser, Trash2, ChevronDown, Check, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

type Tool = "pen" | "line" | "circle" | "rectangle" | "eraser" | "text" | null

const predefinedColors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
]

interface DrawingToolbarProps {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
    selectedColor : string,
    setSelectedColor : (color : string) => void
}

export default function DrawingToolbar({ selectedTool, setSelectedTool, selectedColor, setSelectedColor }: DrawingToolbarProps) {
    // const [selectedColor, setSelectedColor] = useState("#000000")
    // const [customColor, setCustomColor] = useState("#000000")
    const [strokeWidth, setStrokeWidth] = useState(3)


    const handleToolClick = (tool: Tool) => {
        setSelectedTool(tool)
    }

    const handleColorChange = (color: string) => {
        setSelectedColor(color)
        // setCustomColor(color)
    }

    const handleClearAll = () => {
        // Implement clear all functionality
        console.log("Clear all")
        setSelectedTool(null)
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
            <Button
                variant={selectedTool === "line" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("line")}
                title="Line"
            >
                <Minus className="w-4 h-4" />
            </Button>

            <Button
                variant={selectedTool === "circle" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("circle")}
                title="Circle"
            >
                <Circle className="w-4 h-4" />
            </Button>

            <Button
                variant={selectedTool === "rectangle" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("rectangle")}
                title="Rectangle"
            >
                <Square className="w-4 h-4" />
            </Button>
            <Button
                variant={selectedTool === "pen" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("pen")}
            >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Pen</span>
            </Button>

            <Button
                variant={selectedTool === "eraser" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("eraser")}
                title="Eraser"
            >
                <Eraser className="w-4 h-4" />
            </Button>

            <Button
                variant={selectedTool === "text" ? "default" : "outline"}
                size="icon"
                onClick={() => handleToolClick("text")}
                title="Text"
            >
                <Type className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={handleClearAll} title="Clear All" className="ml-1">
                <Trash2 className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 min-w-[150px]">
                <span className="text-xs font-medium">Width:</span>
                <Slider
                    value={[strokeWidth]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(value) => setStrokeWidth(value[0])}
                    className="w-full"
                />
                <span className="text-xs w-6 text-center">{strokeWidth}</span>
            </div>

            <div className="h-6 mx-1 border-l border-gray-300" />

            <div className="h-6 mx-1 border-l border-gray-300" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="relative flex items-center gap-1 pl-2 pr-1">
                        <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: selectedColor }} />
                        <span className="sr-only">Select color</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="grid grid-cols-5 gap-1 p-2">
                        {predefinedColors.map((color) => (
                            <button
                                key={color}
                                className={cn(
                                    "w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center",
                                    selectedColor === color && "ring-2 ring-black",
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                            >
                                {selectedColor === color && (
                                    <Check
                                        className={cn(
                                            "w-4 h-4",
                                            color === "#FFFFFF" || color === "#FFFF00" || color === "#00FF00" || color === "#00FFFF"
                                                ? "text-black"
                                                : "text-white",
                                        )}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    {/* <div className="p-2 border-t">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    Custom Color
                                    <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: customColor }} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="custom-color">Pick a color:</label>
                                            <div
                                                className="w-8 h-8 rounded-md border border-gray-200"
                                                style={{ backgroundColor: customColor }}
                                            />
                                        </div>
                                        <input
                                            id="custom-color"
                                            type="color"
                                            value={customColor}
                                            onChange={(e) => setCustomColor(e.target.value)}
                                            className="w-full h-8"
                                        />
                                    </div>
                                    <Button onClick={() => handleColorChange(customColor)}>Apply Color</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

