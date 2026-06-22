/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@vutto.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

// Deterministic real motorcycle photos (keyword + stable `lock` per seed).
// If the network blocks this host, the frontend's <SmartImage> falls back to a
// branded gradient so listings never look broken.
const hashSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 95) + 1;
};
const img = (seed: string) => `https://loremflickr.com/1024/768/motorcycle?lock=${hashSeed(seed)}`;
const slugify = (t: string) =>
  `${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

interface SeedVehicle {
  title: string;
  brand: string;
  model: string;
  year: number;
  fuelType: 'PETROL' | 'ELECTRIC' | 'HYBRID';
  transmission: 'MANUAL' | 'AUTOMATIC';
  kmDriven: number;
  ownerCount: number;
  engineCapacityCc?: number;
  color: string;
  city: string;
  registrationState: string;
  price: number;
  conditionScore: number;
  featured?: boolean;
  description: string;
  imgSeed: string;
}

const VEHICLES: SeedVehicle[] = [
  { title: 'Royal Enfield Classic 350', brand: 'Royal Enfield', model: 'Classic 350', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 12500, ownerCount: 1, engineCapacityCc: 349, color: 'Stealth Black', city: 'New Delhi', registrationState: 'DL', price: 142000, conditionScore: 92, featured: true, description: 'Single-owner Classic 350 in pristine condition. Full service history, new tyres, and a clear title. Thunderous thump intact. Inspected on 200+ points.', imgSeed: 'royalenfield1' },
  { title: 'Honda Activa 6G', brand: 'Honda', model: 'Activa 6G', year: 2022, fuelType: 'PETROL', transmission: 'AUTOMATIC', kmDriven: 8200, ownerCount: 1, engineCapacityCc: 109, color: 'Pearl White', city: 'Gurugram', registrationState: 'HR', price: 72000, conditionScore: 95, featured: true, description: 'Barely used Activa 6G, perfect city commuter. Excellent mileage, smooth ride, all papers up to date.', imgSeed: 'activa1' },
  { title: 'Bajaj Pulsar NS200', brand: 'Bajaj', model: 'Pulsar NS200', year: 2020, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 21000, ownerCount: 2, engineCapacityCc: 199, color: 'Racing Red', city: 'Noida', registrationState: 'UP', price: 98000, conditionScore: 84, description: 'Well-maintained NS200 with strong performance. Recently serviced, new chain sprocket kit installed.', imgSeed: 'pulsar1' },
  { title: 'Yamaha MT-15', brand: 'Yamaha', model: 'MT-15', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 15600, ownerCount: 1, engineCapacityCc: 155, color: 'Metallic Blue', city: 'New Delhi', registrationState: 'DL', price: 118000, conditionScore: 90, featured: true, description: 'Aggressive streetfighter styling with VVA engine. Single owner, garage kept, zero accidents.', imgSeed: 'mt15' },
  { title: 'TVS Apache RTR 160 4V', brand: 'TVS', model: 'Apache RTR 160 4V', year: 2019, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 28400, ownerCount: 2, engineCapacityCc: 159, color: 'Gloss Black', city: 'Faridabad', registrationState: 'HR', price: 74000, conditionScore: 80, description: 'Sporty and fuel efficient. Well maintained with timely servicing. Great first bike.', imgSeed: 'apache1' },
  { title: 'Ather 450X', brand: 'Ather', model: '450X', year: 2022, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', kmDriven: 6100, ownerCount: 1, color: 'Space Grey', city: 'Gurugram', registrationState: 'HR', price: 128000, conditionScore: 93, featured: true, description: 'Premium electric scooter with warp mode. Battery health excellent, fast charger included.', imgSeed: 'ather1' },
  { title: 'KTM Duke 390', brand: 'KTM', model: 'Duke 390', year: 2020, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 19800, ownerCount: 1, engineCapacityCc: 373, color: 'Electronic Orange', city: 'New Delhi', registrationState: 'DL', price: 205000, conditionScore: 88, description: 'The corner-carving Duke 390. Quickshifter, TFT dash, fresh Metzeler tyres.', imgSeed: 'duke390' },
  { title: 'Hero Splendor Plus', brand: 'Hero', model: 'Splendor Plus', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 17200, ownerCount: 1, engineCapacityCc: 97, color: 'Black Red', city: 'Ghaziabad', registrationState: 'UP', price: 52000, conditionScore: 86, description: 'India\'s most trusted commuter. Unbeatable mileage, low maintenance, ready to ride.', imgSeed: 'splendor1' },
  { title: 'Royal Enfield Meteor 350', brand: 'Royal Enfield', model: 'Meteor 350', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 9400, ownerCount: 1, engineCapacityCc: 349, color: 'Supernova Blue', city: 'Gurugram', registrationState: 'HR', price: 168000, conditionScore: 94, featured: true, description: 'Cruiser comfort with the Tripper navigation pod. Immaculate, single owner.', imgSeed: 'meteor1' },
  { title: 'Suzuki Access 125', brand: 'Suzuki', model: 'Access 125', year: 2020, fuelType: 'PETROL', transmission: 'AUTOMATIC', kmDriven: 23100, ownerCount: 2, engineCapacityCc: 124, color: 'Silver', city: 'New Delhi', registrationState: 'DL', price: 61000, conditionScore: 82, description: 'Refined 125cc scooter, great for the whole family. Well serviced and reliable.', imgSeed: 'access1' },
  { title: 'Kawasaki Ninja 300', brand: 'Kawasaki', model: 'Ninja 300', year: 2019, fuelType: 'PETROL', transmission: 'MANUAL', kmDriven: 16700, ownerCount: 1, engineCapacityCc: 296, color: 'Lime Green', city: 'Noida', registrationState: 'UP', price: 248000, conditionScore: 89, description: 'Twin-cylinder sportbike, buttery smooth. Track-day ready yet street friendly.', imgSeed: 'ninja300' },
  { title: 'Ola S1 Pro', brand: 'Ola', model: 'S1 Pro', year: 2023, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', kmDriven: 3200, ownerCount: 1, color: 'Jet Black', city: 'Gurugram', registrationState: 'HR', price: 112000, conditionScore: 91, description: 'Long-range electric scooter with hyper mode. Like-new condition, under warranty.', imgSeed: 'olas1' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin + demo users ──
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN' },
    create: { name: 'Vutto Admin', email: ADMIN_EMAIL, role: 'ADMIN', emailVerified: true, passwordHash: adminHash },
  });

  const demoHash = await bcrypt.hash('Password@123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@vutto.local' },
    update: {},
    create: { name: 'Rohan Sharma', email: 'seller@vutto.local', phone: '+91 98100 11223', emailVerified: true, passwordHash: demoHash },
  });
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@vutto.local' },
    update: {},
    create: { name: 'Aisha Khan', email: 'buyer@vutto.local', phone: '+91 99200 33445', emailVerified: true, passwordHash: demoHash },
  });
  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@vutto.local' },
    update: {},
    create: { name: 'Vikram Reddy', email: 'buyer2@vutto.local', phone: '+91 90000 55667', emailVerified: true, passwordHash: demoHash },
  });

  // Idempotent re-seed: clear catalogue-related data.
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.savedVehicle.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.vehicle.deleteMany();

  const createdVehicles = [];
  for (const v of VEHICLES) {
    const vehicle = await prisma.vehicle.create({
      data: {
        slug: slugify(v.title),
        title: v.title,
        brand: v.brand,
        model: v.model,
        year: v.year,
        fuelType: v.fuelType,
        transmission: v.transmission,
        kmDriven: v.kmDriven,
        ownerCount: v.ownerCount,
        engineCapacityCc: v.engineCapacityCc,
        color: v.color,
        registrationState: v.registrationState,
        city: v.city,
        description: v.description,
        price: new Prisma.Decimal(v.price),
        conditionScore: v.conditionScore,
        featured: v.featured ?? false,
        status: 'ACTIVE',
        listingType: 'SALE',
        sellerId: seller.id,
        viewCount: Math.floor(Math.random() * 400),
        images: {
          create: [
            { url: img(v.imgSeed), isPrimary: true, sortOrder: 0 },
            { url: img(`${v.imgSeed}-b`), sortOrder: 1 },
            { url: img(`${v.imgSeed}-c`), sortOrder: 2 },
          ],
        },
      },
    });
    createdVehicles.push(vehicle);
  }

  // ── Auctions ──
  const now = Date.now();
  // 1) A LIVE auction with existing bids (RE Classic 350)
  const liveVehicle = createdVehicles[0];
  await prisma.vehicle.update({ where: { id: liveVehicle.id }, data: { listingType: 'AUCTION' } });
  const liveAuction = await prisma.auction.create({
    data: {
      vehicleId: liveVehicle.id,
      startingPrice: new Prisma.Decimal(110000),
      reservePrice: new Prisma.Decimal(130000),
      bidIncrement: new Prisma.Decimal(1000),
      currentPrice: new Prisma.Decimal(124000),
      startTime: new Date(now - 60 * 60 * 1000),
      endTime: new Date(now + 45 * 60 * 1000),
      antiSnipeSeconds: 30,
      status: 'LIVE',
      totalBids: 3,
      reserveMet: false,
      winnerId: buyer.id,
    },
  });
  await prisma.bid.createMany({
    data: [
      { auctionId: liveAuction.id, bidderId: buyer.id, amount: new Prisma.Decimal(115000), createdAt: new Date(now - 40 * 60 * 1000) },
      { auctionId: liveAuction.id, bidderId: buyer2.id, amount: new Prisma.Decimal(120000), createdAt: new Date(now - 20 * 60 * 1000) },
      { auctionId: liveAuction.id, bidderId: buyer.id, amount: new Prisma.Decimal(124000), createdAt: new Date(now - 5 * 60 * 1000) },
    ],
  });

  // 2) A SCHEDULED auction starting soon (KTM Duke 390)
  const scheduledVehicle = createdVehicles[6];
  await prisma.vehicle.update({ where: { id: scheduledVehicle.id }, data: { listingType: 'AUCTION' } });
  await prisma.auction.create({
    data: {
      vehicleId: scheduledVehicle.id,
      startingPrice: new Prisma.Decimal(180000),
      reservePrice: new Prisma.Decimal(195000),
      bidIncrement: new Prisma.Decimal(2000),
      currentPrice: new Prisma.Decimal(180000),
      startTime: new Date(now + 30 * 60 * 1000),
      endTime: new Date(now + 24 * 60 * 60 * 1000),
      antiSnipeSeconds: 30,
      status: 'SCHEDULED',
    },
  });

  // 3) A SETTLED auction (Kawasaki Ninja 300) with a winner
  const soldVehicle = createdVehicles[10];
  await prisma.vehicle.update({ where: { id: soldVehicle.id }, data: { listingType: 'AUCTION', status: 'SOLD' } });
  const settled = await prisma.auction.create({
    data: {
      vehicleId: soldVehicle.id,
      startingPrice: new Prisma.Decimal(220000),
      reservePrice: new Prisma.Decimal(235000),
      bidIncrement: new Prisma.Decimal(2500),
      currentPrice: new Prisma.Decimal(247500),
      startTime: new Date(now - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(now - 2 * 24 * 60 * 60 * 1000),
      antiSnipeSeconds: 30,
      status: 'SETTLED',
      totalBids: 5,
      reserveMet: true,
      winnerId: buyer2.id,
    },
  });
  await prisma.bid.create({ data: { auctionId: settled.id, bidderId: buyer2.id, amount: new Prisma.Decimal(247500) } });

  // ── Inquiries ──
  await prisma.inquiry.createMany({
    data: [
      { vehicleId: createdVehicles[1].id, userId: buyer.id, name: 'Aisha Khan', email: 'buyer@vutto.local', phone: '+91 99200 33445', message: 'Is the Activa still available? Can I see it this weekend?', status: 'NEW' },
      { vehicleId: createdVehicles[3].id, name: 'Karan Mehta', email: 'karan@example.com', phone: '+91 98765 43210', message: 'Interested in the MT-15. Is the price negotiable?', status: 'CONTACTED' },
      { vehicleId: createdVehicles[5].id, name: 'Neha Gupta', email: 'neha@example.com', phone: '+91 91234 56789', message: 'What is the battery warranty status on the Ather?', status: 'NEW' },
    ],
  });

  // ── Saved vehicles ──
  await prisma.savedVehicle.createMany({
    data: [
      { userId: buyer.id, vehicleId: createdVehicles[8].id },
      { userId: buyer.id, vehicleId: createdVehicles[3].id },
    ],
    skipDuplicates: true,
  });

  // ── Testimonials ──
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { authorName: 'Sandeep Verma', authorTitle: 'Bought a Royal Enfield', rating: 5, content: 'The inspection report was spot on and the auction was completely transparent. Got my dream bike below market price!', sortOrder: 0, avatarUrl: img('avatar1') },
      { authorName: 'Priya Nair', authorTitle: 'Sold her scooter', rating: 5, content: 'Listed my Activa and had genuine buyers within two days. The whole process was smooth and trustworthy.', sortOrder: 1, avatarUrl: img('avatar2') },
      { authorName: 'Mohammed Irfan', authorTitle: 'First-time buyer', rating: 4, content: 'Loved the live bidding experience. The anti-sniping timer kept things fair right till the end.', sortOrder: 2, avatarUrl: img('avatar3') },
    ],
  });

  // ── FAQs ──
  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      { question: 'How does the live auction work?', answer: 'Browse upcoming and live auctions, place a bid in real time, and the highest bid above the reserve price when the timer ends wins the vehicle.', category: 'Auctions', sortOrder: 0 },
      { question: 'What is anti-sniping?', answer: 'If a bid is placed in the final seconds, the auction is automatically extended by a short window so every bidder gets a fair chance to respond.', category: 'Auctions', sortOrder: 1 },
      { question: 'Are the vehicles inspected?', answer: 'Yes. Every vehicle goes through a multi-point inspection and is assigned a condition score you can see on the listing.', category: 'Buying', sortOrder: 2 },
      { question: 'How do I sell my two-wheeler?', answer: 'Create an account, click “Sell your bike”, add photos and details, and your listing goes live. You can also opt for an auction.', category: 'Selling', sortOrder: 3 },
      { question: 'Is my payment secure?', answer: 'All transactions are processed through verified, secure payment channels with full documentation support.', category: 'Payments', sortOrder: 4 },
    ],
  });

  // ── Editable homepage content ──
  await prisma.siteContent.upsert({
    where: { key: 'hero' },
    update: {},
    create: {
      key: 'hero',
      value: {
        title: 'Buy & sell used two-wheelers you can trust',
        subtitle: 'Inspected bikes, transparent live auctions, and the best prices in Delhi NCR.',
        ctaPrimary: 'Browse bikes',
        ctaSecondary: 'Sell your bike',
      },
    },
  });

  console.log('✅ Seed complete');
  console.log(`   Admin login : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('   Buyer login : buyer@vutto.local / Password@123');
  console.log('   Seller login: seller@vutto.local / Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
