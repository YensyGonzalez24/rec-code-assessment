const eaters = [
  {
    id: '47e9cad5-0a12-48eb-b31f-5efbae918b41',
    name: 'Alice',
    dietaryRestrictions: ['Vegan'],
  },
  {
    id: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
    name: 'Bob',
    dietaryRestrictions: ['Gluten-Free'],
  },
  {
    id: '83348328-1043-41b6-96e8-884ad6407e00',
    name: 'Josh',
    dietaryRestrictions: ['Paleo'],
  },
  {
    id: '7be598bc-995f-47da-9469-336c48ef3511',
    name: 'Drake',
    dietaryRestrictions: ['Paleo'],
  },
];

const restaurants = [
  {
    id: 'a1103f90-cd8c-4c68-8d94-046b46a68461',
    name: 'Gluten-Free Heaven',
    endorsements: ['Gluten-Free'],
  },
  {
    id: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
    name: 'Paleo Heaven',
    endorsements: ['Paleo'],
  },
];

const tables = [
  {
    id: 'ed9750c9-9271-4611-a6f4-18885d250ef3',
    capacity: 2,
    restaurantId: 'a1103f90-cd8c-4c68-8d94-046b46a68461',
  },
  {
    id: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
    capacity: 4,
    restaurantId: 'a1103f90-cd8c-4c68-8d94-046b46a68461',
  },
  {
    id: '7d9697a0-de0d-49c5-94e8-08b1270bfb39',
    capacity: 4,
    restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
  },
  {
    id: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
    capacity: 4,
    restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
  },
  {
    id: '26f44073-ae5a-4812-be87-f7f1cd83609d',
    capacity: 6,
    restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
  },
];

const reservations = [
  {
    id: '12d49967-1b54-4a65-a31e-b27c80b6c147',
    startTime: new Date('2026-12-03T19:30:00'),
    endTime: new Date('2026-12-03T21:30:00'),
    ownerId: '7be598bc-995f-47da-9469-336c48ef3511',
    tableId: 'ed9750c9-9271-4611-a6f4-18885d250ef3',
    additionalGuests: 0,
    invitees: [],
  },
  {
    id: '6a7b59c8-e7b1-4691-b7ba-bee1c58e7ee5',
    startTime: new Date('2026-07-03T19:30:00'),
    endTime: new Date('2026-07-03T21:30:00'),
    ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
    tableId: 'ed9750c9-9271-4611-a6f4-18885d250ef3',
    additionalGuests: 0,
    invitees: [],
  },
  {
    id: '5b5b87a2-ac96-429d-a1f7-be3bf6011ecb',
    startTime: new Date('2027-07-03T19:30:00'),
    endTime: new Date('2027-07-03T21:30:00'),
    ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
    tableId: 'ed9750c9-9271-4611-a6f4-18885d250ef3',
    additionalGuests: 0,
    invitees: [],
  },
  {
    id: '4b4306a5-76cb-49d5-9bf8-34f52d748b29',
    startTime: new Date('2026-08-03T19:30:00'),
    endTime: new Date('2026-08-03T21:30:00'),
    ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
    tableId: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
    additionalGuests: 0,
    invitees: [],
  },
  {
    id: 'a141aea8-7f92-4dbb-850a-97a96b60500f',
    startTime: new Date('2026-08-03T19:30:00'),
    endTime: new Date('2026-08-03T21:30:00'),
    ownerId: '7be598bc-995f-47da-9469-336c48ef3511',
    tableId: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
    additionalGuests: 0,
    invitees: [],
  },
  {
    id: '12ccd5cb-70fd-41de-8af4-96386afaa60e',
    startTime: new Date('2026-09-03T19:30:00'),
    endTime: new Date('2026-09-03T21:30:00'),
    ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
    tableId: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
    additionalGuests: 0,
    invitees: [
      {
        id: '7be598bc-995f-47da-9469-336c48ef3511',
        name: 'Drake',
        dietaryRestrictions: ['Paleo'],
      },
    ],
  },
];

export { reservations, eaters, tables, restaurants };
