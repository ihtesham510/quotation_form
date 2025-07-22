import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus } from 'lucide-react'
import type { TileFormData as FormData } from '@/lib/types'

interface Step3Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const TRIM_PIECES = [
  { id: 'bullnose', name: 'Bullnose trim', price: 8.5, unit: 'linear foot' },
  {
    id: 'quarterRound',
    name: 'Quarter round',
    price: 6.5,
    unit: 'linear foot',
  },
  { id: 'baseTrim', name: 'Base trim', price: 7.5, unit: 'linear foot' },
  { id: 'outsideCorner', name: 'Outside corner', price: 12.0, unit: 'piece' },
]

const TRANSITION_STRIPS = [
  {
    id: 'tileToCarpet',
    name: 'Tile to carpet',
    price: 15.0,
    unit: 'linear foot',
  },
  {
    id: 'tileToHardwood',
    name: 'Tile to hardwood',
    price: 18.0,
    unit: 'linear foot',
  },
  {
    id: 'tileToVinyl',
    name: 'Tile to vinyl',
    price: 12.0,
    unit: 'linear foot',
  },
]

const UNDERLAYMENT_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard underlayment',
    price: 1.2,
    description: 'Basic moisture protection',
  },
  {
    id: 'premium',
    name: 'Premium moisture barrier',
    price: 2.1,
    description: 'Enhanced moisture protection',
  },
  {
    id: 'soundproof',
    name: 'Soundproof underlayment',
    price: 3.5,
    description: 'Sound dampening properties',
  },
]

const GROUT_SEALERS = [
  {
    id: 'standard',
    name: 'Standard grout',
    price: 0.35,
    description: 'Basic grout for most applications',
  },
  {
    id: 'stainResistant',
    name: 'Premium stain-resistant grout',
    price: 0.65,
    description: 'Enhanced stain protection',
  },
  {
    id: 'stoneSealer',
    name: 'Natural stone sealer',
    price: 0.85,
    description: 'Specialized sealer for natural stone',
  },
]

export function Step3({ formData, updateFormData }: Step3Props) {
  const [selectedTrimPieces, setSelectedTrimPieces] = useState<{
    [key: string]: number
  }>({})
  const [selectedTransitionStrips, setSelectedTransitionStrips] = useState<{
    [key: string]: number
  }>({})

  const updateTrimPiece = (id: string, quantity: number) => {
    const newQuantity = Math.max(0, quantity)
    setSelectedTrimPieces((prev) => ({ ...prev, [id]: newQuantity }))

    const trimPiece = TRIM_PIECES.find((t) => t.id === id)
    if (trimPiece) {
      const updatedTrimPieces = formData.trimPieces.filter((t) => t.type !== id)
      if (newQuantity > 0) {
        updatedTrimPieces.push({
          type: id,
          quantity: newQuantity,
          price: trimPiece.price,
        })
      }
      updateFormData({ trimPieces: updatedTrimPieces })
    }
  }

  const updateTransitionStrip = (id: string, quantity: number) => {
    const newQuantity = Math.max(0, quantity)
    setSelectedTransitionStrips((prev) => ({ ...prev, [id]: newQuantity }))

    const transitionStrip = TRANSITION_STRIPS.find((t) => t.id === id)
    if (transitionStrip) {
      const updatedTransitionStrips = formData.transitionStrips.filter(
        (t) => t.type !== id,
      )
      if (newQuantity > 0) {
        updatedTransitionStrips.push({
          type: id,
          quantity: newQuantity,
          price: transitionStrip.price,
        })
      }
      updateFormData({ transitionStrips: updatedTransitionStrips })
    }
  }

  const updateUnderlayment = (id: string) => {
    const underlayment = UNDERLAYMENT_OPTIONS.find((u) => u.id === id)
    updateFormData({
      underlayment: underlayment
        ? { type: id, price: underlayment.price }
        : null,
    })
  }

  const updateGroutSealers = (id: string, checked: boolean) => {
    const groutSealer = GROUT_SEALERS.find((g) => g.id === id)
    if (groutSealer) {
      let updatedGroutSealers = [...formData.groutSealers]
      if (checked) {
        updatedGroutSealers.push({ type: id, price: groutSealer.price })
      } else {
        updatedGroutSealers = updatedGroutSealers.filter((g) => g.type !== id)
      }
      updateFormData({ groutSealers: updatedGroutSealers })
    }
  }

  const calculateAddOnsSubtotal = () => {
    const trimTotal = formData.trimPieces.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    )
    const transitionTotal = formData.transitionStrips.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    )
    const underlaymentTotal = formData.underlayment
      ? formData.squareFootage * formData.underlayment.price
      : 0
    const groutTotal = formData.groutSealers.reduce(
      (sum, item) => sum + formData.squareFootage * item.price,
      0,
    )

    return trimTotal + transitionTotal + underlaymentTotal + groutTotal
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Optional Add-ons</h3>
        <p className="text-muted-foreground">
          Select additional products and services for your project
        </p>
      </div>

      {/* Trim Pieces */}
      <Card>
        <CardHeader>
          <CardTitle>Trim Pieces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRIM_PIECES.map((trim) => (
            <div
              key={trim.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{trim.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${trim.price.toFixed(2)} per {trim.unit}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTrimPiece(
                      trim.id,
                      (selectedTrimPieces[trim.id] || 0) - 1,
                    )
                  }
                  disabled={(selectedTrimPieces[trim.id] || 0) <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={selectedTrimPieces[trim.id] || 0}
                  onChange={(e) =>
                    updateTrimPiece(trim.id, parseInt(e.target.value) || 0)
                  }
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTrimPiece(
                      trim.id,
                      (selectedTrimPieces[trim.id] || 0) + 1,
                    )
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transition Strips */}
      <Card>
        <CardHeader>
          <CardTitle>Transition Strips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRANSITION_STRIPS.map((transition) => (
            <div
              key={transition.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{transition.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${transition.price.toFixed(2)} per {transition.unit}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTransitionStrip(
                      transition.id,
                      (selectedTransitionStrips[transition.id] || 0) - 1,
                    )
                  }
                  disabled={(selectedTransitionStrips[transition.id] || 0) <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={selectedTransitionStrips[transition.id] || 0}
                  onChange={(e) =>
                    updateTransitionStrip(
                      transition.id,
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTransitionStrip(
                      transition.id,
                      (selectedTransitionStrips[transition.id] || 0) + 1,
                    )
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Underlayment */}
      <Card>
        <CardHeader>
          <CardTitle>Underlayment Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup
            value={formData.underlayment?.type || ''}
            onValueChange={updateUnderlayment}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="" id="no-underlayment" />
              <Label htmlFor="no-underlayment">No underlayment</Label>
            </div>
            {UNDERLAYMENT_OPTIONS.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </Label>
                </div>
                <Badge variant="outline">
                  ${option.price.toFixed(2)} per sq ft
                </Badge>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Grout & Sealers */}
      <Card>
        <CardHeader>
          <CardTitle>Grout & Sealers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {GROUT_SEALERS.map((grout) => (
            <div
              key={grout.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={grout.id}
                  checked={formData.groutSealers.some(
                    (g) => g.type === grout.id,
                  )}
                  onCheckedChange={(checked) =>
                    updateGroutSealers(grout.id, checked as boolean)
                  }
                />
                <Label htmlFor={grout.id} className="flex-1">
                  <div className="font-medium">{grout.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {grout.description}
                  </div>
                </Label>
              </div>
              <Badge variant="outline">
                ${grout.price.toFixed(2)} per sq ft
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add-ons Subtotal */}
      {calculateAddOnsSubtotal() > 0 && (
        <Card className="bg-accent border-accent">
          <CardHeader>
            <CardTitle className="text-lg">Add-ons Subtotal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${calculateAddOnsSubtotal().toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total for selected add-on products and services
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
