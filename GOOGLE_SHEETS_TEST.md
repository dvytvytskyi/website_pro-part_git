# Тестування інтеграції з Google Sheets

## Локальне тестування

Для локального тестування створіть файл `.env.local` у корені проекту:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbz2IYI0VYkkRb0vHassxdL9lvw8HxWFCaK_vWChgHtDDsbChOeypbBlL4xuGX3zOolq3A/exec
```

Потім запустіть проект:
```bash
npm run dev
```

## Перевірка роботи

1. Відкрийте сайт локально: `http://localhost:3000`
2. Заповніть будь-яку форму на сайті:
   - Форма на головній сторінці (ProjectImage)
   - Форма "Запланувати зустріч" (AboutHero)
   - Форма на сторінці Ghaf Woods
   - Форма на сторінці консалтингу
3. Перевірте ваш Google Sheet - має з'явитися новий рядок з даними

## Структура даних у Google Sheet

Кожна заявка буде записана з такими колонками:

| Timestamp | Form Type | Name | Email | Phone | Message | Additional Data |
|-----------|-----------|------|-------|-------|---------|-----------------|
| 2025-01-19 10:30:00 | project-image-contact | Іван Іванов | | +380501234567 | | {} |
| 2025-01-19 10:35:00 | schedule-meeting | Петро Петров | | +380509876543 | Хочу зустрітися | {"date":"2025-01-20","time":"14:00","specialist":"Artem Gerasimov"} |

## Типи форм

- `project-image-contact` - Форма на головній сторінці
- `schedule-meeting` - Форма запланувати зустріч
- `ghaf-woods-contact` - Основна форма на сторінці Ghaf Woods
- `ghaf-woods-register` - Модальна форма реєстрації інтересу
- `ghaf-woods-payment-plan` - Модальна форма завантаження плану оплати
- `ghaf-woods-brochure` - Модальна форма завантаження брошури
- `consulting-contact` - Форма на сторінці консалтингу

## Усунення проблем

Якщо дані не з'являються у Google Sheet:

1. Перевірте, чи правильно скопійований URL у `.env.local`
2. Перевірте консоль браузера (F12) на наявність помилок
3. Перевірте, чи правильно налаштований Google Apps Script:
   - Код має бути `doPost` функція
   - Deploy має бути як "Web app"
   - "Who has access" має бути "Anyone"
4. Перевірте логи на сервері (якщо вже задеплоєно)

