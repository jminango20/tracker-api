-- CreateTable
CREATE TABLE "public"."asset_operation_event" (
    "id" SERIAL NOT NULL,
    "channel_name" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "operation" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "block_timestamp" BIGINT NOT NULL,
    "related_asset_ids" TEXT[],
    "related_amounts" TEXT[],
    "owner_address" TEXT NOT NULL,
    "id_local" TEXT,
    "amount" TEXT NOT NULL,
    "data_hash" TEXT,
    "transaction_hash" TEXT NOT NULL,
    "block_number" BIGINT NOT NULL,
    "log_index" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_operation_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset" (
    "asset_id" TEXT NOT NULL,
    "channel_name" TEXT NOT NULL,
    "owner_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "id_local" TEXT,
    "data_hash" TEXT,
    "status" INTEGER NOT NULL,
    "origin_owner" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "parent_asset_id" TEXT,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("asset_id")
);

-- CreateTable
CREATE TABLE "public"."asset_parent_relation" (
    "id" SERIAL NOT NULL,
    "parent_asset_id" TEXT NOT NULL,
    "child_asset_id" TEXT NOT NULL,
    "operation_event_id" INTEGER NOT NULL,
    "contributed_amount" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_parent_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_hierarchy_path" (
    "id" SERIAL NOT NULL,
    "ancestor_id" TEXT NOT NULL,
    "descendant_id" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_hierarchy_path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."block_tracker" (
    "id" SERIAL NOT NULL,
    "lastBlock" BIGINT NOT NULL,
    "serviceName" TEXT NOT NULL DEFAULT 'EventListener',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_tracker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_operation_event_asset_id_idx" ON "public"."asset_operation_event"("asset_id");

-- CreateIndex
CREATE INDEX "asset_operation_event_channel_name_idx" ON "public"."asset_operation_event"("channel_name");

-- CreateIndex
CREATE INDEX "asset_operation_event_block_number_idx" ON "public"."asset_operation_event"("block_number");

-- CreateIndex
CREATE INDEX "asset_operation_event_processed_idx" ON "public"."asset_operation_event"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "unique_tx_log" ON "public"."asset_operation_event"("transaction_hash", "log_index");

-- CreateIndex
CREATE INDEX "asset_channel_name_idx" ON "public"."asset"("channel_name");

-- CreateIndex
CREATE INDEX "asset_owner_address_idx" ON "public"."asset"("owner_address");

-- CreateIndex
CREATE INDEX "asset_status_idx" ON "public"."asset"("status");

-- CreateIndex
CREATE INDEX "asset_parent_asset_id_idx" ON "public"."asset"("parent_asset_id");

-- CreateIndex
CREATE INDEX "asset_parent_relation_parent_asset_id_idx" ON "public"."asset_parent_relation"("parent_asset_id");

-- CreateIndex
CREATE INDEX "asset_parent_relation_child_asset_id_idx" ON "public"."asset_parent_relation"("child_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_parent_relation_parent_asset_id_child_asset_id_operat_key" ON "public"."asset_parent_relation"("parent_asset_id", "child_asset_id", "operation_event_id");

-- CreateIndex
CREATE INDEX "asset_hierarchy_path_descendant_id_depth_idx" ON "public"."asset_hierarchy_path"("descendant_id", "depth");

-- CreateIndex
CREATE INDEX "asset_hierarchy_path_ancestor_id_idx" ON "public"."asset_hierarchy_path"("ancestor_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_hierarchy_path_ancestor_id_descendant_id_path_key" ON "public"."asset_hierarchy_path"("ancestor_id", "descendant_id", "path");

-- AddForeignKey
ALTER TABLE "public"."asset" ADD CONSTRAINT "asset_parent_asset_id_fkey" FOREIGN KEY ("parent_asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."asset_parent_relation" ADD CONSTRAINT "asset_parent_relation_parent_asset_id_fkey" FOREIGN KEY ("parent_asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_parent_relation" ADD CONSTRAINT "asset_parent_relation_child_asset_id_fkey" FOREIGN KEY ("child_asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_parent_relation" ADD CONSTRAINT "asset_parent_relation_operation_event_id_fkey" FOREIGN KEY ("operation_event_id") REFERENCES "public"."asset_operation_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_hierarchy_path" ADD CONSTRAINT "asset_hierarchy_path_ancestor_id_fkey" FOREIGN KEY ("ancestor_id") REFERENCES "public"."asset"("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_hierarchy_path" ADD CONSTRAINT "asset_hierarchy_path_descendant_id_fkey" FOREIGN KEY ("descendant_id") REFERENCES "public"."asset"("asset_id") ON DELETE RESTRICT ON UPDATE CASCADE;
