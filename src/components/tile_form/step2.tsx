import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TileFormData as FormData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Step2Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const TILE_SIZES = [
  {
    id: 'small',
    name: 'Small tiles (under 6")',
    multiplier: '+20% labor cost',
    description: 'Mosaic and small format tiles',
  },
  {
    id: 'standard',
    name: 'Standard tiles (6"-12")',
    multiplier: 'Base price',
    description: 'Most common tile sizes',
  },
  {
    id: 'large',
    name: 'Large tiles (12"-24")',
    multiplier: '+10% material cost',
    description: 'Large format tiles',
  },
  {
    id: 'extraLarge',
    name: 'Extra large tiles (24"+)',
    multiplier: '+25% material and labor cost',
    description: 'Oversized tiles requiring special handling',
  },
]

const FINISH_TYPES = [
  {
    id: 'matte',
    name: 'Matte',
    premium: 'Base price',
    description: 'Non-reflective, slip-resistant finish',
  },
  {
    id: 'polished',
    name: 'Polished',
    premium: '+$0.50 per sq ft',
    description: 'High-gloss, reflective finish',
  },
  {
    id: 'honed',
    name: 'Honed',
    premium: '+$0.30 per sq ft',
    description: 'Smooth, low-sheen finish',
  },
  {
    id: 'textured',
    name: 'Textured',
    premium: '+$0.40 per sq ft',
    description: 'Textured surface for enhanced grip',
  },
]

const APPLICATION_AREAS = [
  {
    id: 'floor',
    name: 'Floor',
    rate: '$4.50 per sq ft',
    description: 'Standard floor installation',
  },
  {
    id: 'wall',
    name: 'Wall',
    rate: '$5.60 per sq ft',
    description: '+25% installation complexity',
  },
  {
    id: 'countertop',
    name: 'Countertop',
    rate: '$6.75 per sq ft',
    description: '+50% installation complexity',
  },
  {
    id: 'backsplash',
    name: 'Backsplash',
    rate: '$5.85 per sq ft',
    description: '+30% installation complexity',
  },
  {
    id: 'outdoor',
    name: 'Outdoor/Patio',
    rate: '$6.30 per sq ft',
    description: '+40% installation complexity',
  },
]

export function Step2({ formData, updateFormData }: Step2Props) {
  const handleSquareFootageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number.parseFloat(e.target.value) || 0
    updateFormData({ squareFootage: value })
  }

  return (
    <div className="space-y-6">
      {/* Tile Size Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Select Tile Size
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the size of tiles for your project
          </p>
        </div>
        <RadioGroup
          value={formData.tileSize}
          onValueChange={(value) => updateFormData({ tileSize: value })}
          className="space-y-3"
        >
          {TILE_SIZES.map((size) => {
            const isChecked = size.id === formData.tileSize
            return (
              <div key={size.id} className="relative">
                <RadioGroupItem
                  value={size.id}
                  id={size.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={size.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                    isChecked
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card',
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        'font-medium',
                        isChecked ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {size.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {size.description}
                    </div>
                  </div>
                  <Badge
                    variant={
                      size.multiplier === 'Base price' ? 'secondary' : 'default'
                    }
                    className="text-xs"
                  >
                    {size.multiplier}
                  </Badge>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Finish Type Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Select Finish Type
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the surface finish for your tiles
          </p>
        </div>
        <RadioGroup
          value={formData.finishType}
          onValueChange={(value) => updateFormData({ finishType: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {FINISH_TYPES.map((finish) => {
            const isChecked = finish.id === formData.finishType
            return (
              <div key={finish.id} className="relative">
                <RadioGroupItem
                  value={finish.id}
                  id={finish.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={finish.id}
                  className={cn(
                    'grid p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                    isChecked
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card',
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={cn(
                        'font-medium',
                        isChecked ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {finish.name}
                    </span>
                    <Badge
                      variant={
                        finish.premium === 'Base price'
                          ? 'secondary'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {finish.premium}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {finish.description}
                  </p>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Application Area Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Select Application Area
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose where the tiles will be installed
          </p>
        </div>
        <RadioGroup
          value={formData.applicationArea}
          onValueChange={(value) => updateFormData({ applicationArea: value })}
          className="space-y-3"
        >
          {APPLICATION_AREAS.map((area) => {
            const isChecked = area.id === formData.applicationArea
            return (
              <div key={area.id} className="relative">
                <RadioGroupItem
                  value={area.id}
                  id={area.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={area.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                    isChecked
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card',
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        'font-medium',
                        isChecked ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {area.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {area.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {area.rate}
                  </Badge>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Square Footage Input */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Total Square Footage
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter the total area to be tiled
          </p>
        </div>
        <div className="max-w-md space-y-2">
          <Label htmlFor="squareFootage" className="text-sm font-medium">
            Square footage for your project
          </Label>
          <Input
            id="squareFootage"
            type="number"
            min="10"
            max="10000"
            step="0.1"
            value={formData.squareFootage || ''}
            onChange={handleSquareFootageChange}
            placeholder="Enter square footage"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Minimum: 10 sq ft, Maximum: 10,000 sq ft
          </p>
          {formData.squareFootage > 0 && formData.squareFootage < 10 && (
            <p className="text-xs text-destructive">
              Minimum square footage is 10 sq ft
            </p>
          )}
        </div>
      </div>

      {/* Real-time Preview */}
      {formData.squareFootage >= 10 && formData.applicationArea && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cost Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Square Footage:</span>
                <span className="font-medium">
                  {formData.squareFootage} sq ft
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Application Area:</span>
                <span className="font-medium">
                  {
                    APPLICATION_AREAS.find(
                      (a) => a.id === formData.applicationArea,
                    )?.name
                  }
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Material and installation costs will be calculated based on your
              selections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
