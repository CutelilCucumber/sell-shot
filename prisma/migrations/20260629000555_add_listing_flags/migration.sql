-- CreateEnum
CREATE TYPE "MarketplaceType" AS ENUM ('API', 'TEMPLATE');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Marketplace" ADD COLUMN     "listingUrl" TEXT,
ADD COLUMN     "type" "MarketplaceType" NOT NULL DEFAULT 'TEMPLATE';

-- CreateTable
CREATE TABLE "UserMarketplaceAuth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMarketplaceAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMarketplaceAuth_userId_marketplaceId_key" ON "UserMarketplaceAuth"("userId", "marketplaceId");

-- AddForeignKey
ALTER TABLE "UserMarketplaceAuth" ADD CONSTRAINT "UserMarketplaceAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMarketplaceAuth" ADD CONSTRAINT "UserMarketplaceAuth_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
