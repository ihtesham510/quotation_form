import type { ProductDatabase } from './types'

export const productDatabase: ProductDatabase = {
  categories: [
    {
      id: 1,
      name: 'Luxx Shades',
      description: 'Premium shades (formerly Curvers & Unishade)',
    },
    {
      id: 2,
      name: 'Allusion Blinds',
      description: 'Modern allusion style blinds',
    },
    {
      id: 3,
      name: 'Fabric Collections',
      description: 'Texstyle, Shaw, Alpha, Louvolite, Vertex Fabrics',
    },
    {
      id: 4,
      name: 'Roller & Vertical',
      description: 'Roller and vertical blind components',
    },
    { id: 5, name: 'Motors', description: 'Various motorization options' },
    { id: 6, name: 'Panel Blinds', description: 'Panel blind systems' },
    { id: 7, name: 'Cassette Blinds', description: 'Cassette style blinds' },
    {
      id: 8,
      name: 'Plantation Shutters',
      description: 'Premium plantation shutters',
    },
    {
      id: 9,
      name: 'Pleated Fly Screens',
      description: 'Pleated fly screen systems',
    },
    { id: 10, name: 'Curtains', description: 'HOAD, Nettex, Charles Parsons' },
    {
      id: 11,
      name: 'Combi & Venetian',
      description: 'Combination and venetian blinds',
    },
    {
      id: 12,
      name: 'Roller Shutters',
      description: 'External roller shutters',
    },
    {
      id: 13,
      name: 'EZIP & Outdoor',
      description: 'EZIP and outdoor blind systems',
    },
    {
      id: 14,
      name: 'Specialty Items',
      description: 'Straight Drops, Wire Guides, PVC Blinds, Folding Arms',
    },
  ],
  products: [
    // Luxx Shades
    {
      id: 1,
      categoryId: 1,
      name: 'Luxx Premium Shade',
      priceType: 'sqm',
      basePrice: 85,
      minimumQty: 1,
      leadTime: '2-3 weeks',
      specialConditions: 'Import item',
    },
    {
      id: 2,
      categoryId: 1,
      name: 'Luxx Standard Shade',
      priceType: 'sqm',
      basePrice: 65,
      minimumQty: 1,
      leadTime: '1-2 weeks',
      specialConditions: '',
    },
    // Allusion Blinds
    {
      id: 3,
      categoryId: 2,
      name: 'Allusion Standard',
      priceType: 'sqm',
      basePrice: 75,
      minimumQty: 1,
      leadTime: '1-2 weeks',
      specialConditions: '',
    },
    {
      id: 4,
      categoryId: 2,
      name: 'Allusion Premium',
      priceType: 'sqm',
      basePrice: 95,
      minimumQty: 1,
      leadTime: '2-3 weeks',
      specialConditions: '',
    },
    // Fabric Collections
    {
      id: 5,
      categoryId: 3,
      name: 'Texstyle Collection',
      priceType: 'sqm',
      basePrice: 55,
      minimumQty: 1,
      leadTime: '1-2 weeks',
      specialConditions: '',
    },
    {
      id: 6,
      categoryId: 3,
      name: 'Shaw Fabrics',
      priceType: 'sqm',
      basePrice: 60,
      minimumQty: 1,
      leadTime: '1-2 weeks',
      specialConditions: '',
    },
    {
      id: 7,
      categoryId: 3,
      name: 'Vertex Fabrics',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 1,
      leadTime: '3-4 weeks',
      specialConditions: 'No guarantee on timeframes',
    },
    // Combi & Venetian
    {
      id: 8,
      categoryId: 11,
      name: 'Combi Blind',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '1-2 weeks',
      specialConditions: 'Minimum 2 sqm per blind',
    },
    {
      id: 9,
      categoryId: 11,
      name: 'Venetian Blind',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '1-2 weeks',
      specialConditions: 'Minimum 2 sqm per blind',
    },
    // Roller Shutters
    {
      id: 10,
      categoryId: 12,
      name: 'Standard Roller Shutter',
      priceType: 'sqm',
      basePrice: 120,
      minimumQty: 1,
      leadTime: '2-3 weeks',
      specialConditions: '50% deposit required',
    },
    // Pleated Fly Screens
    {
      id: 11,
      categoryId: 9,
      name: 'Pleated Fly Screen',
      priceType: 'sqm',
      basePrice: 90,
      minimumQty: 1,
      leadTime: '2-3 weeks',
      specialConditions: '50% deposit required',
    },
    // Motors
    {
      id: 12,
      categoryId: 5,
      name: 'Standard Motor',
      priceType: 'each',
      basePrice: 350,
      minimumQty: 1,
      leadTime: '1-2 weeks',
      specialConditions: '',
    },
    {
      id: 13,
      categoryId: 5,
      name: 'Premium Motor',
      priceType: 'each',
      basePrice: 450,
      minimumQty: 1,
      leadTime: '2-3 weeks',
      specialConditions: '',
    },
    // Plantation Shutters
    {
      id: 14,
      categoryId: 8,
      name: 'Timber Plantation Shutter',
      priceType: 'sqm',
      basePrice: 180,
      minimumQty: 1,
      leadTime: '3-4 weeks',
      specialConditions: 'Custom fabrication',
    },
    {
      id: 15,
      categoryId: 8,
      name: 'PVC Plantation Shutter',
      priceType: 'sqm',
      basePrice: 140,
      minimumQty: 1,
      leadTime: '2-3 weeks',
      specialConditions: '',
    },
  ],
}

export const roomTypes = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Office',
  'Dining Room',
  'Study',
  'Laundry',
  'Other',
]

export const paymentTerms = [
  'Net 30 days',
  '50% deposit, balance on completion',
  'Full payment on order',
  'Net 14 days',
  'COD',
]

export const controlTypes = ['Cord', 'Chain', 'Motorized', 'Remote Control']

export const unitTypes = ['each', 'sqm', 'linear', 'hour']
