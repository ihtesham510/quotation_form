import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface InteractiveCardProps {
  title: string
  description?: string
  children?: ReactNode
  image?: ReactNode
  button?: {
    text: string
    icon?: LucideIcon
    variant?:
      | 'default'
      | 'secondary'
      | 'outline'
      | 'ghost'
      | 'link'
      | 'destructive'
    onClick?: () => void
  }
  className?: string
  imageClassName?: string
  overlayIntensity?: 'light' | 'medium' | 'strong'
  shadowIntensity?: 'sm' | 'md' | 'lg' | 'xl'
  hoverShadowIntensity?: 'md' | 'lg' | 'xl' | '2xl'
  animationDuration?: 'fast' | 'normal' | 'slow'
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const overlayClasses = {
  light: 'bg-black/3 dark:bg-white/3',
  medium: 'bg-black/5 dark:bg-white/5',
  strong: 'bg-black/8 dark:bg-white/8',
}

const shadowClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

const durationClasses = {
  fast: 'duration-200',
  normal: 'duration-300',
  slow: 'duration-500',
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
}

export function InteractiveCard({
  title,
  description,
  children,
  image,
  button,
  className = '',
  imageClassName = '',
  overlayIntensity = 'medium',
  shadowIntensity = 'md',
  hoverShadowIntensity = 'xl',
  animationDuration = 'normal',
  buttonPosition = 'bottom-right',
}: InteractiveCardProps) {
  const ButtonIcon = button?.icon

  return (
    <Card
      className={`group relative overflow-hidden border transition-all ${durationClasses[animationDuration]} hover:${shadowClasses[hoverShadowIntensity]} ${shadowClasses[shadowIntensity]} w-full min-w-[280px] ${className}`}
    >
      {/* Background overlay that appears on hover */}
      <div
        className={`absolute inset-0 opacity-0 transition-opacity ${durationClasses[animationDuration]} group-hover:opacity-100 ${overlayClasses[overlayIntensity]}`}
      />
      <CardHeader className="relative z-10">
        {image && <div className={`mb-4 ${imageClassName}`}>{image}</div>}
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {/* Only render CardContent if there are children, otherwise skip it entirely */}
      {children && (
        <CardContent className="relative z-10">{children}</CardContent>
      )}
      {/* Button that appears on hover with blur backdrop */}
      {button && (
        <div
          className={`absolute ${positionClasses[buttonPosition]} opacity-0 transition-all ${durationClasses[animationDuration]} group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 z-30`}
        >
          {/* Blur backdrop behind button */}
          <div className="absolute inset-0 -m-2 rounded-lg backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-border/20" />
          <Button
            size="sm"
            variant={button.variant || 'default'}
            onClick={button.onClick}
            className="relative z-10 shadow-lg hover:shadow-xl transition-shadow duration-100"
          >
            {button.text}
            {ButtonIcon && <ButtonIcon className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )}
    </Card>
  )
}
