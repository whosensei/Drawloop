import { Button } from "./ui/button"
import {LogOut} from "lucide-react"
import { cn } from "@/lib/utils"


export default function BacktoDashboard(){
    const theme = localStorage.getItem("theme")

    function leaveroom(){
            localStorage.removeItem("selectedColor"),
            localStorage.removeItem("selectedbgColor"),
            localStorage.removeItem("thickness")
            localStorage.removeItem("theme")
            
            // Set a flag to indicate we're returning from a canvas
            sessionStorage.setItem('returningFromCanvas', 'true');
            
            window.location.href = "/dashboard"
    }
    return (
        <>
        
        <Button className={cn(
              theme === "light"
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-red-100 text-red-600 hover:bg-red-200",
            )} onClick={leaveroom}>
            <LogOut />
        </Button>
        </>

    )
}