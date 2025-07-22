import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import type { TileFormData as FormData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Step1Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const TILE_MATERIALS = [
  {
    id: 'ceramic',
    name: 'Ceramic',
    priceRange: '$2.50 - $4.00 per sq ft',
    description: 'Durable and versatile, perfect for most applications',
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    priceRange: '$3.00 - $6.50 per sq ft',
    description: 'Dense and water-resistant, ideal for high-traffic areas',
  },
  {
    id: 'naturalStone',
    name: 'Natural Stone',
    priceRange: '$5.00 - $12.00 per sq ft',
    description: 'Elegant and unique, adds natural beauty to any space',
  },
  {
    id: 'glass',
    name: 'Glass',
    priceRange: '$8.00 - $15.00 per sq ft',
    description: 'Modern and reflective, perfect for contemporary designs',
  },
]

const TILE_STYLES = [
  {
    id: 'traditional',
    name: 'Traditional/Solid Colors',
    premium: 'Base price',
    description: 'Classic solid colors and traditional patterns',
  },
  {
    id: 'woodLook',
    name: 'Wood Look',
    premium: '+15% premium',
    description: 'Realistic wood grain appearance',
  },
  {
    id: 'subway',
    name: 'Subway Style',
    premium: 'Base price',
    description: 'Classic rectangular subway tile design',
  },
  {
    id: 'stoneLook',
    name: 'Stone/Marble Look',
    premium: '+25% premium',
    description: 'Natural stone and marble patterns',
  },
  {
    id: 'concrete',
    name: 'Concrete Look',
    premium: '+10% premium',
    description: 'Modern industrial concrete appearance',
  },
  {
    id: 'decorative',
    name: 'Decorative/Patterned',
    premium: '+30% premium',
    description: 'Intricate patterns and decorative designs',
  },
]
export function Step1({ formData, updateFormData }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Select Tile Material
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the type of material for your tiling project
          </p>
        </div>

        <RadioGroup
          value={formData.tileMaterial}
          onValueChange={(value) => updateFormData({ tileMaterial: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {TILE_MATERIALS.map((material) => {
            const isChecked = material.id === formData.tileMaterial
            return (
              <div key={material.id} className="relative">
                <RadioGroupItem
                  value={material.id}
                  id={material.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={material.id}
                  className={cn(
                    'grid p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                    isChecked
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={cn(
                        'font-medium',
                        isChecked ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {material.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {material.priceRange}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {material.description}
                  </p>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Select Tile Style/Look
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the pattern and layout style for your tiles
          </p>
        </div>

        <RadioGroup
          value={formData.tileStyle}
          onValueChange={(value) => updateFormData({ tileStyle: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {TILE_STYLES.map((style) => {
            const isChecked = style.id === formData.tileStyle
            return (
              <div key={style.id} className="relative">
                <RadioGroupItem
                  value={style.id}
                  id={style.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={style.id}
                  className={cn(
                    'grid p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                    isChecked
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={cn(
                        'font-medium',
                        isChecked ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {style.name}
                    </span>
                    <Badge
                      variant={
                        style.premium === 'Base price' ? 'secondary' : 'default'
                      }
                      className="text-xs"
                    >
                      {style.premium}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {style.description}
                  </p>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Price Preview */}
      {formData.tileMaterial && formData.tileStyle && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Price Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Based on your selections, material pricing will be calculated when
              you specify square footage in the next step.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">
                  {
                    TILE_MATERIALS.find((m) => m.id === formData.tileMaterial)
                      ?.name
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Style:</span>
                <span className="font-medium">
                  {TILE_STYLES.find((s) => s.id === formData.tileStyle)?.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
