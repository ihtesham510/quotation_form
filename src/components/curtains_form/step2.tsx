import type React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2 } from 'lucide-react'
import type { QuoteData, Room } from './types'
import { roomTypes } from './data'

interface Step2Props {
  quoteData: QuoteData
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
  errors: Record<string, string>
}

export function Step2({ quoteData, setQuoteData, errors }: Step2Props) {
  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `Room ${quoteData.rooms.length + 1}`,
      type: 'Living Room',
      products: [],
    }
    setQuoteData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
    }))
  }

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setQuoteData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room,
      ),
    }))
  }

  const removeRoom = (roomId: string) => {
    setQuoteData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((room) => room.id !== roomId),
    }))
  }

  const duplicateRoom = (roomId: string) => {
    const roomToDuplicate = quoteData.rooms.find((room) => room.id === roomId)
    if (roomToDuplicate) {
      const newRoom: Room = {
        ...roomToDuplicate,
        id: Date.now().toString(),
        name: `${roomToDuplicate.name} (Copy)`,
        products: roomToDuplicate.products.map((product) => ({
          ...product,
          id: Date.now().toString() + Math.random(),
        })),
      }
      setQuoteData((prev) => ({
        ...prev,
        rooms: [...prev.rooms, newRoom],
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Room Configuration</h3>
        <Button onClick={addRoom} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {errors.rooms && (
        <Alert>
          <AlertDescription>{errors.rooms}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {quoteData.rooms.map((room, index) => (
          <Card key={room.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Room {index + 1}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateRoom(room.id)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRoom(room.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Name</Label>
                  <Input
                    value={room.name}
                    onChange={(e) =>
                      updateRoom(room.id, { name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select
                    value={room.type}
                    onValueChange={(value) =>
                      updateRoom(room.id, { type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
