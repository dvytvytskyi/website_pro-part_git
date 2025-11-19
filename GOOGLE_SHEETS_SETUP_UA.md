# Налаштування Google Sheets для збору заявок (Українською)

## Покрокова інструкція для Google Apps Script Webhook

### Крок 1: Створіть Google Sheet
1. Відкрийте [Google Sheets](https://sheets.google.com)
2. Створіть новий файл (або використайте існуючий)
3. Запам'ятайте URL вашого файлу (він буде потрібен пізніше)

### Крок 2: Відкрийте Google Apps Script
1. У вашому Google Sheet натисніть **Tools** (Інструменти) → **Script Editor** (Редактор скриптів)
2. Відкриється нове вікно з редактором коду

### Крок 3: Вставте код
1. Видаліть весь код, який там є (за замовчуванням там `function myFunction() {}`)
2. Скопіюйте та вставте наступний код:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Якщо це перший рядок, додаємо заголовки
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Form Type',
      'Name',
      'Email',
      'Phone',
      'Message',
      'Additional Data'
    ]);
  }
  
  const data = JSON.parse(e.postData.contents);
  const row = [
    new Date(),
    data.formType || '',
    data.name || '',
    data.email || '',
    data.phone || '',
    data.message || '',
    JSON.stringify(data.additionalData || {})
  ];
  
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}
```

3. Натисніть **Save** (Зберегти) або `Ctrl+S` / `Cmd+S`

### Крок 4: Deploy як Web App
1. Натисніть кнопку **Deploy** (Ввести в дію) → **New deployment** (Нове розгортання)
2. Натисніть на іконку шестерні ⚙️ поруч з "Select type" і виберіть **Web app**
3. Заповніть поля:
   - **Description** (Опис): `Form submissions handler` (або будь-який опис)
   - **Execute as** (Виконувати як): **Me** (Я)
   - **Who has access** (Хто має доступ): **Anyone** (Будь-хто)
4. Натисніть **Deploy** (Ввести в дію)
5. **ВАЖЛИВО**: При першому деплої Google попросить авторизувати доступ
   - Натисніть **Authorize access** (Авторизувати доступ)
   - Виберіть свій Google акаунт
   - Натисніть **Advanced** (Розширено)
   - Натисніть **Go to [Project name] (unsafe)** (Перейти до [Назва проекту] (небезпечно))
   - Натисніть **Allow** (Дозволити)

### Крок 5: Скопіюйте Web App URL
1. Після успішного деплою ви побачите вікно з **Web App URL**
2. Скопіюйте цей URL (виглядає як: `https://script.google.com/macros/s/AKfycby.../exec`)
3. **Надайте мені цей URL** - я додам його до налаштувань сайту

### Крок 6: Оновіть змінні оточення
Після того, як ви надасте мені URL, я додам його до файлу `.env.local`:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/ВАШ_URL/exec
```

## Що буде в Google Sheet:

Після налаштування, кожна заявка з сайту буде автоматично додаватися у ваш Google Sheet з такими колонками:

| Timestamp | Form Type | Name | Email | Phone | Message | Additional Data |
|-----------|-----------|------|-------|-------|---------|-----------------|
| 2025-01-19 10:30:00 | project-image-contact | Іван Іванов | | +380501234567 | | {} |
| 2025-01-19 10:35:00 | schedule-meeting | Петро Петров | | +380509876543 | Хочу зустрітися | {"date":"2025-01-20","time":"14:00"} |

## Типи форм на сайті:

- `project-image-contact` - Форма на головній сторінці (ProjectImage)
- `schedule-meeting` - Форма запланувати зустріч (AboutHero)
- `ghaf-woods-contact` - Основна форма на сторінці Ghaf Woods
- `ghaf-woods-register` - Модальна форма реєстрації інтересу
- `ghaf-woods-payment-plan` - Модальна форма завантаження плану оплати
- `ghaf-woods-brochure` - Модальна форма завантаження брошури
- `consulting-contact` - Форма на сторінці консалтингу
- `investment-form` - Форма інвестицій
- І інші форми на сайті

## Перевірка роботи:

Після налаштування:
1. Заповніть будь-яку форму на сайті
2. Перевірте ваш Google Sheet - має з'явитися новий рядок з даними
3. Якщо дані не з'являються, перевірте:
   - Чи правильно скопійований URL
   - Чи правильно вставлений код у Script Editor
   - Чи правильно налаштований Deploy (Who has access = Anyone)

