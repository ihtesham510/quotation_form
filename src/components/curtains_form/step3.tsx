'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Calculator, ChevronsUpDownIcon } from 'lucide-react'
import type { QuoteData, RoomProduct } from './types'
import { productDatabase, controlTypes } from './data'
import { calculateProductTotal, calculateRoomTotal } from './calculations'
import { CommandSelect } from '../CommandSelect'

interface Step3Props {
  quoteData: QuoteData
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
  errors: Record<string, string>
}

export function Step3({ quoteData, setQuoteData, errors }: Step3Props) {
  const addProductToRoom = (roomId: string) => {
    const newProduct: RoomProduct = {
      id: Date.now().toString(),
      productId: 1,
      width: 1,
      height: 1,
      quantity: 1,
      color: 'White',
      controlType: 'Cord',
      installation: false,
      specialFeatures: '',
    }

    setQuoteData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? { ...room, products: [...room.products, newProduct] }
          : room,
      ),
    }))
  }

  const updateRoomProduct = (
    roomId: string,
    productId: string,
    updates: Partial<RoomProduct>,
  ) => {
    setQuoteData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              products: room.products.map((product) =>
                product.id === productId ? { ...product, ...updates } : product,
              ),
            }
          : room,
      ),
    }))
  }

  const removeRoomProduct = (roomId: string, productId: string) => {
    setQuoteData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              products: room.products.filter(
                (product) => product.id !== productId,
              ),
            }
          : room,
      ),
    }))
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Product Selection</h3>

      {quoteData.rooms.map((room, roomIndex) => (
        <Card key={room.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">
                {room.name} ({room.type})
              </CardTitle>
              <Button
                onClick={() => addProductToRoom(room.id)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
            {errors[`room${roomIndex}Products`] && (
              <Alert>
                <AlertDescription>
                  {errors[`room${roomIndex}Products`]}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {room.products.map((product, productIndex) => {
              const productInfo = productDatabase.products.find(
                (p) => p.id === product.productId,
              )
              const sqm = product.width * product.height
              const total = calculateProductTotal(product)

              return (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Product {productIndex + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRoomProduct(room.id, product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <CommandSelect
                        list={productDatabase.categories.map((p) => ({
                          value: p.id.toString(),
                          label: p.name,
                        }))}
                        value={
                          productDatabase.products
                            .find((p) => p.id === product.productId)
                            ?.categoryId.toString() || ''
                        }
                        onSelect={(categoryId) => {
                          const firstProductInCategory =
                            productDatabase.products.find(
                              (p) =>
                                p.categoryId === Number.parseInt(categoryId),
                            )
                          if (firstProductInCategory) {
                            updateRoomProduct(room.id, product.id, {
                              productId: firstProductInCategory.id,
                            })
                          }
                        }}
                      >
                        <Button
                          className="w-full md:max-w-[200px]"
                          variant="secondary"
                        >
                          <p>
                            {' '}
                            {productDatabase.products.find(
                              (p) => p.id === product.productId,
                            )?.name ?? 'Select Value'}
                          </p>

                          <ChevronsUpDownIcon className="size-4" />
                        </Button>
                      </CommandSelect>
                      <Select
                        value={
                          productDatabase.products
                            .find((p) => p.id === product.productId)
                            ?.categoryId.toString() || ''
                        }
                        onValueChange={(categoryId) => {
                          const firstProductInCategory =
                            productDatabase.products.find(
                              (p) =>
                                p.categoryId === Number.parseInt(categoryId),
                            )
                          if (firstProductInCategory) {
                            updateRoomProduct(room.id, product.id, {
                              productId: firstProductInCategory.id,
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productDatabase.categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Product</Label>
                      <Select
                        value={product.productId.toString()}
                        onValueChange={(productId) =>
                          updateRoomProduct(room.id, product.id, {
                            productId: Number.parseInt(productId),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productDatabase.products
                            .filter(
                              (p) => p.categoryId === productInfo?.categoryId,
                            )
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name} (${p.basePrice}/{p.priceType})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          updateRoomProduct(room.id, product.id, {
                            quantity: Number.parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Width (m) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={product.width}
                        onChange={(e) =>
                          updateRoomProduct(room.id, product.id, {
                            width: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        className={
                          errors[`room${roomIndex}Product${productIndex}Width`]
                            ? 'border-red-500'
                            : ''
                        }
                      />
                      {errors[
                        `room${roomIndex}Product${productIndex}Width`
                      ] && (
                        <p className="text-red-500 text-sm">
                          {
                            errors[
                              `room${roomIndex}Product${productIndex}Width`
                            ]
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Height (m) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={product.height}
                        onChange={(e) =>
                          updateRoomProduct(room.id, product.id, {
                            height: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        className={
                          errors[`room${roomIndex}Product${productIndex}Height`]
                            ? 'border-red-500'
                            : ''
                        }
                      />
                      {errors[
                        `room${roomIndex}Product${productIndex}Height`
                      ] && (
                        <p className="text-red-500 text-sm">
                          {
                            errors[
                              `room${roomIndex}Product${productIndex}Height`
                            ]
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Area</Label>
                      <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                        <Calculator className="w-4 h-4 mr-2" />
                        {sqm.toFixed(2)} sqm
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color/Finish</Label>
                      <Input
                        value={product.color}
                        onChange={(e) =>
                          updateRoomProduct(room.id, product.id, {
                            color: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Control Type</Label>
                      <Select
                        value={product.controlType}
                        onValueChange={(value) =>
                          updateRoomProduct(room.id, product.id, {
                            controlType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {controlTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Special Features</Label>
                    <Textarea
                      value={product.specialFeatures}
                      onChange={(e) =>
                        updateRoomProduct(room.id, product.id, {
                          specialFeatures: e.target.value,
                        })
                      }
                      placeholder="Any special requirements or features..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`installation-${product.id}`}
                      checked={product.installation}
                      onCheckedChange={(checked) =>
                        updateRoomProduct(room.id, product.id, {
                          installation: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor={`installation-${product.id}`}>
                      Requires Installation
                    </Label>
                  </div>

                  {productInfo?.specialConditions && (
                    <Alert>
                      <AlertDescription>
                        <strong>Note:</strong> {productInfo.specialConditions}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      {productInfo?.priceType === 'sqm' &&
                        productInfo.minimumQty > sqm && (
                          <span>
                            Minimum {productInfo.minimumQty} sqm applies
                          </span>
                        )}
                    </div>
                    <div className="text-lg font-semibold">
                      ${total.toFixed(2)}
                    </div>
                  </div>
                </div>
              )
            })}

            {room.products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products added to this room yet.
              </div>
            )}

            {room.products.length > 0 && (
              <div className="flex justify-end pt-4 border-t">
                <div className="text-xl font-bold">
                  Room Total: ${calculateRoomTotal(room).toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
