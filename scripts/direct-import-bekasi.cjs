const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function importCompanies() {
  try {
    // Path ke file data perusahaan Bekasi sederhana
    const dataDir = path.join(__dirname, '..', 'data');
    const simpleJsonFilePath = path.join(dataDir, 'bekasi-companies-simple.json');
    
    // Periksa apakah file ada
    if (!fs.existsSync(simpleJsonFilePath)) {
      console.error(`File tidak ditemukan: ${simpleJsonFilePath}`);
      return;
    }
    
    // Baca data
    const companiesRaw = fs.readFileSync(simpleJsonFilePath, 'utf8');
    const companies = JSON.parse(companiesRaw);
    
    console.log(`Membaca ${companies.length} perusahaan dari file JSON`);
    
    // Filter data yang valid
    const validCompanies = companies.filter(company => 
      company.nama_perusahaan && 
      company.nama_perusahaan.trim() !== 'PT.' &&
      company.alamat &&
      company.alamat.trim() !== ''
    );
    
    console.log(`Terdapat ${validCompanies.length} perusahaan valid untuk diimpor`);
    
    // Impor perusahaan satu per satu untuk menghindari kesalahan batch
    let successCount = 0;
    
    for (let i = 0; i < validCompanies.length; i++) {
      const company = validCompanies[i];
      
      // Clean up nama perusahaan (hapus spasi berlebih)
      company.nama_perusahaan = company.nama_perusahaan.trim().replace(/\s+/g, ' ');
      
      try {
        console.log(`Mengimpor perusahaan ${i+1}/${validCompanies.length}: ${company.nama_perusahaan}`);
        
        // Kirim request ke API
        const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -d '[${JSON.stringify(company)}]' http://localhost:5000/api/import-bekasi-companies`;
        
        exec(curlCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error mengimpor perusahaan: ${company.nama_perusahaan}`, error);
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            if (result.companies && result.companies.length > 0) {
              successCount++;
              console.log(`Sukses mengimpor: ${company.nama_perusahaan}`);
            } else {
              console.error(`Gagal mengimpor: ${company.nama_perusahaan}`, stdout);
            }
          } catch (parseError) {
            console.error(`Gagal parse hasil untuk: ${company.nama_perusahaan}`, stdout);
          }
        });
        
        // Jeda singkat untuk menghindari overload
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (companyError) {
        console.error(`Error saat memproses perusahaan: ${company.nama_perusahaan}`, companyError);
      }
    }
    
    console.log(`Proses impor selesai. Perusahaan berhasil diimpor: ${successCount}`);
  } catch (error) {
    console.error('Error dalam proses impor:', error);
  }
}

// Jalankan fungsi impor
importCompanies();