-- Add optional "direct buy" (buy-now) price to auctions.
-- NULL means the auction is not available for direct buy.
ALTER TABLE "auctions" ADD COLUMN "buyNowPrice" DECIMAL(12,2);
