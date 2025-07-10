import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Palette,
  Grid,
  Blinds,
  Plus,
  Trash2,
  Percent,
  Receipt,
  Download,
} from 'lucide-react'
import {
  basePrices,
  fabricOptions,
  roomTypes,
  shutterLocations,
  SwaveCurtainPricing,
  SwaveCurtainSize,
} from '@/constants'

interface RoomSelection {
  livingRoom: number
  mainRoom: number
  guestRoom: number
  bedRoom: number
}

interface RoomDetails {
  roomType: string
  roomIndex: number
  curtainType: 'SWAVE' | 'SWAVE BO' | ''
  curtainsSize: SwaveCurtainSize
  motorized: boolean
  fabric: string
}

interface ShutterDetails {
  location: string
  quantity: number
}

interface RollerBlindDetails {
  withTracks: boolean
}

interface Addon {
  name: string
  amount: number
}

interface Discount {
  percentage: number
}

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [roomSelection, setRoomSelection] = useState<RoomSelection>({
    livingRoom: 0,
    mainRoom: 0,
    guestRoom: 0,
    bedRoom: 0,
  })
  const [roomDetails, setRoomDetails] = useState<RoomDetails[]>([])
  const [shutterDetails, setShutterDetails] = useState<ShutterDetails[]>([])
  const [rollerBlindDetails, setRollerBlindDetails] =
    useState<RollerBlindDetails>({
      withTracks: false,
    })
  const [wantsShutters, setWantsShutters] = useState(false)
  const [wantsRollerBlinds, setWantsRollerBlinds] = useState(false)
  const [addons, setAddons] = useState<Addon[]>([])
  const [discount, setDiscount] = useState<Discount>({ percentage: 0 })
  const [wantsDiscount, setWantsDiscount] = useState(false)

  const totalSteps = 7

  const getTotalRooms = () => {
    return Object.values(roomSelection).reduce((sum, count) => sum + count, 0)
  }

  const calculateBasePrice = () => {
    let total = 0
    roomDetails.forEach((room) => {
      if (room.curtainType) {
        total += basePrices[room.curtainType]
        if (room.motorized) {
          total += basePrices.motorized
        }
      }
    })

    shutterDetails.forEach((shutter) => {
      total += basePrices.shutter * shutter.quantity
    })

    if (wantsRollerBlinds) {
      total += rollerBlindDetails.withTracks
        ? basePrices.rollerBlindsWithTracks
        : basePrices.rollerBlinds
    }

    return total
  }

  const calculateTotalWithAddons = () => {
    const basePrice = calculateBasePrice()
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.amount, 0)
    return basePrice + addonsTotal
  }

  const calculateFinalTotal = () => {
    const totalWithAddons = calculateTotalWithAddons()
    const discountAmount = wantsDiscount
      ? (totalWithAddons * discount.percentage) / 100
      : 0
    return totalWithAddons - discountAmount
  }

  const initializeRoomDetails = () => {
    const details: RoomDetails[] = []
    roomTypes.forEach(({ key, label }) => {
      const count = roomSelection[key as keyof RoomSelection]
      for (let i = 0; i < count; i++) {
        details.push({
          roomType: label,
          roomIndex: i + 1,
          curtainType: '',
          curtainsSize: SwaveCurtainSize.Small,
          motorized: false,
          fabric: '',
        })
      }
    })
    setRoomDetails(details)
  }

  const updateRoomDetail = (
    index: number,
    field: keyof RoomDetails,
    value: any,
  ) => {
    const updated = [...roomDetails]
    updated[index] = { ...updated[index], [field]: value }
    setRoomDetails(updated)
  }

  const addShutter = () => {
    setShutterDetails([...shutterDetails, { location: '', quantity: 1 }])
  }

  const updateShutter = (
    index: number,
    field: keyof ShutterDetails,
    value: any,
  ) => {
    const updated = [...shutterDetails]
    updated[index] = { ...updated[index], [field]: value }
    setShutterDetails(updated)
  }

  const removeShutter = (index: number) => {
    setShutterDetails(shutterDetails.filter((_, i) => i !== index))
  }

  const addAddon = () => {
    setAddons([...addons, { name: '', amount: 0 }])
  }

  const updateAddon = (index: number, field: keyof Addon, value: any) => {
    const updated = [...addons]
    updated[index] = { ...updated[index], [field]: value }
    setAddons(updated)
  }

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index))
  }

  const canProceedFromStep1 = () => {
    return getTotalRooms() > 0
  }

  const canProceedFromStep2 = () => {
    return roomDetails.every(
      (room) => room.curtainType && room.fabric && room.curtainsSize,
    )
  }

  const canProceedFromStep5 = () => {
    return (
      addons.length === 0 ||
      addons.every((addon) => addon.name.trim() && addon.amount > 0)
    )
  }
  const canProceedFromStep3 = () => {
    for (const shutter of shutterDetails) {
      if (!shutter.location || shutter.location === '') return false
    }
    return true
  }

  const canProceedFromStep6 = () => {
    return (
      !wantsDiscount || (discount.percentage >= 0 && discount.percentage <= 100)
    )
  }

  const nextStep = () => {
    if (currentStep === 1 && canProceedFromStep1()) {
      initializeRoomDetails()
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipStep = () => {
    if (currentStep === 3) {
      setWantsShutters(false)
      setShutterDetails([])
    } else if (currentStep === 4) {
      setWantsRollerBlinds(false)
    } else if (currentStep === 5) {
      setAddons([])
    } else if (currentStep === 6) {
      setWantsDiscount(false)
      setDiscount({ percentage: 0 })
    }
    nextStep()
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Home className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">
          What kind of rooms do you want to furnish?
        </h2>
        <p className="text-muted-foreground">
          Select the number of rooms for each type
        </p>
      </div>

      <div className="grid gap-4">
        {roomTypes.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <Label htmlFor={key} className="text-base font-medium">
              {label}
            </Label>
            <Input
              id={key}
              type="number"
              min="0"
              max="10"
              value={roomSelection[key as keyof RoomSelection]}
              onChange={(e) =>
                setRoomSelection({
                  ...roomSelection,
                  [key]: Number.parseInt(e.target.value) || 0,
                })
              }
              className="w-20"
            />
          </div>
        ))}
      </div>

      {getTotalRooms() > 0 && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Total rooms selected:{' '}
            <Badge variant="secondary">{getTotalRooms()}</Badge>
          </p>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Palette className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Curtain Details for Each Room</h2>
        <p className="text-muted-foreground">
          Configure curtains for each selected room
        </p>
      </div>

      <div className="space-y-6">
        {roomDetails.map((room, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">
                {room.roomType} {room.roomIndex > 1 ? `#${room.roomIndex}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Curtain Type</Label>
                <RadioGroup
                  value={room.curtainType}
                  onValueChange={(value) =>
                    updateRoomDetail(index, 'curtainType', value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SWAVE" id={`swave-${index}`} />
                    <Label htmlFor={`swave-${index}`}>SWAVE Curtains</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SWAVE BO" id={`swave-bo-${index}`} />
                    <Label htmlFor={`swave-bo-${index}`}>
                      SWAVE BO Curtains
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`motorized-${index}`}
                  checked={room.motorized}
                  onCheckedChange={(checked) =>
                    updateRoomDetail(index, 'motorized', checked)
                  }
                />
                <Label htmlFor={`motorized-${index}`}>Motorized Version</Label>
              </div>

              <div className="space-y-2">
                <Label>Fabric Type</Label>
                <Select
                  value={room.fabric}
                  onValueChange={(value) =>
                    updateRoomDetail(index, 'fabric', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricOptions.map((fabric) => (
                      <SelectItem key={fabric} value={fabric}>
                        {fabric}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 mt-2">
                <Label>Size</Label>
                <Select
                  value={room.curtainsSize}
                  onValueChange={(value) =>
                    updateRoomDetail(index, 'curtainsSize', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SwaveCurtainSize).map((size) => {
                      const value =
                        SwaveCurtainSize[size as keyof typeof SwaveCurtainSize]
                      const dimensions_width =
                        SwaveCurtainPricing[size as SwaveCurtainSize]
                          .widthRangeCm
                      const dimensions_drop =
                        SwaveCurtainPricing[size as SwaveCurtainSize]
                          .dropRangeCm
                      return (
                        <SelectItem key={size} value={value}>
                          {size} ( {dimensions_width[0]} - {dimensions_width[1]}{' '}
                          <p className="font-bold">x</p> {dimensions_drop[0]} -{' '}
                          {dimensions_drop[1]} )
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Grid className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Shutters (Optional)</h2>
        <p className="text-muted-foreground">
          Add shutters for specific locations
        </p>
      </div>

      <div className="flex items-center space-x-2 justify-center">
        <Checkbox
          id="wants-shutters"
          checked={wantsShutters}
          onCheckedChange={(checked) => {
            setWantsShutters(!!checked)
            if (!checked) {
              setShutterDetails([])
            }
          }}
        />
        <Label htmlFor="wants-shutters">I want shutters</Label>
      </div>

      {wantsShutters && (
        <div className="space-y-4">
          {shutterDetails.map((shutter, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Location</Label>
                    <Select
                      value={shutter.location}
                      onValueChange={(value) =>
                        updateShutter(index, 'location', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {shutterLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={shutter.quantity}
                      onChange={(e) =>
                        updateShutter(
                          index,
                          'quantity',
                          Number.parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeShutter(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addShutter} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Shutter
          </Button>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Blinds className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Roller Blinds (Optional)</h2>
        <p className="text-muted-foreground">
          Choose your roller blind preferences
        </p>
      </div>

      <div className="flex items-center space-x-2 justify-center">
        <Checkbox
          id="wants-roller-blinds"
          checked={wantsRollerBlinds}
          onCheckedChange={(checked) => setWantsRollerBlinds(!!checked)}
        />
        <Label htmlFor="wants-roller-blinds">I want roller blinds</Label>
      </div>

      {wantsRollerBlinds && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label>Track Option</Label>
              <RadioGroup
                value={rollerBlindDetails.withTracks ? 'with' : 'without'}
                onValueChange={(value) =>
                  setRollerBlindDetails({
                    withTracks: value === 'with',
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with" id="with-tracks" />
                  <Label htmlFor="with-tracks">With Tracks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="without" id="without-tracks" />
                  <Label htmlFor="without-tracks">Without Tracks</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Plus className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Additional Charges (Optional)</h2>
        <p className="text-muted-foreground">
          Add delivery, installation, or other charges
        </p>
      </div>

      <div className="space-y-4">
        {addons.map((addon, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Charge Name</Label>
                  <Input
                    placeholder="e.g., Delivery Charges, Installation Fee"
                    value={addon.name}
                    onChange={(e) => updateAddon(index, 'name', e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addon.amount}
                    onChange={(e) =>
                      updateAddon(
                        index,
                        'amount',
                        Number.parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAddon(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addAddon} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Additional Charge
        </Button>
      </div>

      {addons.length > 0 && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Total Additional Charges:{' '}
            <Badge variant="secondary">
              ${addons.reduce((sum, addon) => sum + addon.amount, 0).toFixed(2)}
            </Badge>
          </p>
        </div>
      )}
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Percent className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Discount (Optional)</h2>
        <p className="text-muted-foreground">
          Apply a percentage discount to your order
        </p>
      </div>

      <div className="flex items-center space-x-2 justify-center">
        <Checkbox
          id="wants-discount"
          checked={wantsDiscount}
          onCheckedChange={(checked) => {
            setWantsDiscount(!!checked)
            if (!checked) {
              setDiscount({ percentage: 0 })
            }
          }}
        />
        <Label htmlFor="wants-discount">Apply discount</Label>
      </div>

      {wantsDiscount && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label>Discount Percentage</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discount.percentage}
                  onChange={(e) =>
                    setDiscount({
                      percentage: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a value between 0 and 100
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {wantsDiscount && discount.percentage > 0 && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Discount Amount:{' '}
            <Badge variant="secondary">
              $
              {(
                (calculateTotalWithAddons() * discount.percentage) /
                100
              ).toFixed(2)}
            </Badge>
          </p>
        </div>
      )}
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Receipt className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Order Preview</h2>
        <p className="text-muted-foreground">
          Review your complete order details
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Room Curtains</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {roomDetails.map((room, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">
                    {room.roomType}{' '}
                    {room.roomIndex > 1 ? `#${room.roomIndex}` : ''} -{' '}
                    {room.curtainType} curtains in {room.fabric}
                    {room.motorized && ' (Motorized)'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {wantsShutters && shutterDetails.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Shutters</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {shutterDetails.map((shutter, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">
                      {shutter.location} - {shutter.quantity} unit
                      {shutter.quantity > 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {wantsRollerBlinds && (
          <Card>
            <CardHeader>
              <CardTitle>Roller Blinds</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">
                    Roller Blinds{' '}
                    {rollerBlindDetails.withTracks
                      ? 'with tracks'
                      : 'without tracks'}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {addons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {addons.map((addon, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{addon.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-xl">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateTotalWithAddons().toFixed(2)}</span>
              </div>
              {wantsDiscount && discount.percentage > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({discount.percentage}%):</span>
                  <span>
                    -$
                    {(
                      (calculateTotalWithAddons() * discount.percentage) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Total:</span>
                  <span>${calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full" size="lg">
        <Download className="w-4 h-4 mr-2" />
        Download PDF Quote
      </Button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
          {currentStep === 7 && renderStep7()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep <= totalSteps && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {(currentStep === 3 ||
              currentStep === 4 ||
              currentStep === 5 ||
              currentStep === 6) && (
              <Button variant="ghost" onClick={skipStep}>
                Skip
              </Button>
            )}

            {currentStep < totalSteps && (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1()) ||
                  (currentStep === 3 && !canProceedFromStep3()) ||
                  (currentStep === 2 && !canProceedFromStep2()) ||
                  (currentStep === 5 && !canProceedFromStep5()) ||
                  (currentStep === 6 && !canProceedFromStep6())
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
