import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { TileFormData as FormData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Step5Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard delivery',
    price: 75,
    description: 'Within 25 miles, 5-7 business days',
  },
  {
    id: 'extended',
    name: 'Extended delivery',
    price: 125,
    description: '25-50 miles, 5-7 business days',
  },
  {
    id: 'premium',
    name: 'Premium delivery',
    price: 200,
    description: '50+ miles or expedited (2-3 business days)',
  },
  {
    id: 'pickup',
    name: 'Customer pickup',
    price: 0,
    description: 'Pick up at our warehouse',
  },
]

const INSTALLATION_COMPLEXITY = [
  {
    id: 'complex',
    name: 'Complex layout',
    price: 1.5,
    description: 'Intricate patterns, multiple angles, or custom cuts',
  },
  {
    id: 'demolition',
    name: 'Demolition required',
    price: 2.25,
    description: 'Removal of existing flooring or tiles',
  },
  {
    id: 'subfloor',
    name: 'Subfloor preparation',
    price: 1.75,
    description: 'Leveling, repair, or preparation of subfloor',
  },
]

export function Step5({ formData, updateFormData }: Step5Props) {
  const updateInstallationComplexity = (id: string, checked: boolean) => {
    let updatedComplexity = [...formData.installationComplexity]
    if (checked) {
      updatedComplexity.push(id)
    } else {
      updatedComplexity = updatedComplexity.filter((item) => item !== id)
    }
    updateFormData({ installationComplexity: updatedComplexity })
  }

  // const calculateAdditionalCharges = () => {
  //   const deliveryCharges = {
  //     standard: 75,
  //     extended: 125,
  //     premium: 200,
  //     pickup: 0,
  //   }
  //
  //   let total =
  //     deliveryCharges[
  //       formData.deliveryOption as keyof typeof deliveryCharges
  //     ] || 0
  //
  //   // Installation complexity charges
  //   formData.installationComplexity.forEach((complexity) => {
  //     const complexityOption = INSTALLATION_COMPLEXITY.find(
  //       (c) => c.id === complexity,
  //     )
  //     if (complexityOption) {
  //       total += formData.squareFootage * complexityOption.price
  //     }
  //   })
  //
  //   // Permit fees
  //   total += formData.permitFees
  //
  //   // Rush order (15% of material cost - calculated in main component)
  //   // Weekend work (25% of installation cost - calculated in main component)
  //
  //   return total
  // }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Additional Charges</h3>
        <p className="text-muted-foreground">
          Select delivery options and additional services
        </p>
      </div>

      {/* Delivery Options */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Options</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.deliveryOption}
            onValueChange={(value) => updateFormData({ deliveryOption: value })}
            className="space-y-3"
          >
            {DELIVERY_OPTIONS.map((option) => {
              const isChecked = option.id === formData.deliveryOption
              return (
                <div key={option.id}>
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      'flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors',
                      'hover:bg-accent peer-checked:border-primary peer-checked:bg-accent',
                      isChecked
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card',
                    )}
                  >
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    <Badge
                      variant={option.price === 0 ? 'secondary' : 'default'}
                    >
                      {option.price === 0 ? 'Free' : `$${option.price}`}
                    </Badge>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Installation Complexity */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Complexity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select any that apply to your project
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {INSTALLATION_COMPLEXITY.map((complexity) => (
            <div
              key={complexity.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={complexity.id}
                  checked={formData.installationComplexity.includes(
                    complexity.id,
                  )}
                  onCheckedChange={(checked) =>
                    updateInstallationComplexity(
                      complexity.id,
                      checked as boolean,
                    )
                  }
                />
                <Label htmlFor={complexity.id} className="flex-1">
                  <div className="font-medium">{complexity.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {complexity.description}
                  </div>
                </Label>
              </div>
              <Badge variant="outline">
                +${complexity.price.toFixed(2)} per sq ft
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Permit Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Permit Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="permitFees">Permit fees (if applicable)</Label>
            <Input
              id="permitFees"
              type="number"
              min="0"
              step="0.01"
              value={formData.permitFees || ''}
              onChange={(e) =>
                updateFormData({
                  permitFees: Number.parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter any applicable permit fees for your project
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rush Order & Weekend Work */}
      <Card>
        <CardHeader>
          <CardTitle>Special Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rushOrder"
                checked={formData.rushOrder}
                onCheckedChange={(checked) =>
                  updateFormData({ rushOrder: checked as boolean })
                }
              />
              <Label htmlFor="rushOrder" className="flex-1">
                <div className="font-medium">Rush order</div>
                <div className="text-sm text-muted-foreground">
                  Expedited processing and delivery
                </div>
              </Label>
            </div>
            <Badge variant="outline">+15% of material cost</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                id="weekendWork"
                checked={formData.weekendWork}
                onCheckedChange={(checked) =>
                  updateFormData({ weekendWork: checked as boolean })
                }
              />
              <Label htmlFor="weekendWork" className="flex-1">
                <div className="font-medium">Weekend/after-hours work</div>
                <div className="text-sm text-muted-foreground">
                  Installation outside normal business hours
                </div>
              </Label>
            </div>
            <Badge variant="outline">+25% of installation cost</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charges Summary */}
      {(formData.deliveryOption ||
        formData.installationComplexity.length > 0 ||
        formData.permitFees > 0) && (
        <Card className="bg-accent border-accent">
          <CardHeader>
            <CardTitle className="text-lg">
              Additional Charges Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {formData.deliveryOption && (
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-medium">
                    $
                    {DELIVERY_OPTIONS.find(
                      (d) => d.id === formData.deliveryOption,
                    )?.price.toFixed(2) || '0.00'}
                  </span>
                </div>
              )}
              {formData.installationComplexity.map((complexity) => {
                const option = INSTALLATION_COMPLEXITY.find(
                  (c) => c.id === complexity,
                )
                return option ? (
                  <div key={complexity} className="flex justify-between">
                    <span>{option.name}:</span>
                    <span className="font-medium">
                      ${(formData.squareFootage * option.price).toFixed(2)}
                    </span>
                  </div>
                ) : null
              })}
              {formData.permitFees > 0 && (
                <div className="flex justify-between">
                  <span>Permit fees:</span>
                  <span className="font-medium">
                    ${formData.permitFees.toFixed(2)}
                  </span>
                </div>
              )}
              {formData.rushOrder && (
                <div className="flex justify-between">
                  <span>Rush order:</span>
                  <span className="font-medium">+15% of material cost</span>
                </div>
              )}
              {formData.weekendWork && (
                <div className="flex justify-between">
                  <span>Weekend work:</span>
                  <span className="font-medium">+25% of installation cost</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
