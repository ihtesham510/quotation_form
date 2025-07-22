import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import type { TileFormData as FormData } from '@/lib/types'

interface Step4Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const UNIT_OPTIONS = [
  { value: 'sqft', label: 'per sq ft' },
  { value: 'piece', label: 'per piece' },
  { value: 'linearft', label: 'per linear foot' },
  { value: 'each', label: 'each' },
]

export function Step4({ formData, updateFormData }: Step4Props) {
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'each',
    unitPrice: 0,
    description: '',
  })

  const addItem = () => {
    if (newItem.name && newItem.unitPrice > 0) {
      const item = {
        id: Date.now().toString(),
        ...newItem,
      }
      updateFormData({
        otherItems: [...formData.otherItems, item],
      })
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'each',
        unitPrice: 0,
        description: '',
      })
    }
  }

  const removeItem = (id: string) => {
    updateFormData({
      otherItems: formData.otherItems.filter((item) => item.id !== id),
    })
  }

  const updateItem = (id: string, field: string, value: any) => {
    updateFormData({
      otherItems: formData.otherItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    })
  }

  const calculateOtherItemsSubtotal = () => {
    return formData.otherItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Other Items</h3>
        <p className="text-primary/50">
          Add custom line items for additional products or services
        </p>
      </div>

      {/* Add New Item Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Enter item name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: Number.parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={newItem.unit}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, unit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={newItem.unitPrice}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    unitPrice: Number.parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description/Notes</Label>
            <Textarea
              id="description"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              placeholder="Optional description or notes"
              rows={2}
            />
          </div>

          <Button
            onClick={addItem}
            disabled={!newItem.name || newItem.unitPrice <= 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Current Items List */}
      {formData.otherItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.otherItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'quantity',
                          Number.parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col w-full">
                    <Label>Unit</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(value) =>
                        updateItem(item.id, 'unit', value)
                      }
                    >
                      <SelectTrigger asChild>
                        <SelectValue className="w-[400px]" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'unitPrice',
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="mb-4 flex-col flex gap-2">
                  <Label>Description/Notes</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, 'description', e.target.value)
                    }
                    rows={2}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Other Items Subtotal */}
      {calculateOtherItemsSubtotal() > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Other Items Subtotal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${calculateOtherItemsSubtotal().toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Total for custom line items
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
