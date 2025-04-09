"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { LogOut, Plus, Trash2, ExternalLink, Info, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

// Mock data for rooms
const initialRooms = [
  { id: "1", name: "Brainstorming Session", createdAt: "2023-10-15", members: 4, color: "indigo" },
  { id: "2", name: "Project Planning", createdAt: "2023-10-16", members: 6, color: "violet" },
  { id: "3", name: "UI Design Review", createdAt: "2023-10-17", members: 3, color: "rose" },
  { id: "4", name: "Weekly Team Sync", createdAt: "2023-10-18", members: 8, color: "amber" },
  { id: "5", name: "Product Roadmap", createdAt: "2023-10-19", members: 5, color: "cyan" },
]

// Demo credentials component
// function TestCredentials() {
//   return (
//     <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 mb-8">
//       <div className="flex items-center gap-2 mb-3">
//         <Info className="h-4 w-4 text-indigo-400" />
//         <h3 className="text-sm font-medium text-white">Demo Information</h3>
//       </div>

//       <p className="text-sm text-white/60 mb-2">
//         This is a demo dashboard showing your sketch rooms. You can create new rooms, join existing ones, or delete
//         rooms you no longer need.
//       </p>

//       <div className="text-[11px] text-white/40 mt-3">
//         Try creating a new room or joining an existing one to see the interactions.
//       </div>
//     </div>
//   )
// }

// Claymorphic room card component
function ClayRoomCard({
  room,
  onJoin,
  onDelete,
}: {
  room: { id: string; name: string; createdAt: string; members: number; color: string }
  onJoin: () => void
  onDelete: () => void
}) {
  // Color mapping for different card styles
  const colorMap: Record<string, { light: string; medium: string; dark: string }> = {
    indigo: {
      light: "from-indigo-400/20",
      medium: "from-indigo-500/30 to-indigo-600/20",
      dark: "from-indigo-600/40 to-indigo-700/30",
    },
    violet: {
      light: "from-violet-400/20",
      medium: "from-violet-500/30 to-violet-600/20",
      dark: "from-violet-600/40 to-violet-700/30",
    },
    rose: {
      light: "from-rose-400/20",
      medium: "from-rose-500/30 to-rose-600/20",
      dark: "from-rose-600/40 to-rose-700/30",
    },
    amber: {
      light: "from-amber-400/20",
      medium: "from-amber-500/30 to-amber-600/20",
      dark: "from-amber-600/40 to-amber-700/30",
    },
    cyan: {
      light: "from-cyan-400/20",
      medium: "from-cyan-500/30 to-cyan-600/20",
      dark: "from-cyan-600/40 to-cyan-700/30",
    },
  }

  const colors = colorMap[room.color] || colorMap.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <div
        className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${colors.medium} shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300" />

        <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 h-full flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-1 text-white group-hover:text-white/90 transition-colors">
              {room.name}
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-sm text-white/60">Created on {room.createdAt}</p>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <span className="inline-block w-2 h-2 rounded-full bg-white/50"></span>
                {room.members} members
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 gap-2 border-white/10 bg-gradient-to-r ${colors.light} hover:bg-white/10`}
              onClick={onJoin}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Join</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-rose-400 transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const [rooms, setRooms] = useState(initialRooms)
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      // Generate a random color from the available options
      const colors = ["indigo", "violet", "rose", "amber", "cyan"]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const newRoom = {
        id: Date.now().toString(),
        name: newRoomName,
        createdAt: new Date().toISOString().split("T")[0],
        members: 1,
        color: randomColor,
      }
      setRooms([...rooms, newRoom])
      setNewRoomName("")
      setIsCreateDialogOpen(false)

      toast({
        variant: "success",
        title: "Room Created",
        description: `"${newRoomName}" has been created successfully.`,
      })
    }
  }

  const handleDeleteRoom = (id: string, name: string) => {
    const roomToDelete = rooms.find((room) => room.id === id)
    setRooms(rooms.filter((room) => room.id !== id))

    toast({
      variant: "info",
      title: "Room Deleted",
      description: `"${name}" has been deleted.`,
      action: (
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => {
            if (roomToDelete) {
              setRooms((prev) => [...prev, roomToDelete])
              toast({
                variant: "success",
                title: "Room Restored",
                description: `"${name}" has been restored.`,
              })
            }
          }}
        >
          Undo
        </Button>
      ),
    })
  }

  const handleJoinRoom = async(name: string) => {
    // const tok = localStorage.getItem("token")
    // console.log(tok)
    // if(tok){
    //   const msg = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/create-room`,{
    //     name:newRoomName
    //   },{
    //     headers:{
    //       'authorization' : tok
    //     }
    //   })
    //   console.log(msg)
    // }
    toast({
      variant: "success",
      title: "Joining Room",
      description: `You are now joining "${name}".`,
    })
  }

  // Filter rooms based on search query
  const filteredRooms = searchQuery
    ? rooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : rooms

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />

      <header className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            Sketch Board
          </h1>
          <div className="flex items-center gap-4">
            <Toggle />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/10 bg-white/5 hover:bg-white/10"
              onClick={() => {
                toast({
                  variant: "info",
                  title: "Logged Out",
                  description: "You have been logged out successfully.",
                })
                setTimeout(() => {
                  localStorage.removeItem("token")
                  window.location.href = "/"
                }, 1000)
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* <TestCredentials /> */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold">Your Rooms</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
              />
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 border-none">
                  <Plus className="h-4 w-4" />
                  <span>Create Room</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#030303]/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Give your room a name to get started with your sketching session.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g., Project Brainstorm"
                    className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 border-none"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <ClayRoomCard
              key={room.id}
              room={room}
              onJoin={() => handleJoinRoom(room.name)}
              onDelete={() => handleDeleteRoom(room.id, room.name)}
            />
          ))}
        </div>

        {rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 max-w-md mx-auto">
              <h3 className="text-xl font-medium mb-2">No rooms yet</h3>
              <p className="text-white/60 mb-6">Create your first room to get started</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 border-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </div>
          </motion.div>
        )}

        {filteredRooms.length === 0 && rooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 max-w-md mx-auto">
              <h3 className="text-xl font-medium mb-2">No matching rooms</h3>
              <p className="text-white/60 mb-6">Try a different search term or create a new room</p>
              <Button
                onClick={() => setSearchQuery("")}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 border-none"
              >
                Clear Search
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
