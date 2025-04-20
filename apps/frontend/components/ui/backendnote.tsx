import { Clock } from "lucide-react"

export function BackendNote() {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-3 mt-6">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-white/60">
            If the sign-in/up fails initially, please wait a few seconds as the backend may still be starting up (it's
            deployed on Render).
          </p>
        </div>
      </div>
    )
  }
