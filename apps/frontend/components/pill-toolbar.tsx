// "use client"

// import { useState, useEffect } from "react"
// import { Circle, Square, Type, Minus, Eraser, Trash2, Check, Pencil, Save, Undo, Redo, Palette } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { clearAll } from "@/components/ui/clearAll"
// import { toast } from "./ui/use-toast"
// // import { HandleClearAll } from "./handleClearAll"

// type Tool = "pen" | "line" | "circle" | "rectangle" | "eraser" | "text" | null
// type StrokeThickness = "thin" | "medium" | "thick"

// interface DrawingToolbarProps {
//     selectedTool: Tool;
//     setSelectedTool: (tool: Tool) => void;
//     selectedColor: string,
//     setSelectedColor: (color: string) => void,
//     clear: boolean,
//     setclear: (clear: boolean) => void,
//     roomId: string,
//     selectedbgColor :string,
//     setSelectedbgColor : (color:string)=>void
// }

// const predefinedColors = [
//   "#000000", // Black
//   "#FFFFFF", // White
//   "#FF0000", // Red
//   "#00FF00", // Green
//   "#0000FF", // Blue
//   "#FFFF00", // Yellow
//   "#FF00FF", // Magenta
//   "#00FFFF", // Cyan
//   "#FFA500", // Orange
//   "#800080", // Purple
// ]

// // Map thickness names to actual pixel values
// const thicknessValues = {
//   thin: 2,
//   medium: 5,
//   thick: 10,
// }

// export default function PillToolbar({ selectedTool, setSelectedTool, selectedColor, setSelectedColor, clear, setclear, roomId ,selectedbgColor,setSelectedbgColor}: DrawingToolbarProps) {
// //   const [selectedTool, setSelectedTool] = useState<Tool>("pen")
// //   const [selectedColor, setSelectedColor] = useState("#000000")
//   const [customStrokeColor, setCustomStrokeColor] = useState("#000000")
// //   const [selectedbgColor, setSelectedbgColor] = useState("#FFFFFF")
//   const [customBgColor, setCustomBgColor] = useState("#FFFFFF")
//   const [thickness, setThickness] = useState<StrokeThickness>("medium")
//   const [canUndo, setCanUndo] = useState(false)
//   const [canRedo, setCanRedo] = useState(false)

//   // Initialize canUndo and canRedo state client-side only
//   useEffect(() => {
//     // Set initial state once client-side
//     setCanUndo(false);
//     setCanRedo(false);
//   }, []);

//   const handleToolClick = (tool: Tool) => {
//     setSelectedTool(tool)
//   }

//   const handleStrokeColorChange = (color: string) => {
//     setSelectedColor(color)
//     setCustomStrokeColor(color)
//   }

//   const handleBgColorChange = (color: string) => {
//     setSelectedbgColor(color)
//     setCustomBgColor(color)
//   }

//   const handleClearAll = async() => {
//     try {
//         setclear(true);
//         await clearAll(roomId);
//         setSelectedTool(null);
//         setCanUndo(false)
//         setCanRedo(false)
//         console.log("Clear all successful");
//     } catch (error) {
//         console.error("Failed to clear canvas:", error);
//         toast({
//             variant : "error",
//             title :"Failed to clear canvas",
//             description :"Please try again"
//         })
//     } finally {
//         setclear(false);
//     }

//   }

//   const handleUndo = () => {
//     console.log("Undo action")
//     setCanRedo(true)
//     // Don't use Math.random() as it causes hydration errors
//     setCanUndo(false) // Set to a deterministic value instead
//   }

//   const handleRedo = () => {
//     console.log("Redo action")
//     // Don't use Math.random() as it causes hydration errors
//     setCanRedo(false) // Set to a deterministic value instead
//   }

//   const handleSave = () => {
//     console.log("Save drawing")
//   }

//   return (
//     <TooltipProvider delayDuration={300}>
//       <div className="inline-flex items-center gap-1 p-1.5 bg-gray-100 rounded-full shadow-sm overflow-x-auto max-w-full">
//         {/* Drawing Tools */}
//         <div className="flex items-center bg-white rounded-full shadow-sm p-1 gap-0.5">

//         <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={selectedTool === "rectangle" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full",
//                   selectedTool === "rectangle" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => handleToolClick("rectangle")}
//               >
//                 <Square className="w-4 h-4" />
//                 <span className="sr-only">Rectangle</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Rectangle</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={selectedTool === "line" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full",
//                   selectedTool === "line" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => handleToolClick("line")}
//               >
//                 <Minus className="w-4 h-4" />
//                 <span className="sr-only">Line</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Line</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={selectedTool === "circle" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full",
//                   selectedTool === "circle" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => handleToolClick("circle")}
//               >
//                 <Circle className="w-4 h-4" />
//                 <span className="sr-only">Circle</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Circle</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={selectedTool === "pen" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full",
//                   selectedTool === "pen" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => handleToolClick("pen")}
//               >
//                 <Pencil className="w-4 h-4" />
//                 <span className="sr-only">Pen</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Pen</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={selectedTool === "text" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full",
//                   selectedTool === "text" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => handleToolClick("text")}
//               >
//                 <Type className="w-4 h-4" />
//                 <span className="sr-only">Text</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Text</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={selectedTool === "eraser" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full",
//                   selectedTool === "eraser" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => handleToolClick("eraser")}
//               >
//                 <Eraser className="w-4 h-4" />
//                 <span className="sr-only">Eraser</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Eraser</TooltipContent>
//           </Tooltip>
//         </div>

//         {/* Thickness Buttons */}
//         <div className="flex items-center bg-white rounded-full shadow-sm p-1 gap-0.5">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={thickness === "thin" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full flex items-center justify-center",
//                   thickness === "thin" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => setThickness("thin")}
//               >
//                 <div className="w-4 h-0.5 bg-current rounded-full" />
//                 <span className="sr-only">Thin</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Thin</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={thickness === "medium" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full flex items-center justify-center",
//                   thickness === "medium" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => setThickness("medium")}
//               >
//                 <div className="w-4 h-1 bg-current rounded-full" />
//                 <span className="sr-only">Medium</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Medium</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant={thickness === "thick" ? "default" : "ghost"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 rounded-full flex items-center justify-center",
//                   thickness === "thick" && "bg-gray-900 text-white hover:bg-gray-800",
//                 )}
//                 onClick={() => setThickness("thick")}
//               >
//                 <div className="w-4 h-2 bg-current rounded-full" />
//                 <span className="sr-only">Thick</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Thick</TooltipContent>
//           </Tooltip>
//         </div>

//         {/* Color Pickers */}
//         <div className="flex items-center bg-white rounded-full shadow-sm p-1 gap-1">
//           <Popover>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <PopoverTrigger asChild>
//                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full relative">
//                     <div className="absolute inset-0 m-2 rounded-full" style={{ backgroundColor: selectedColor }} />
//                   </Button>
//                 </PopoverTrigger>
//               </TooltipTrigger>
//               <TooltipContent>Stroke Color</TooltipContent>
//             </Tooltip>
//             <PopoverContent className="w-64 p-0" align="start">
//               <div className="p-2 border-b">
//                 <div className="font-medium mb-1.5">Stroke Color</div>
//                 <div className="grid grid-cols-5 gap-1">
//                   {predefinedColors.map((color) => (
//                     <button
//                       key={color}
//                       className={cn(
//                         "w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center",
//                         selectedColor === color && "ring-2 ring-black",
//                       )}
//                       style={{ backgroundColor: color }}
//                       onClick={() => handleStrokeColorChange(color)}
//                     >
//                       {selectedColor === color && (
//                         <Check
//                           className={cn(
//                             "w-4 h-4",
//                             color === "#FFFFFF" || color === "#FFFF00" || color === "#00FF00" || color === "#00FFFF"
//                               ? "text-black"
//                               : "text-white",
//                           )}
//                         />
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div className="p-2">
//                 <div className="font-medium mb-1.5">Custom Color</div>
//                 <div className="flex gap-2">
//                   <input
//                     type="color"
//                     value={customStrokeColor}
//                     onChange={(e) => setCustomStrokeColor(e.target.value)}
//                     className="w-8 h-8 rounded-full"
//                   />
//                   <Button className="flex-1" size="sm" onClick={() => handleStrokeColorChange(customStrokeColor)}>
//                     Apply
//                   </Button>
//                 </div>
//               </div>
//             </PopoverContent>
//           </Popover>

//           <Popover>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <PopoverTrigger asChild>
//                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full relative">
//                     <div
//                       className="absolute inset-0 m-2 rounded-full border border-gray-300"
//                       style={{ backgroundColor: selectedbgColor }}
//                     />
//                     <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full">
//                       <Palette className="w-1.5 h-1.5 text-gray-500" />
//                     </div>
//                   </Button>
//                 </PopoverTrigger>
//               </TooltipTrigger>
//               <TooltipContent>Background Color</TooltipContent>
//             </Tooltip>
//             <PopoverContent className="w-64 p-0" align="start">
//               <div className="p-2 border-b">
//                 <div className="font-medium mb-1.5">Background Color</div>
//                 <div className="grid grid-cols-5 gap-1">
//                   {predefinedColors.map((color) => (
//                     <button
//                       key={color}
//                       className={cn(
//                         "w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center",
//                         selectedbgColor === color && "ring-2 ring-black",
//                       )}
//                       style={{ backgroundColor: color }}
//                       onClick={() => handleBgColorChange(color)}
//                     >
//                       {selectedbgColor === color && (
//                         <Check
//                           className={cn(
//                             "w-4 h-4",
//                             color === "#FFFFFF" || color === "#FFFF00" || color === "#00FF00" || color === "#00FFFF"
//                               ? "text-black"
//                               : "text-white",
//                           )}
//                         />
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div className="p-2">
//                 <div className="font-medium mb-1.5">Custom Background</div>
//                 <div className="flex gap-2">
//                   <input
//                     type="color"
//                     value={customBgColor}
//                     onChange={(e) => setCustomBgColor(e.target.value)}
//                     className="w-8 h-8 rounded-full"
//                   />
//                   <Button className="flex-1" size="sm" onClick={() => handleBgColorChange(customBgColor)}>
//                     Apply
//                   </Button>
//                 </div>
//               </div>
//             </PopoverContent>
//           </Popover>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center bg-white rounded-full shadow-sm p-1 gap-0.5 ml-auto">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleUndo}
//                 disabled={!canUndo}
//                 className="h-8 w-8 p-0 rounded-full"
//               >
//                 <Undo className="w-4 h-4" />
//                 <span className="sr-only">Undo</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Undo</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleRedo}
//                 disabled={!canRedo}
//                 className="h-8 w-8 p-0 rounded-full"
//               >
//                 <Redo className="w-4 h-4" />
//                 <span className="sr-only">Redo</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Redo</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0 rounded-full">
//                 <Save className="w-4 h-4" />
//                 <span className="sr-only">Save</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Save</TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="sm" onClick={handleClearAll/*()=>HandleClearAll(setclear,setSelectedTool,setCanUndo,setCanRedo,roomId)*/} className="h-8 w-8 p-0 rounded-full">
//                 <Trash2 className="w-4 h-4" />
//                 <span className="sr-only">Clear All</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Clear All</TooltipContent>
//           </Tooltip>
//         </div>
//       </div>
//     </TooltipProvider>
//   )
// }
