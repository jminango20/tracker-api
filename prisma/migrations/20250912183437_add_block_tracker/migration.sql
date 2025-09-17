-- CreateTable
CREATE TABLE "public"."block_tracker" (
    "id" SERIAL NOT NULL,
    "lastBlock" BIGINT NOT NULL,
    "serviceName" TEXT NOT NULL DEFAULT 'EventListener',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_tracker_pkey" PRIMARY KEY ("id")
);
