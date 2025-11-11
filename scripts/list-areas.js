/**
 * Script to list all areas that are displayed on the areas page
 * This script fetches areas from the API and applies the same filtering logic as AreasList component
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Try to read .env.local file manually
let API_BASE_URL = 'https://admin.foryou-realestate.com/api';
let API_KEY = 'fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2';
let API_SECRET = '5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f';

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key === 'NEXT_PUBLIC_API_URL') {
          API_BASE_URL = value;
        } else if (key === 'NEXT_PUBLIC_API_KEY') {
          API_KEY = value;
        } else if (key === 'NEXT_PUBLIC_API_SECRET') {
          API_SECRET = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('⚠️ Could not read .env.local, using default values');
}

// Override with environment variables if set
API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
API_KEY = process.env.NEXT_PUBLIC_API_KEY || API_KEY;
API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || API_SECRET;

async function getAreas() {
  try {
    console.log('📡 Fetching areas from API...');
    console.log(`   API URL: ${API_BASE_URL}/public/areas`);
    
    // Try /public/areas first (new endpoint)
    let apiAreas = [];
    try {
      const response = await axios.get(`${API_BASE_URL}/public/areas`, {
        headers: {
          'X-Api-Key': API_KEY,
          'X-Api-Secret': API_SECRET,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data)) {
        apiAreas = response.data.data;
        console.log(`✅ Received ${apiAreas.length} areas from /public/areas endpoint\n`);
      } else {
        throw new Error('Invalid response structure from /public/areas');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('⚠️ /public/areas endpoint not found, trying /public/data...');
        // Fallback to /public/data
        const response = await axios.get(`${API_BASE_URL}/public/data`, {
          headers: {
            'X-Api-Key': API_KEY,
            'X-Api-Secret': API_SECRET,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });

        if (!response.data || !response.data.success || !response.data.data || !response.data.data.areas) {
          console.error('❌ Invalid response structure from /public/data');
          console.error('Response:', JSON.stringify(response.data, null, 2));
          return [];
        }

        apiAreas = response.data.data.areas;
        console.log(`✅ Received ${apiAreas.length} areas from /public/data endpoint\n`);
      } else {
        throw error;
      }
    }

    // Apply the same filtering logic as AreasList component
    const filteredAreas = apiAreas
      .filter(area => {
        // Filter out areas that don't have real images (have placeholder)
        const hasImages = area.images && Array.isArray(area.images) && area.images.length > 0;
        if (!hasImages) {
          return false; // No images at all
        }
        
        // Get first image URL
        const firstImage = area.images[0];
        if (!firstImage || typeof firstImage !== 'string' || firstImage.trim() === '') {
          return false; // Empty or invalid image URL
        }
        
        // Check if image URL is a placeholder (unsplash.com or other placeholder services)
        const isPlaceholder = firstImage.includes('unsplash.com') ||
          firstImage.includes('placeholder') ||
          firstImage.includes('via.placeholder.com') ||
          firstImage.includes('dummyimage.com') ||
          firstImage.includes('placehold.it') ||
          firstImage.includes('fakeimg.pl');
        
        if (isPlaceholder) {
          return false;
        }
        
        // Check if URL looks valid (starts with http:// or https://)
        const isValidUrl = firstImage.startsWith('http://') || firstImage.startsWith('https://');
        if (!isValidUrl) {
          return false;
        }
        
        // Area passed all checks
        return true;
      })
      .map(area => {
        const imageUrl = area.images && area.images.length > 0 ? area.images[0] : '';
        
        return {
          id: area.id,
          nameEn: area.nameEn,
          nameRu: area.nameRu,
          projectsCount: area.projectsCount?.total || 0,
          image: imageUrl,
          city: area.city?.nameEn || 'N/A',
          cityRu: area.city?.nameRu || 'N/A',
        };
      });

    const filteredOut = apiAreas.length - filteredAreas.length;
    console.log(`📊 Results:`);
    console.log(`   Total areas from API: ${apiAreas.length}`);
    console.log(`   Areas with valid images: ${filteredAreas.length}`);
    console.log(`   Areas filtered out: ${filteredOut}\n`);

    if (filteredAreas.length === 0) {
      console.log('❌ No areas with valid images found!');
      return [];
    }

    console.log('✅ Areas displayed on /areas page:\n');
    console.log('='.repeat(80));
    filteredAreas.forEach((area, index) => {
      console.log(`${index + 1}. ${area.nameEn} (${area.nameRu})`);
      console.log(`   ID: ${area.id}`);
      console.log(`   City: ${area.city} (${area.cityRu})`);
      console.log(`   Projects: ${area.projectsCount}`);
      console.log(`   Image: ${area.image.substring(0, 80)}...`);
      console.log('');
    });
    console.log('='.repeat(80));
    console.log(`\nTotal: ${filteredAreas.length} areas\n`);

    // Also create a simple list
    console.log('📋 Simple list (names only):');
    filteredAreas.forEach((area, index) => {
      console.log(`${index + 1}. ${area.nameEn}`);
    });

    return filteredAreas;
  } catch (error) {
    console.error('❌ Error fetching areas:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return [];
  }
}

// Run the script
getAreas()
  .then(areas => {
    if (areas.length === 0) {
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });

