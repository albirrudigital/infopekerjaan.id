import { db } from "../server/db";
import { userProfileCompletions } from "../shared/schema";
import { eq, count, sql } from "drizzle-orm";

/**
 * Script untuk memperbaiki duplikasi data pada tabel user_profile_completions
 * Script ini akan mendeteksi dan menghapus duplikasi data untuk setiap pasangan user_id dan item_id
 */
async function fixDuplicateProfileCompletions() {
  console.log("Memulai proses perbaikan duplikasi data profile completion...");
  
  try {
    // Dapatkan semua pasangan user_id dan item_id yang memiliki lebih dari satu entri
    console.log("Mencari duplikasi data...");
    const duplicates = await db.select({
      userId: userProfileCompletions.userId,
      itemId: userProfileCompletions.itemId,
      count: count(userProfileCompletions.id)
    })
    .from(userProfileCompletions)
    .groupBy(userProfileCompletions.userId, userProfileCompletions.itemId)
    .having(sql`count(${userProfileCompletions.id}) > 1`);
    
    console.log(`Ditemukan ${duplicates.length} duplikasi data!`);
    
    if (duplicates.length === 0) {
      console.log("Tidak ada duplikasi data yang perlu diperbaiki.");
      return;
    }
    
    let totalDeleted = 0;
    
    // Proses setiap duplikasi
    for (const duplicate of duplicates) {
      const { userId, itemId } = duplicate;
      
      // Dapatkan semua entri untuk pasangan user_id dan item_id ini
      const entries = await db.select()
        .from(userProfileCompletions)
        .where(
          sql`${userProfileCompletions.userId} = ${userId} AND ${userProfileCompletions.itemId} = ${itemId}`
        )
        .orderBy(userProfileCompletions.createdAt);
      
      if (entries.length <= 1) continue;
      
      // Simpan entri pertama (paling lama) dan hapus sisanya
      console.log(`Memperbaiki duplikasi untuk user ${userId} dan item ${itemId}. Ditemukan ${entries.length} entri.`);
      
      const idsToDelete = entries.slice(1).map(entry => entry.id);
      
      // Hapus semua duplikasi kecuali yang pertama
      const deleteResult = await db.delete(userProfileCompletions)
        .where(sql`${userProfileCompletions.id} IN (${idsToDelete.join(', ')})`);
      
      console.log(`  Berhasil menghapus ${idsToDelete.length} duplikasi.`);
      totalDeleted += idsToDelete.length;
    }
    
    console.log(`\nProses perbaikan selesai. Jumlah total data yang dihapus: ${totalDeleted}`);
  } catch (error) {
    console.error("Error dalam proses perbaikan duplikasi data:", error);
  }
}

async function main() {
  try {
    await fixDuplicateProfileCompletions();
  } catch (error) {
    console.error("Error dalam proses utama:", error);
  } finally {
    process.exit(0);
  }
}

main();