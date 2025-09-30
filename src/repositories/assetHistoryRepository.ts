import { prisma } from '../database/prismaClient';

export class AssetHistoryRepository {
  /**
   * DIRECT: Asset + todos os ancestrais
   */
  async getDirectHistory(assetId: string) {
    const query = `
      WITH HierarquiaAssets AS (
        SELECT $1::text as asset_id
        UNION
        SELECT ancestor_id FROM asset_hierarchy_path 
        WHERE descendant_id = $1
      )
      SELECT
        aoe.asset_id,
        CASE aoe.operation
          WHEN 0 THEN 'CREATE'
          WHEN 1 THEN 'UPDATE'
          WHEN 2 THEN 'TRANSFER'
          WHEN 3 THEN 'TRANSFERIN'
          WHEN 4 THEN 'SPLIT'
          WHEN 5 THEN 'GROUP'
          WHEN 6 THEN 'UNGROUP'
          WHEN 7 THEN 'TRANSFORM'
          WHEN 8 THEN 'INACTIVATE'
        END as operacao,
        aoe.amount,
        aoe.related_asset_ids,
        aoe.related_amounts,
        TO_TIMESTAMP(aoe.block_timestamp) as timestamp_operacao,
        ROW_NUMBER() OVER (ORDER BY aoe.block_timestamp, aoe.log_index) as sequencia
      FROM asset_operation_event aoe
      WHERE aoe.asset_id IN (SELECT asset_id FROM HierarquiaAssets)
         OR EXISTS (
           SELECT 1 FROM unnest(aoe.related_asset_ids) AS related_id
           WHERE related_id IN (SELECT asset_id FROM HierarquiaAssets)
         )
      ORDER BY aoe.block_timestamp, aoe.log_index
    `;

    return await prisma.$queryRawUnsafe(query, assetId);
  }

  /**
   * INDIRECT: Asset + ancestrais + descendentes + irmãos
   */
  async getIndirectHistory(assetId: string) {
    const query = `
      WITH HierarquiaCompleta AS (
        SELECT $1::text as asset_id
        UNION
        SELECT ancestor_id FROM asset_hierarchy_path
        WHERE descendant_id = $1
        UNION
        SELECT descendant_id FROM asset_hierarchy_path
        WHERE ancestor_id = $1
        UNION
        SELECT DISTINCT ahp_sibling.descendant_id
        FROM asset_hierarchy_path ahp_ancestor
        INNER JOIN asset_hierarchy_path ahp_sibling
          ON ahp_ancestor.ancestor_id = ahp_sibling.ancestor_id
          AND ahp_ancestor.depth = ahp_sibling.depth
        WHERE ahp_ancestor.descendant_id IN (
          SELECT ancestor_id FROM asset_hierarchy_path WHERE descendant_id = $1
        )
        AND ahp_sibling.descendant_id NOT IN (
          SELECT $1::text
          UNION
          SELECT ancestor_id FROM asset_hierarchy_path WHERE descendant_id = $1
        )
      )
      SELECT
        aoe.asset_id,
        CASE aoe.operation
          WHEN 0 THEN 'CREATE'
          WHEN 1 THEN 'UPDATE'
          WHEN 2 THEN 'TRANSFER'
          WHEN 3 THEN 'TRANSFERIN'
          WHEN 4 THEN 'SPLIT'
          WHEN 5 THEN 'GROUP'
          WHEN 6 THEN 'UNGROUP'
          WHEN 7 THEN 'TRANSFORM'
          WHEN 8 THEN 'INACTIVATE'
        END as operacao,
        aoe.amount,
        aoe.related_asset_ids,
        aoe.related_amounts,
        TO_TIMESTAMP(aoe.block_timestamp) as timestamp_operacao
      FROM asset_operation_event aoe
      WHERE aoe.asset_id IN (SELECT asset_id FROM HierarquiaCompleta)
        OR EXISTS (
          SELECT 1 FROM unnest(aoe.related_asset_ids) AS related_id
          WHERE related_id IN (SELECT asset_id FROM HierarquiaCompleta)
        )
      ORDER BY aoe.block_timestamp, aoe.log_index
    `;

    return await prisma.$queryRawUnsafe(query, assetId);
  }
}