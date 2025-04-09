// import { clearAll } from "@/components/ui/clearAll"
// import { toast } from "./ui/use-toast"


// export const HandleClearAll = async (
//   setclear: (value: boolean) => void,
//   setSelectedTool: (tool: any | null) => void,
//   setCanUndo: (value: boolean) => void,
//   setCanRedo: (value: boolean) => void,
//   roomId: string
// ) => {
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