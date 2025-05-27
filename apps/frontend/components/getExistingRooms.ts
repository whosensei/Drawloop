import axios from "axios"

const api = axios.create({
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
})

const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 

function getCacheKey(url: string, token: string): string {
  return `${url}_${token?.slice(-10) || 'anonymous'}`
}

function getFromCache(cacheKey: string): any | null {
  const cached = requestCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  requestCache.delete(cacheKey)
  return null
}

function setCache(cacheKey: string, data: any): void {
  requestCache.set(cacheKey, { data, timestamp: Date.now() })
}

export async function GetexistingRooms() {
  try {
    const tok = localStorage.getItem("token")
    if (!tok) {
      console.warn("No token found when fetching rooms")
      return []
    }
    
    const cacheKey = getCacheKey('/api/rooms', tok)
    const cachedData = getFromCache(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    const response = await api.get('/api/rooms', {
      headers: {
        'authorization': tok
      }
    })
    
    if (!response.data.rooms || !Array.isArray(response.data.rooms)) {
      console.error("Invalid rooms data format:", response.data)
      return []
    }
    
    const rooms = response.data.rooms
    setCache(cacheKey, rooms)
    
    return rooms
  } catch (error) {
    console.error("Error fetching room data:", error)
    
    // Return cached data even if expired in case of network error
    const tok = localStorage.getItem("token")
    if (tok) {
      const cacheKey = getCacheKey('/api/rooms', tok)
      const cached = requestCache.get(cacheKey)
      if (cached) {
        console.log("Returning stale cached data due to network error")
        return cached.data
      }
    }
    
    return []
  }
}

export async function Createroom(newRoomName: string) {
  try {
    const tok = localStorage.getItem("token")
    if (!tok) {
      throw new Error("Authentication required")
    }
    
    const response = await api.post('/api/create-room', {
      name: newRoomName
    }, {
      headers: {
        'authorization': tok
      }
    })
    
    // Clear cache after creating a room
    const cacheKey = getCacheKey('/api/rooms', tok)
    requestCache.delete(cacheKey)
    
    return response.data
  } catch (error) {
    console.error("Failed to create room", error)
    throw error
  }
}

export async function LeaveRoom(roomId: number) {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await api.delete(`/api/delete-room/${roomId}`, {
      headers: {
        'authorization': token
      }
    })
    
    // Clear cache after leaving a room
    const cacheKey = getCacheKey('/api/rooms', token)
    requestCache.delete(cacheKey)
    
    return response.data
  } catch (error) {
    console.error("Failed to leave room:", error)
    throw error
  }
}

// Function to clear all cache (useful for logout)
export function clearApiCache() {
  requestCache.clear()
}