import { getDB, generateId, getNextSequence, formatShopCode, Customer, Motorcycle, Part } from './db';

export async function seedDatabase() {
  const db = await getDB();
  
  // Check if already seeded
  const existingCustomers = await db.getAll('customers');
  if (existingCustomers.length > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database with sample data...');

  // Create sample customers
  const customers: Customer[] = [
    {
      id: generateId(),
      name: 'Juan Pérez García',
      phone: '987654321',
      email: 'juan.perez@email.com',
      address: 'Av. Los Libertadores 123, Lima',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: generateId(),
      name: 'María López Sánchez',
      phone: '998765432',
      email: 'maria.lopez@email.com',
      address: 'Jr. Las Flores 456, Lima',
      createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    },
    {
      id: generateId(),
      name: 'Carlos Rodríguez',
      phone: '976543210',
      email: 'carlos.rodriguez@email.com',
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    },
    {
      id: generateId(),
      name: 'Ana Torres Vega',
      phone: '965432109',
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    },
    {
      id: generateId(),
      name: 'Roberto Méndez',
      phone: '954321098',
      email: 'roberto.mendez@email.com',
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
  ];

  for (const customer of customers) {
    await db.add('customers', customer);
  }

  // Create sample motorcycles
  const motorcycleBrands = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Bajaj'];
  const motorcycleModels = ['CBR 250R', 'XTZ 125', 'Gixxer 150', 'Ninja 300', 'Pulsar 200'];
  const colors = ['Negro', 'Rojo', 'Azul', 'Blanco', 'Verde'];

  const motorcycles: Motorcycle[] = [];
  for (let i = 0; i < 8; i++) {
    const seqNumber = await getNextSequence('motorcycle_shop_code');
    const shopCode = formatShopCode(seqNumber);
    
    motorcycles.push({
      id: generateId(),
      customerId: customers[i % customers.length].id,
      shopCode,
      brand: motorcycleBrands[i % motorcycleBrands.length],
      model: motorcycleModels[i % motorcycleModels.length],
      year: 2018 + (i % 6),
      color: colors[i % colors.length],
      vinChasis: `1HGBH41JXMN${String(109186 + i).padStart(6, '0')}`,
      engineNumber: `JH2PC3${String(7000000 + i * 1234).padStart(7, '0')}`,
      createdAt: Date.now() - (30 - i * 3) * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - (30 - i * 3) * 24 * 60 * 60 * 1000,
    });
  }

  for (const motorcycle of motorcycles) {
    await db.add('motorcycles', motorcycle);
  }

  // Create sample parts
  const parts: Part[] = [
    {
      id: generateId(),
      sku: 'ACE-001',
      name: 'Aceite Motor 20W-50',
      description: 'Aceite sintético para motor 4 tiempos',
      unitPrice: 45.00,
      minStock: 10,
      ean: '7501234567890',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'FIL-002',
      name: 'Filtro de Aceite',
      description: 'Filtro universal compatible con varias marcas',
      unitPrice: 18.50,
      minStock: 15,
      ean: '7501234567891',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'BUJ-003',
      name: 'Bujía NGK',
      description: 'Bujía estándar NGK',
      unitPrice: 12.00,
      minStock: 20,
      ean: '7501234567892',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'CAD-004',
      name: 'Cadena de Transmisión',
      description: 'Cadena reforzada 428H-120L',
      unitPrice: 85.00,
      minStock: 5,
      ean: '7501234567893',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'PAS-005',
      name: 'Pastillas de Freno Delanteras',
      description: 'Pastillas cerámicas alta performance',
      unitPrice: 55.00,
      minStock: 8,
      ean: '7501234567894',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'NEU-006',
      name: 'Neumático Delantero 100/80-17',
      description: 'Neumático deportivo para moto',
      unitPrice: 180.00,
      minStock: 4,
      ean: '7501234567895',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'BAT-007',
      name: 'Batería 12V 7Ah',
      description: 'Batería libre de mantenimiento',
      unitPrice: 120.00,
      minStock: 3,
      ean: '7501234567896',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      sku: 'KIT-008',
      name: 'Kit de Arrastre Completo',
      description: 'Incluye piñón, catalina y cadena',
      unitPrice: 250.00,
      minStock: 2,
      ean: '7501234567897',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  for (const part of parts) {
    await db.add('parts', part);
    // Initialize stock balances with random quantities
    const randomStock = Math.floor(Math.random() * 15);
    await db.put('stockBalances', {
      partId: part.id,
      quantity: randomStock,
      updatedAt: Date.now(),
    });
  }

  console.log('Database seeded successfully!');
  console.log(`- ${customers.length} customers`);
  console.log(`- ${motorcycles.length} motorcycles`);
  console.log(`- ${parts.length} parts`);
}
