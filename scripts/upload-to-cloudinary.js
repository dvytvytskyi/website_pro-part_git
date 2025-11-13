const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgv0rxd60',
  api_key: '141613625537469',
  api_secret: 'GgziMAcVfQvOGD44Yj0OlNqitPg'
});

async function uploadFile(filePath, publicId, resourceType = 'auto') {
  try {
    console.log(`📤 Завантаження файлу: ${filePath}`);
    console.log(`   Public ID: ${publicId}`);
    console.log(`   Resource Type: ${resourceType}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    });
    
    console.log(`✅ Файл успішно завантажено!`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    
    return result;
  } catch (error) {
    console.error('❌ Помилка завантаження:', error.message);
    throw error;
  }
}

// Get file path and public ID from command line arguments
const filePath = process.argv[2];
const publicId = process.argv[3] || path.basename(filePath, path.extname(filePath));
const resourceType = process.argv[4] || 'auto';

if (!filePath) {
  console.error('❌ Використання: node upload-to-cloudinary.js <file-path> [public-id] [resource-type]');
  console.error('   Приклад: node upload-to-cloudinary.js public/dubai-hero-video-2.mp4 dubai-hero-video-2 video');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ Файл не знайдено: ${filePath}`);
  process.exit(1);
}

// Upload file
uploadFile(filePath, publicId, resourceType)
  .then((result) => {
    console.log('\n📋 Результат:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Помилка:', error);
    process.exit(1);
  });

