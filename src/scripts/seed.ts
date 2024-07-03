import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all records from all tables
  await prisma.eater.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.restaurant.deleteMany({});

  // Create eaters with multiple dietary restrictions
  const eatersData = [
    { name: 'Alice', dietaryRestrictions: ['Vegan', 'Gluten-Free'] },
    { name: 'Bob', dietaryRestrictions: ['Vegetarian', 'Paleo'] },
    { name: 'Charlie', dietaryRestrictions: ['Paleo', 'Gluten-Free'] },
    { name: 'Diana', dietaryRestrictions: ['Gluten-Free'] },
    { name: 'Eve', dietaryRestrictions: [] },
    { name: 'Frank', dietaryRestrictions: ['Vegan'] },
    { name: 'Grace', dietaryRestrictions: ['Vegetarian'] },
    { name: 'Hank', dietaryRestrictions: ['Paleo'] },
  ];

  await prisma.eater.createMany({ data: eatersData });

  // Create restaurants with multiple endorsements
  const restaurantsData = [
    {
      name: 'Green Garden',
      endorsements: ['Vegan-Friendly', 'Gluten-Free-Options'],
    },
    {
      name: 'Veggie Delight',
      endorsements: ['Vegetarian-Friendly', 'Paleo-Friendly'],
    },
    { name: 'Paleo Palace', endorsements: ['Paleo-Friendly'] },
    { name: 'Gluten-Free Haven', endorsements: ['Gluten-Free-Options'] },
    { name: 'Mixed Grill', endorsements: [] },
    {
      name: 'Cuisine Fusion',
      endorsements: ['Vegan-Friendly', 'Vegetarian-Friendly'],
    },
  ];

  await prisma.restaurant.createMany({ data: restaurantsData });

  // Fetch created restaurants to add tables
  const restaurants = await prisma.restaurant.findMany();

  // Create tables for each restaurant
  for (const restaurant of restaurants) {
    const tablesData: { capacity: number; restaurantId: string }[] = [];
    const tableTypes = [2, 4, 6];

    tableTypes.forEach((type) => {
      const count = Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        tablesData.push({
          capacity: type,
          restaurantId: restaurant.id,
        });
      }
    });

    await prisma.table.createMany({ data: tablesData });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
