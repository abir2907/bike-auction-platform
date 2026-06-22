import { prisma } from '../../config/prisma';

/** Public, published-only CMS reads consumed by the marketing pages. */
export async function getPublishedFaqs() {
  return prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getPublishedTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });
}

/** Returns all editable homepage blocks as a `{ key: value }` map. */
export async function getSiteContent() {
  const rows = await prisma.siteContent.findMany();
  return rows.reduce<Record<string, unknown>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

/** Aggregate live platform statistics for the "Statistics" homepage section. */
export async function getStats() {
  const [vehicles, sold, users, liveAuctions] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.user.count(),
    prisma.auction.count({ where: { status: 'LIVE' } }),
  ]);
  return { vehiclesListed: vehicles, vehiclesSold: sold, happyCustomers: users, liveAuctions };
}
