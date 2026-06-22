import { Prisma } from '@prisma/client';
import { minimumNextBid } from '../../src/modules/auctions/auctions.service';
import { ttlToMs, hashToken } from '../../src/utils/jwt';
import { slugify } from '../../src/utils/slug';
import { buildPageMeta, parsePagination } from '../../src/utils/pagination';

const D = (n: number) => new Prisma.Decimal(n);

describe('auction: minimumNextBid', () => {
  it('requires at least the starting price for the first bid', () => {
    expect(
      minimumNextBid({ totalBids: 0, currentPrice: D(50000), startingPrice: D(50000), bidIncrement: D(1000) }),
    ).toBe(50000);
  });

  it('requires current + increment once bidding has started', () => {
    expect(
      minimumNextBid({ totalBids: 2, currentPrice: D(52000), startingPrice: D(50000), bidIncrement: D(1000) }),
    ).toBe(53000);
  });
});

describe('jwt utils', () => {
  it('parses ttl strings into milliseconds', () => {
    expect(ttlToMs('15m')).toBe(900_000);
    expect(ttlToMs('7d')).toBe(604_800_000);
    expect(ttlToMs('30s')).toBe(30_000);
  });

  it('hashes a token deterministically and irreversibly', () => {
    const raw = 'super-secret-token';
    expect(hashToken(raw)).toBe(hashToken(raw));
    expect(hashToken(raw)).not.toBe(raw);
    expect(hashToken(raw)).toHaveLength(64); // sha-256 hex
  });
});

describe('slugify', () => {
  it('produces a url-safe, suffixed slug', () => {
    const slug = slugify('Royal Enfield Classic 350!!');
    expect(slug).toMatch(/^royal-enfield-classic-350-[a-z0-9]{6}$/);
  });
});

describe('pagination', () => {
  it('clamps page and limit to safe ranges', () => {
    expect(parsePagination({ page: '0', limit: '9999' })).toMatchObject({ page: 1, limit: 100 });
    expect(parsePagination({})).toMatchObject({ page: 1, limit: 12 });
  });

  it('computes page metadata', () => {
    expect(buildPageMeta(25, 1, 12)).toMatchObject({ totalPages: 3, hasNextPage: true, hasPrevPage: false });
  });
});
