require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CLOTHING_ITEMS = [
  {
    title: "Vintage Levi's 501 Jeans",
    description: "Classic 1990s Levi's 501 straight leg jeans in medium indigo wash. Button fly, five-pocket styling. Some natural fading at thighs and seat - adds character. Great vintage condition with plenty of life left.",
    brand: "Levi's",
    category: "bottoms",
    size: "32x32",
    color: "indigo",
    material: "100% cotton denim",
    condition: "good",
    estimatedPrice: 45.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Vintage Levi's 501 Jeans", confidence_score: 0.95, reasoning: "Recognizable red tab and button fly" },
      brand: { value: "Levi's", confidence_score: 0.98, reasoning: "Red tab and leather patch visible" },
      category: { value: "bottoms", confidence_score: 0.99, reasoning: "Clear jeans silhouette" },
      color: { value: "indigo", confidence_score: 0.92, reasoning: "Medium blue wash typical of 501s" },
      material: { value: "100% cotton denim", confidence_score: 0.90, reasoning: "Classic denim texture" },
      condition: { value: "good", confidence_score: 0.85, reasoning: "Natural fading, no holes or repairs" },
      estimatedPrice: { value: 45, confidence_score: 0.80, reasoning: "Vintage 501s sell $40-60" },
      tags: { value: ["vintage", "levis", "501", "denim", "jeans"], confidence_score: 0.90, reasoning: "Standard search terms" },
      description: { value: "Classic 1990s Levi's 501 straight leg jeans in medium indigo wash. Button fly, five-pocket styling. Some natural fading at thighs and seat - adds character. Great vintage condition with plenty of life left.", confidence_score: 0.88, reasoning: "Generated from visual details" }
    },
    tags: ["vintage", "levis", "501", "denim", "jeans"],
    images: [
      { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", fileName: "levis-501-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1475180021983-82f523d2e5c8?w=800", fileName: "levis-501-2.jpg", isPrimary: false },
      { url: "https://images.unsplash.com/photo-1584370848034-44d9c5a2b2eb?w=800", fileName: "levis-501-3.jpg", isPrimary: false }
    ]
  },
  {
    title: "Patagonia Better Sweater Fleece Jacket",
    description: "Patagonia Better Sweater 1/4-zip fleece in navy blue. Polartec fleece interior, sweater-knit exterior. Fair Trade Certified sewn. Great for layering or standalone wear. Minor pilling at cuffs - normal for this fabric.",
    brand: "Patagonia",
    category: "outerwear",
    size: "M",
    color: "navy",
    material: "100% polyester fleece",
    condition: "good",
    estimatedPrice: 65.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Patagonia Better Sweater Fleece Jacket", confidence_score: 0.96, reasoning: "Distinctive 1/4 zip and logo" },
      brand: { value: "Patagonia", confidence_score: 0.99, reasoning: "Logo on chest and tag visible" },
      category: { value: "outerwear", confidence_score: 0.97, reasoning: "Fleece jacket silhouette" },
      color: { value: "navy", confidence_score: 0.95, reasoning: "Dark blue color" },
      material: { value: "100% polyester fleece", confidence_score: 0.93, reasoning: "Sweater-knit texture visible" },
      condition: { value: "good", confidence_score: 0.88, reasoning: "Minor pilling at cuffs only" },
      estimatedPrice: { value: 65, confidence_score: 0.85, reasoning: "Used Better Sweaters sell $55-80" },
      tags: { value: ["patagonia", "fleece", "better sweater", "outdoor", "quarter zip"], confidence_score: 0.92, reasoning: "Popular search terms" },
      description: { value: "Patagonia Better Sweater 1/4-zip fleece in navy blue. Polartec fleece interior, sweater-knit exterior. Fair Trade Certified sewn. Great for layering or standalone wear. Minor pilling at cuffs - normal for this fabric.", confidence_score: 0.90, reasoning: "Generated from visual details" }
    },
    tags: ["patagonia", "fleece", "better sweater", "outdoor", "quarter zip"],
    images: [
      { url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800", fileName: "patagonia-fleece-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800", fileName: "patagonia-fleece-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Ralph Lauren Oxford Button-Down Shirt",
    description: "Classic Ralph Lauren oxford cloth button-down in white. Iconic pony embroidery on chest. Boxy traditional fit. Button-down collar rolls perfectly. Slight yellowing at collar interior - barely noticeable when worn.",
    brand: "Ralph Lauren",
    category: "tops",
    size: "M",
    color: "white",
    material: "100% cotton oxford cloth",
    condition: "like_new",
    estimatedPrice: 38.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Ralph Lauren Oxford Button-Down Shirt", confidence_score: 0.94, reasoning: "Pony logo and oxford texture" },
      brand: { value: "Ralph Lauren", confidence_score: 0.97, reasoning: "Embroidered pony on chest" },
      category: { value: "tops", confidence_score: 0.98, reasoning: "Button-down shirt silhouette" },
      color: { value: "white", confidence_score: 0.99, reasoning: "Clean white fabric" },
      material: { value: "100% cotton oxford cloth", confidence_score: 0.91, reasoning: "Distinctive basket weave texture" },
      condition: { value: "like_new", confidence_score: 0.90, reasoning: "Minimal wear, slight collar yellowing only" },
      estimatedPrice: { value: 38, confidence_score: 0.82, reasoning: "RL oxfords sell $30-50 used" },
      tags: { value: ["ralph lauren", "oxford", "button down", "classic", "preppy"], confidence_score: 0.88, reasoning: "Style-specific keywords" },
      description: { value: "Classic Ralph Lauren oxford cloth button-down in white. Iconic pony embroidery on chest. Boxy traditional fit. Button-down collar rolls perfectly. Slight yellowing at collar interior - barely noticeable when worn.", confidence_score: 0.88, reasoning: "Generated from visual details" }
    },
    tags: ["ralph lauren", "oxford", "button down", "classic", "preppy"],
    images: [
      { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", fileName: "rl-oxford-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", fileName: "rl-oxford-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Nike Air Force 1 Low '07",
    description: "Nike Air Force 1 Low '07 in white/white. Leather upper with perforated toe box. Air-Sole unit for cushioning. Classic silhouette. Light creasing at toe box - normal wear. Includes original box.",
    brand: "Nike",
    category: "shoes",
    size: "10",
    color: "white",
    material: "leather",
    condition: "good",
    estimatedPrice: 55.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Nike Air Force 1 Low '07", confidence_score: 0.97, reasoning: "Iconic AF1 silhouette with swoosh" },
      brand: { value: "Nike", confidence_score: 0.99, reasoning: "Swoosh and branding visible" },
      category: { value: "shoes", confidence_score: 0.99, reasoning: "Clear sneaker profile" },
      color: { value: "white", confidence_score: 0.98, reasoning: "All-white colorway" },
      material: { value: "leather", confidence_score: 0.93, reasoning: "Leather texture and creasing" },
      condition: { value: "good", confidence_score: 0.87, reasoning: "Light toe creasing, clean otherwise" },
      estimatedPrice: { value: 55, confidence_score: 0.85, reasoning: "Used white AF1s $45-70" },
      tags: { value: ["nike", "air force 1", "af1", "sneakers", "white"], confidence_score: 0.94, reasoning: "High-volume search terms" },
      description: { value: "Nike Air Force 1 Low '07 in white/white. Leather upper with perforated toe box. Air-Sole unit for cushioning. Classic silhouette. Light creasing at toe box - normal wear. Includes original box.", confidence_score: 0.90, reasoning: "Generated from visual details" }
    },
    tags: ["nike", "air force 1", "af1", "sneakers", "white"],
    images: [
      { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800", fileName: "nike-af1-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800", fileName: "nike-af1-2.jpg", isPrimary: false },
      { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800", fileName: "nike-af1-3.jpg", isPrimary: false }
    ]
  },
  {
    title: "Carhartt Detroit Jacket",
    description: "Carhartt Detroit Jacket in Carhartt Brown (DNY). 12oz cotton duck canvas, blanket-lined body, quilted-nylon lined sleeves. Brass zipper with storm flap. Four exterior pockets, two interior. Some fading and softening - adds character. Classic workwear style.",
    brand: "Carhartt",
    category: "outerwear",
    size: "L",
    color: "brown",
    material: "100% cotton duck canvas",
    condition: "good",
    estimatedPrice: 110.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Carhartt Detroit Jacket", confidence_score: 0.95, reasoning: "Distinctive collar and pocket layout" },
      brand: { value: "Carhartt", confidence_score: 0.98, reasoning: "Carhartt label and logo visible" },
      category: { value: "outerwear", confidence_score: 0.96, reasoning: "Work jacket silhouette" },
      color: { value: "brown", confidence_score: 0.94, reasoning: "Signature Carhartt brown" },
      material: { value: "100% cotton duck canvas", confidence_score: 0.92, reasoning: "Heavy canvas texture visible" },
      condition: { value: "good", confidence_score: 0.85, reasoning: "Natural fading, broken in nicely" },
      estimatedPrice: { value: 110, confidence_score: 0.80, reasoning: "Vintage Detroit jackets $90-150" },
      tags: { value: ["carhartt", "detroit jacket", "workwear", "canvas", "vintage"], confidence_score: 0.90, reasoning: "Workwear collector terms" },
      description: { value: "Carhartt Detroit Jacket in Carhartt Brown (DNY). 12oz cotton duck canvas, blanket-lined body, quilted-nylon lined sleeves. Brass zipper with storm flap. Four exterior pockets, two interior. Some fading and softening - adds character. Classic workwear style.", confidence_score: 0.88, reasoning: "Generated from visual details" }
    },
    tags: ["carhartt", "detroit jacket", "workwear", "canvas", "vintage"],
    images: [
      { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", fileName: "carhartt-detroit-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800", fileName: "carhartt-detroit-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "L.L.Bean Boat and Tote Bag",
    description: "L.L.Bean Boat and Tote, open top, in navy with natural canvas contrast. Heavy 24oz cotton canvas, reinforced bottom. Webbing handles. Monogrammed 'J.S.' on side. Excellent condition - canvas still stiff. Made in USA.",
    brand: "L.L.Bean",
    category: "accessories",
    size: "Large",
    color: "navy",
    material: "24oz cotton canvas",
    condition: "like_new",
    estimatedPrice: 42.00,
    aiIdentified: true,
    aiData: {
      title: { value: "L.L.Bean Boat and Tote Bag", confidence_score: 0.96, reasoning: "Distinctive shape and contrast handles" },
      brand: { value: "L.L.Bean", confidence_score: 0.98, reasoning: "Logo tag visible" },
      category: { value: "accessories", confidence_score: 0.95, reasoning: "Tote bag silhouette" },
      color: { value: "navy", confidence_score: 0.97, reasoning: "Navy body with natural contrast" },
      material: { value: "24oz cotton canvas", confidence_score: 0.93, reasoning: "Heavy canvas texture" },
      condition: { value: "like_new", confidence_score: 0.94, reasoning: "Canvas still stiff, no wear" },
      estimatedPrice: { value: 42, confidence_score: 0.85, reasoning: "Monogrammed totes $35-55" },
      tags: { value: ["ll bean", "boat and tote", "canvas", "tote bag", "made in usa"], confidence_score: 0.91, reasoning: "Brand and style specific" },
      description: { value: "L.L.Bean Boat and Tote, open top, in navy with natural canvas contrast. Heavy 24oz cotton canvas, reinforced bottom. Webbing handles. Monogrammed 'J.S.' on side. Excellent condition - canvas still stiff. Made in USA.", confidence_score: 0.90, reasoning: "Generated from visual details" }
    },
    tags: ["ll bean", "boat and tote", "canvas", "tote bag", "made in usa"],
    images: [
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", fileName: "llbean-tote-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1590874103328-ec191a5b3c3a?w=800", fileName: "llbean-tote-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Filson Mackinaw Cruiser Jacket",
    description: "Filson Mackinaw Cruiser in Forest Green. 100% virgin Mackinaw wool, 24oz. Four front flap pockets, two handwarmer pockets. Brass snap closures. Made in USA. Some natural pilling - characteristic of wool. Warm, wind-resistant, built to last generations.",
    brand: "Filson",
    category: "outerwear",
    size: "M",
    color: "forest green",
    material: "100% virgin Mackinaw wool",
    condition: "good",
    estimatedPrice: 185.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Filson Mackinaw Cruiser Jacket", confidence_score: 0.94, reasoning: "Distinctive pocket layout and wool texture" },
      brand: { value: "Filson", confidence_score: 0.97, reasoning: "Filson label visible" },
      category: { value: "outerwear", confidence_score: 0.95, reasoning: "Cruiser jacket silhouette" },
      color: { value: "forest green", confidence_score: 0.93, reasoning: "Signature Filson green" },
      material: { value: "100% virgin Mackinaw wool", confidence_score: 0.94, reasoning: "Thick wool texture visible" },
      condition: { value: "good", confidence_score: 0.88, reasoning: "Natural pilling, no damage" },
      estimatedPrice: { value: 185, confidence_score: 0.82, reasoning: "Used Filson cruisers $160-220" },
      tags: { value: ["filson", "mackinaw", "cruiser", "wool", "made in usa"], confidence_score: 0.90, reasoning: "Heritage brand keywords" },
      description: { value: "Filson Mackinaw Cruiser in Forest Green. 100% virgin Mackinaw wool, 24oz. Four front flap pockets, two handwarmer pockets. Brass snap closures. Made in USA. Some natural pilling - characteristic of wool. Warm, wind-resistant, built to last generations.", confidence_score: 0.88, reasoning: "Generated from visual details" }
    },
    tags: ["filson", "mackinaw", "cruiser", "wool", "made in usa"],
    images: [
      { url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800", fileName: "filson-cruiser-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800", fileName: "filson-cruiser-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Uniqlo Supima Cotton Crew Neck T-Shirt",
    description: "Uniqlo Supima Cotton short-sleeve crew neck in black. Extra-long staple Supima cotton - softer and more durable than regular cotton. Relaxed fit. Minimal branding. Great basics staple. Like new - only worn a few times.",
    brand: "Uniqlo",
    category: "tops",
    size: "L",
    color: "black",
    material: "100% Supima cotton",
    condition: "like_new",
    estimatedPrice: 12.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Uniqlo Supima Cotton Crew Neck T-Shirt", confidence_score: 0.92, reasoning: "Simple crew neck, minimal branding" },
      brand: { value: "Uniqlo", confidence_score: 0.95, reasoning: "Uniqlo tag visible" },
      category: { value: "tops", confidence_score: 0.99, reasoning: "Basic t-shirt silhouette" },
      color: { value: "black", confidence_score: 0.99, reasoning: "Solid black fabric" },
      material: { value: "100% Supima cotton", confidence_score: 0.88, reasoning: "Smooth cotton texture" },
      condition: { value: "like_new", confidence_score: 0.93, reasoning: "Nearly new condition" },
      estimatedPrice: { value: 12, confidence_score: 0.75, reasoning: "Basic tees low resale value" },
      tags: { value: ["uniqlo", "supima", "cotton", "basic", "t-shirt"], confidence_score: 0.85, reasoning: "Basic staple keywords" },
      description: { value: "Uniqlo Supima Cotton short-sleeve crew neck in black. Extra-long staple Supima cotton - softer and more durable than regular cotton. Relaxed fit. Minimal branding. Great basics staple. Like new - only worn a few times.", confidence_score: 0.85, reasoning: "Generated from visual details" }
    },
    tags: ["uniqlo", "supima", "cotton", "basic", "t-shirt"],
    images: [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", fileName: "uniqlo-tee-1.jpg", isPrimary: true }
    ]
  },
  {
    title: "Arc'teryx Beta AR Jacket",
    description: "Arc'teryx Beta AR Jacket in Phenom (dark grey). Gore-Tex Pro 3-layer, helmet-compatible StormHood, WaterTight zippers. Articulated patterning for climbing. Incredible condition - barely used. Includes stuff sack. Retails $550+.",
    brand: "Arc'teryx",
    category: "outerwear",
    size: "M",
    color: "dark grey",
    material: "Gore-Tex Pro 3-layer",
    condition: "like_new",
    estimatedPrice: 320.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Arc'teryx Beta AR Jacket", confidence_score: 0.96, reasoning: "Distinctive StormHood and Bird logo" },
      brand: { value: "Arc'teryx", confidence_score: 0.99, reasoning: "Arc'teryx logo on chest and hem" },
      category: { value: "outerwear", confidence_score: 0.98, reasoning: "Technical shell jacket" },
      color: { value: "dark grey", confidence_score: 0.95, reasoning: "Phenom colorway" },
      material: { value: "Gore-Tex Pro 3-layer", confidence_score: 0.94, reasoning: "Technical fabric sheen" },
      condition: { value: "like_new", confidence_score: 0.96, reasoning: "Pristine condition" },
      estimatedPrice: { value: 320, confidence_score: 0.85, reasoning: "Used Beta AR $280-380" },
      tags: { value: ["arcteryx", "beta ar", "gore-tex", "technical", "climbing"], confidence_score: 0.93, reasoning: "Technical outdoor keywords" },
      description: { value: "Arc'teryx Beta AR Jacket in Phenom (dark grey). Gore-Tex Pro 3-layer, helmet-compatible StormHood, WaterTight zippers. Articulated patterning for climbing. Incredible condition - barely used. Includes stuff sack. Retails $550+.", confidence_score: 0.92, reasoning: "Generated from visual details" }
    },
    tags: ["arcteryx", "beta ar", "gore-tex", "technical", "climbing"],
    images: [
      { url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800", fileName: "arcteryx-beta-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", fileName: "arcteryx-beta-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Dr. Martens 1460 Pascal Boots",
    description: "Dr. Martens 1460 Pascal 8-eye boots in black smooth leather. AirWair cushioned sole, yellow welt stitching, heel loop. Break-in period mostly done - leather softened nicely. Classic docs silhouette. Some scuffs on toe - adds character.",
    brand: "Dr. Martens",
    category: "shoes",
    size: "9",
    color: "black",
    material: "smooth leather",
    condition: "good",
    estimatedPrice: 75.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Dr. Martens 1460 Pascal Boots", confidence_score: 0.97, reasoning: "Iconic 8-eye silhouette with yellow stitching" },
      brand: { value: "Dr. Martens", confidence_score: 0.99, reasoning: "AirWair heel loop and branding" },
      category: { value: "shoes", confidence_score: 0.99, reasoning: "Clear boot profile" },
      color: { value: "black", confidence_score: 0.98, reasoning: "Black smooth leather" },
      material: { value: "smooth leather", confidence_score: 0.94, reasoning: "Leather texture and creasing" },
      condition: { value: "good", confidence_score: 0.88, reasoning: "Broken in, minor scuffs" },
      estimatedPrice: { value: 75, confidence_score: 0.83, reasoning: "Used 1460s $60-95" },
      tags: { value: ["dr martens", "1460", "pascal", "boots", "docs"], confidence_score: 0.93, reasoning: "Iconic model keywords" },
      description: { value: "Dr. Martens 1460 Pascal 8-eye boots in black smooth leather. AirWair cushioned sole, yellow welt stitching, heel loop. Break-in period mostly done - leather softened nicely. Classic docs silhouette. Some scuffs on toe - adds character.", confidence_score: 0.90, reasoning: "Generated from visual details" }
    },
    tags: ["dr martens", "1460", "pascal", "boots", "docs"],
    images: [
      { url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800", fileName: "drmartens-1460-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1520639888713-3b6d3f1a8b2c?w=800", fileName: "drmartens-1460-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Brooks Brothers Golden Fleece Suit",
    description: "Brooks Brothers Golden Fleece worsted wool suit in navy pinstripe. 100% Super 120s merino wool. Natural shoulder, full canvas construction. Two-button, notch lapel, flap pockets. Pants unhemmed. Impeccable condition - dry cleaned once. Investment piece.",
    brand: "Brooks Brothers",
    category: "outerwear",
    size: "40R",
    color: "navy",
    material: "100% Super 120s merino wool",
    condition: "like_new",
    estimatedPrice: 285.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Brooks Brothers Golden Fleece Suit", confidence_score: 0.93, reasoning: "Golden Fleece label and suit silhouette" },
      brand: { value: "Brooks Brothers", confidence_score: 0.96, reasoning: "Golden Fleece label visible" },
      category: { value: "outerwear", confidence_score: 0.94, reasoning: "Suit jacket silhouette" },
      color: { value: "navy", confidence_score: 0.96, reasoning: "Navy with subtle pinstripe" },
      material: { value: "100% Super 120s merino wool", confidence_score: 0.92, reasoning: "Fine wool texture" },
      condition: { value: "like_new", confidence_score: 0.95, reasoning: "Pristine, barely worn" },
      estimatedPrice: { value: 285, confidence_score: 0.80, reasoning: "Golden Fleece suits $250-400 used" },
      tags: { value: ["brooks brothers", "golden fleece", "suit", "wool", "formal"], confidence_score: 0.88, reasoning: "Formal wear keywords" },
      description: { value: "Brooks Brothers Golden Fleece worsted wool suit in navy pinstripe. 100% Super 120s merino wool. Natural shoulder, full canvas construction. Two-button, notch lapel, flap pockets. Pants unhemmed. Impeccable condition - dry cleaned once. Investment piece.", confidence_score: 0.90, reasoning: "Generated from visual details" }
    },
    tags: ["brooks brothers", "golden fleece", "suit", "wool", "formal"],
    images: [
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800", fileName: "bb-suit-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800", fileName: "bb-suit-2.jpg", isPrimary: false }
    ]
  },
  {
    title: "Red Wing Iron Ranger Boots",
    description: "Red Wing Iron Ranger 8085 in Amber Harness leather. Goodyear welt construction, Vibram 430 mini-lug sole. Triple-stitched, leather insole molds to foot. Copper roughneck leather - ages beautifully. Well broken in, developing great patina. Includes leather laces.",
    brand: "Red Wing",
    category: "shoes",
    size: "9.5",
    color: "amber",
    material: "Amber Harness leather",
    condition: "good",
    estimatedPrice: 165.00,
    aiIdentified: true,
    aiData: {
      title: { value: "Red Wing Iron Ranger Boots", confidence_score: 0.96, reasoning: "Distinctive double-layer toe cap" },
      brand: { value: "Red Wing", confidence_score: 0.98, reasoning: "Red Wing logo on heel" },
      category: { value: "shoes", confidence_score: 0.99, reasoning: "Work boot silhouette" },
      color: { value: "amber", confidence_score: 0.94, reasoning: "Signature Amber Harness color" },
      material: { value: "Amber Harness leather", confidence_score: 0.95, reasoning: "Copper roughneck texture" },
      condition: { value: "good", confidence_score: 0.87, reasoning: "Well worn in, developing patina" },
      estimatedPrice: { value: 165, confidence_score: 0.82, reasoning: "Used Iron Rangers $140-200" },
      tags: { value: ["red wing", "iron ranger", "8085", "boots", "goodyear welt"], confidence_score: 0.92, reasoning: "Heritage boot keywords" },
      description: { value: "Red Wing Iron Ranger 8085 in Amber Harness leather. Goodyear welt construction, Vibram 430 mini-lug sole. Triple-stitched, leather insole molds to foot. Copper roughneck leather - ages beautifully. Well broken in, developing great patina. Includes leather laces.", confidence_score: 0.90, reasoning: "Generated from visual details" }
    },
    tags: ["red wing", "iron ranger", "8085", "boots", "goodyear welt"],
    images: [
      { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800", fileName: "redwing-iron-1.jpg", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1520639888713-3b6d3f1a8b2c?w=800", fileName: "redwing-iron-2.jpg", isPrimary: false }
    ]
  }
];

async function main() {
  console.log('Seeding test clothing data...');

  // Create or get test user
  let user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        role: 'MEMBER',
        hash: '$2b$10$dummyhash', // placeholder
        salt: 'dummysalt'
      }
    });
    console.log('Created test user:', user.id);
  } else {
    console.log('Using existing test user:', user.id);
  }

  // Create items with images and tags
  for (const itemData of CLOTHING_ITEMS) {
    const { images, tags, aiData, ...itemFields } = itemData;

    const item = await prisma.item.create({
      data: {
        ...itemFields,
        authorId: user.id,
        aiData: aiData,
        images: {
          create: images
        },
        tags: {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName.toLowerCase() },
                create: { name: tagName.toLowerCase() }
              }
            }
          }))
        }
      }
    });

    console.log(`Created item: ${item.title} (${item.id})`);

    // Create eBay listing for some items (first 5)
    if (CLOTHING_ITEMS.indexOf(itemData) < 5) {
      const ebayMarketplace = await prisma.marketplace.findUnique({
        where: { slug: 'ebay' }
      });

      if (ebayMarketplace) {
        await prisma.listing.create({
          data: {
            itemId: item.id,
            marketplaceId: ebayMarketplace.id,
            title: item.title,
            description: item.description,
            listingPrice: item.estimatedPrice,
            status: ['DRAFT', 'ACTIVE', 'SOLD'][Math.floor(Math.random() * 3)],
            externalId: `ebay-${item.id.slice(-8)}`,
            externalUrl: `https://www.ebay.com/itm/${item.id.slice(-12)}`
          }
        });
        console.log(`  -> Created eBay listing for: ${item.title}`);
      }
    }
  }

  console.log('Done seeding test data!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());