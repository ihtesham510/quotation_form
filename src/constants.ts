export const fabricOptions = [
  'Cotton',
  'Silk',
  'Linen',
  'Polyester',
  'Velvet',
  'Blackout',
  'Sheer',
  'Semi-Sheer',
]

export const shutterLocations = [
  'Kitchen',
  'Bathroom',
  'Stairs',
  'Balcony',
  'Study Room',
  'Dining Room',
]

export const basePrices = {
  SWAVE: 150,
  'SWAVE BO': 200,
  motorized: 100,
  shutter: 80,
  rollerBlinds: 60,
  rollerBlindsWithTracks: 90,
}

export const roomTypes = [
  { key: 'livingRoom', label: 'Living Room' },
  { key: 'mainRoom', label: 'Main Room' },
  { key: 'guestRoom', label: 'Guest Room' },
  { key: 'bedRoom', label: 'Bedroom' },
]

export enum SwaveCurtainSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  XL = 'XL',
}

export const SwaveCurtainPricing: Record<
  SwaveCurtainSize,
  {
    price: number
    widthRangeCm: [number, number]
    dropRangeCm: [number, number]
  }
> = {
  [SwaveCurtainSize.Small]: {
    price: 200,
    widthRangeCm: [120, 180],
    dropRangeCm: [220, 250],
  },
  [SwaveCurtainSize.Medium]: {
    price: 300,
    widthRangeCm: [181, 240],
    dropRangeCm: [220, 270],
  },
  [SwaveCurtainSize.Large]: {
    price: 400,
    widthRangeCm: [241, 300],
    dropRangeCm: [240, 280],
  },
  [SwaveCurtainSize.XL]: {
    price: 600,
    widthRangeCm: [301, 500],
    dropRangeCm: [250, 300],
  },
}
