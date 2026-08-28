# Прогрес проєкту — сайт психолога Валентини Сваткової

Останнє оновлення: 28.08.2026

## 1. Що зроблено

### Архітектура (оновлено 28.08.2026)
Сайт перебудовано з плоского HTML на **Eleventy (11ty) + Decap CMS**, щоб можна було редагувати тексти й публікувати статті блогу через веб-форму на `/admin`, без відкриття коду — за вашим запитом у файлі `netlify autorisation.md`. Вихід збірки — усе одно чистий статичний HTML/CSS/JS (`_site/`), без фреймворків на фронті.

```
package.json, eleventy.config.js   — конфігурація Eleventy
content/
  pages/            — 6 сторінок, редагованих через CMS (home, pro-mene, tsiny,
                       onlayn-konsultatsii, dlya-ukraintsiv-za-kordonom, pryvasi-polisy)
  services/         — 8 файлів, по одному на напрямок послуг
  posts/            — статті блогу (поки 1)
src/
  _data/            — site.js, icons.js + читачі content/ (services.js, posts.js, pages.js)
  _includes/        — base.njk (шаблон сторінки), header.njk, footer.njk, macros.njk
  *.njk             — шаблони сторінок (Nunjucks)
  assets/           — CSS/JS/зображення (без змін від попередньої версії)
admin/
  index.html, config.yml   — Decap CMS
netlify.toml        — build = "npm run build", publish = "_site"
```

Команди: `npm install`, потім `npm run build` (збірка в `_site/`) або `npm start` (локальний сервер з live-reload).

**Розбіжності з чернеткою `config.yml` з файлу, які я свідомо виправив:**
- Backend змінено з `git-gateway` на `github` — Netlify більше не рекомендує Git Gateway для нових сайтів (перевірено). Деталі авторизації — розділ 2 нижче.
- До колекції "Сторінки" додав `onlayn-konsultatsii` і `dlya-ukraintsiv-za-kordonom` — вони були в переліку файлів у файлі-інструкції, але не потрапили у сам `config.yml` (очевидний недогляд).
- `kontakty`, `vidguky`, індекси `/posluhy/` і `/blog/`, `404` — свідомо НЕ підключені до CMS (форма запису, картки-агрегатори), лишились фіксованою розміткою — так само, як окреслено у вашому файлі.
- Додав поле "Пов'язані послуги" (`related`) і для самих сторінок послуг, не тільки для статей блогу — тепер на кожній сторінці послуги внизу є блок "Пов'язані послуги" з реальними посиланнями, які можна редагувати через CMS.

### Структура сайту (20 сторінок)
- `/` — головна
- `/pro-mene/` — про мене (з фото, реальний текст)
- `/posluhy/` — індекс послуг + 8 сторінок послуг (tryvoga-panichni-ataky, emotsiyne-vysnazhennya-stres, travmatychnyy-dosvid, kryzy-u-stosunkakh, rozluchennya-vtrata-zminy, rozlady-kharchovoi-povedinky, samootsinka-pryynyattya-sebe, adaptatsiya-pislya-pereizdu)
- `/onlayn-konsultatsii/`, `/dlya-ukraintsiv-za-kordonom/`, `/tsiny/`, `/vidguky/`
- `/blog/` — індекс + 1 приклад статті
- `/kontakty/`, `/pryvasi-polisy/`, `404.html`

### Дизайн
- Кольорова палітра з логотипу: шавлієво-зелений `#2d5c42`, dusty rose `#c99a94`, кремовий фон `#f7f1ec`, у CSS-змінних
- Fraunces (заголовки) + Marck Script (акценти) + Mulish (текст), Google Fonts з кириличним підмножиною
- Логотип: прозорий PNG для шапки/футера, повний набір фавіконок
- Заокруглені картки, лінійні іконки, адаптивна верстка, мобільне меню, акордеон FAQ

### Фото
- Реальне фото Валентини Сваткової на головній, `/pro-mene/` та в `Person` JSON-LD

### SEO
- Унікальні `<title>`/`<meta description>`, `canonical`, Open Graph, Twitter Card на кожній сторінці
- JSON-LD: `Person` + `ProfessionalService`, `FAQPage`, `BreadcrumbList`, `BlogPosting` — валідний
- `sitemap.xml` тепер генерується автоматично з колекцій Eleventy, `robots.txt`
- Семантичний HTML5, один `<h1>` на сторінку, `alt` на зображеннях, `loading="lazy"`

### Контент
- Блок «Я допомагаю при:» — редагується через CMS (домашня сторінка)
- Текст «Про мене» — повністю реальний, від першої особи, редагується через CMS
- Політика конфіденційності — реальний текст (не лорем іпсум), редагується через CMS
- Решта (сторінки послуг, блог) — лорем іпсум-заглушки, редагувати через `/admin` коли буде готовий текст

## 2. Деплой на Netlify — що зробити вам

Я підготував усе локально (git-репозиторій, Eleventy, CMS-конфіг), але GitHub і Netlify — ваші акаунти, тож ці кроки — ваші:

1. **Створіть порожній репозиторій на GitHub** (наприклад `psychologists-website`), без README/gitignore (вони вже є локально).
2. У теці проєкту виконайте:
   ```
   git remote add origin https://github.com/<ваш-логін>/psychologists-website.git
   git branch -M master
   git push -u origin master
   ```
3. **GitHub OAuth App** (для входу в `/admin` через GitHub, без Netlify Identity): GitHub → Settings → Developer settings → OAuth Apps → New OAuth App. Authorization callback URL: `https://api.netlify.com/auth/done`. Отримаєте Client ID і Client Secret.
4. **Netlify**: New site from Git → оберіть репозиторій. Build command і publish directory підхопляться самі з `netlify.toml`.
5. Netlify → Site configuration → Access control → OAuth → вставте Client ID/Secret з кроку 3, увімкніть GitHub.
6. У файлі `admin/config.yml` замініть рядок `repo: власник/psychologists-website` на реальний `<ваш-GitHub-логін>/psychologists-website`, закомітьте й запуште.
7. Відкрийте `https://ваш-сайт.netlify.app/admin`, увійдіть через GitHub — і зможете редагувати тексти й публікувати статті.

## 3. Що ще потрібно зробити

### Контент (найважливіше)
- [ ] Замінити лорем іпсум на реальні тексти сторінок послуг і блогу — тепер через `/admin`
- [ ] Написати реальні відгуки клієнтів (зараз заглушки, поки без CMS-колекції)
- [ ] Додати ще статті в блог через `/admin` (зараз лише 1 реальна стаття)
- [ ] Уточнити: чи називати Валентину всюди на сайті «клінічний психолог» замість просто «психолог» (зараз ця назва — лише в alt-текстах фото й title «Про мене»)

### Контакти та реквізити (зараз — заглушки, у `src/_data/site.js`)
- [ ] Реальний телефон, Telegram, Viber, email
- [ ] Реальна адреса кабінету в Черкасах + перевірити Google-карту на `/kontakty/`
- [ ] Реальні посилання на Instagram/Facebook
- [ ] Реальний домен (зараз `svatkova-psy.com.ua`) — після цього оновити й `admin/config.yml`, і `netlify.toml` не потребує змін

### Технічне
- [ ] Виконати розділ 2 вище (деплой на Netlify)
- [ ] Підключити форму запису на `/kontakty/` до Telegram-бота або email-сервісу (позначено `TODO` в `src/kontakty.njk`)
- [ ] Додати реальні фото для сторінок послуг/блогу через медіа-бібліотеку CMS
- [ ] Перевірити JSON-LD у Google Rich Results Test після визначення реального домену
- [ ] Вручну перевірити мобільне меню (гамбургер) у реальному браузері/на телефоні (технічна примітка нижче)
- [ ] Підключити аналітику (Google Analytics/Meta Pixel), якщо потрібно — доповнити Cookie-політику

### Публікація
- [ ] Зареєструвати сайт у Google Search Console, надіслати `sitemap.xml`
- [ ] Створити/оновити Google Business Profile для локального SEO по Черкасах
- [ ] Прив'язати реальний домен до Netlify (DNS-записи в панелі реєстратора)

## 4. Відома технічна примітка

Під час першої перевірки я витратив багато часу, намагаючись скриншотити мобільну версію шапки сайту (ширина ~390px) у headless-браузері цього середовища — кнопка-гамбургер послідовно не з'являлася на скриншотах, хоча desktop-версія рендериться ідеально. З'ясувалось, що це примха headless-рендерингу саме цього пісочничного середовища (відтворюється навіть на тривіальних тестових сторінках, не пов'язаних із кодом сайту), а не помилка коду — меню написане стандартним CSS/JS-патерном. Рекомендую самостійно перевірити мобільне меню на телефоні чи в DevTools браузера.
