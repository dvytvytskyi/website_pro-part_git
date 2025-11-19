# Налаштування Google Sheets для збору заявок

## Що потрібно надати:

### Варіант 1: Google Apps Script Webhook (Рекомендовано - найпростіший)

1. **Створіть Google Sheet** для збору заявок
2. **Створіть Google Apps Script:**
   - Відкрийте Google Sheet
   - Перейдіть до `Tools` > `Script Editor`
   - Вставте наступний код:

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

3. **Deploy як Web App:**
   - Натисніть `Deploy` > `New deployment`
   - Тип: `Web app`
   - Description: `Form submissions handler`
   - Execute as: `Me`
   - Who has access: `Anyone`
   - Натисніть `Deploy`
   - Скопіюйте `Web App URL`

4. **Надайте мені:**
   - Web App URL (виглядає як: `https://script.google.com/macros/s/.../exec`)

### Варіант 2: Google Sheets API (Service Account)

1. **Створіть Service Account:**
   - Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
   - Створіть новий проект або виберіть існуючий
   - Увімкніть Google Sheets API
   - Створіть Service Account
   - Створіть ключ (JSON) та завантажте файл

2. **Поділіться Google Sheet з Service Account:**
   - Відкрийте ваш Google Sheet
   - Натисніть `Share`
   - Додайте email Service Account (виглядає як `xxx@xxx.iam.gserviceaccount.com`)
   - Дайте права `Editor`

3. **Надайте мені:**
   - ID Google Sheet (з URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`)
   - JSON файл з credentials Service Account

## Після налаштування:

Додайте змінну оточення до `.env.local`:

```env
# Для Webhook методу:
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec

# АБО для API методу:
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
```

## Структура даних у Google Sheet:

Кожна заявка буде записана з наступними колонками:
- **Timestamp** - Дата та час відправлення
- **Form Type** - Тип форми (наприклад: `project-image-contact`, `schedule-meeting`, `ghaf-woods-contact`)
- **Name** - Ім'я клієнта
- **Email** - Email клієнта
- **Phone** - Телефон клієнта
- **Message** - Повідомлення
- **Additional Data** - Додаткові дані у форматі JSON

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

