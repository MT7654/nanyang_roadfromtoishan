export const statTypes = ['wealth', 'trust', 'legacy']

export const initialStats = {
  wealth: 1,
  trust: 1,
  legacy: 1,
}

export const artifactPrompts = [
  {
    id: 'migration-trunk',
    name: 'Migration Trunk',
    chapter: 'Arrival',
    description:
      'A weathered trunk that carries memory, risk, and the first fragile hopes of a new life.',
    prompt:
      'Front-facing artefact icon of a worn wooden migrant trunk with rope handles, brass corners, hand-painted travel marks, illustrated in premium manga-inspired historical game style, parchment texture, isolated composition, no text.',
  },
  {
    id: 'clan-seal',
    name: 'Clan Seal',
    chapter: 'The Clan Hall',
    description:
      'The seal symbolizes belonging: work, shelter, rites, and a web of mutual care.',
    prompt:
      'Historical artefact icon of an old Chinese clan association seal carved from dark wood with red stamp surface, premium indie game illustration, paper grain, isolated composition, no text.',
  },
  {
    id: 'carpenter-plane',
    name: "Carpenter's Plane",
    chapter: 'Work by the River',
    description:
      'A humble tool that turns labor into structure and survival into city-making.',
    prompt:
      "Detailed artefact icon of a traditional carpenter's hand plane made of worn wood and steel, premium historical game item illustration, soft paper texture, isolated composition, no text.",
  },
  {
    id: 'qiaopi-letter',
    name: 'Qiaopi Letter',
    chapter: 'The Letter Home',
    description:
      'Ink on paper becomes a lifeline between Singapore and Toishan.',
    prompt:
      'Historical artefact icon of a folded qiaopi remittance letter with brushed ink, red wax mark, and aged paper edges, premium indie narrative game illustration, isolated composition, no text.',
  },
]

export const assetPrompts = {
  title:
    'Premium indie narrative game title screen background, early Singapore riverfront at dawn, monochrome manga ink wash with muted sepia accents, layered cinematic depth, paper texture, emotional and prestigious.',
  scenes: {
    arrival:
      'Cinematic 2.5D background of early Singapore port and riverfront, wooden pier, moored junk boats, migrants arriving, shophouses in distance, black-and-white manga style with tiny muted color details, side-scrolling wide composition, paper texture, no text.',
    clanHall:
      'Historical Toishanese clan association hall interior, ancestral plaques, donation box, job board, lantern light, monochrome manga style with subtle muted reds and golds beginning to emerge, wide side-scrolling composition, paper grain, no text.',
    worksite:
      'Kallang River construction and sawmill worksite, timber beams, carpentry tables, workers resting, river edge, cinematic side-scrolling composition, mostly monochrome inked style with slight earthy color hints, no text.',
    qiaopiHouse:
      'Quiet remittance house interior with writing desk, coins, route map, ink brush, open window, premium visual novel game background, black-and-white with muted teal and amber accents, paper texture, no text.',
    legacy:
      'The same clan hall years later transitioning into modern heritage space, warm full color blooming across wood, plaques, lanterns, and sunlight, premium emotional ending scene, side-scrolling widescreen composition, no text.',
  },
  characters: {
    liang:
      'Full-body illustrated character sprite of Liang, a fictional 17-year-old Toishanese migrant, simple worker clothes, slender build, curious and uncertain but ambitious, premium indie narrative game art, clean silhouette for side-scrolling, mostly monochrome with slight warm accents, transparent-style presentation on flat green background, no text.',
    wong:
      "Full-body illustrated character sprite of Wong Ah Fook as a calm older mentor figure, dignified robe-jacket blend, strategic and community-minded expression, premium historical narrative game art, clean silhouette, muted sepia accents, flat green background for removal, no text.",
    elder:
      'Full-body illustrated character sprite of a Toishanese clan elder, steady and compassionate, traditional association attire, premium narrative game art, monochrome with restrained warm accents, clean silhouette, flat green background for removal, no text.',
  },
}

export const chapters = [
  {
    id: 'arrival',
    number: 1,
    title: 'Arrival',
    subtitle: 'At the edge of the river, every choice feels urgent.',
    era: 'Singapore Riverfront, 1880s-inspired fiction',
    sceneId: 'arrival',
    artifactId: 'migration-trunk',
    playerStart: 10,
    playerEnd: 88,
    narrator:
      'A fictionalised story inspired by Toishanese migration and Wong Ah Fook’s legacy.',
    hotspots: [
      {
        id: 'street-sign',
        label: 'Nanyang Sign',
        x: 18,
        y: 48,
        colorize: 0.12,
        detail:
          'A painted sign points inland. The word "Nanyang" feels larger than geography. It sounds like promise, distance, and reinvention all at once.',
      },
      {
        id: 'manifest',
        label: 'Ship Manifest',
        x: 33,
        y: 58,
        colorize: 0.16,
        detail:
          'A list of names and cargo. So much of a life reduced to ink, passage, and a line item at the edge of empire.',
      },
      {
        id: 'migrants',
        label: 'Other Migrants',
        x: 57,
        y: 56,
        colorize: 0.2,
        detail:
          'Some men stare ahead with resolve. Others hide fear behind silence. You recognize the same uncertainty in yourself.',
      },
      {
        id: 'trunk',
        label: 'Wooden Trunk',
        x: 74,
        y: 66,
        colorize: 0.26,
        detail:
          'A trunk scuffed by salt, rope, and time. It holds almost nothing valuable except the meaning Liang gives it.',
        unlocksArtifact: true,
      },
    ],
    dialogue: [
      {
        speaker: 'Narrator',
        text: 'Liang steps into Nanyang with a stitched shirt, a restless heart, and a future that has not chosen its shape.',
      },
      {
        speaker: 'Liang',
        text: 'If I move quickly, perhaps I can outrun hunger. If I move carefully, perhaps I can become more than hungry.',
      },
    ],
    choice: {
      prompt:
        'A tired migrant drops his bundle in the mud. The hiring yard is opening. What does Liang do?',
      options: [
        {
          id: 'help-migrant',
          label: 'Help him gather his things',
          outcome:
            'You lose time, but the gesture travels farther than coin. People remember who stopped.',
          effects: { trust: 1, legacy: 1 },
        },
        {
          id: 'rush-ahead',
          label: 'Rush ahead to find work',
          outcome:
            'You reach the queue early and secure an advantage. Survival rarely waits for kindness.',
          effects: { wealth: 1 },
        },
      ],
    },
  },
  {
    id: 'clan-hall',
    number: 2,
    title: 'The Clan Hall',
    subtitle: 'Community is architecture made of memory and duty.',
    era: 'Wong Clan Association Hall',
    sceneId: 'clanHall',
    artifactId: 'clan-seal',
    playerStart: 14,
    playerEnd: 90,
    hotspots: [
      {
        id: 'seal',
        label: 'Clan Seal',
        x: 24,
        y: 38,
        colorize: 0.32,
        detail:
          'The seal marks who belongs, who is vouched for, and who will not be left entirely alone.',
        unlocksArtifact: true,
      },
      {
        id: 'donation-box',
        label: 'Donation Box',
        x: 43,
        y: 62,
        colorize: 0.36,
        detail:
          'Coins gathered from men who had little to spare, transformed into food, care, burial, and introductions.',
      },
      {
        id: 'job-board',
        label: 'Job Board',
        x: 64,
        y: 46,
        colorize: 0.42,
        detail:
          'Handwritten notices promise wages, lodging, and risk in unequal measure.',
      },
      {
        id: 'ancestral-plaque',
        label: 'Ancestral Plaque',
        x: 81,
        y: 35,
        colorize: 0.46,
        detail:
          'Names on lacquered wood remind Liang that migration can stretch a family without severing it.',
      },
    ],
    dialogue: [
      {
        speaker: 'Clan Elder',
        text: 'A hall like this is not just walls. It is a bridge. Men arrive with no roof, no contacts, no doctor, no rites for the dead. We try to close those distances.',
      },
      {
        speaker: 'Liang',
        text: 'Then belonging is not free.',
      },
      {
        speaker: 'Clan Elder',
        text: 'No. But neither is being alone.',
      },
    ],
    choice: {
      prompt:
        'The elder offers a low-paying job through the clan network, steady but modest. Another rumor speaks of quicker money outside the hall.',
      options: [
        {
          id: 'clan-job',
          label: 'Take the clan-arranged job',
          outcome:
            'The pay is thinner, but doors begin opening with your name attached to trust.',
          effects: { trust: 1, legacy: 1 },
        },
        {
          id: 'search-alone',
          label: 'Search for better pay alone',
          outcome:
            'You gamble on independence. The wages look better, but the hall will watch you more carefully now.',
          effects: { wealth: 1, trust: -1 },
        },
      ],
    },
  },
  {
    id: 'worksite',
    number: 3,
    title: 'Work by the River',
    subtitle: 'Labor shapes buildings. Character shapes what survives them.',
    era: 'Kallang River Worksite',
    sceneId: 'worksite',
    artifactId: 'carpenter-plane',
    playerStart: 12,
    playerEnd: 90,
    hotspots: [
      {
        id: 'tools',
        label: 'Carpenter Tools',
        x: 18,
        y: 65,
        colorize: 0.53,
        detail:
          'Handles polished by repetition. Every tool carries the memory of the last hand that trusted it.',
      },
      {
        id: 'timber',
        label: 'Timber Beams',
        x: 38,
        y: 47,
        colorize: 0.58,
        detail:
          'Measured, lifted, and joined. Materials obey skill before they obey ambition.',
      },
      {
        id: 'kiln',
        label: 'Brick Kiln',
        x: 61,
        y: 49,
        colorize: 0.6,
        detail:
          'A furnace making permanence one fired block at a time.',
      },
      {
        id: 'plane',
        label: "Carpenter's Plane",
        x: 83,
        y: 68,
        colorize: 0.64,
        detail:
          'A simple plane, but in practiced hands it turns rough timber into a useful promise.',
        unlocksArtifact: true,
      },
    ],
    dialogue: [
      {
        speaker: 'Wong Ah Fook',
        text: 'Hands build houses. Trust builds cities. One can be measured in timber. The other is counted years later.',
      },
      {
        speaker: 'Liang',
        text: 'Then which one feeds a man tonight?',
      },
      {
        speaker: 'Wong Ah Fook',
        text: 'The better question is which one keeps feeding him when the easy money disappears.',
      },
    ],
    choice: {
      prompt:
        'A foreman offers extra pay if you ignore unsafe shortcuts in the timber work.',
      options: [
        {
          id: 'accept-corners',
          label: 'Accept the extra pay',
          outcome:
            'The coins feel real in your pocket. So does the unease when others start checking your work twice.',
          effects: { wealth: 1, trust: -1, legacy: -1 },
        },
        {
          id: 'refuse-corners',
          label: 'Refuse and do the work properly',
          outcome:
            'The day is harder and the pay lighter, but your name gains weight of a different kind.',
          effects: { trust: 1, legacy: 1 },
        },
      ],
    },
  },
  {
    id: 'letter-home',
    number: 4,
    title: 'The Letter Home',
    subtitle: 'Distance becomes bearable when words and remittance can cross it.',
    era: 'Qiaopi House',
    sceneId: 'qiaopiHouse',
    artifactId: 'qiaopi-letter',
    playerStart: 16,
    playerEnd: 86,
    hotspots: [
      {
        id: 'desk',
        label: 'Writing Desk',
        x: 22,
        y: 63,
        colorize: 0.71,
        detail:
          'Here, silence becomes script. What Liang writes will comfort, conceal, and reveal all at once.',
      },
      {
        id: 'ink-brush',
        label: 'Ink Brush',
        x: 40,
        y: 60,
        colorize: 0.74,
        detail:
          'A brush that makes trembling thoughts look composed.',
      },
      {
        id: 'coins',
        label: 'Coins',
        x: 61,
        y: 68,
        colorize: 0.78,
        detail:
          'Each coin carries labor, hunger, and the shape of deferred comfort.',
      },
      {
        id: 'letter',
        label: 'Qiaopi Letter',
        x: 79,
        y: 52,
        colorize: 0.82,
        detail:
          'A message and a remittance folded together: proof that absence can still provide.',
        unlocksArtifact: true,
      },
    ],
    dialogue: [
      {
        speaker: 'Narrator',
        text: 'Before Liang can become anything in Nanyang, he must decide what version of himself to send home.',
      },
    ],
    choice: {
      prompt: 'Which line does Liang include in the letter?',
      options: [
        {
          id: 'do-not-worry',
          label: '“I am well. Do not worry.”',
          outcome:
            'Your words become a shelter for others. Reassurance has its own quiet discipline.',
          effects: { trust: 1 },
        },
        {
          id: 'miss-home',
          label: '“I miss home every night.”',
          outcome:
            'Honesty preserves the emotional thread of home, even when it offers no solution.',
          effects: { legacy: 1 },
        },
        {
          id: 'bring-honour',
          label: '“One day, I will bring our name honour.”',
          outcome:
            'Ambition becomes promise. It fuels both striving and the burden of expectation.',
          effects: { wealth: 1, legacy: 1 },
        },
      ],
    },
  },
  {
    id: 'legacy',
    number: 5,
    title: 'Legacy',
    subtitle: 'A life becomes history the moment someone else inherits its consequences.',
    era: 'Clan Hall, Then and Now',
    sceneId: 'legacy',
    artifactId: null,
    playerStart: 14,
    playerEnd: 88,
    hotspots: [
      {
        id: 'plaques',
        label: 'Ancestral Plaques',
        x: 27,
        y: 36,
        colorize: 0.9,
        detail:
          'The room is warmer now. The plaques no longer feel distant. They feel like witnesses.',
      },
      {
        id: 'records',
        label: 'Hall Records',
        x: 51,
        y: 58,
        colorize: 0.95,
        detail:
          'Ledger books, donations, names, obligations. Legacy is rarely abstract. It is usually filed somewhere.',
      },
      {
        id: 'sunlight',
        label: 'Blooming Light',
        x: 78,
        y: 29,
        colorize: 1,
        detail:
          'Color finally arrives not as spectacle, but as understanding.',
      },
    ],
    dialogue: [
      {
        speaker: 'Wong Ah Fook',
        text: 'Savings can be spent many ways. Wealth expands your reach. Trust strengthens your name. Legacy outlives both. What kind of man have you become, Liang?',
      },
    ],
    choice: {
      prompt: 'Liang has enough to act. Where does he direct his future?',
      options: [
        {
          id: 'expand-business',
          label: 'Expand his business',
          ending: 'wealth',
          outcome:
            'Liang secures prosperity and scale. His life becomes a story of survival sharpened into enterprise.',
          effects: { wealth: 2 },
        },
        {
          id: 'support-migrants',
          label: 'Support new migrants',
          ending: 'trust',
          outcome:
            'Liang becomes a bridge for those arriving after him, remembered first by the people he steadied.',
          effects: { trust: 2 },
        },
        {
          id: 'fund-school',
          label: 'Fund a school and community project',
          ending: 'legacy',
          outcome:
            'Liang turns private success into public inheritance. Long after him, others will keep learning inside his choice.',
          effects: { legacy: 2 },
        },
      ],
    },
  },
]
