require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── UK Locations ──────────────────────────────────────────────────────────────
const UK_LOCATIONS = [
  { city: 'London',       postcode: 'E1 6RF',   address: '14 Whitechapel Road'    },
  { city: 'London',       postcode: 'SW1A 1AA',  address: '22 Victoria Street'     },
  { city: 'London',       postcode: 'N1 9BE',    address: '5 Islington High Street' },
  { city: 'London',       postcode: 'SE1 7PB',   address: '89 Borough Road'        },
  { city: 'Manchester',   postcode: 'M1 1AE',    address: '33 Piccadilly Gardens'   },
  { city: 'Manchester',   postcode: 'M4 2BS',    address: '11 Northern Quarter'     },
  { city: 'Manchester',   postcode: 'M14 6HR',   address: '76 Wilmslow Road'       },
  { city: 'Birmingham',   postcode: 'B1 1BB',    address: '40 Broad Street'        },
  { city: 'Birmingham',   postcode: 'B15 2TT',   address: '18 Edgbaston Park Road' },
  { city: 'Birmingham',   postcode: 'B23 6DX',   address: '3 Erdington High Street' },
  { city: 'Leeds',        postcode: 'LS1 4DY',   address: '7 Briggate'             },
  { city: 'Leeds',        postcode: 'LS8 2LN',   address: '54 Roundhay Road'       },
  { city: 'Liverpool',    postcode: 'L1 8JQ',    address: '21 Bold Street'         },
  { city: 'Liverpool',    postcode: 'L15 8HW',   address: '9 Wavertree Road'       },
  { city: 'Sheffield',    postcode: 'S1 2GU',    address: '66 Division Street'     },
  { city: 'Sheffield',    postcode: 'S8 0PQ',    address: '29 Abbeydale Road'      },
  { city: 'Bristol',      postcode: 'BS1 5TH',   address: '13 Clifton Down Road'   },
  { city: 'Bristol',      postcode: 'BS6 6JF',   address: '42 Gloucester Road'     },
  { city: 'Telford',      postcode: 'TF1 1LU',   address: '8 Telford Town Centre'  },
  { city: 'Telford',      postcode: 'TF2 9NT',   address: '15 Hadley Park Road'    },
  { city: 'Telford',      postcode: 'TF3 4JL',   address: '3 Stirchley Road'       },
  { city: 'Shrewsbury',   postcode: 'SY1 1LH',   address: '27 Pride Hill'          },
  { city: 'Shrewsbury',   postcode: 'SY3 8LJ',   address: '64 Radbrook Road'       },
  { city: 'Newcastle',    postcode: 'NE1 4ST',   address: '38 Grainger Street'     },
  { city: 'Newcastle',    postcode: 'NE6 2HH',   address: '12 Walker Road'         },
  { city: 'Nottingham',   postcode: 'NG1 3FB',   address: '55 Maid Marian Way'     },
  { city: 'Nottingham',   postcode: 'NG7 2RD',   address: '19 Forest Road West'    },
  { city: 'Leicester',    postcode: 'LE1 6YL',   address: '31 Highcross Street'    },
  { city: 'Leicester',    postcode: 'LE5 3GH',   address: '8 Evington Road'        },
  { city: 'Cardiff',      postcode: 'CF10 1EP',  address: '16 Queen Street'        },
  { city: 'Cardiff',      postcode: 'CF24 3AA',  address: '73 Albany Road'         },
  { city: 'Glasgow',      postcode: 'G1 3QQ',    address: '44 Argyle Street'       },
  { city: 'Glasgow',      postcode: 'G41 3TG',   address: '26 Victoria Road'       },
  { city: 'Edinburgh',    postcode: 'EH1 1QS',   address: '5 Royal Mile'           },
  { city: 'Edinburgh',    postcode: 'EH6 8NX',   address: '18 Leith Walk'          },
  { city: 'Coventry',     postcode: 'CV1 2EL',   address: '37 Far Gosford Street'  },
  { city: 'Derby',        postcode: 'DE1 2ES',   address: '22 Sadler Gate'         },
  { city: 'Wolverhampton', postcode: 'WV1 4JR',  address: '9 Lichfield Street'     },
  { city: 'Stoke-on-Trent', postcode: 'ST1 1JL', address: '6 Piccadilly'          },
  { city: 'Portsmouth',   postcode: 'PO1 2EJ',   address: '58 Commercial Road'     },
  { city: 'Southampton',  postcode: 'SO14 7FX',  address: '33 Above Bar Street'    },
  { city: 'Brighton',     postcode: 'BN1 1YR',   address: '11 North Street'        },
  { city: 'Oxford',       postcode: 'OX1 1BY',   address: '24 Cornmarket Street'   },
  { city: 'Cambridge',    postcode: 'CB2 3QD',   address: '7 Kings Parade'         },
  { city: 'Reading',      postcode: 'RG1 1JX',   address: '45 Broad Street'        },
  { city: 'Milton Keynes', postcode: 'MK9 2FX',  address: '3 Central Milton Keynes' },
  { city: 'Northampton',  postcode: 'NN1 2QZ',   address: '16 Gold Street'         },
  { city: 'Peterborough', postcode: 'PE1 1YZ',   address: '51 Queensgate'          },
  { city: 'Norwich',      postcode: 'NR1 3HQ',   address: '28 Prince of Wales Road' },
  { city: 'Ipswich',      postcode: 'IP1 1AH',   address: '14 Tavern Street'       },
];

// ─── Healthcare Roles ──────────────────────────────────────────────────────────
const ROLE_NAMES = [
  'Registered Nurse (RN)',
  'Healthcare Assistant (HCA)',
  'Senior Carer',
  'Support Worker',
  'Mental Health Nurse',
  'Community Nurse',
];

// ─── Test Users ────────────────────────────────────────────────────────────────
const TEST_USERS = [
  { name: 'Amara Okonkwo',     bio: 'Experienced RN with 8 years in acute care settings.' },
  { name: 'James Patel',       bio: 'HCA specialising in dementia and elderly care.' },
  { name: 'Sophie Williams',   bio: 'Community nurse passionate about patient education.' },
  { name: 'Daniel Osei',       bio: 'Senior carer with experience in rehabilitation.' },
  { name: 'Fatima Al-Hassan',  bio: 'Mental health nurse with CBT training.' },
  { name: 'Liam Brennan',      bio: 'Support worker with 5 years in learning disabilities.' },
  { name: 'Chidera Nwosu',     bio: 'RN with ICU background and ACLS certification.' },
  { name: 'Grace Mensah',      bio: 'HCA specialising in palliative care.' },
  { name: 'Thomas Kowalski',   bio: 'Ward nurse with surgical ward experience.' },
  { name: 'Yemi Adebayo',      bio: 'Community nurse focusing on chronic disease management.' },
  { name: 'Sarah Fitzpatrick', bio: 'Experienced carer in care home settings.' },
  { name: 'Mohammed Hussain',  bio: 'MH nurse with CAMHS and adult services experience.' },
  { name: 'Blessing Eze',      bio: 'RN trained in both UK and Nigeria.' },
  { name: 'Connor Murphy',     bio: 'HCA working towards registered nurse qualification.' },
  { name: 'Priya Sharma',      bio: 'Oncology nurse with specialist chemotherapy training.' },
  { name: 'Emmanuel Boateng',  bio: 'Support worker with positive behaviour support training.' },
  { name: 'Lucy Thornton',     bio: 'Senior carer with NVQ Level 3 in Health & Social Care.' },
  { name: 'Adaeze Obinna',     bio: 'RN with theatres and recovery room experience.' },
  { name: 'Jack Harrison',     bio: 'Newly qualified nurse with placement in orthopaedics.' },
  { name: 'Nkechi Okafor',     bio: 'Community mental health nurse, CPN qualified.' },
  { name: 'Megan Davies',      bio: 'HCA with 3 years in NHS and private care.' },
  { name: 'Kwame Asante',      bio: 'RN with cardiology ward experience.' },
  { name: 'Isabelle Laurent',  bio: 'Senior carer managing a small residential team.' },
  { name: 'Joshua Abara',      bio: 'Support worker specialising in autism spectrum care.' },
  { name: 'Hannah Baker',      bio: 'Paediatric nurse transitioning to adult services.' },
  { name: 'Samuel Dankwa',     bio: 'Charge nurse experienced in A&E triage.' },
  { name: 'Rebecca Stone',     bio: 'HCA with manual handling trainer qualification.' },
  { name: 'Chukwuemeka Eze',   bio: 'Nurse with experience in stroke and neurology wards.' },
  { name: 'Olivia Grant',      bio: 'Mental health support worker, Recovery College volunteer.' },
  { name: 'David Olamide',     bio: 'Band 5 nurse seeking community placement experience.' },
  { name: 'Chloe Watkins',     bio: 'Senior HCA with aspirations to train as a paramedic.' },
  { name: 'Tunde Afolabi',     bio: 'RN with 10 years in community nursing across West Midlands.' },
  { name: 'Harriet Powell',    bio: 'Care coordinator with experience in NHS and private sector.' },
  { name: 'Ifeanyi Obi',       bio: 'Support worker working with adults with complex needs.' },
  { name: 'Niamh Kelly',       bio: 'Irish-trained nurse with NHS band 6 experience.' },
  { name: 'Marcus Webb',       bio: 'HCA completing Access to Higher Education diploma.' },
  { name: 'Zara Ahmed',        bio: 'District nurse with leg ulcer and wound care specialism.' },
  { name: 'Tobi Fashola',      bio: 'Mental health nurse with PICU and CAMHS background.' },
  { name: 'Charlotte Hughes',  bio: 'RN with interest in infection prevention and control.' },
  { name: 'Kofi Mensah',       bio: 'Senior carer managing night shifts in a 60-bed home.' },
  { name: 'Aoife Brennan',     bio: 'School nurse with safeguarding lead experience.' },
  { name: 'Damilola Adesanya', bio: 'Newly registered nurse, keen on complex care.' },
  { name: 'Paige Mitchell',    bio: 'HCA with phlebotomy training and blood glucose monitoring.' },
  { name: 'Obinna Uzoma',      bio: 'RN specialising in diabetes management and education.' },
  { name: 'Natalie Fraser',    bio: 'Mental health support worker, CBT informed practice.' },
  { name: 'Abiodun Salami',    bio: 'Senior carer with end-of-life care experience.' },
  { name: 'Jessica Lamb',      bio: 'Community nurse working with health visitors.' },
  { name: 'Chidi Okonkwo',     bio: 'Theatre nurse with scrub and anaesthetic experience.' },
  { name: 'Emily Robertson',   bio: 'Band 6 nurse in acute medical unit.' },
  { name: 'Folake Adeyemi',    bio: 'RN with training in IV therapy and catheter care.' },
];

const COMPLIANCE_TYPES = ['DBS', 'RIGHT_TO_WORK', 'CARE_CERTIFICATE', 'MANDATORY_TRAINING'];
const COMPLIANCE_STATUSES = ['VALID', 'VALID', 'VALID', 'EXPIRING_SOON', 'EXPIRED', 'NOT_SUBMITTED'];
const PHONE_PREFIXES = ['07700', '07800', '07900', '07711', '07811', '07911', '07712', '07812'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const prefix = randomItem(PHONE_PREFIXES);
  const suffix = String(Math.floor(Math.random() * 900000 + 100000));
  return `${prefix} ${suffix}`;
}

function randomComplianceDate(status) {
  const now = new Date();
  if (status === 'VALID') {
    const future = new Date(now);
    future.setMonth(future.getMonth() + Math.floor(Math.random() * 18) + 6);
    return future;
  }
  if (status === 'EXPIRING_SOON') {
    const near = new Date(now);
    near.setDate(near.getDate() + Math.floor(Math.random() * 25) + 5);
    return near;
  }
  if (status === 'EXPIRED') {
    const past = new Date(now);
    past.setMonth(past.getMonth() - Math.floor(Math.random() * 6) - 1);
    return past;
  }
  return null; // NOT_SUBMITTED has no date
}

async function main() {
  console.log('🌱 Seeding 50 test employees...\n');

  // Get available healthcare roles
  const roles = await prisma.healthcareRole.findMany({ where: { name: { in: ROLE_NAMES } } });
  if (roles.length === 0) {
    console.error('❌ No healthcare roles found. Run the main seed first: node prisma/seed.js');
    process.exit(1);
  }

  const password = await bcrypt.hash('Password@123', 12);
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < TEST_USERS.length; i++) {
    const userData = TEST_USERS[i];
    const location = UK_LOCATIONS[i % UK_LOCATIONS.length];
    const slug = userData.name.toLowerCase().replace(/[^a-z]/g, '.');
    const email = `${slug}@leadnurse-test.com`;

    // Skip if already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`  ⏭  Skipped (exists): ${userData.name}`);
      skipped++;
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email,
        password,
        role: 'EMPLOYEE',
        phone: randomPhone(),
        address: location.address,
        city: location.city,
        postcode: location.postcode,
        bio: userData.bio,
      },
    });

    // Assign 1–2 healthcare roles
    const numRoles = Math.random() > 0.5 ? 2 : 1;
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5).slice(0, numRoles);
    for (let r = 0; r < shuffledRoles.length; r++) {
      await prisma.workerRole.create({
        data: { userId: user.id, roleId: shuffledRoles[r].id, isPrimary: r === 0 },
      }).catch(() => {}); // ignore duplicate
    }

    // Add compliance records (DBS + Right to Work always, others random)
    const mandatoryTypes = ['DBS', 'RIGHT_TO_WORK'];
    const optionalTypes = ['CARE_CERTIFICATE', 'MANDATORY_TRAINING', 'NMC_PIN', 'FIRST_AID'];
    const selectedOptional = optionalTypes.filter(() => Math.random() > 0.4);
    const allTypes = [...mandatoryTypes, ...selectedOptional];

    for (const type of allTypes) {
      const status = randomItem(COMPLIANCE_STATUSES);
      const expiryDate = randomComplianceDate(status);
      const issueDate = expiryDate
        ? new Date(expiryDate.getTime() - 365 * 24 * 60 * 60 * 1000 * 3)
        : null;

      await prisma.workerCompliance.create({
        data: {
          userId: user.id,
          type,
          status,
          issueDate,
          expiryDate,
          documentNumber: status !== 'NOT_SUBMITTED' ? `DOC-${Math.random().toString(36).substr(2, 8).toUpperCase()}` : null,
        },
      }).catch(() => {});
    }

    created++;
    console.log(`  ✅ ${userData.name.padEnd(26)} ${location.city.padEnd(16)} ${location.postcode}`);
  }

  console.log(`\n✨ Done! ${created} users created, ${skipped} skipped.`);
  console.log('   Login password for all test accounts: Password@123');
  console.log('\n   Example accounts:');
  TEST_USERS.slice(0, 5).forEach((u) => {
    const slug = u.name.toLowerCase().replace(/[^a-z]/g, '.');
    console.log(`   ${u.name.padEnd(26)} → ${slug}@leadnurse-test.com`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
