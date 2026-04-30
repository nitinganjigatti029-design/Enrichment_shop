/* =========================================================
   ZooEnrich — Prototype Dummy Database
   Shared across all HTML screens. Window-scoped (window.DB).
   ========================================================= */
(function () {
  const img = (q, w=600, h=480, seed=1) =>
    `https://image.pollinations.ai/prompt/${encodeURIComponent(q)}?width=${w}&height=${h}&seed=${seed}&nologo=true`;

  const anglePrompts = [
    ', front product photography studio lighting white background',
    ', side view product photography studio lighting white background',
    ', three-quarter angle product photography studio lighting white background',
    ', close up detail macro shot product photography',
    ', lifestyle in use zoo enclosure natural light'
  ];
  const buildGallery = (p) => anglePrompts.map((ap, i) =>
    img(p.imgQ + ap, 600, 600, (p.seed || 0) * 10 + i + 1)
  );
  const galleryFor = (product) =>
    (product && Array.isArray(product.gallery) && product.gallery.length)
      ? product.gallery
      : [product && product.imgSmall].filter(Boolean);

  const SPECIES = [
    { id: 'sp_tiger',   name: 'Bengal Tiger',           latin: 'Panthera tigris tigris', taxon: 'Mammal · Felidae',    imgQ: 'bengal tiger face close up portrait studio, professional wildlife photography, soft light, depth of field',        seed: 7,  count: 47 },
    { id: 'sp_eleph',   name: 'Asian Elephant',         latin: 'Elephas maximus',        taxon: 'Mammal · Elephantidae',imgQ: 'asian elephant face portrait closeup warm light, professional wildlife photography, soft light, depth of field',    seed: 14, count: 62 },
    { id: 'sp_orang',   name: 'Bornean Orangutan',      latin: 'Pongo pygmaeus',         taxon: 'Mammal · Hominidae',  imgQ: 'orangutan face portrait warm light professional, professional wildlife photography, soft light, depth of field',    seed: 21, count: 58 },
    { id: 'sp_lion',    name: 'African Lion',           latin: 'Panthera leo',           taxon: 'Mammal · Felidae',    imgQ: 'african lion male portrait wildlife photography, professional wildlife photography, soft light, depth of field',    seed: 28, count: 41 },
    { id: 'sp_snow',    name: 'Snow Leopard',           latin: 'Panthera uncia',         taxon: 'Mammal · Felidae',    imgQ: 'snow leopard face portrait mountain background, professional wildlife photography, soft light, depth of field',     seed: 35, count: 33 },
    { id: 'sp_chimp',   name: 'Chimpanzee',             latin: 'Pan troglodytes',        taxon: 'Mammal · Hominidae',  imgQ: 'chimpanzee face portrait forest warm light, professional wildlife photography, soft light, depth of field',         seed: 42, count: 54 },
    { id: 'sp_macaw',   name: 'Scarlet Macaw',          latin: 'Ara macao',              taxon: 'Bird · Psittacidae',  imgQ: 'scarlet macaw parrot closeup vivid red, professional wildlife photography, soft light, depth of field',             seed: 49, count: 27 },
    { id: 'sp_bear',    name: 'Grizzly Bear',           latin: 'Ursus arctos horribilis',taxon: 'Mammal · Ursidae',    imgQ: 'grizzly bear portrait forest natural light, professional wildlife photography, soft light, depth of field',         seed: 56, count: 36 },
    { id: 'sp_gibbon',  name: 'White-cheeked Gibbon',   latin: 'Nomascus leucogenys',    taxon: 'Mammal · Hylobatidae',imgQ: 'white cheeked gibbon primate face closeup, professional wildlife photography, soft light, depth of field',          seed: 63, count: 22 },
    { id: 'sp_otter',   name: 'Asian Small-clawed Otter',latin:'Aonyx cinereus',         taxon: 'Mammal · Mustelidae', imgQ: 'asian small clawed otter closeup warm light, professional wildlife photography, soft light, depth of field',        seed: 70, count: 19 },
    { id: 'sp_gorilla', name: 'Western Lowland Gorilla',latin: 'Gorilla gorilla gorilla',taxon: 'Mammal · Hominidae',  imgQ: 'western lowland gorilla silverback portrait, professional wildlife photography, soft light, depth of field',        seed: 77, count: 31 },
    { id: 'sp_pengu',   name: 'Humboldt Penguin',       latin: 'Spheniscus humboldti',   taxon: 'Bird · Spheniscidae', imgQ: 'humboldt penguin closeup portrait water, professional wildlife photography, soft light, depth of field',            seed: 84, count: 15 }
  ];

  const TAGS = [
    { id: 'tag_sen',  name: 'Sensory',    color: '#00D6C9' },
    { id: 'tag_cog',  name: 'Cognitive',  color: '#8479F9' },
    { id: 'tag_phy',  name: 'Physical',   color: '#FA6140' },
    { id: 'tag_soc',  name: 'Social',     color: '#E4B819' },
    { id: 'tag_food', name: 'Food',       color: '#37BD69' }
  ];

  const CATEGORIES = [
    { id: 'cat_scent',  name: 'Scent Boxes',        icon: 'spray-can',     count: 12, imgQ: 'scent enrichment box cardboard with herbs zoo product photography soft light',    seed: 101 },
    { id: 'cat_puzzle', name: 'Puzzle Feeders',     icon: 'puzzle',        count:  9, imgQ: 'wooden puzzle feeder for zoo animals product photography',                       seed: 102 },
    { id: 'cat_climb',  name: 'Climbing & Rigging', icon: 'trees',         count:  7, imgQ: 'climbing rope structure enrichment for big cats product photo',                  seed: 103 },
    { id: 'cat_ice',    name: 'Ice Treats',         icon: 'snowflake',     count:  6, imgQ: 'frozen fruit ice block colorful enrichment zoo',                                 seed: 104 },
    { id: 'cat_tactile',name: 'Tactile Toys',       icon: 'hand',          count:  8, imgQ: 'rubber kong toy enrichment durable chew product photo',                          seed: 105 },
    { id: 'cat_av',     name: 'Audio / Visual',     icon: 'speaker',       count:  5, imgQ: 'mirror kaleidoscope zoo enrichment visual device',                               seed: 106 },
    { id: 'cat_novel',  name: 'Novel Objects',      icon: 'sparkle',       count:  6, imgQ: 'pinata shaped cardboard novel object enrichment zoo',                            seed: 107 },
    { id: 'cat_herb',   name: 'Plants & Herbs',     icon: 'leaf',          count:  4, imgQ: 'fresh catnip lavender herb bundle zoo enrichment',                               seed: 108 }
  ];

  const ATTRIBUTES = [
    { id: 'attr_size',       name: 'Size',              type: 'select',       options: ['XS','S','M','L','XL'],                                                                                   icon: 'ruler' },
    { id: 'attr_material',   name: 'Material',          type: 'multi_select', options: ['Cardboard','Wood','Jute','Rope','Rubber','Burlap','Ice','Fabric','Plastic','Metal','Paper'],              icon: 'layers' },
    { id: 'attr_scent',      name: 'Scent',             type: 'multi_select', options: ['Catnip','Lavender','Cinnamon','Vanilla','Mint','Clove','Cedar','None'],                                   icon: 'flask-conical' },
    { id: 'attr_color',      name: 'Color',             type: 'color',        options: ['#8B5A2B','#2F2A25','#37BD69','#E4B819','#FA6140','#8479F9','#00D6C9','#FFFFFF'] },
    { id: 'attr_weight',     name: 'Weight (kg)',       type: 'number',       unit: 'kg',                                                                                                          icon: 'weight' },
    { id: 'attr_duration',   name: 'Expected lifespan', type: 'select',       options: ['Single use','1 week','1 month','3+ months'] },
    { id: 'attr_prep',       name: 'Prep time',         type: 'select',       options: ['< 15 min','15–60 min','1–3 hrs','Half day'] },
    { id: 'attr_compat',     name: 'Enclosure type',    type: 'multi_select', options: ['Indoor','Outdoor','Water','Aerial'] },
    { id: 'attr_durability', name: 'Durability',        type: 'select',       options: ['1','2','3','4','5'],                                                                                      icon: 'shield-check' },
    { id: 'attr_refillable', name: 'Refillable',        type: 'boolean',                                                                                                                            icon: 'refresh-cw' },
    { id: 'attr_weather',    name: 'Weather-resistant', type: 'boolean',                                                                                                                            icon: 'cloud-rain' },
    { id: 'attr_washable',   name: 'Washable',          type: 'boolean',                                                                                                                            icon: 'droplets' },
    { id: 'attr_assembly',   name: 'Assembly',          type: 'select',       options: ['None','Basic','Advanced'],                                                                                icon: 'wrench' },
    { id: 'attr_pack_qty',   name: 'Pack quantity',     type: 'number',       unit: 'units',                                                                                                       icon: 'box' },
    { id: 'attr_difficulty', name: 'Difficulty level',  type: 'select',       options: ['Easy','Medium','Hard','Expert'],                                                                          icon: 'gauge' },
    { id: 'attr_dimensions', name: 'Dimensions',        type: 'select',       options: ['Small (20–40cm)','Medium (40–80cm)','Large (80–150cm)','Extra large (150cm+)'],                           icon: 'ruler' },
    { id: 'attr_hang_type',  name: 'Mount type',        type: 'select',       options: ['Ground','Hanging','Floating','Mounted'],                                                                  icon: 'anchor' },
    { id: 'attr_age',        name: 'Age suitability',   type: 'multi_select', options: ['Juvenile','Sub-adult','Adult','Geriatric'],                                                               icon: 'baby' },
    { id: 'attr_cert',       name: 'Certifications',    type: 'multi_select', options: ['AZA-approved','CZA-approved','Non-toxic','BPA-free'],                                                     icon: 'shield-check' },
    { id: 'attr_indoor_outdoor', name: 'Indoor / Outdoor', type: 'multi_select', options: ['Indoor','Outdoor'],                                                                                    icon: 'home' },
    { id: 'attr_capacity',   name: 'Capacity',          type: 'number',       unit: 'L',                                                                                                           icon: 'flask-conical' },
    { id: 'attr_noise_level',name: 'Noise level',       type: 'select',       options: ['Silent','Quiet','Moderate','Loud'],                                                                      icon: 'volume-2' }
  ];

  const categoryAttributeSchema = {
    cat_scent:   [ { id:'attr_size', mandatory:true }, { id:'attr_material', mandatory:true }, { id:'attr_scent', mandatory:true }, { id:'attr_duration', mandatory:false } ],
    cat_puzzle:  [ { id:'attr_size', mandatory:true }, { id:'attr_material', mandatory:true }, { id:'attr_prep', mandatory:true }, { id:'attr_weight', mandatory:false } ],
    cat_climb:   [ { id:'attr_size', mandatory:true }, { id:'attr_material', mandatory:true }, { id:'attr_weight', mandatory:true }, { id:'attr_compat', mandatory:true } ],
    cat_ice:     [ { id:'attr_size', mandatory:true }, { id:'attr_material', mandatory:false }, { id:'attr_prep', mandatory:true }, { id:'attr_duration', mandatory:false } ],
    cat_tactile: [ { id:'attr_size', mandatory:true }, { id:'attr_material', mandatory:true }, { id:'attr_color', mandatory:false } ],
    cat_av:      [ { id:'attr_size', mandatory:false }, { id:'attr_material', mandatory:false }, { id:'attr_prep', mandatory:true } ],
    cat_novel:   [ { id:'attr_size', mandatory:true }, { id:'attr_material', mandatory:true }, { id:'attr_duration', mandatory:false } ],
    cat_herb:    [ { id:'attr_scent', mandatory:true }, { id:'attr_prep', mandatory:false }, { id:'attr_duration', mandatory:false } ]
  };

  const USERS = [
    { id: 'u_rao',    name: 'Dr. M. Rao',     role: 'biologist',      title: 'Senior Biologist',          species: ['sp_tiger','sp_lion','sp_snow'],                   seed: 401, email: 'm.rao@zooenrich.in',    phone: '+91 98401 12233', canPurchase: true,  approverId: 'u_singh', siteId: 'site_hyd', additionalSites: ['site_blr'], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_iyer',   name: 'K. Iyer',        role: 'keeper',         title: 'Primate Keeper',             species: ['sp_orang','sp_chimp','sp_gibbon','sp_gorilla'],   seed: 402, email: 'k.iyer@zooenrich.in',   phone: '+91 98455 66778', canPurchase: false, approverId: 'u_rao',   siteId: 'site_blr', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_patel',  name: 'Dr. R. Patel',   role: 'vet',            title: 'Senior Veterinarian',        species: [],                                                 seed: 403, email: 'r.patel@zooenrich.in',  phone: '+91 98211 00998', canPurchase: true,  approverId: 'u_singh', siteId: 'site_mum', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_singh',  name: 'Dr. N. Singh',   role: 'curator',        title: 'Curator of Animal Care',     species: [],                                                 seed: 404, email: 'n.singh@zooenrich.in',  phone: '+91 98112 23344', canPurchase: true,  approverId: null,      siteId: 'site_del', additionalSites: ['site_hyd','site_mum'], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_kumar',  name: 'S. Kumar',       role: 'lab_manager',    title: 'Enrichment Lab Manager',     species: [],                                                 seed: 405, email: 's.kumar@zooenrich.in',  phone: '+91 98400 55667', canPurchase: true,  approverId: 'u_admin', siteId: 'site_hyd', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_joshi',  name: 'A. Joshi',       role: 'lab_tech',       title: 'Lab Technician',             species: [],                                                 seed: 406, email: 'a.joshi@zooenrich.in',  phone: '+91 98406 77889', canPurchase: false, approverId: 'u_kumar', siteId: 'site_hyd', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_mehta',  name: 'P. Mehta',       role: 'lab_tech',       title: 'Lab Technician (Jr.)',       species: [],                                                 seed: 407, email: 'p.mehta@zooenrich.in',  phone: '+91 98407 88990', canPurchase: false, approverId: 'u_kumar', siteId: 'site_mys', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_das',    name: 'T. Das',         role: 'keeper',         title: 'Big Cat Keeper',             species: ['sp_tiger','sp_lion','sp_snow','sp_bear'],         seed: 408, email: 't.das@zooenrich.in',    phone: '+91 98884 44556', canPurchase: false, approverId: 'u_rao',   siteId: 'site_hyd', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_farah',  name: 'F. Karim',       role: 'biologist',      title: 'Avian Specialist',           species: ['sp_macaw','sp_pengu'],                            seed: 409, email: 'f.karim@zooenrich.in',  phone: '+91 98492 23344', canPurchase: true,  approverId: 'u_singh', siteId: 'site_che', additionalSites: ['site_viz'], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_admin',  name: 'V. Verma',       role: 'admin',          title: 'Site Director',              species: [],                                                 seed: 410, email: 'v.verma@zooenrich.in',  phone: '+91 98410 99001', canPurchase: true,  approverId: null,      siteId: 'site_del', additionalSites: [], imgQ: 'professional portrait headshot person smile' },
    { id: 'u_super',  name: 'A. Banerjee',    role: 'super_admin',    title: 'Finance Controller (Org)',   species: [],                                                 seed: 411, email: 'a.banerjee@zooenrich.in', phone: '+91 98430 11223', canPurchase: false, approverId: null,    siteId: 'site_del', additionalSites: [], imgQ: 'professional portrait headshot person smile' }
  ];

  /* -------- Sites (10 Indian zoo facilities) --------
     `cluster` groups sites for org-level rollup (Super Admin reports). Three regional
     clusters: south, north, east. Used by ZE.wallet.allSites and the dashboard. */
  const SITES = [
    { id:'site_hyd',  name:'Nehru Zoological Park',                         city:'Hyderabad',    state:'Telangana',     pincode:'500064', addressLine1:'Nehru Zoo Park Rd, Bahadurpura', cluster:'south' },
    { id:'site_mys',  name:'Mysore Zoo',                                    city:'Mysuru',       state:'Karnataka',     pincode:'570010', addressLine1:'Indira Nagar',                    cluster:'south' },
    { id:'site_del',  name:'National Zoological Park Delhi',                city:'New Delhi',    state:'Delhi',         pincode:'110003', addressLine1:'Mathura Road',                    cluster:'north' },
    { id:'site_che',  name:'Vandalur Arignar Anna Zoological Park',         city:'Chennai',      state:'Tamil Nadu',    pincode:'600048', addressLine1:'GST Road, Vandalur',              cluster:'south' },
    { id:'site_mum',  name:'Byculla Zoo',                                   city:'Mumbai',       state:'Maharashtra',   pincode:'400027', addressLine1:'Lal Bahadur Shastri Rd',          cluster:'west'  },
    { id:'site_blr',  name:'Bannerghatta Biological Park',                  city:'Bengaluru',    state:'Karnataka',     pincode:'560083', addressLine1:'Bannerghatta Main Rd',            cluster:'south' },
    { id:'site_viz',  name:'Indira Gandhi Zoological Park',                 city:'Visakhapatnam',state:'Andhra Pradesh',pincode:'530040', addressLine1:'Zoo Park Rd',                     cluster:'south' },
    { id:'site_pat',  name:'Patna Zoo',                                     city:'Patna',        state:'Bihar',         pincode:'800014', addressLine1:'Bailey Road',                     cluster:'east'  },
    { id:'site_kan',  name:'Kanpur Zoological Park',                        city:'Kanpur',       state:'Uttar Pradesh', pincode:'208002', addressLine1:'Ratan Lal Nagar',                 cluster:'north' },
    { id:'site_gwt',  name:'Assam State Zoo',                               city:'Guwahati',     state:'Assam',         pincode:'781005', addressLine1:'RG Barua Rd',                     cluster:'east'  }
  ];

  /* -------- Per-site annual enrichment budget (FY 2026–27) --------
     The wallet model: each site has an annual allotment for enrichment purchases.
     Buyers placing orders deduct from the site wallet. Funds sit "Locked" until
     delivery (then "Spent" / paid to admin). Cancellation refunds back to wallet. */
  const FY_LABEL = '2026-27';
  const FY_START = '2026-04-01';
  const FY_END   = '2027-03-31';
  const SITE_BUDGETS = {
    site_hyd: { allotted: 7500000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_mys: { allotted: 5500000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_del: { allotted: 8500000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_che: { allotted: 6500000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_mum: { allotted: 5000000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_blr: { allotted: 7000000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_viz: { allotted: 4500000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_pat: { allotted: 4000000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_kan: { allotted: 4000000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END },
    site_gwt: { allotted: 5000000, fy: FY_LABEL, fyStart: FY_START, fyEnd: FY_END }
  };

  /* -------- Enclosures (per-site, per-species) -------- */
  const ENCLOSURES = [
    // Hyderabad — Nehru Zoological Park (6)
    { id:'enc_hyd_1', siteId:'site_hyd', name:'Tiger Outdoor Habitat A',  type:'outdoor',   speciesIds:['sp_tiger','sp_lion','sp_snow'] },
    { id:'enc_hyd_2', siteId:'site_hyd', name:'Big Cat Night Den',        type:'nocturnal', speciesIds:['sp_tiger','sp_lion','sp_bear'] },
    { id:'enc_hyd_3', siteId:'site_hyd', name:'Elephant Paddock',         type:'outdoor',   speciesIds:['sp_eleph'] },
    { id:'enc_hyd_4', siteId:'site_hyd', name:'Indoor Enrichment Room',   type:'indoor',    speciesIds:['sp_chimp','sp_orang','sp_gibbon','sp_gorilla'] },
    { id:'enc_hyd_5', siteId:'site_hyd', name:'Aviary North',             type:'aerial',    speciesIds:['sp_macaw'] },
    { id:'enc_hyd_6', siteId:'site_hyd', name:'Quarantine Pen',           type:'indoor',    speciesIds:['sp_tiger','sp_bear','sp_lion'] },

    // Mysore Zoo (5)
    { id:'enc_mys_1', siteId:'site_mys', name:'Lion Outdoor Habitat',     type:'outdoor',   speciesIds:['sp_lion','sp_tiger'] },
    { id:'enc_mys_2', siteId:'site_mys', name:'Primate Island',           type:'outdoor',   speciesIds:['sp_chimp','sp_orang','sp_gibbon'] },
    { id:'enc_mys_3', siteId:'site_mys', name:'Elephant Yard',            type:'outdoor',   speciesIds:['sp_eleph'] },
    { id:'enc_mys_4', siteId:'site_mys', name:'Otter Water Enclosure',    type:'water',     speciesIds:['sp_otter','sp_pengu'] },
    { id:'enc_mys_5', siteId:'site_mys', name:'Indoor Enrichment Room',   type:'indoor',    speciesIds:['sp_chimp','sp_gibbon','sp_macaw'] },

    // Delhi — National Zoological Park (5)
    { id:'enc_del_1', siteId:'site_del', name:'Tiger Outdoor Habitat',    type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_del_2', siteId:'site_del', name:'Night Den Block',          type:'nocturnal', speciesIds:['sp_tiger','sp_lion','sp_bear','sp_snow'] },
    { id:'enc_del_3', siteId:'site_del', name:'Great Aviary',             type:'aerial',    speciesIds:['sp_macaw'] },
    { id:'enc_del_4', siteId:'site_del', name:'Gorilla Indoor Den',       type:'indoor',    speciesIds:['sp_gorilla','sp_chimp','sp_orang'] },
    { id:'enc_del_5', siteId:'site_del', name:'Penguin Cove',             type:'water',     speciesIds:['sp_pengu','sp_otter'] },

    // Chennai — Vandalur (5)
    { id:'enc_che_1', siteId:'site_che', name:'Big Cat Habitat A',        type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_che_2', siteId:'site_che', name:'Primate Habitat',          type:'outdoor',   speciesIds:['sp_chimp','sp_orang','sp_gibbon'] },
    { id:'enc_che_3', siteId:'site_che', name:'Macaw Aviary',             type:'aerial',    speciesIds:['sp_macaw'] },
    { id:'enc_che_4', siteId:'site_che', name:'Water Enclosure',          type:'water',     speciesIds:['sp_otter','sp_pengu'] },
    { id:'enc_che_5', siteId:'site_che', name:'Quarantine Pen',           type:'indoor',    speciesIds:['sp_tiger','sp_lion','sp_bear'] },

    // Mumbai — Byculla Zoo (4)
    { id:'enc_mum_1', siteId:'site_mum', name:'Primate Outdoor Habitat',  type:'outdoor',   speciesIds:['sp_chimp','sp_orang','sp_gibbon'] },
    { id:'enc_mum_2', siteId:'site_mum', name:'Penguin Exhibit',          type:'water',     speciesIds:['sp_pengu','sp_otter'] },
    { id:'enc_mum_3', siteId:'site_mum', name:'Indoor Enrichment Room',   type:'indoor',    speciesIds:['sp_chimp','sp_orang'] },
    { id:'enc_mum_4', siteId:'site_mum', name:'Bird Aviary',              type:'aerial',    speciesIds:['sp_macaw'] },

    // Bengaluru — Bannerghatta (6)
    { id:'enc_blr_1', siteId:'site_blr', name:'Tiger Safari Zone',        type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_blr_2', siteId:'site_blr', name:'Bear Habitat',             type:'outdoor',   speciesIds:['sp_bear'] },
    { id:'enc_blr_3', siteId:'site_blr', name:'Primate Forest',           type:'outdoor',   speciesIds:['sp_chimp','sp_orang','sp_gibbon','sp_gorilla'] },
    { id:'enc_blr_4', siteId:'site_blr', name:'Night Den',                type:'nocturnal', speciesIds:['sp_tiger','sp_snow','sp_bear'] },
    { id:'enc_blr_5', siteId:'site_blr', name:'Butterfly Aviary',         type:'aerial',    speciesIds:['sp_macaw'] },
    { id:'enc_blr_6', siteId:'site_blr', name:'Indoor Enrichment Room',   type:'indoor',    speciesIds:['sp_chimp','sp_gibbon','sp_orang'] },

    // Visakhapatnam — Indira Gandhi Zoo (4)
    { id:'enc_viz_1', siteId:'site_viz', name:'Tiger Habitat',            type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_viz_2', siteId:'site_viz', name:'Aviary',                   type:'aerial',    speciesIds:['sp_macaw'] },
    { id:'enc_viz_3', siteId:'site_viz', name:'Primate Enclosure',        type:'outdoor',   speciesIds:['sp_chimp','sp_gibbon'] },
    { id:'enc_viz_4', siteId:'site_viz', name:'Water Pool',               type:'water',     speciesIds:['sp_otter','sp_pengu'] },

    // Patna Zoo (4)
    { id:'enc_pat_1', siteId:'site_pat', name:'Elephant Yard',            type:'outdoor',   speciesIds:['sp_eleph'] },
    { id:'enc_pat_2', siteId:'site_pat', name:'Tiger Outdoor Habitat',    type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_pat_3', siteId:'site_pat', name:'Indoor Enrichment Room',   type:'indoor',    speciesIds:['sp_chimp','sp_orang','sp_gibbon'] },
    { id:'enc_pat_4', siteId:'site_pat', name:'Aviary',                   type:'aerial',    speciesIds:['sp_macaw'] },

    // Kanpur Zoo (4)
    { id:'enc_kan_1', siteId:'site_kan', name:'Bear Habitat',             type:'outdoor',   speciesIds:['sp_bear'] },
    { id:'enc_kan_2', siteId:'site_kan', name:'Tiger Outdoor Habitat',    type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_kan_3', siteId:'site_kan', name:'Night Den',                type:'nocturnal', speciesIds:['sp_tiger','sp_bear','sp_snow'] },
    { id:'enc_kan_4', siteId:'site_kan', name:'Aviary',                   type:'aerial',    speciesIds:['sp_macaw'] },

    // Guwahati — Assam State Zoo (4)
    { id:'enc_gwt_1', siteId:'site_gwt', name:'Elephant Yard',            type:'outdoor',   speciesIds:['sp_eleph'] },
    { id:'enc_gwt_2', siteId:'site_gwt', name:'Primate Forest',           type:'outdoor',   speciesIds:['sp_chimp','sp_orang','sp_gibbon'] },
    { id:'enc_gwt_3', siteId:'site_gwt', name:'Tiger Habitat',            type:'outdoor',   speciesIds:['sp_tiger','sp_lion'] },
    { id:'enc_gwt_4', siteId:'site_gwt', name:'Aviary',                   type:'aerial',    speciesIds:['sp_macaw'] }
  ];

  /* -------- Vendors (5) -------- */
  const VENDORS = [
    { id:'ven_acme',       name:'Acme Enrichment Co.',      tagline:'Rope, wood & burlap experts',             city:'Bengaluru',  state:'Karnataka',   rating:4.7, orders:142, yearFounded:2014, returnPolicy:'7-day replacement on manufacturing defects', logoQ:'minimalist logo letter A green brand product photography flat icon design',          seed:601, coverQ:'enrichment product workshop craft maker india soft light professional photography rope wood',  coverSeed:691 },
    { id:'ven_biocraft',   name:'BioCraft Labs',            tagline:'Scientific scent & cognitive enrichment', city:'Pune',       state:'Maharashtra', rating:4.5, orders:88,  yearFounded:2018, returnPolicy:'Non-returnable once used',                   logoQ:'minimalist logo letter B teal brand flat icon design',                                seed:602, coverQ:'enrichment product workshop craft maker india soft light professional photography laboratory scent', coverSeed:692 },
    { id:'ven_zooworks',   name:'ZooWorks India',           tagline:'Heavy-duty climbing & rigging',           city:'Hyderabad',  state:'Telangana',   rating:4.6, orders:64,  yearFounded:2010, returnPolicy:'14-day inspection window',                    logoQ:'minimalist logo letter Z orange brand flat icon',                                     seed:603, coverQ:'enrichment product workshop craft maker india soft light professional photography climbing ropes', coverSeed:693 },
    { id:'ven_frostbite',  name:'Frostbite Treats',         tagline:'Ice & frozen enrichment specialists',     city:'Chennai',    state:'Tamil Nadu',  rating:4.3, orders:39,  yearFounded:2021, returnPolicy:'Perishable — final sale',                      logoQ:'minimalist logo letter F blue snowflake flat icon',                                   seed:604, coverQ:'enrichment product workshop craft maker india soft light professional photography ice freezer', coverSeed:694 },
    { id:'ven_natureloop', name:'NatureLoop Botanicals',    tagline:'Fresh herbs, scents and plants',          city:'Coimbatore', state:'Tamil Nadu',  rating:4.8, orders:51,  yearFounded:2019, returnPolicy:'3-day freshness guarantee',                    logoQ:'minimalist logo letter N green leaf flat icon',                                       seed:605, coverQ:'enrichment product workshop craft maker india soft light professional photography herbs botanicals', coverSeed:695 }
  ];

  /* -------- Products (20) -------- */
  const productsRaw = [
    { name:'Burlap Scent Sack',     cat:'cat_scent',  tags:['tag_sen','tag_cog'],  stars:5, uses:12, engagement:8.4, safety:'safe',  priority:null,       hot:true,  mat:['Burlap','Jute'], size:'L', scent:['Catnip'],     duration:'1 week',  prep:'< 15 min', imgQ:'burlap scent sack with herbs enrichment product photography soft natural light',             seed:201, price:{material:80,labor:40,effortHrs:0.5},
      specs:{ attr_size:'L', attr_material:['Burlap','Jute'], attr_color:'#E4B819', attr_scent:['Catnip'], attr_duration:'1 week', attr_refillable:true, attr_washable:false, attr_weather:false, attr_hang_type:'Hanging', attr_durability:'3', attr_cert:['Non-toxic'] } },
    { name:'Hidden Treat Log',      cat:'cat_puzzle', tags:['tag_cog','tag_food'], stars:4, uses:8,  engagement:7.9, safety:'safe',  priority:'permanent',hot:false, mat:['Wood'],          size:'M', scent:[],             duration:'3+ months',prep:'15–60 min',imgQ:'hollow log with hidden treats enrichment product photography',                               seed:202, price:{material:220,labor:120,effortHrs:2},
      specs:{ attr_size:'M', attr_material:['Wood'], attr_color:'#8B5A2B', attr_dimensions:'Medium (40–80cm)', attr_weight:4.5, attr_duration:'3+ months', attr_prep:'15–60 min', attr_difficulty:'Medium', attr_hang_type:'Ground', attr_durability:'4', attr_indoor_outdoor:['Indoor','Outdoor'], attr_refillable:true } },
    { name:'Blood Popsicle XL',     cat:'cat_ice',    tags:['tag_food','tag_sen'], stars:5, uses:24, engagement:9.1, safety:'review',priority:'01',       hot:true,  mat:['Ice'],           size:'XL',scent:[],             duration:'Single use',prep:'1–3 hrs', imgQ:'giant frozen red meat ice popsicle tiger enrichment product photography',                      seed:203, price:{material:520,labor:180,effortHrs:3},
      specs:{ attr_size:'XL', attr_material:['Ice'], attr_color:'#FA6140', attr_weight:8.0, attr_capacity:6, attr_duration:'Single use', attr_prep:'1–3 hrs', attr_dimensions:'Large (80–150cm)', attr_hang_type:'Ground', attr_indoor_outdoor:['Outdoor'], attr_age:['Adult','Sub-adult'] } },
    { name:'Climbing Rope Rig',     cat:'cat_climb',  tags:['tag_phy','tag_soc'],  stars:4, uses:3,  engagement:7.2, safety:'safe',  priority:null,       hot:false, mat:['Rope','Wood'],   size:'XL',scent:[],             duration:'3+ months',prep:'Half day', imgQ:'thick climbing rope rig with platforms zoo enrichment product photo',                          seed:204, price:{material:1200,labor:600,effortHrs:8},
      specs:{ attr_size:'XL', attr_material:['Rope','Wood'], attr_color:'#8B5A2B', attr_weight:22, attr_duration:'3+ months', attr_dimensions:'Extra large (150cm+)', attr_hang_type:'Hanging', attr_assembly:'Advanced', attr_weather:true, attr_durability:'5', attr_indoor_outdoor:['Outdoor'], attr_cert:['AZA-approved'] } },
    { name:'Paper Mache Prey',      cat:'cat_novel',  tags:['tag_cog','tag_phy'],  stars:5, uses:6,  engagement:8.7, safety:'safe',  priority:null,       hot:true,  mat:['Paper','Cardboard'], size:'L', scent:['Clove'],  duration:'Single use',prep:'1–3 hrs', imgQ:'paper mache prey deer shape zoo enrichment novel object product photo',                        seed:205, price:{material:180,labor:140,effortHrs:2.5},
      specs:{ attr_size:'L', attr_material:['Paper','Cardboard'], attr_color:'#E4B819', attr_scent:['Clove'], attr_weight:3.2, attr_duration:'Single use', attr_prep:'1–3 hrs', attr_dimensions:'Large (80–150cm)', attr_hang_type:'Ground', attr_cert:['Non-toxic'], attr_indoor_outdoor:['Indoor','Outdoor'] } },
    { name:'Catnip Scratch Tower',  cat:'cat_climb',  tags:['tag_sen','tag_phy'],  stars:4, uses:9,  engagement:8.0, safety:'safe',  priority:null,       hot:false, mat:['Wood','Rope'],   size:'XL',scent:['Catnip'],     duration:'3+ months',prep:'Half day', imgQ:'large wooden scratch tower with catnip for tiger product photo',                               seed:206, price:{material:900,labor:420,effortHrs:6},
      specs:{ attr_size:'XL', attr_material:['Wood','Rope'], attr_color:'#8B5A2B', attr_scent:['Catnip'], attr_weight:35, attr_duration:'3+ months', attr_dimensions:'Extra large (150cm+)', attr_hang_type:'Mounted', attr_assembly:'Advanced', attr_weather:true, attr_durability:'5', attr_indoor_outdoor:['Indoor','Outdoor'], attr_refillable:true } },
    { name:'Puzzle Box Large',      cat:'cat_puzzle', tags:['tag_cog'],            stars:5, uses:14, engagement:8.8, safety:'safe',  priority:null,       hot:true,  mat:['Wood'],          size:'L', scent:[],             duration:'3+ months',prep:'1–3 hrs', imgQ:'large wooden puzzle box with latches enrichment product photo',                                seed:207, price:{material:340,labor:260,effortHrs:4},
      specs:{ attr_size:'L', attr_material:['Wood'], attr_color:'#8B5A2B', attr_weight:6.8, attr_capacity:3, attr_duration:'3+ months', attr_prep:'1–3 hrs', attr_difficulty:'Hard', attr_dimensions:'Large (80–150cm)', attr_assembly:'Basic', attr_durability:'4', attr_refillable:true, attr_cert:['Non-toxic'] } },
    { name:'Herb Garden Planter',   cat:'cat_herb',   tags:['tag_sen','tag_food'], stars:4, uses:5,  engagement:7.5, safety:'safe',  priority:null,       hot:false, mat:['Wood'],          size:'M', scent:['Mint','Lavender'],duration:'1 month',prep:'15–60 min',imgQ:'planter with fresh herbs catnip lemongrass enrichment product photo',                        seed:208, price:{material:280,labor:120,effortHrs:1.5},
      specs:{ attr_size:'M', attr_material:['Wood'], attr_color:'#37BD69', attr_scent:['Mint','Lavender'], attr_weight:4.0, attr_duration:'1 month', attr_prep:'15–60 min', attr_hang_type:'Ground', attr_indoor_outdoor:['Outdoor'], attr_weather:true, attr_cert:['Non-toxic'], attr_refillable:true } },
    { name:'Cardboard Piñata',      cat:'cat_novel',  tags:['tag_cog','tag_food'], stars:4, uses:11, engagement:8.6, safety:'safe',  priority:null,       hot:false, mat:['Cardboard','Paper'], size:'L', scent:[],         duration:'Single use',prep:'15–60 min',imgQ:'cardboard pinata shaped animal enrichment hanging zoo product photo',                         seed:209, price:{material:110,labor:90,effortHrs:1},
      specs:{ attr_size:'L', attr_material:['Cardboard','Paper'], attr_color:'#E4B819', attr_weight:1.4, attr_duration:'Single use', attr_prep:'15–60 min', attr_dimensions:'Medium (40–80cm)', attr_hang_type:'Hanging', attr_difficulty:'Easy', attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['Non-toxic'] } },
    { name:'Ice Ball with Fish',    cat:'cat_ice',    tags:['tag_sen','tag_food'], stars:3, uses:7,  engagement:7.6, safety:'safe',  priority:null,       hot:false, mat:['Ice'],           size:'L', scent:[],             duration:'Single use',prep:'1–3 hrs', imgQ:'giant frozen ice ball with fish inside zoo enrichment',                                        seed:210, price:{material:240,labor:80,effortHrs:1},
      specs:{ attr_size:'L', attr_material:['Ice'], attr_color:'#00D6C9', attr_weight:5.5, attr_capacity:4, attr_duration:'Single use', attr_prep:'1–3 hrs', attr_dimensions:'Medium (40–80cm)', attr_hang_type:'Floating', attr_indoor_outdoor:['Outdoor'], attr_age:['Adult','Sub-adult','Juvenile'] } },
    { name:'Jute Tug Rope',         cat:'cat_tactile',tags:['tag_phy','tag_soc'],  stars:4, uses:13, engagement:8.1, safety:'safe',  priority:null,       hot:false, mat:['Jute','Rope'],   size:'L', scent:[],             duration:'1 month',  prep:'15–60 min',imgQ:'thick jute tug rope knotted for big cat enrichment',                                           seed:211, price:{material:160,labor:80,effortHrs:1},
      specs:{ attr_size:'L', attr_material:['Jute','Rope'], attr_color:'#E4B819', attr_weight:2.2, attr_duration:'1 month', attr_dimensions:'Large (80–150cm)', attr_hang_type:'Hanging', attr_durability:'4', attr_washable:true, attr_weather:true, attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['Non-toxic'] } },
    { name:'Mirror Panel',          cat:'cat_av',     tags:['tag_sen','tag_cog'],  stars:3, uses:4,  engagement:6.8, safety:'safe',  priority:null,       hot:false, mat:['Plastic','Metal'], size:'M', scent:[],           duration:'3+ months',prep:'1–3 hrs', imgQ:'curved acrylic mirror panel enrichment zoo',                                                   seed:212, price:{material:420,labor:180,effortHrs:2},
      specs:{ attr_size:'M', attr_material:['Plastic','Metal'], attr_color:'#00D6C9', attr_weight:3.5, attr_duration:'3+ months', attr_dimensions:'Medium (40–80cm)', attr_hang_type:'Mounted', attr_assembly:'Basic', attr_washable:true, attr_weather:true, attr_durability:'4', attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['BPA-free','Non-toxic'] } },
    { name:'Lavender Scent Ball',   cat:'cat_scent',  tags:['tag_sen'],            stars:5, uses:9,  engagement:8.3, safety:'safe',  priority:null,       hot:true,  mat:['Fabric'],        size:'M', scent:['Lavender'],   duration:'1 week',   prep:'< 15 min', imgQ:'fabric scent ball with dried lavender enrichment product photo',                                seed:213, price:{material:70,labor:30,effortHrs:0.4},
      specs:{ attr_size:'M', attr_material:['Fabric'], attr_color:'#8479F9', attr_scent:['Lavender'], attr_duration:'1 week', attr_prep:'< 15 min', attr_refillable:true, attr_washable:true, attr_hang_type:'Hanging', attr_durability:'3', attr_cert:['Non-toxic'], attr_pack_qty:1 } },
    { name:'Kong Chew Toy XL',      cat:'cat_tactile',tags:['tag_phy'],            stars:5, uses:18, engagement:8.5, safety:'safe',  priority:null,       hot:true,  mat:['Rubber'],        size:'XL',scent:[],             duration:'3+ months',prep:'< 15 min', imgQ:'giant rubber kong chew toy enrichment product photo',                                          seed:214, price:{material:620,labor:40,effortHrs:0.2},
      specs:{ attr_size:'XL', attr_material:['Rubber'], attr_color:'#FA6140', attr_weight:1.8, attr_duration:'3+ months', attr_dimensions:'Medium (40–80cm)', attr_hang_type:'Ground', attr_durability:'5', attr_washable:true, attr_weather:true, attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['BPA-free','Non-toxic'], attr_refillable:true } },
    { name:'Sound Enrichment Box',  cat:'cat_av',     tags:['tag_sen','tag_cog'],  stars:4, uses:6,  engagement:7.9, safety:'safe',  priority:null,       hot:false, mat:['Wood','Plastic'],size:'M', scent:[],             duration:'3+ months',prep:'1–3 hrs', imgQ:'wooden box speaker sound enrichment zoo product photo',                                        seed:215, price:{material:520,labor:240,effortHrs:3},
      specs:{ attr_size:'M', attr_material:['Wood','Plastic'], attr_color:'#2F2A25', attr_weight:5.2, attr_duration:'3+ months', attr_prep:'1–3 hrs', attr_assembly:'Advanced', attr_noise_level:'Moderate', attr_hang_type:'Mounted', attr_indoor_outdoor:['Indoor'], attr_durability:'4', attr_cert:['BPA-free'] } },
    { name:'Spice Rub Log',         cat:'cat_scent',  tags:['tag_sen','tag_cog'],  stars:4, uses:10, engagement:9.2, safety:'safe',  priority:null,       hot:true,  mat:['Wood'],          size:'L', scent:['Cinnamon','Clove'],duration:'1 week',prep:'15–60 min',imgQ:'wooden log with spice rub enrichment product photo',                                     seed:216, price:{material:200,labor:120,effortHrs:2},
      specs:{ attr_size:'L', attr_material:['Wood'], attr_color:'#8B5A2B', attr_scent:['Cinnamon','Clove'], attr_weight:4.6, attr_duration:'1 week', attr_prep:'15–60 min', attr_dimensions:'Large (80–150cm)', attr_hang_type:'Ground', attr_refillable:true, attr_weather:true, attr_indoor_outdoor:['Outdoor'], attr_cert:['Non-toxic'] } },
    { name:'Bamboo Foraging Tube',  cat:'cat_puzzle', tags:['tag_cog','tag_food'], stars:5, uses:15, engagement:8.9, safety:'safe',  priority:null,       hot:true,  mat:['Wood'],          size:'M', scent:[],             duration:'1 month',  prep:'< 15 min', imgQ:'bamboo tube foraging feeder with holes enrichment product photo',                               seed:217, price:{material:90,labor:60,effortHrs:0.75},
      specs:{ attr_size:'M', attr_material:['Wood'], attr_color:'#8B5A2B', attr_weight:1.2, attr_capacity:1, attr_duration:'1 month', attr_prep:'< 15 min', attr_difficulty:'Easy', attr_dimensions:'Medium (40–80cm)', attr_hang_type:'Hanging', attr_refillable:true, attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['Non-toxic'] } },
    { name:'Soft Hammock',          cat:'cat_tactile',tags:['tag_phy','tag_soc'],  stars:4, uses:8,  engagement:7.7, safety:'safe',  priority:null,       hot:false, mat:['Fabric','Rope'], size:'XL',scent:[],             duration:'3+ months',prep:'1–3 hrs', imgQ:'primate hammock hanging fabric rope enrichment zoo product',                                   seed:218, price:{material:380,labor:160,effortHrs:2},
      specs:{ attr_size:'XL', attr_material:['Fabric','Rope'], attr_color:'#37BD69', attr_weight:2.8, attr_duration:'3+ months', attr_dimensions:'Large (80–150cm)', attr_hang_type:'Hanging', attr_assembly:'Basic', attr_washable:true, attr_durability:'4', attr_indoor_outdoor:['Indoor','Outdoor'], attr_age:['Juvenile','Sub-adult','Adult','Geriatric'] } },
    { name:'Cinnamon Shake Tube',   cat:'cat_scent',  tags:['tag_sen'],            stars:5, uses:7,  engagement:8.0, safety:'safe',  priority:null,       hot:false, mat:['Cardboard'],     size:'S', scent:['Cinnamon'],   duration:'Single use',prep:'< 15 min', imgQ:'cardboard tube filled with cinnamon enrichment product',                                       seed:219, price:{material:40,labor:20,effortHrs:0.25},
      specs:{ attr_size:'S', attr_material:['Cardboard'], attr_color:'#E4B819', attr_scent:['Cinnamon'], attr_duration:'Single use', attr_prep:'< 15 min', attr_dimensions:'Small (20–40cm)', attr_hang_type:'Ground', attr_pack_qty:6, attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['Non-toxic'] } },
    { name:'Puzzle Ball Feeder',    cat:'cat_puzzle', tags:['tag_cog','tag_phy'],  stars:5, uses:19, engagement:8.7, safety:'safe',  priority:null,       hot:true,  mat:['Rubber'],        size:'L', scent:[],             duration:'3+ months',prep:'< 15 min', imgQ:'rubber puzzle ball treat dispenser enrichment product',                                         seed:220, price:{material:540,labor:40,effortHrs:0.3},
      specs:{ attr_size:'L', attr_material:['Rubber'], attr_color:'#37BD69', attr_weight:2.1, attr_capacity:2, attr_duration:'3+ months', attr_prep:'< 15 min', attr_difficulty:'Medium', attr_dimensions:'Medium (40–80cm)', attr_hang_type:'Ground', attr_refillable:true, attr_washable:true, attr_weather:true, attr_durability:'5', attr_indoor_outdoor:['Indoor','Outdoor'], attr_cert:['BPA-free','Non-toxic'] } }
  ];

  // Vendor assignment + stock levels per product index (0..19 → prod_001..prod_020)
  const productVendorMap = [
    'ven_natureloop', // prod_001 Burlap Scent Sack (scent)
    'ven_acme',       // prod_002 Hidden Treat Log (puzzle)
    'ven_frostbite',  // prod_003 Blood Popsicle XL (ice)
    'ven_zooworks',   // prod_004 Climbing Rope Rig (climb)
    'ven_acme',       // prod_005 Paper Mache Prey (novel)
    'ven_zooworks',   // prod_006 Catnip Scratch Tower (climb)
    'ven_acme',       // prod_007 Puzzle Box Large (puzzle)
    'ven_natureloop', // prod_008 Herb Garden Planter (herb)
    'ven_natureloop', // prod_009 Cardboard Piñata (novel)
    'ven_frostbite',  // prod_010 Ice Ball with Fish (ice)
    'ven_acme',       // prod_011 Jute Tug Rope (tactile)
    'ven_biocraft',   // prod_012 Mirror Panel (av)
    'ven_biocraft',   // prod_013 Lavender Scent Ball (scent)
    'ven_zooworks',   // prod_014 Kong Chew Toy XL (tactile)
    'ven_biocraft',   // prod_015 Sound Enrichment Box (av)
    'ven_natureloop', // prod_016 Spice Rub Log (scent)
    'ven_acme',       // prod_017 Soft Hammock (tactile)
    'ven_biocraft',   // prod_018 Bamboo Foraging Tube (puzzle)
    'ven_biocraft',   // prod_019 Cinnamon Shake Tube (scent)
    'ven_acme'        // prod_020 Puzzle Ball Feeder (puzzle)
  ];
  const productStockMap = [
    24, 18, 5, 3, 12, 7, 22, 0, 35, 14,
    28, 11, 40, 16, 4, 26, 20, 31, 0, 15
  ];

  // Each product gets its own unique prompt + seed, with style modifiers appended for polished e-commerce look
  const PRODUCTS = productsRaw.map((p, i) => ({
    id: 'prod_' + String(i + 1).padStart(3, '0'),
    ...p,
    vendorId: productVendorMap[i],
    stock: productStockMap[i],
    img: img(p.imgQ + ', product photography, studio lighting, soft shadow, white background, 8k, sharp focus, detailed', 600, 600, p.seed),
    imgSmall: img(p.imgQ + ', product photography, white background', 240, 240, p.seed),
    gallery: buildGallery(p),
    compatibleSpecies: SPECIES.filter(() => Math.random() > 0.3).map(s => s.id),
    submittedBy: USERS[(i % USERS.length)].id,
    createdAt: `2026-0${1 + (i % 3)}-${10 + (i % 18)}`,
    status: 'published'
  }));

  /* -------- Pending catalog approvals (5) -------- */
  const PENDING = [
    { id:'pend_1', name:'Frozen Herring Log',    cat:'cat_ice',    submittedBy:'u_iyer',  tags:['tag_food','tag_sen'], reason:'New item · safety review needed', imgQ:'frozen fish herring in ice block enrichment zoo product photo',       seed:301, daysPending:2, flags:['Needs vet sign-off'] },
    { id:'pend_2', name:'Bubble Machine',        cat:'cat_av',     submittedBy:'u_farah', tags:['tag_sen'],            reason:'Electronic device · check safety', imgQ:'bubble blowing machine enrichment zoo product photo',                seed:302, daysPending:5, flags:['Electrical','Small parts'] },
    { id:'pend_3', name:'Salt Lick Tower',       cat:'cat_tactile',tags:['tag_sen','tag_food'], submittedBy:'u_das', reason:'New material · check ingestion risk', imgQ:'natural salt lick mineral block for zoo animals product',           seed:303, daysPending:1, flags:[] },
    { id:'pend_4', name:'Foraging Hay Ball',     cat:'cat_puzzle', submittedBy:'u_iyer',  tags:['tag_cog','tag_food'], reason:'Replaces older variant',            imgQ:'hay ball with hidden food for primate enrichment product',           seed:304, daysPending:3, flags:[] },
    { id:'pend_5', name:'Scented Paint Canvas',  cat:'cat_scent',  submittedBy:'u_farah', tags:['tag_sen','tag_cog'],  reason:'Non-toxic paint · document spec',  imgQ:'canvas with animal paw prints paint enrichment zoo product',         seed:305, daysPending:8, flags:['Material check'] }
  ];

  /* -------- Reviews (12) -------- */
  const REVIEWS = [
    { id:'rv_001', productId:'prod_001', buyerId:'u_rao',   stars:5, text:'Our Bengal tigers engaged for 40+ minutes. Burlap held up through three wash cycles.',                                                          createdAt:'2026-04-10T09:22:00.000Z', vendorReply:{ text:'Thanks Dr. Rao! We are shipping a refill pack next week.', at:'2026-04-11T06:00:00.000Z' } },
    { id:'rv_002', productId:'prod_001', buyerId:'u_das',   stars:4, text:'Great for big cats. Arrived slightly smaller than pictured.',                                                                                   createdAt:'2026-04-05T14:00:00.000Z' },
    { id:'rv_003', productId:'prod_003', buyerId:'u_rao',   stars:5, text:'Blood popsicles are a hit. Lasted 90 min in 35°C shade.',                                                                                       createdAt:'2026-04-08T12:20:00.000Z' },
    { id:'rv_004', productId:'prod_006', buyerId:'u_das',   stars:5, text:'Scratch tower is indestructible — three months in and it still looks new.',                                                                     createdAt:'2026-03-28T08:00:00.000Z' },
    { id:'rv_005', productId:'prod_007', buyerId:'u_iyer',  stars:4, text:'Our orangutans solved the puzzle faster than expected. Need a harder version.',                                                                  createdAt:'2026-04-02T10:00:00.000Z', vendorReply:{ text:'Working on a Puzzle Box XL — launching next quarter.', at:'2026-04-03T09:00:00.000Z' } },
    { id:'rv_006', productId:'prod_008', buyerId:'u_farah', stars:5, text:'Herbs arrived fresh and the macaws loved the lemongrass.',                                                                                      createdAt:'2026-04-15T11:00:00.000Z' },
    { id:'rv_007', productId:'prod_011', buyerId:'u_iyer',  stars:3, text:'Jute tug rope frays faster than I hoped. Otters still like it.',                                                                                 createdAt:'2026-04-12T15:30:00.000Z' },
    { id:'rv_008', productId:'prod_013', buyerId:'u_rao',   stars:5, text:'Lavender scent ball — calmed the tiger cubs within minutes. Ordering more.',                                                                    createdAt:'2026-04-18T09:30:00.000Z' },
    { id:'rv_009', productId:'prod_014', buyerId:'u_das',   stars:5, text:'Kong toys survive even our biggest bears. Worth every rupee.',                                                                                  createdAt:'2026-03-20T10:00:00.000Z' },
    { id:'rv_010', productId:'prod_017', buyerId:'u_iyer',  stars:4, text:'Hammock is a favourite nap spot. Ropes could be a touch softer.',                                                                               createdAt:'2026-04-14T08:00:00.000Z' },
    { id:'rv_011', productId:'prod_020', buyerId:'u_rao',   stars:5, text:'Puzzle ball feeder — tigers love it, keeps them busy for hours.',                                                                               createdAt:'2026-04-19T17:00:00.000Z' },
    { id:'rv_012', productId:'prod_002', buyerId:'u_iyer',  stars:4, text:'Hidden treat log — primates figured it out quickly. Need more hiding spots.',                                                                    createdAt:'2026-04-06T13:00:00.000Z' }
  ];

  /* -------- Carriers (courier partners) -------- */
  const CARRIERS = [
    { id:'bluedart',  name:'Blue Dart',  urlTemplate: 'https://www.bluedart.com/tracking?awb={number}', prefix:'BD'  },
    { id:'delhivery', name:'Delhivery',  urlTemplate: 'https://www.delhivery.com/track/package/{number}', prefix:'DLV' },
    { id:'dtdc',      name:'DTDC',       urlTemplate: 'https://www.dtdc.in/track?awb={number}',          prefix:'DT'  },
    { id:'indiapost', name:'India Post', urlTemplate: 'https://www.indiapost.gov.in/track?id={number}',  prefix:'IP'  },
    { id:'xpressbees',name:'Xpressbees', urlTemplate: 'https://www.xpressbees.com/track/{number}',       prefix:'XP'  }
  ];

  /* -------- Demo orders (12) with shipping & tracking -------- */
  // Computed subtotals use (material + labor) * qty from PRODUCTS:
  // prod_001 = 120, prod_002 = 340, prod_003 = 700, prod_004 = 1800,
  // prod_005 = 320, prod_006 = 1320, prod_007 = 600, prod_008 = 400,
  // prod_009 = 200, prod_010 = 320, prod_011 = 240, prod_012 = 600,
  // prod_013 = 100, prod_014 = 660, prod_015 = 760, prod_016 = 320,
  // prod_017 = 150, prod_018 = 540, prod_019 = 60,  prod_020 = 580
  const DEMO_ORDERS = [
    // 1 — placed (newest, carrier not yet assigned)
    { id:'ORD-D001', createdAt:'2026-04-22T09:15:00+05:30', createdBy:'u_rao', species:'sp_tiger', speciesId:'sp_tiger',
      siteId:'site_hyd', enclosureId:'enc_hyd_1',
      requiresApproval:false, approvalStatus:null, approverId:null, approvedAt:null, rejectReason:null,
      vendorId:'ven_natureloop',
      vendorResponse: null,
      items:[
        { productId:'prod_001', qty:2, config:{ size:'L', scent:'Catnip' } },
        { productId:'prod_016', qty:1 }
      ],
      subtotal: 120*2 + 320*1, // 560
      shippingMethod:'Standard', shippingFee:80, total: 640,
      status:'placed', priority:'Normal',
      notes:'Order just placed — awaiting seller confirmation.',
      shippingAddress:{
        name:'Dr. M. Rao', site:'Nehru Zoological Park', line1:'Bahadurpura Road', line2:'Near Mir Alam Tank',
        city:'Hyderabad', state:'Telangana', pincode:'500064', phone:'+91 9840112233'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:'2026-04-27T18:00:00+05:30',
        events:[
          { status:'placed', at:'2026-04-22T09:15:00+05:30', location:'Online', note:'Order placed' }
        ]
      },
      source:'demo'
    },

    // 2a — pending approval (u_joshi needs u_kumar approval) — newest
    { id:'ORD-J103', createdAt:'2026-04-27T14:20:00+05:30', createdBy:'u_joshi', species:'sp_tiger', speciesId:'sp_tiger',
      siteId:'site_hyd', enclosureId:'enc_hyd_1',
      requiresApproval:true, approvalStatus:'pending', approverId:'u_kumar', approvedAt:null, rejectReason:null,
      vendorId:'ven_natureloop',
      vendorResponse: null,
      items:[
        { productId:'prod_001', qty:3, config:{ size:'L', scent:'Catnip' } },
        { productId:'prod_016', qty:2 }
      ],
      subtotal: 120*3 + 320*2, // 1000
      shippingMethod:'Standard', shippingFee:80, total: 1080,
      status:'pending_approval', priority:'Normal',
      notes:'Big-cat enclosure refresh — needed for next week rotation.',
      shippingAddress:{
        name:'A. Joshi', site:'Nehru Zoological Park', line1:'Bahadurpura Road', line2:'Near Mir Alam Tank',
        city:'Hyderabad', state:'Telangana', pincode:'500064', phone:'+91 98406 77889'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:null,
        events:[
          { status:'pending_approval', at:'2026-04-27T14:20:00+05:30', location:'Online', note:'Awaiting approval from S. Kumar' }
        ]
      },
      source:'demo'
    },

    // 2b — pending approval (u_joshi needs u_kumar approval) — high-priority larger basket
    { id:'ORD-J102', createdAt:'2026-04-26T10:05:00+05:30', createdBy:'u_joshi', species:'sp_orang', speciesId:'sp_orang',
      siteId:'site_hyd', enclosureId:'enc_hyd_2',
      requiresApproval:true, approvalStatus:'pending', approverId:'u_kumar', approvedAt:null, rejectReason:null,
      vendorId:'ven_biocraft',
      vendorResponse: null,
      items:[
        { productId:'prod_009', qty:4, config:{ size:'L' } },
        { productId:'prod_013', qty:6 }
      ],
      subtotal: 200*4 + 100*6, // 1400
      shippingMethod:'Express', shippingFee:200, total: 1600,
      status:'pending_approval', priority:'High',
      notes:'Primate puzzle feeders — current set damaged.',
      shippingAddress:{
        name:'A. Joshi', site:'Nehru Zoological Park', line1:'Bahadurpura Road', line2:'Near Mir Alam Tank',
        city:'Hyderabad', state:'Telangana', pincode:'500064', phone:'+91 98406 77889'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:null,
        events:[
          { status:'pending_approval', at:'2026-04-26T10:05:00+05:30', location:'Online', note:'Awaiting approval from S. Kumar' }
        ]
      },
      source:'demo'
    },

    // 2c — pending approval (u_joshi needs u_kumar approval) — small order
    { id:'ORD-J101', createdAt:'2026-04-25T16:50:00+05:30', createdBy:'u_joshi', species:'sp_macaw', speciesId:'sp_macaw',
      siteId:'site_hyd', enclosureId:'enc_hyd_3',
      requiresApproval:true, approvalStatus:'pending', approverId:'u_kumar', approvedAt:null, rejectReason:null,
      vendorId:'ven_biocraft',
      vendorResponse: null,
      items:[
        { productId:'prod_013', qty:3 }
      ],
      subtotal: 100*3, // 300
      shippingMethod:'Standard', shippingFee:80, total: 380,
      status:'pending_approval', priority:'Normal',
      notes:'Top-up for avian foraging blocks.',
      shippingAddress:{
        name:'A. Joshi', site:'Nehru Zoological Park', line1:'Bahadurpura Road', line2:'Near Mir Alam Tank',
        city:'Hyderabad', state:'Telangana', pincode:'500064', phone:'+91 98406 77889'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:null,
        events:[
          { status:'pending_approval', at:'2026-04-25T16:50:00+05:30', location:'Online', note:'Awaiting approval from S. Kumar' }
        ]
      },
      source:'demo'
    },

    // 2 — pending approval (u_iyer needs u_rao approval)
    { id:'ORD-D002', createdAt:'2026-04-21T11:40:00+05:30', createdBy:'u_iyer', species:'sp_orang', speciesId:'sp_orang',
      siteId:'site_blr', enclosureId:'enc_blr_3',
      requiresApproval:true, approvalStatus:'pending', approverId:'u_rao', approvedAt:null, rejectReason:null,
      vendorId:'ven_natureloop',
      vendorResponse: null,
      items:[
        { productId:'prod_009', qty:2, config:{ size:'L' } },
        { productId:'prod_008', qty:1, config:{ size:'M' } }
      ],
      subtotal: 200*2 + 400*1, // 800
      shippingMethod:'Express', shippingFee:200, total: 1000,
      status:'pending_approval', priority:'High',
      notes:'Priority order for primate enclosure refresh.',
      shippingAddress:{
        name:'K. Iyer', site:'Bannerghatta Biological Park', line1:'Bannerghatta Main Rd', line2:'Anekal Taluk',
        city:'Bengaluru', state:'Karnataka', pincode:'560083', phone:'+91 98455 66778'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:'2026-04-23T18:00:00+05:30',
        events:[
          { status:'pending_approval', at:'2026-04-21T11:40:00+05:30', location:'Online', note:'Awaiting senior approval' }
        ]
      },
      source:'demo'
    },

    // 3 — confirmed (senior — no approval needed)
    { id:'ORD-D003', createdAt:'2026-04-20T16:05:00+05:30', createdBy:'u_farah', species:'sp_macaw', speciesId:'sp_macaw',
      siteId:'site_che', enclosureId:'enc_che_3',
      requiresApproval:false, approvalStatus:null, approverId:null, approvedAt:null, rejectReason:null,
      vendorId:'ven_biocraft',
      vendorResponse: {
        respondedAt: '2026-04-20T18:45:00+05:30',
        daysToComplete: 4,
        estimatedReadyBy: '2026-04-24T18:45:00+05:30',
        note: 'Batch-blending lavender — ready Thursday.'
      },
      items:[
        { productId:'prod_013', qty:4 }
      ],
      subtotal: 100*4, // 400
      shippingMethod:'Standard', shippingFee:80, total: 480,
      status:'confirmed', priority:'Normal', notes:'',
      shippingAddress:{
        name:'F. Karim', site:'National Zoological Park Delhi', line1:'Mathura Road', line2:'Near Purana Qila',
        city:'New Delhi', state:'Delhi', pincode:'110003', phone:'+91 9811223344'
      },
      tracking:{
        carrier:'Blue Dart', number:'BD9107334562', url:'https://www.bluedart.com/tracking?awb=BD9107334562',
        eta:'2026-04-25T18:00:00+05:30',
        events:[
          { status:'placed',    at:'2026-04-20T16:05:00+05:30', location:'Online',  note:'Order placed' },
          { status:'confirmed', at:'2026-04-20T18:45:00+05:30', location:'Chennai', note:'Seller has confirmed your order' }
        ]
      },
      source:'demo'
    },

    // 4 — packed (u_das approved by u_rao)
    { id:'ORD-D004', createdAt:'2026-04-19T10:25:00+05:30', createdBy:'u_das', species:'sp_lion', speciesId:'sp_lion',
      siteId:'site_hyd', enclosureId:'enc_hyd_1',
      requiresApproval:true, approvalStatus:'approved', approverId:'u_rao', approvedAt:'2026-04-19T11:05:00+05:30', rejectReason:null,
      vendorId:'ven_natureloop',
      vendorResponse: {
        respondedAt: '2026-04-19T12:40:00+05:30',
        daysToComplete: 3,
        estimatedReadyBy: '2026-04-22T12:40:00+05:30',
        note: 'Sacks re-scented fresh — packed with care.'
      },
      items:[
        { productId:'prod_001', qty:3 },
        { productId:'prod_008', qty:1 }
      ],
      subtotal: 120*3 + 400*1, // 760
      shippingMethod:'Standard', shippingFee:80, total: 840,
      status:'packed', priority:'Normal', notes:'Please handle the scent sacks with care.',
      shippingAddress:{
        name:'T. Das', site:'Arignar Anna Zoological Park (Vandalur)', line1:'Grand Southern Trunk Road', line2:'Vandalur',
        city:'Chennai', state:'Tamil Nadu', pincode:'600048', phone:'+91 9884455667'
      },
      tracking:{
        carrier:'DTDC', number:'DT4572019836', url:'https://www.dtdc.in/track?awb=DT4572019836',
        eta:'2026-04-24T18:00:00+05:30',
        events:[
          { status:'placed',    at:'2026-04-19T10:25:00+05:30', location:'Online',  note:'Order placed' },
          { status:'confirmed', at:'2026-04-19T12:40:00+05:30', location:'Chennai', note:'Seller has confirmed your order' },
          { status:'packed',    at:'2026-04-20T09:10:00+05:30', location:'Chennai', note:'Packed and ready to ship' }
        ]
      },
      source:'demo'
    },

    // 5 — pending approval (u_iyer needs u_rao approval)
    { id:'ORD-D005', createdAt:'2026-04-18T13:50:00+05:30', createdBy:'u_iyer', species:'sp_chimp', speciesId:'sp_chimp',
      siteId:'site_blr', enclosureId:'enc_blr_3',
      requiresApproval:true, approvalStatus:'pending', approverId:'u_rao', approvedAt:null, rejectReason:null,
      vendorId:'ven_natureloop',
      vendorResponse: null,
      items:[
        { productId:'prod_016', qty:4 },
        { productId:'prod_009', qty:2 }
      ],
      subtotal: 320*4 + 200*2, // 1680
      shippingMethod:'Express', shippingFee:200, total: 1880,
      status:'pending_approval', priority:'High', notes:'',
      shippingAddress:{
        name:'K. Iyer', site:'Bannerghatta Biological Park', line1:'Bannerghatta Main Rd', line2:'Anekal Taluk',
        city:'Bengaluru', state:'Karnataka', pincode:'560083', phone:'+91 98455 66778'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:'2026-04-20T18:00:00+05:30',
        events:[
          { status:'pending_approval', at:'2026-04-18T13:50:00+05:30', location:'Online', note:'Awaiting senior approval' }
        ]
      },
      source:'demo'
    },

    // 6 — shipped (senior — no approval needed)
    { id:'ORD-D006', createdAt:'2026-04-17T08:30:00+05:30', createdBy:'u_rao', species:'sp_tiger', speciesId:'sp_tiger',
      siteId:'site_hyd', enclosureId:'enc_hyd_1',
      requiresApproval:false, approvalStatus:null, approverId:null, approvedAt:null, rejectReason:null,
      vendorId:'ven_frostbite',
      vendorResponse: {
        respondedAt: '2026-04-17T10:05:00+05:30',
        daysToComplete: 1,
        estimatedReadyBy: '2026-04-18T10:05:00+05:30',
        note: 'Cold chain dispatch — overnight freeze held at -22°C.'
      },
      items:[
        { productId:'prod_003', qty:1, config:{ size:'XL' } },
        { productId:'prod_010', qty:1 }
      ],
      subtotal: 700*1 + 320*1, // 1020
      shippingMethod:'Standard', shippingFee:80, total: 1100,
      status:'shipped', priority:'Critical', notes:'Frozen content — maintain cold chain.',
      shippingAddress:{
        name:'Dr. M. Rao', site:'Bannerghatta Biological Park', line1:'Bannerghatta Main Road', line2:'Anekal Taluk',
        city:'Bangalore', state:'Karnataka', pincode:'560083', phone:'+91 9880011223'
      },
      tracking:{
        carrier:'Blue Dart', number:'BD2385901147', url:'https://www.bluedart.com/tracking?awb=BD2385901147',
        eta:'2026-04-22T18:00:00+05:30',
        events:[
          { status:'placed',    at:'2026-04-17T08:30:00+05:30', location:'Online',     note:'Order placed' },
          { status:'confirmed', at:'2026-04-17T10:05:00+05:30', location:'Hyderabad',  note:'Seller has confirmed your order' },
          { status:'packed',    at:'2026-04-17T17:30:00+05:30', location:'Hyderabad',  note:'Packed and ready to ship' },
          { status:'shipped',   at:'2026-04-18T09:20:00+05:30', location:'Hyderabad',  note:'Picked up by Blue Dart' }
        ]
      },
      source:'demo'
    },

    // 7 — shipped (senior — no approval needed)
    { id:'ORD-D007', createdAt:'2026-04-15T12:15:00+05:30', createdBy:'u_farah', species:'sp_pengu', speciesId:'sp_pengu',
      siteId:'site_viz', enclosureId:'enc_viz_4',
      requiresApproval:false, approvalStatus:null, approverId:null, approvedAt:null, rejectReason:null,
      vendorId:'ven_frostbite',
      vendorResponse: {
        respondedAt: '2026-04-15T14:40:00+05:30',
        daysToComplete: 1,
        estimatedReadyBy: '2026-04-16T14:40:00+05:30',
        note: 'Frozen same day — dispatched via express cold-chain.'
      },
      items:[
        { productId:'prod_010', qty:3 }
      ],
      subtotal: 320*3, // 960
      shippingMethod:'Express', shippingFee:200, total: 1160,
      status:'shipped', priority:'High', notes:'',
      shippingAddress:{
        name:'F. Karim', site:'Indira Gandhi Zoological Park', line1:'Kambalakonda Reserve Forest', line2:'Visakhapatnam',
        city:'Visakhapatnam', state:'Andhra Pradesh', pincode:'530040', phone:'+91 9849223344'
      },
      tracking:{
        carrier:'Delhivery', number:'DLV6612003872', url:'https://www.delhivery.com/track/package/DLV6612003872',
        eta:'2026-04-17T18:00:00+05:30',
        events:[
          { status:'placed',    at:'2026-04-15T12:15:00+05:30', location:'Online',  note:'Order placed' },
          { status:'confirmed', at:'2026-04-15T14:40:00+05:30', location:'Chennai', note:'Seller has confirmed your order' },
          { status:'packed',    at:'2026-04-16T09:50:00+05:30', location:'Chennai', note:'Packed and ready to ship' },
          { status:'shipped',   at:'2026-04-16T18:10:00+05:30', location:'Chennai', note:'Picked up by Delhivery' }
        ]
      },
      source:'demo'
    },

    // 8 — out_for_delivery (u_iyer approved by u_rao)
    { id:'ORD-D008', createdAt:'2026-04-14T15:00:00+05:30', createdBy:'u_iyer', species:'sp_gibbon', speciesId:'sp_gibbon',
      siteId:'site_blr', enclosureId:'enc_blr_3',
      requiresApproval:true, approvalStatus:'approved', approverId:'u_rao', approvedAt:'2026-04-14T16:10:00+05:30', rejectReason:null,
      vendorId:'ven_biocraft',
      vendorResponse: {
        respondedAt: '2026-04-14T17:25:00+05:30',
        daysToComplete: 2,
        estimatedReadyBy: '2026-04-16T17:25:00+05:30',
        note: 'Bamboo stock available — will ship Wednesday.'
      },
      items:[
        { productId:'prod_018', qty:2 }
      ],
      subtotal: 540*2, // 1080
      shippingMethod:'Standard', shippingFee:80, total: 1160,
      status:'out_for_delivery', priority:'Normal', notes:'',
      shippingAddress:{
        name:'K. Iyer', site:'Sakkarbaug Zoological Garden', line1:'Junagadh-Rajkot Highway', line2:'Near Sakkarbaug',
        city:'Junagadh', state:'Gujarat', pincode:'362001', phone:'+91 9825567788'
      },
      tracking:{
        carrier:'DTDC', number:'DT8814602219', url:'https://www.dtdc.in/track?awb=DT8814602219',
        eta:'2026-04-19T18:00:00+05:30',
        events:[
          { status:'placed',           at:'2026-04-14T15:00:00+05:30', location:'Online',    note:'Order placed' },
          { status:'confirmed',        at:'2026-04-14T17:25:00+05:30', location:'Ahmedabad', note:'Seller has confirmed your order' },
          { status:'packed',           at:'2026-04-15T10:00:00+05:30', location:'Ahmedabad', note:'Packed and ready to ship' },
          { status:'shipped',          at:'2026-04-15T19:30:00+05:30', location:'Ahmedabad', note:'Picked up by DTDC' },
          { status:'out_for_delivery', at:'2026-04-19T08:45:00+05:30', location:'Junagadh Hub', note:'Out for delivery' }
        ]
      },
      source:'demo'
    },

    // 9 — out_for_delivery (senior — no approval needed)
    { id:'ORD-D009', createdAt:'2026-04-12T09:20:00+05:30', createdBy:'u_rao', species:'sp_eleph', speciesId:'sp_eleph',
      siteId:'site_hyd', enclosureId:'enc_hyd_3',
      requiresApproval:false, approvalStatus:null, approverId:null, approvedAt:null, rejectReason:null,
      vendorId:'ven_natureloop',
      vendorResponse: {
        respondedAt: '2026-04-12T11:05:00+05:30',
        daysToComplete: 5,
        estimatedReadyBy: '2026-04-17T11:05:00+05:30',
        note: 'Consolidated shipment — fresh herbs harvested before dispatch.'
      },
      items:[
        { productId:'prod_008', qty:1 },
        { productId:'prod_009', qty:2 },
        { productId:'prod_016', qty:1 }
      ],
      subtotal: 400*1 + 200*2 + 320*1, // 1120
      shippingMethod:'Standard', shippingFee:80, total: 1200,
      status:'out_for_delivery', priority:'Normal', notes:'Consolidate into single shipment if possible.',
      shippingAddress:{
        name:'Dr. M. Rao', site:'Patna Zoo (Sanjay Gandhi Jaivik Udyan)', line1:'Bailey Road', line2:'Near Raj Bhavan',
        city:'Patna', state:'Bihar', pincode:'800014', phone:'+91 9835112244'
      },
      tracking:{
        carrier:'India Post', number:'IP5590221803', url:'https://www.indiapost.gov.in/track?id=IP5590221803',
        eta:'2026-04-17T18:00:00+05:30',
        events:[
          { status:'placed',           at:'2026-04-12T09:20:00+05:30', location:'Online',    note:'Order placed' },
          { status:'confirmed',        at:'2026-04-12T11:05:00+05:30', location:'Kolkata',   note:'Seller has confirmed your order' },
          { status:'packed',           at:'2026-04-13T08:30:00+05:30', location:'Kolkata',   note:'Packed and ready to ship' },
          { status:'shipped',          at:'2026-04-13T16:45:00+05:30', location:'Kolkata',   note:'Picked up by India Post' },
          { status:'out_for_delivery', at:'2026-04-21T07:50:00+05:30', location:'Patna Hub', note:'Out for delivery' }
        ]
      },
      source:'demo'
    },

    // 10 — delivered (u_das approved by u_rao)
    { id:'ORD-D010', createdAt:'2026-04-09T10:40:00+05:30', createdBy:'u_das', species:'sp_bear', speciesId:'sp_bear',
      siteId:'site_hyd', enclosureId:'enc_hyd_2',
      requiresApproval:true, approvalStatus:'approved', approverId:'u_rao', approvedAt:'2026-04-09T11:55:00+05:30', rejectReason:null,
      vendorId:'ven_zooworks',
      vendorResponse: {
        respondedAt: '2026-04-09T13:15:00+05:30',
        daysToComplete: 2,
        estimatedReadyBy: '2026-04-11T13:15:00+05:30',
        note: 'Rig pre-assembled and load-tested to 250 kg before dispatch.'
      },
      items:[
        { productId:'prod_004', qty:1 }
      ],
      subtotal: 1800*1, // 1800
      shippingMethod:'Express', shippingFee:200, total: 2000,
      status:'delivered', priority:'High', notes:'Installation team required on-site.',
      shippingAddress:{
        name:'T. Das', site:'Kanpur Zoological Park', line1:'Azad Nagar', line2:'Allen Forest',
        city:'Kanpur', state:'Uttar Pradesh', pincode:'208002', phone:'+91 9415667788'
      },
      tracking:{
        carrier:'Blue Dart', number:'BD7730944182', url:'https://www.bluedart.com/tracking?awb=BD7730944182',
        eta:'2026-04-11T18:00:00+05:30',
        events:[
          { status:'placed',           at:'2026-04-09T10:40:00+05:30', location:'Online',      note:'Order placed' },
          { status:'confirmed',        at:'2026-04-09T13:15:00+05:30', location:'Delhi',       note:'Seller has confirmed your order' },
          { status:'packed',           at:'2026-04-09T18:20:00+05:30', location:'Delhi',       note:'Packed and ready to ship' },
          { status:'shipped',          at:'2026-04-10T07:55:00+05:30', location:'Delhi',       note:'Picked up by Blue Dart' },
          { status:'out_for_delivery', at:'2026-04-11T08:30:00+05:30', location:'Kanpur Hub',  note:'Out for delivery' },
          { status:'delivered',        at:'2026-04-11T15:25:00+05:30', location:'Kanpur',      note:'Delivered to facility' }
        ]
      },
      source:'demo'
    },

    // 11 — delivered (senior — no approval needed)
    { id:'ORD-D011', createdAt:'2026-04-07T14:10:00+05:30', createdBy:'u_farah', species:'sp_macaw', speciesId:'sp_macaw',
      siteId:'site_gwt', enclosureId:'enc_gwt_4',
      requiresApproval:false, approvalStatus:null, approverId:null, approvedAt:null, rejectReason:null,
      vendorId:'ven_biocraft',
      vendorResponse: {
        respondedAt: '2026-04-07T16:35:00+05:30',
        daysToComplete: 3,
        estimatedReadyBy: '2026-04-10T16:35:00+05:30',
        note: 'Bench-tested sound unit before packing.'
      },
      items:[
        { productId:'prod_015', qty:1 },
        { productId:'prod_018', qty:2 }
      ],
      subtotal: 760*1 + 540*2, // 1840
      shippingMethod:'Standard', shippingFee:80, total: 1920,
      status:'delivered', priority:'Normal', notes:'',
      shippingAddress:{
        name:'F. Karim', site:'Assam State Zoo cum Botanical Garden', line1:'RG Baruah Road', line2:'Hengrabari',
        city:'Guwahati', state:'Assam', pincode:'781005', phone:'+91 9435778899'
      },
      tracking:{
        carrier:'Xpressbees', number:'XP3348071260', url:'https://www.xpressbees.com/track/XP3348071260',
        eta:'2026-04-12T18:00:00+05:30',
        events:[
          { status:'placed',           at:'2026-04-07T14:10:00+05:30', location:'Online',       note:'Order placed' },
          { status:'confirmed',        at:'2026-04-07T16:35:00+05:30', location:'Chennai',      note:'Seller has confirmed your order' },
          { status:'packed',           at:'2026-04-08T10:20:00+05:30', location:'Chennai',      note:'Packed and ready to ship' },
          { status:'shipped',          at:'2026-04-08T19:10:00+05:30', location:'Chennai',      note:'Picked up by Xpressbees' },
          { status:'out_for_delivery', at:'2026-04-12T08:15:00+05:30', location:'Guwahati Hub', note:'Out for delivery' },
          { status:'delivered',        at:'2026-04-12T14:50:00+05:30', location:'Guwahati',     note:'Delivered to facility' }
        ]
      },
      source:'demo'
    },

    // 12 — cancelled (u_iyer rejected by u_rao — budget exceeded)
    { id:'ORD-D012', createdAt:'2026-04-05T11:05:00+05:30', createdBy:'u_iyer', species:'sp_gorilla', speciesId:'sp_gorilla',
      siteId:'site_blr', enclosureId:'enc_blr_3',
      requiresApproval:true, approvalStatus:'rejected', approverId:'u_rao', approvedAt:null, rejectReason:'Budget exceeded for Q1',
      vendorId:'ven_acme',
      vendorResponse: null,
      items:[
        { productId:'prod_017', qty:1 },
        { productId:'prod_011', qty:2 }
      ],
      subtotal: 150*1 + 240*2, // 630
      shippingMethod:'Standard', shippingFee:80, total: 710,
      status:'cancelled', priority:'Normal', notes:'Approval rejected — Budget exceeded for Q1.',
      shippingAddress:{
        name:'K. Iyer', site:'Bannerghatta Biological Park', line1:'Bannerghatta Main Rd', line2:'Anekal Taluk',
        city:'Bengaluru', state:'Karnataka', pincode:'560083', phone:'+91 98455 66778'
      },
      tracking:{
        carrier:null, number:null, url:null,
        eta:'2026-04-10T18:00:00+05:30',
        events:[
          { status:'pending_approval', at:'2026-04-05T11:05:00+05:30', location:'Online', note:'Awaiting senior approval' },
          { status:'cancelled',        at:'2026-04-05T16:40:00+05:30', location:'Online', note:'Approval rejected: Budget exceeded for Q1' }
        ]
      },
      source:'demo'
    }
  ];

  /* -------- Screens registry (for nav/index) -------- */
  const SCREENS = [
    { id:'catalog',           href:'catalog_1.html',            name:'Catalog',                    group:'Shop',    icon:'store',         roles:['keeper','biologist'] },
    { id:'product_detail',    href:'product_detail_1.html',     name:'Product Detail',             group:'Shop',    icon:'package',       roles:['keeper','biologist'] },
    { id:'cart',              href:'cart_1.html',               name:'Cart & Submit',              group:'Shop',    icon:'shopping-cart', roles:['keeper','biologist'] },
    { id:'my_tickets',        href:'my_tickets_1.html',         name:'My Tickets',                 group:'Shop',    icon:'ticket',        roles:['keeper','biologist'] },
    { id:'lab_inbox',         href:'lab_inbox_1.html',          name:'Lab Inbox',                  group:'Lab',     icon:'inbox',         roles:['lab_manager','lab_tech'] },
    { id:'lab_ticket',        href:'lab_ticket_1.html',         name:'Lab Ticket',                 group:'Lab',     icon:'clipboard-list',roles:['lab_manager','lab_tech'] },
    { id:'add_product',       href:'add_product_1.html',        name:'Add Product',                group:'Catalog', icon:'plus-square',   roles:['contributor','curator'] },
    { id:'approval_queue',    href:'approval_queue_1.html',     name:'Approval Queue',             group:'Catalog', icon:'shield-check',  roles:['curator','vet'] },
    { id:'category_manager',  href:'category_manager_1.html',   name:'Categories',                 group:'Catalog', icon:'folder-tree',   roles:['admin'] },
    { id:'attribute_library', href:'attribute_library_1.html',  name:'Attributes',                 group:'Catalog', icon:'tags',          roles:['admin'] },
    { id:'dashboard_mgmt',    href:'dashboard_mgmt_1.html',     name:'Management Dashboard',       group:'Insights',icon:'bar-chart-3',   roles:['admin','curator'] },
    { id:'dashboard_bio',     href:'dashboard_biologist_1.html',name:'Biologist Dashboard',        group:'Insights',icon:'user-square',   roles:['biologist','keeper'] },
    { id:'dashboard_lab',     href:'dashboard_lab_1.html',      name:'Lab Dashboard',              group:'Insights',icon:'factory',       roles:['lab_manager','admin'] },
    { id:'reports',           href:'reports_1.html',            name:'Reports & AI',               group:'Insights',icon:'sparkles',      roles:['admin','curator','biologist'] },
    { id:'users_roles',       href:'users_roles_1.html',        name:'Users & Roles',              group:'Admin',   icon:'users',         roles:['admin'] }
  ];

  /* -------- Helpers -------- */
  const byId = (arr, id) => arr.find(x => x.id === id);
  const fmtINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const orderTotal = (o) => (o.subtotal || 0) + (o.shippingFee || 0);
  const orderItemCount = (o) => (o.items || []).reduce((s, it) => s + (it.qty || 0), 0);

  /* Vendor helpers */
  const vendorLogo  = (v) => v ? img(v.logoQ,  120, 120, v.seed)      : '';
  const vendorCover = (v) => v ? img(v.coverQ, 1200, 500, v.coverSeed) : '';

  /* Review helpers */
  const reviewsForProduct = (pid) =>
    REVIEWS
      .filter(r => r.productId === pid)
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const productRating = (pid) => {
    const rs = REVIEWS.filter(r => r.productId === pid);
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((s, r) => s + (r.stars || 0), 0);
    return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
  };

  /* Site & enclosure helpers */
  const enclosuresForSite = (siteId) =>
    ENCLOSURES.filter(e => e.siteId === siteId);

  const enclosuresForSpecies = (speciesId) =>
    ENCLOSURES.filter(e => Array.isArray(e.speciesIds) && e.speciesIds.includes(speciesId));

  const enclosuresForSiteAndSpecies = (siteId, speciesId) =>
    ENCLOSURES.filter(e =>
      e.siteId === siteId &&
      Array.isArray(e.speciesIds) &&
      e.speciesIds.includes(speciesId)
    );

  /* Approval helpers */
  const subordinatesOf = (userId) =>
    USERS.filter(u => u.approverId === userId);

  const isApprover = (userId) =>
    USERS.some(u => u.approverId === userId);

  /* Build a dynamic filter bank from a given set of products.
     Returns [{attr, valuesInSet}] where valuesInSet is the array of
     distinct values observed across those products for that attribute.
     Only attributes that at least one product in the set uses are returned. */
  const filterBankForProducts = (products) => {
    const bank = [];
    ATTRIBUTES.forEach(attr => {
      const values = new Set();
      (products || []).forEach(p => {
        if (!p || !p.specs) return;
        const v = p.specs[attr.id];
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) {
          v.forEach(x => values.add(x));
        } else {
          values.add(v);
        }
      });
      if (values.size > 0) {
        bank.push({ attr, valuesInSet: Array.from(values) });
      }
    });
    return bank;
  };

  window.DB = { SPECIES, TAGS, CATEGORIES, ATTRIBUTES, categoryAttributeSchema, USERS, VENDORS, PRODUCTS, REVIEWS, PENDING, DEMO_ORDERS, CARRIERS, SCREENS, SITES, ENCLOSURES, SITE_BUDGETS, FY_LABEL, FY_START, FY_END, byId, fmtINR, orderTotal, orderItemCount, img, galleryFor, filterBankForProducts, vendorLogo, vendorCover, reviewsForProduct, productRating, enclosuresForSite, enclosuresForSpecies, enclosuresForSiteAndSpecies, subordinatesOf, isApprover };
})();
