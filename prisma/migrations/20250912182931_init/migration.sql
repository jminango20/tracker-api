-- CreateTable
CREATE TABLE "public"."asset_events" (
    "id" SERIAL NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "primaryAssetId" TEXT NOT NULL,
    "secondaryAssetId" TEXT,
    "owner" TEXT,
    "operation" TEXT,
    "relatedAssetIds" TEXT[],
    "amounts" BIGINT[],
    "eventData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_events_primaryAssetId_idx" ON "public"."asset_events"("primaryAssetId");

-- CreateIndex
CREATE INDEX "asset_events_blockNumber_idx" ON "public"."asset_events"("blockNumber");

-- CreateIndex
CREATE INDEX "asset_events_eventName_idx" ON "public"."asset_events"("eventName");

-- CreateIndex
CREATE INDEX "asset_events_transactionHash_idx" ON "public"."asset_events"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "asset_events_transactionHash_logIndex_key" ON "public"."asset_events"("transactionHash", "logIndex");
