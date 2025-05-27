"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Plus, Trash2, ExternalLink, Info, Search, Loader2 } from "lucide-react"
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
import { Room } from "@repo/db/schema"
import { GetexistingRooms, Createroom, LeaveRoom, clearApiCache } from "./getExistingRooms"
import JoinRoom, { createSocketConnection } from "./joinRoom"

type Room = {
  id: number,
  name: string,
  createdAt: string | null,
  adminId: number,
  members: number | null,
}

type UIRoom = {
  id: number,
  name: string,
  createdAt: string,
  members: number,
  color: string
}

let roomsCache: UIRoom[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 30000

const ClayRoomCard = memo(({
  room,
  onJoin,
  onDelete,
  isJoining,
}: {
  room: UIRoom
  onJoin: () => void
  onDelete: () => void
  isJoining: boolean
}) => {
  const colorMap: Record<string, { light: string; medium: string; dark: string }> = useMemo(() => ({
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
  }), [])

  const colors = colorMap[room.color] || colorMap.indigo

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
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
              disabled={isJoining}
            >
              {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              <span>{isJoining ? "Joining..." : "Join"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-rose-400 transition-colors"
              onClick={onDelete}
              disabled={isJoining}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ClayRoomCard.displayName = "ClayRoomCard"

const RoomCardSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 h-full">
      <div className="mb-4">
        <div className="h-6 bg-white/10 rounded mb-2"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
        </div>
      </div>
      <div className="mt-auto flex justify-between gap-3">
        <div className="flex-1 h-8 bg-white/10 rounded"></div>
        <div className="h-8 w-8 bg-white/10 rounded"></div>
      </div>
    </div>
  </div>
))

RoomCardSkeleton.displayName = "RoomCardSkeleton"

export default function Dashboard() {
  const [rooms, setRooms] = useState<UIRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [joiningroomId, setJoiningroomId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(() => Date.now())
  const { toast } = useToast()

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms
    return rooms.filter((room) => 
      room.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  }, [rooms, searchQuery])

  const loadRooms = useCallback(async (force = false) => {
    const now = Date.now()
    
    if (!force && roomsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      setRooms(roomsCache)
      setIsLoading(false)
      return
    }

    try {
      setIsRefreshing(true)
      const initialRooms: Room[] = await GetexistingRooms()
      const colors = ["indigo", "violet", "rose", "amber", "cyan"]
      const uirooms = initialRooms.map((room: Room, index: number) => ({
        id: room.id,
        name: room.name,
        createdAt: room.createdAt || new Date().toLocaleDateString(),
        members: room.members || 0,
        color: colors[index % colors.length]
      }))
      
      roomsCache = uirooms
      cacheTimestamp = now
      
      setRooms(uirooms)
    } catch (e) {
      console.error("Failed to fetch rooms:", e)
      toast({
        variant: "error",
        title: "Failed to load rooms",
        description: "Please refresh the page to try again."
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    loadRooms()
  }, [loadRooms, refreshTrigger])

  useEffect(() => {
    const isReturningFromCanvas = sessionStorage.getItem('returningFromCanvas')
    if (isReturningFromCanvas) {
      sessionStorage.removeItem('returningFromCanvas')
      loadRooms(true)
    }
  }, [loadRooms])

  const handleCreateRoom = useCallback(async () => {
    const trimmedName = newRoomName.trim()
    if (!trimmedName) {
      toast({
        variant: "error",
        title: "Room name required",
        description: "Please enter a name for your room."
      })
      return
    }

    setIsCreatingRoom(true)
    try {
      const roomdata = await Createroom(trimmedName)

      if (!roomdata || !roomdata.id) {
        throw new Error("Invalid response from server")
      }

      const colors = ["indigo", "violet", "rose", "amber", "cyan"]
      const newRoom: UIRoom = {
        id: roomdata.id,
        name: roomdata.name,
        createdAt: new Date().toLocaleDateString(),
        members: 1,
        color: colors[rooms.length % colors.length]
      }
      
      setRooms(prev => [newRoom, ...prev])
      
      roomsCache = null
      
      setNewRoomName("")
      setIsCreateDialogOpen(false)
      
      toast({
        variant: "success",
        title: "Room Created",
        description: `"${roomdata.name}" has been created successfully.`
      })
    } catch (e) {
      console.error("Failed to create room:", e)
      toast({
        variant: "error", 
        title: "Failed to create room",
        description: "Please try again later."
      })
    } finally {
      setIsCreatingRoom(false)
    }
  }, [newRoomName, rooms.length, toast])

  const handleDeleteRoom = useCallback(async (id: number, name: string) => {
    try {
      setRooms(prev => prev.filter(room => room.id !== id))
      
      await LeaveRoom(id)
      
      roomsCache = null
      
      toast({
        variant: "info",
        title: "Room Removed",
        description: `You have left "${name}".`
      })
    } catch (error) {
      console.error("Failed to leave room:", error)
      loadRooms(true)
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to leave the room. Please try again."
      })
    }
  }, [loadRooms, toast])

  const handleJoinRoom = useCallback(async (id: string) => {
    try {
      setJoiningroomId(id)
      const roomToJoin = rooms.find(room => room.id.toString() === id)
      
      if (!roomToJoin) {
        throw new Error("Room not found")
      }

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await axios.post('/api/add-user-to-room', {
        roomId: id
      }, {
        headers: {
          'authorization': token
        }
      })

      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to join room")
      }

      try {
        await createSocketConnection(id)
      } catch (err) {
        console.warn("WebSocket connection could not be established. Will try again when entering the room.", err)
      }

      toast({
        variant: "success",
        title: "Joining Room",
        description: `You are now joining "${roomToJoin.name}".`
      })
      
      window.location.href = `/canvas/${id}`
    } catch (error) {
      console.error("Failed to join room:", error)
      toast({
        variant: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join the room. Please try again."
      })
    } finally {
      setJoiningroomId(null)
    }
  }, [rooms, toast])

  const handleLogout = useCallback(() => {
    toast({
      variant: "info",
      title: "Logged Out",
      description: "You have been logged out successfully."
    })
    
    roomsCache = null
    clearApiCache()
    
    setTimeout(() => {
      localStorage.removeItem("token")
      window.location.href = "/"
    }, 1000)
  }, [toast])

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />

      <header className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            Drawloop
          </h1>
          <div className="flex items-center gap-4">
            <Toggle />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/10 bg-white/5 hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold font-poppins tracking-tight">Your Rooms</h2>
            {isRefreshing && (
              <Loader2 className="h-5 w-5 animate-spin text-white/60" />
            )}
          </div>

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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isCreatingRoom) {
                        handleCreateRoom()
                      }
                    }}
                    disabled={isCreatingRoom}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    disabled={isCreatingRoom}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 border-none"
                    disabled={isCreatingRoom}
                  >
                    {isCreatingRoom ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRooms.map((room) => (
                <ClayRoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => handleJoinRoom(room.id.toString())}
                  onDelete={() => handleDeleteRoom(room.id, room.name)}
                  isJoining={joiningroomId === room.id.toString()}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && rooms.length === 0 && (
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

        {!isLoading && filteredRooms.length === 0 && rooms.length > 0 && (
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
