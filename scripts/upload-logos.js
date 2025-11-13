const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgv0rxd60',
  api_key: '141613625537469',
  api_secret: 'GgziMAcVfQvOGD44Yj0OlNqitPg'
});

async function uploadLogo(filePath, publicId) {
  try {
    console.log(`📤 Завантаження: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Файл не знайдено: ${filePath}`);
      return null;
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: 'image',
      overwrite: true,
    });
    
    console.log(`✅ Завантажено: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Помилка завантаження ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Початок завантаження логотипів...\n');
  
  const logos = [
    { path: 'public/logo color.png', id: 'logo-color' },
    { path: 'public/logo white.png', id: 'logo-white' }
  ];
  
  const results = [];
  
  for (const logo of logos) {
    const result = await uploadLogo(logo.path, logo.id);
    if (result) {
      results.push({
        name: logo.id,
        url: result.secure_url
      });
    }
    console.log('');
  }
  
  console.log('📋 Результати:');
  results.forEach(r => {
    console.log(`   ${r.name}: ${r.url}`);
  });
  
  if (results.length === 2) {
    console.log('\n✅ Всі логотипи успішно завантажено!');
  } else {
    console.log('\n⚠️ Деякі логотипи не завантажено');
  }
}

main().catch(console.error);

