// Script to import Bekasi company data
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL file
const sqlFilePath = path.join(__dirname, '../attached_assets/perusahaan_data.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Extract INSERT statements
const insertRegex = /INSERT INTO perusahaan \(nama_perusahaan, alamat, kawasan_kecamatan\) VALUES \('(.+?)', '(.+?)', '(.+?)'\);/g;
const companies = [];

// Process each match from the SQL file
let match;
while ((match = insertRegex.exec(sqlContent)) !== null) {
  const namaPerusahaan = match[1].trim();
  const alamat = match[2].trim();
  const kawasanKecamatan = match[3].trim();
  
  // Check if the row contains multiple companies
  if (namaPerusahaan.includes('PT.') && namaPerusahaan !== 'PT.') {
    // This is a single company
    companies.push({
      nama_perusahaan: namaPerusahaan,
      alamat: alamat,
      kawasan_kecamatan: kawasanKecamatan
    });
  } else {
    // This row might contain multiple companies
    // Try to find patterns like "XX., PT. NAME"
    const multiCompanyRegex = /(\d+)\.,\s+(PT\.\s+[A-Z\s]+)/g;
    let multiMatch;
    
    let alamatText = alamat;
    while ((multiMatch = multiCompanyRegex.exec(alamatText)) !== null) {
      const companyName = multiMatch[2].trim();
      
      // Extract address - this is tricky but we'll try our best
      // Find the next company marker or the end of string
      const startPos = multiMatch.index + multiMatch[0].length;
      const nextCompanyMatch = /\d+\.,\s+PT\./g;
      nextCompanyMatch.lastIndex = startPos;
      
      const nextMatch = nextCompanyMatch.exec(alamatText);
      const endPos = nextMatch ? nextMatch.index : alamatText.length;
      
      const companyAddress = alamatText.substring(startPos, endPos).trim();
      
      companies.push({
        nama_perusahaan: companyName,
        alamat: companyAddress,
        kawasan_kecamatan: kawasanKecamatan
      });
    }
    
    // If we didn't find any companies with regex, at least add the original entry
    if (multiCompanyRegex.lastIndex === 0) {
      companies.push({
        nama_perusahaan: namaPerusahaan,
        alamat: alamat,
        kawasan_kecamatan: kawasanKecamatan
      });
    }
  }
}

// Post-process to handle more edge cases and clean up data
const cleanedCompanies = companies.map(company => {
  // Clean up company name
  let name = company.nama_perusahaan.replace(/,+$/, '').trim();
  
  // If name has commas and doesn't start with PT, try to extract proper name
  if (name.includes(',') && !name.startsWith('PT')) {
    const parts = name.split(',');
    name = parts[0].trim();
  }
  
  // Clean up address - remove excessive commas and spaces
  let address = company.alamat.replace(/,+/g, ',').replace(/\s+/g, ' ').trim();
  
  // If address contains numbered markers, try to clean it
  if (address.match(/\d+\.,/)) {
    address = address.replace(/\d+\.,/g, '').trim();
  }
  
  return {
    nama_perusahaan: name,
    alamat: address,
    kawasan_kecamatan: company.kawasan_kecamatan
  };
});

console.log(`Found ${cleanedCompanies.length} companies in the SQL file.`);

// Create the data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Save as JSON file for easier import
const jsonFilePath = path.join(dataDir, 'bekasi-companies.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(cleanedCompanies, null, 2));
console.log(`Saved ${cleanedCompanies.length} companies to ${jsonFilePath}`);

// Import to the database using the API endpoint in batches
try {
  console.log('Importing companies to the database in batches...');
  
  // Split companies into batches of 50
  const BATCH_SIZE = 50;
  const batches = [];
  
  for (let i = 0; i < cleanedCompanies.length; i += BATCH_SIZE) {
    batches.push(cleanedCompanies.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`Split data into ${batches.length} batches of ${BATCH_SIZE} companies each`);
  
  // Process each batch
  let importedCount = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} companies)...`);
    
    // Create a temporary batch file
    const batchFilePath = path.join(dataDir, `batch-${i + 1}.json`);
    fs.writeFileSync(batchFilePath, JSON.stringify(batch, null, 2));
    
    try {
      const curlCommand = `curl -X POST -H "Content-Type: application/json" -d @${batchFilePath} http://localhost:5000/api/import-bekasi-companies`;
      const result = execSync(curlCommand).toString();
      console.log(`Batch ${i + 1} result:`, result);
      
      // Parse result to get count
      try {
        const resultObj = JSON.parse(result);
        if (resultObj.companies) {
          importedCount += resultObj.companies.length;
        }
      } catch (parseErr) {
        // If we can't parse the result, just continue
      }
      
      // Clean up batch file
      fs.unlinkSync(batchFilePath);
    } catch (batchError) {
      console.error(`Error importing batch ${i + 1}:`, batchError.message);
    }
  }
  
  console.log(`Total companies imported: ${importedCount}`);
} catch (error) {
  console.error('Error in batch import process:', error.message);
  console.log('Make sure the server is running and the API endpoint is available.');
  console.log('You can manually import the data later by sending a POST request to /api/import-bekasi-companies');
}

// Additionally, save a simple version with just the main entries from each INSERT statement
const simpleCompanies = [];
let simpleMatch;
const simpleRegex = /INSERT INTO perusahaan \(nama_perusahaan, alamat, kawasan_kecamatan\) VALUES \('(.+?)', '(.+?)', '(.+?)'\);/g;
while ((simpleMatch = simpleRegex.exec(sqlContent)) !== null) {
  simpleCompanies.push({
    nama_perusahaan: simpleMatch[1].trim(),
    alamat: simpleMatch[2].trim(),
    kawasan_kecamatan: simpleMatch[3].trim()
  });
}

const simpleJsonFilePath = path.join(dataDir, 'bekasi-companies-simple.json');
fs.writeFileSync(simpleJsonFilePath, JSON.stringify(simpleCompanies, null, 2));
console.log(`Also saved ${simpleCompanies.length} simple company entries to ${simpleJsonFilePath}`);