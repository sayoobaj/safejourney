import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample incidents for seeding
const incidents = [
  {
    type: 'BANDITRY' as const,
    state: 'Zamfara',
    lga: 'Anka',
    title: 'Bandits attack village in Zamfara, kill 15',
    description: 'Armed bandits attacked Kurya village in Anka LGA of Zamfara State, killing at least 15 people and abducting several others.',
    date: new Date('2026-02-08'),
    killed: 15,
    kidnapped: 8,
    source: 'Premium Times',
  },
  {
    type: 'KIDNAPPING' as const,
    state: 'Kaduna',
    lga: 'Chikun',
    title: 'Gunmen kidnap 5 travelers on Kaduna-Abuja highway',
    description: 'Unknown gunmen abducted five travelers along the Kaduna-Abuja highway near Rijana area.',
    date: new Date('2026-02-09'),
    kidnapped: 5,
    source: 'Vanguard',
  },
  {
    type: 'TERRORISM' as const,
    state: 'Borno',
    lga: 'Gwoza',
    title: 'ISWAP terrorists attack military base in Borno',
    description: 'Islamic State West Africa Province fighters attacked a military outpost in Gwoza LGA, killing 3 soldiers.',
    date: new Date('2026-02-07'),
    killed: 3,
    injured: 7,
    source: 'Punch',
  },
  {
    type: 'ARMED_ROBBERY' as const,
    state: 'Lagos',
    lga: 'Ikorodu',
    title: 'Armed robbers attack bank customers in Ikorodu',
    description: 'A gang of armed robbers attacked customers leaving a bank in Ikorodu, dispossessing them of cash and valuables.',
    date: new Date('2026-02-10'),
    injured: 2,
    source: 'Punch',
  },
  {
    type: 'BANDITRY' as const,
    state: 'Katsina',
    lga: 'Batsari',
    title: 'Bandits rustle 200 cattle in Katsina',
    description: 'Armed bandits invaded Unguwar Musa village and rustled over 200 cattle after overpowering local vigilantes.',
    date: new Date('2026-02-06'),
    killed: 2,
    source: 'Daily Trust',
  },
  {
    type: 'KIDNAPPING' as const,
    state: 'Niger',
    lga: 'Rafi',
    title: '20 villagers abducted in Niger State',
    description: 'Bandits abducted about 20 villagers from Kukoki community in Rafi LGA during an overnight raid.',
    date: new Date('2026-02-05'),
    kidnapped: 20,
    source: 'Premium Times',
  },
  {
    type: 'TERRORISM' as const,
    state: 'Yobe',
    lga: 'Gujba',
    title: 'Boko Haram ambush kills 5 in Yobe',
    description: 'Suspected Boko Haram insurgents ambushed a convoy near Gujba, killing 5 civilians.',
    date: new Date('2026-02-04'),
    killed: 5,
    injured: 3,
    source: 'Sahara Reporters',
  },
  {
    type: 'BANDITRY' as const,
    state: 'Sokoto',
    lga: 'Rabah',
    title: 'Bandits kill 8 in Sokoto village attack',
    description: 'Armed bandits attacked Gandi village in Rabah LGA, killing 8 residents and burning several houses.',
    date: new Date('2026-02-03'),
    killed: 8,
    source: 'Vanguard',
  },
  {
    type: 'KIDNAPPING' as const,
    state: 'Taraba',
    lga: 'Wukari',
    title: 'Gunmen abduct traditional ruler in Taraba',
    description: 'A village head was kidnapped by gunmen along the Wukari-Jalingo road. Ransom demanded.',
    date: new Date('2026-02-02'),
    kidnapped: 1,
    source: 'Tribune',
  },
  {
    type: 'ARMED_ROBBERY' as const,
    state: 'Rivers',
    lga: 'Obio-Akpor',
    title: 'Robbers attack bullion van in Port Harcourt',
    description: 'Armed robbers attacked a bullion van along Aba Road in Port Harcourt, engaging police in a shootout.',
    date: new Date('2026-02-01'),
    killed: 1,
    injured: 4,
    source: 'Channels TV',
  },
  {
    type: 'BANDITRY' as const,
    state: 'Plateau',
    lga: 'Riyom',
    title: 'Herders attack farming community in Plateau',
    description: 'Suspected herders attacked Rim village, killing 12 farmers and destroying crops.',
    date: new Date('2026-01-30'),
    killed: 12,
    source: 'Premium Times',
  },
  {
    type: 'KIDNAPPING' as const,
    state: 'Ogun',
    lga: 'Ijebu North',
    title: 'Travelers kidnapped on Lagos-Ore expressway',
    description: 'Gunmen abducted 6 passengers from a commercial bus along Lagos-Ore expressway in Ogun State.',
    date: new Date('2026-01-29'),
    kidnapped: 6,
    source: 'Guardian',
  },
  {
    type: 'OTHER' as const,
    state: 'Benue',
    lga: 'Logo',
    title: 'Militia group clashes with locals in Benue',
    description: 'Armed militia clashed with community members over land dispute, leaving 4 dead.',
    date: new Date('2026-01-28'),
    killed: 4,
    injured: 10,
    source: 'Vanguard',
  },
  {
    type: 'TERRORISM' as const,
    state: 'Adamawa',
    lga: 'Michika',
    title: 'Suicide bomber targets market in Adamawa',
    description: 'A suicide bomber detonated explosives at a crowded market in Michika, killing 7.',
    date: new Date('2026-01-27'),
    killed: 7,
    injured: 15,
    source: 'Punch',
  },
  {
    type: 'BANDITRY' as const,
    state: 'Kebbi',
    lga: 'Danko-Wasagu',
    title: 'Bandits kill 10 in Kebbi border town',
    description: 'Armed bandits attacked Ribah town near the Niger Republic border, killing 10 and abducting women.',
    date: new Date('2026-01-26'),
    killed: 10,
    kidnapped: 15,
    source: 'Daily Trust',
  },
]

async function main() {
  console.log('🌱 Seeding SafeJourney database...\n')

  for (const incident of incidents) {
    await prisma.incident.create({
      data: {
        ...incident,
        killed: incident.killed || 0,
        kidnapped: incident.kidnapped || 0,
        injured: incident.injured || 0,
        status: 'CONFIRMED',
      }
    })
    console.log(`✓ ${incident.title.slice(0, 50)}...`)
  }

  console.log(`\n✅ Seeded ${incidents.length} incidents`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
