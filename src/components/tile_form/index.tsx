import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, DownloadIcon } from 'lucide-react'
import { Step1 } from '@/components/tile_form/step1'
import { Step2 } from '@/components/tile_form/step2'
import { Step3 } from '@/components/tile_form/step3'
import { Step4 } from '@/components/tile_form/step4'
import { Step5 } from '@/components/tile_form/step5'
import { Step6 } from '@/components/tile_form/step6'
import { Step7 } from '@/components/tile_form/step7'
import PricingSidebar from '@/components/tile_form/pricing-sidebar'
import type {
  TilePricingBreakdown as PricingBreakdown,
  TileFormData as FormData,
} from '@/lib/types'
import { generateTilePdf, openPdf } from '@/lib/pdf'

const STEPS = [
  {
    id: 1,
    title: 'Material & Style',
    description: 'Select tile material and style',
  },
  {
    id: 2,
    title: 'Size & Finish',
    description: 'Choose size, finish, and area',
  },
  { id: 3, title: 'Add-ons', description: 'Optional products and services' },
  { id: 4, title: 'Other Items', description: 'Custom line items' },
  {
    id: 5,
    title: 'Additional Charges',
    description: 'Delivery and complexity charges',
  },
  { id: 6, title: 'Discounts', description: 'Apply discounts if applicable' },
  { id: 7, title: 'Review & Quote', description: 'Final review and quotation' },
]

export function TileForm({
  title,
  description,
  onSave,
}: {
  title?: string
  description?: string
  onSave: (data: FormData) => Promise<void> | void
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    tileMaterial: '',
    tileStyle: '',
    tileSize: '',
    finishType: '',
    applicationArea: '',
    squareFootage: 0,
    trimPieces: [],
    transitionStrips: [],
    underlayment: null,
    groutSealers: [],
    otherItems: [],
    deliveryOption: '',
    installationComplexity: [],
    permitFees: 0,
    rushOrder: false,
    weekendWork: false,
    discountType: 'none',
    discountPercentage: 0,
    discountAmount: 0,
    discountReason: '',
  })

  const [pricing, setPricing] = useState<PricingBreakdown>({
    materialCost: 0,
    installationCost: 0,
    addOnsSubtotal: 0,
    otherItemsSubtotal: 0,
    additionalChargesSubtotal: 0,
    preDiscountSubtotal: 0,
    discountAmount: 0,
    afterDiscountSubtotal: 0,
    tax: 0,
    finalTotal: 0,
  })

  // Calculate pricing whenever form data changes
  useEffect(() => {
    calculatePricing()
  }, [formData])

  const downloadQuote = async () => {
    if (title && description) {
      const blob = await generateTilePdf({
        title,
        description,
        formData,
        pricingBreakdown: pricing,
      })
      openPdf(blob)
    }
  }

  const calculatePricing = () => {
    // Material pricing
    const materialPrices = {
      ceramic: { min: 2.5, max: 4.0 },
      porcelain: { min: 3.0, max: 6.5 },
      naturalStone: { min: 5.0, max: 12.0 },
      glass: { min: 8.0, max: 15.0 },
    }

    const styleMultipliers = {
      traditional: 1.0,
      woodLook: 1.15,
      subway: 1.0,
      stoneLook: 1.25,
      concrete: 1.1,
      decorative: 1.3,
    }

    const sizeMultipliers = {
      small: 1.2,
      standard: 1.0,
      large: 1.1,
      extraLarge: 1.25,
    }

    const finishPremiums = {
      matte: 0,
      polished: 0.5,
      honed: 0.3,
      textured: 0.4,
    }

    const installationRates = {
      floor: 4.5,
      wall: 5.6,
      countertop: 6.75,
      backsplash: 5.85,
      outdoor: 6.3,
    }

    // Calculate material cost
    let baseMaterialPrice = 0
    if (
      formData.tileMaterial &&
      materialPrices[formData.tileMaterial as keyof typeof materialPrices]
    ) {
      const priceRange =
        materialPrices[formData.tileMaterial as keyof typeof materialPrices]
      baseMaterialPrice = (priceRange.min + priceRange.max) / 2
    }

    const styleMultiplier =
      styleMultipliers[formData.tileStyle as keyof typeof styleMultipliers] ||
      1.0
    const sizeMultiplier =
      sizeMultipliers[formData.tileSize as keyof typeof sizeMultipliers] || 1.0
    const finishPremium =
      finishPremiums[formData.finishType as keyof typeof finishPremiums] || 0

    const materialCost =
      formData.squareFootage *
        baseMaterialPrice *
        styleMultiplier *
        sizeMultiplier +
      formData.squareFootage * finishPremium

    // Calculate installation cost
    const baseInstallationRate =
      installationRates[
        formData.applicationArea as keyof typeof installationRates
      ] || 0
    let installationCost = formData.squareFootage * baseInstallationRate

    // Add complexity charges
    formData.installationComplexity.forEach((complexity) => {
      switch (complexity) {
        case 'complex':
          installationCost += formData.squareFootage * 1.5
          break
        case 'demolition':
          installationCost += formData.squareFootage * 2.25
          break
        case 'subfloor':
          installationCost += formData.squareFootage * 1.75
          break
      }
    })

    // Calculate add-ons subtotal
    const addOnsSubtotal = [
      ...formData.trimPieces.map((item) => item.quantity * item.price),
      ...formData.transitionStrips.map((item) => item.quantity * item.price),
      formData.underlayment
        ? formData.squareFootage * formData.underlayment.price
        : 0,
      ...formData.groutSealers.map(
        (item) => formData.squareFootage * item.price,
      ),
    ].reduce((sum, cost) => sum + cost, 0)

    // Calculate other items subtotal
    const otherItemsSubtotal = formData.otherItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    )

    // Calculate additional charges
    const deliveryCharges = {
      standard: 75,
      extended: 125,
      premium: 200,
      pickup: 0,
    }

    let additionalChargesSubtotal =
      deliveryCharges[
        formData.deliveryOption as keyof typeof deliveryCharges
      ] || 0
    additionalChargesSubtotal += formData.permitFees

    if (formData.rushOrder) {
      additionalChargesSubtotal += materialCost * 0.15
    }

    if (formData.weekendWork) {
      additionalChargesSubtotal += installationCost * 0.25
    }

    // Calculate pre-discount subtotal
    const preDiscountSubtotal =
      materialCost +
      installationCost +
      addOnsSubtotal +
      otherItemsSubtotal +
      additionalChargesSubtotal

    // Calculate discount
    let discountAmount = 0
    if (formData.discountType === 'percentage') {
      discountAmount = preDiscountSubtotal * (formData.discountPercentage / 100)
    } else if (formData.discountType === 'fixed') {
      discountAmount = Math.min(formData.discountAmount, preDiscountSubtotal)
    }

    const afterDiscountSubtotal = preDiscountSubtotal - discountAmount
    const tax = afterDiscountSubtotal * 0.0875 // 8.75% tax rate
    const finalTotal = afterDiscountSubtotal + tax

    setPricing({
      materialCost,
      installationCost,
      addOnsSubtotal,
      otherItemsSubtotal,
      additionalChargesSubtotal,
      preDiscountSubtotal,
      discountAmount,
      afterDiscountSubtotal,
      tax,
      finalTotal,
    })
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.tileMaterial !== '' && formData.tileStyle !== ''
      case 2:
        return (
          formData.tileSize !== '' &&
          formData.finishType !== '' &&
          formData.applicationArea !== '' &&
          formData.squareFootage >= 10
        )
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} updateFormData={updateFormData} />
      case 2:
        return <Step2 formData={formData} updateFormData={updateFormData} />
      case 3:
        return <Step3 formData={formData} updateFormData={updateFormData} />
      case 4:
        return <Step4 formData={formData} updateFormData={updateFormData} />
      case 5:
        return <Step5 formData={formData} updateFormData={updateFormData} />
      case 6:
        return (
          <Step6
            formData={formData}
            updateFormData={updateFormData}
            pricing={pricing}
          />
        )
      case 7:
        return (
          <Step7
            formData={formData}
            title={title}
            description={description}
            pricing={pricing}
            onSave={async () => await onSave(formData)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="hidden md:flex justify-between items-center mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 border ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : currentStep > step.id
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {step.id}
                </button>
                <div className="text-xs text-center mt-2 max-w-xl">
                  <div
                    className={`font-medium ${
                      currentStep === step.id
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 7) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-md border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center justify-between text-card-foreground">
                  <span className="text-lg">
                    Step {currentStep}: {STEPS[currentStep - 1].title}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    {currentStep} of {STEPS.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center bg-transparent border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 7 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid(currentStep)}
                      className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={downloadQuote}
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download Quote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="xl:col-span-3">
            <PricingSidebar pricing={pricing} formData={formData} />
          </div>
        </div>
      </div>
    </div>
  )
}
