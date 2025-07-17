import { z } from 'zod'

export const RoomDetailsSchema = z
  .object({
    roomType: z
      .string()
      .min(1, 'Room type is required')
      .describe(
        "The type of room where curtains will be installed (e.g., 'Living Room', 'Bedroom', 'Kitchen')",
      ),

    roomIndex: z
      .number()
      .int()
      .positive('Room index must be a positive integer')
      .describe(
        'A unique numerical identifier for the room, used for ordering and reference purposes',
      ),

    curtainType: z
      .enum(['SWAVE', 'SWAVE BO', ''], {
        errorMap: () => ({
          message: "Curtain type must be 'SWAVE', 'SWAVE BO', or empty",
        }),
      })
      .describe(
        "The style of curtain waves - 'SWAVE' for standard wave, 'SWAVE BO' for blackout wave, or empty string for no specific wave type",
      ),

    curtainsSize: z
      .string()
      .min(1, 'Curtain size is required')
      .describe(
        "The dimensions of the curtains in the format 'width x height' (e.g., '120cm x 200cm')",
      ),

    motorized: z
      .boolean()
      .describe(
        'Whether the curtains will have motorized operation (true) or manual operation (false)',
      ),

    fabric: z
      .string()
      .min(1, 'Fabric type is required')
      .describe(
        "The type of fabric material used for the curtains (e.g., 'Cotton', 'Silk', 'Polyester', 'Linen')",
      ),
  })
  .describe('Complete details for curtain installation in a specific room')

// ShutterDetails schema
export const ShutterDetailsSchema = z
  .object({
    location: z
      .string()
      .min(1, 'Location is required')
      .describe(
        "The specific location where shutters will be installed (e.g., 'Front Window', 'Balcony Door', 'Kitchen Window')",
      ),

    quantity: z
      .number()
      .int()
      .positive('Quantity must be a positive integer')
      .describe('The number of shutter units to be installed at this location'),
  })
  .describe('Details for shutter installation including location and quantity')

// RollerBlindDetails schema
export const RollerBlindDetailsSchema = z
  .object({
    withTracks: z
      .boolean()
      .describe(
        'Whether the roller blinds will include track systems for smoother operation (true) or be trackless (false)',
      ),
  })
  .describe('Configuration details for roller blind installation')

// Addon schema
export const AddonSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Addon name is required')
      .describe(
        "The name of the additional service or product (e.g., 'Remote Control', 'Installation Service', 'Warranty Extension')",
      ),

    amount: z
      .number()
      .min(0, 'Amount must be non-negative')
      .describe('The cost of this addon in the quote currency'),
  })
  .describe(
    'Additional products or services that can be added to the main quote',
  )

// Discount schema
export const DiscountSchema = z
  .object({
    percentage: z
      .number()
      .min(0, 'Percentage must be non-negative')
      .max(100, 'Percentage cannot exceed 100')
      .describe(
        'The discount percentage to be applied to the total quote amount (0-100)',
      ),
  })
  .describe('Discount information applied to the quote')

// QuoteData schema
export const QuoteDataSchema = z
  .object({
    roomDetails: z
      .array(RoomDetailsSchema)
      .min(1, 'At least one room detail is required')
      .describe(
        'Array of room details where curtains will be installed - must contain at least one room',
      ),

    shutterDetails: z
      .array(ShutterDetailsSchema)
      .describe(
        'Array of shutter installation details - can be empty if no shutters are requested',
      ),

    rollerBlindDetails: RollerBlindDetailsSchema.describe(
      'Configuration for roller blind installation',
    ),

    addons: z
      .array(AddonSchema)
      .describe(
        'Array of additional products or services - can be empty if no addons are selected',
      ),

    discount: DiscountSchema.describe(
      'Discount information to be applied to the quote',
    ),

    wantsShutters: z
      .boolean()
      .describe(
        'Whether the customer wants shutters included in the quote (true) or not (false)',
      ),

    wantsRollerBlinds: z
      .boolean()
      .describe(
        'Whether the customer wants roller blinds included in the quote (true) or not (false)',
      ),

    wantsDiscount: z
      .boolean()
      .describe(
        'Whether a discount should be applied to the quote (true) or not (false)',
      ),

    subtotal: z
      .number()
      .min(0, 'Subtotal must be non-negative')
      .describe('The total amount before any discounts are applied'),

    finalTotal: z
      .number()
      .min(0, 'Final total must be non-negative')
      .describe(
        'The final amount after all discounts and calculations are applied',
      ),
  })
  .describe(
    'Complete quote data structure containing all information needed for curtain, shutter, and roller blind installation quote',
  )

export type RoomDetails = z.infer<typeof RoomDetailsSchema>
export type ShutterDetails = z.infer<typeof ShutterDetailsSchema>
export type RollerBlindDetails = z.infer<typeof RollerBlindDetailsSchema>
export type Addon = z.infer<typeof AddonSchema>
export type Discount = z.infer<typeof DiscountSchema>
export type QuoteData = z.infer<typeof QuoteDataSchema>
