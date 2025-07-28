import type { ProductDatabase } from './types'

export const productDatabase: ProductDatabase = {
  categories: [
    {
      id: 1,
      name: 'LUXX SHADES & ALLUSION',
      description:
        'LUXX SHADES are the new name for previously known CURVERS & UNISHADE',
    },
    {
      id: 2,
      name: 'TEXSTYLE FABRICS',
      description: 'Fabric options for roller and vertical blinds',
    },
    {
      id: 3,
      name: 'SHAW FABRICS',
      description: 'Fabric options for roller and vertical blinds',
    },
    {
      id: 4,
      name: 'ALPHA FABRICS',
      description: 'Fabric options for roller and vertical blinds',
    },
    {
      id: 5,
      name: 'LOUVOLITE FABRICS',
      description: 'Fabric options for roller and vertical blinds',
    },
    {
      id: 6,
      name: 'VERTEX FABRICS',
      description:
        'Fabric options for roller and vertical blinds - no guaranteed timeframes with vertical stock',
    },
    {
      id: 7,
      name: 'ROLLER COMPONENTS & EXTRAS',
      description: 'Components and accessories for roller blinds',
    },
    {
      id: 8,
      name: 'VERTICAL COMPONENTS & EXTRAS',
      description:
        'Components and accessories for vertical blinds - all parts must be paid on pick up',
    },
    {
      id: 9,
      name: 'MOTORS',
      description: 'Motorization options for blinds',
    },
    {
      id: 10,
      name: 'PANEL BLINDS',
      description: 'Panel blind systems',
    },
    {
      id: 11,
      name: 'CASSETTE BLINDS',
      description: 'Cassette style blind systems',
    },
    {
      id: 12,
      name: 'LOCAL PLANTATION SHUTTERS',
      description: 'Locally manufactured plantation shutters',
    },
    {
      id: 13,
      name: 'PLEATED FLY SCREENS',
      description: 'Pleated fly screen systems - 50% deposit required',
    },
    {
      id: 14,
      name: 'CURTAINS',
      description: 'Various curtain options from multiple suppliers',
    },
    {
      id: 15,
      name: 'COMBI & VENETIAN BLINDS',
      description: 'Combination and venetian blind systems',
    },
    {
      id: 16,
      name: 'ROLLER SHUTTERS',
      description: 'Roller shutter systems - 50% deposit required',
    },
    {
      id: 17,
      name: 'EZIP & OUTDOOR BLINDS',
      description:
        'EZIP systems and other outdoor blind solutions - supply only, no installation',
    },
  ],
  products: [
    {
      id: 101,
      categoryId: 15,
      name: 'Combi Blinds',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '2-3 weeks import required',
      specialConditions:
        'Use LA MIEUX samples only. Minimum 2 SQM per blind - open size. White, black or grey headbox. Service requests could result in new blind replacement at cost or $20 per blind to maintain.',
    },
    {
      id: 102,
      categoryId: 15,
      name: 'Venetian Blinds - 25mm Aluminium',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '2-3 weeks import required',
      specialConditions:
        'Minimum 2 SQM per blind - open size. Single cord control. Service requests could result in new blind replacement at cost or $20 per blind to maintain.',
    },
    {
      id: 103,
      categoryId: 15,
      name: 'Venetian Blinds - 50mm Aluminium',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '2-3 weeks import required',
      specialConditions:
        'Minimum 2 SQM per blind - open size. Single cord control. Service requests could result in new blind replacement at cost or $20 per blind to maintain.',
    },
    {
      id: 104,
      categoryId: 15,
      name: 'Venetian Blinds - 50mm PVC',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '2-3 weeks import required',
      specialConditions:
        'Minimum 2 SQM per blind - open size. Single cord control. Service requests could result in new blind replacement at cost or $20 per blind to maintain.',
    },
    {
      id: 105,
      categoryId: 15,
      name: 'Venetian Blinds - 50mm Basswood',
      priceType: 'sqm',
      basePrice: 70,
      minimumQty: 2,
      leadTime: '2-3 weeks import required',
      specialConditions:
        'Minimum 2 SQM per blind - open size. Single cord control. Service requests could result in new blind replacement at cost or $20 per blind to maintain.',
    },
    {
      id: 201,
      categoryId: 2,
      name: 'Texstyle Roller Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 202,
      categoryId: 2,
      name: 'Texstyle Vertical Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 301,
      categoryId: 3,
      name: 'Shaw Roller Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 302,
      categoryId: 3,
      name: 'Shaw Vertical Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 401,
      categoryId: 4,
      name: 'Alpha Roller Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 402,
      categoryId: 4,
      name: 'Alpha Vertical Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 501,
      categoryId: 5,
      name: 'Louvolite Roller Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 502,
      categoryId: 5,
      name: 'Louvolite Vertical Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 601,
      categoryId: 6,
      name: 'Vertex Roller Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Variable - no guaranteed timeframes',
      specialConditions:
        'Cannot guarantee timeframes with Vertex vertical stock. For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 602,
      categoryId: 6,
      name: 'Vertex Vertical Fabric',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Variable - no guaranteed timeframes',
      specialConditions:
        'Cannot guarantee timeframes with Vertex vertical stock. For vertical blinds or other fabrics, send order form to orders@worldblinds.com.au for quoting. Allow 3 business days for reply.',
    },
    {
      id: 701,
      categoryId: 7,
      name: 'Roller Components',
      priceType: 'each',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'Parts order - send requests to orders@worldblinds.com.au. All parts must be paid on pick up.',
    },
    {
      id: 801,
      categoryId: 8,
      name: 'Vertical Components',
      priceType: 'each',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'Parts order - send requests to orders@worldblinds.com.au. All parts must be paid on pick up.',
    },
    {
      id: 901,
      categoryId: 9,
      name: 'Motors',
      priceType: 'each',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Contact for pricing and specifications.',
    },
    {
      id: 1001,
      categoryId: 10,
      name: 'Panel Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Contact for pricing and specifications.',
    },
    {
      id: 1101,
      categoryId: 11,
      name: 'Cassette Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Contact for pricing and specifications.',
    },
    {
      id: 1201,
      categoryId: 12,
      name: 'Local Plantation Shutters',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'Locally manufactured. Contact for pricing and specifications.',
    },
    {
      id: 1301,
      categoryId: 13,
      name: 'Pleated Fly Screens',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        '50% deposit required prior to proceeding, remaining payment due at pick up.',
    },
    {
      id: 1401,
      categoryId: 14,
      name: 'HOAD Curtains',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Contact for pricing and specifications.',
    },
    {
      id: 1402,
      categoryId: 14,
      name: 'NETTEX Curtains',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Contact for pricing and specifications.',
    },
    {
      id: 1403,
      categoryId: 14,
      name: 'Charles Parsons Curtains',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Contact for pricing and specifications.',
    },
    {
      id: 1601,
      categoryId: 16,
      name: 'Roller Shutters',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        '50% deposit required prior to proceeding, remaining payment due at pick up.',
    },
    {
      id: 1701,
      categoryId: 17,
      name: 'EZIP System',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: '3 business days for quote',
      specialConditions:
        'Supply only - no installation offered. Send quote requests to joanna@worldblinds.com.au. Allow 3 business days for reply. All measurements must be make size. Recommend obstacle detection for outdoor blinds.',
    },
    {
      id: 1702,
      categoryId: 17,
      name: 'Straight Drop Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: '3 business days for quote',
      specialConditions:
        'Supply only - no installation offered. Send quote requests to joanna@worldblinds.com.au. Allow 3 business days for reply. All measurements must be make size. Recommend obstacle detection for outdoor blinds.',
    },
    {
      id: 1703,
      categoryId: 17,
      name: 'Wire Guide Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: '3 business days for quote',
      specialConditions:
        'Supply only - no installation offered. Send quote requests to joanna@worldblinds.com.au. Allow 3 business days for reply. All measurements must be make size. Recommend obstacle detection for outdoor blinds.',
    },
    {
      id: 1704,
      categoryId: 17,
      name: 'PVC Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: '3 business days for quote',
      specialConditions:
        'Supply only - no installation offered. Send quote requests to joanna@worldblinds.com.au. Allow 3 business days for reply. All measurements must be make size. Recommend obstacle detection for outdoor blinds.',
    },
    {
      id: 1705,
      categoryId: 17,
      name: 'Folding Arm Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: '3 business days for quote',
      specialConditions:
        'Supply only - no installation offered. Send quote requests to joanna@worldblinds.com.au. Allow 3 business days for reply. All measurements must be make size. Recommend obstacle detection for outdoor blinds.',
    },
    {
      id: 101,
      categoryId: 1,
      name: 'LUXX Shades (formerly CURVERS)',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions:
        'LUXX SHADES are the new name for previously known CURVERS & UNISHADE. Contact for pricing.',
    },
    {
      id: 102,
      categoryId: 1,
      name: 'Allusion Blinds',
      priceType: 'sqm',
      basePrice: 0,
      minimumQty: 1,
      leadTime: 'Standard',
      specialConditions: 'Part of LUXX SHADES range. Contact for pricing.',
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
