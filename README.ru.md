# Микрофронтенд-архитектура с Module Federation

**[🇺🇸 English](./README.md)** | **[🇷🇺 Русский](./README.ru.md)**

## Содержание

- [Обзор](#обзор)
- [Архитектурные решения](#архитектурные-решения)
  - [1. Архитектура микрофронтендов](#1-архитектура-микрофронтендов)
  - [2. Интеграция Tailwind CSS](#2-интеграция-tailwind-css)
  - [3. Система интернационализации (i18n)](#3-система-интернационализации-i18n)
- [Структура проекта](#структура-проекта)
- [Быстрый старт](#быстрый-старт)
- [Деплой](#деплой)

---

## Обзор

Этот проект демонстрирует production-ready микрофронтенд-архитектуру с использованием **Webpack Module Federation**. Система включает:

- **Host-приложение** - Главное shell-приложение
- **Remote-микрофронтенды** - Независимые модули функционала (Users, Statistics)
- **Shared UI библиотека** - Переиспользуемые компоненты с Tailwind CSS
- **Система интернационализации** - Ленивая загрузка переводов с контролем версий и кешированием

**Технологический стек:**
- React 18.3.1 + TypeScript 5.3.3
- Webpack 5 Module Federation
- Tailwind CSS 3.4.1
- i18next 23.10.1
- AWS S3 + CloudFront

---

## Архитектурные решения

### 1. Архитектура микрофронтендов

#### Задача

Построить масштабируемую архитектуру, где:
- Несколько команд могут работать независимо над разными фичами
- Микрофронтенды можно деплоить независимо без влияния на другие
- Общий код (React, i18next) должен загружаться только один раз
- Каждый микрофронтенд должен быть деплоируем в production отдельно

#### Решение

**Webpack Module Federation** со следующей структурой:

```
┌─────────────────────────────────────────┐
│           HOST (Shell App)              │
│  - Роутинг                              │
│  - Инициализация i18n                   │
│  - Layout & Навигация                   │
└─────────┬───────────────────────────────┘
          │
          ├─► Remote: Модуль пользователей
          │   (деплоится независимо)
          │
          ├─► Remote: Модуль статистики
          │   (деплоится независимо)
          │
          └─► Shared UI библиотека
              (Button, Card + Tailwind CSS)
```

**Ключевая конфигурация:**

**Host экспортирует:**
```javascript
exposes: {
  './i18n': './src/i18n/index.ts',
  './useRemoteTranslations': './src/hooks/useRemoteTranslations.ts'
}
```

**Remotes импортируют из host:**
```javascript
remotes: {
  host: 'host@https://cdn.example.com/host/remoteEntry.js'
}
```

**Shared зависимости (singleton):**
```javascript
shared: {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
  i18next: { singleton: true, eager: true },
  'react-i18next': { singleton: true, eager: true }
}
```

**Преимущества:**
- ✅ Каждый remote может быть задеплоен независимо
- ✅ React загружается только один раз (singleton)
- ✅ Нет дублирования кода
- ✅ Типобезопасность с TypeScript
---

### 2. Интеграция Tailwind CSS

#### Задача

Несколько микрофронтендов должны:
- Использовать единую дизайн-систему (цвета, отступы, компоненты)
- Избегать конфликтов CSS и дублирования стилей
- Загружать Tailwind CSS только один раз
- Каждый микрофронтенд должен использовать Tailwind классы без дополнительной настройки

#### Решение

**Tailwind CSS компилируется один раз на этапе сборки в Shared пакете**

> **Ключевой принцип**: Tailwind CSS компилируется **один раз при деплое**, сканируя все микрофронтенды. Полученный CSS bundle загружается один раз в host, и все микрофронтенды используют эти же предкомпилированные стили.

```
packages/shared/
├── tailwind.config.js      # Сканирует ВСЕ микрофронтенды
├── postcss.config.js       # Конфигурация PostCSS
├── src/
│   ├── styles.css          # @tailwind директивы
│   └── components/
│       ├── Button.tsx      # Shared UI компоненты
│       └── Card.tsx
└── dist/
    └── styles.css          # ⚡ Единый скомпилированный CSS bundle
```

**Конфигурация:**

```javascript
// shared/tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // ⚡ Сканируем ВСЕ пакеты для сбора Tailwind классов
    '../host/src/**/*.{js,jsx,ts,tsx}',
    '../remote-users/src/**/*.{js,jsx,ts,tsx}',
    '../remote-statistic/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
      }
    }
  }
}
```

**Использование в микрофронтендах:**

```typescript
// Импортируем один раз в host
import '@guesty/shared/dist/styles.css';

// Импортируем компоненты с Tailwind классами
import { Button, Card } from '@guesty/shared/dist';

// Используем Tailwind классы напрямую - никакой дополнительной настройки
<div className="flex items-center space-x-4">
  <Button variant="primary">Нажми меня</Button>
</div>
```

**Процесс сборки:**

1. **Shared собирается первым**: `npm run build:shared`
   - Tailwind сканирует все микрофронтенды на используемые классы
   - Компилирует → `dist/styles.css` (единый bundle с только используемыми классами)
   
2. **Host импортирует скомпилированный CSS**: Единый CSS bundle загружается один раз

3. **Remotes используют классы**: Дополнительный CSS не нужен, нет overhead'а в runtime

**Преимущества:**
- ✅ **Единый CSS bundle** - Нет дублирования между микрофронтендами
- ✅ **Компиляция один раз** - Tailwind запускается один раз при сборке, а не для каждого микрофронтенда
- ✅ **Консистентная дизайн-система** - Все микрофронтенды используют одну тему
- ✅ **Tree-shaking** - Включены только используемые Tailwind классы
- ✅ **Нет конфликтов CSS в runtime** - Классы предкомпилированы и детерминированы
- ✅ **Нулевая конфигурация** - Микрофронтенды просто используют классы, настройка не нужна

---

### 3. Система интернационализации (i18n)

#### Задача

Требования для 200+ микрофронтендов:
1. **Ленивая загрузка**: Загружать переводы только когда нужно
2. **Контроль версий**: Кешировать переводы, но инвалидировать при обновлении
3. **Производительность**: Минимизировать размер bundle и API-запросы
4. **Независимые обновления**: Обновлять переводы без передеплоя приложений
5. **Извлечение на этапе сборки**: Автоматически извлекать ключи переводов

#### Решение

**Гибридная i18n архитектура с ленивой загрузкой + контролем версий**

```
┌──────────────────────────────────────────────────┐
│  Этап сборки: Извлечение и подготовка переводов │
│  scripts/extract-translations.js                 │
│  scripts/translate-and-prepare.js                │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  S3/CloudFront: Хранение переводов               │
│  /manifest.json          (кеш: 1 час)            │
│  /host/v0.1.0/en.json    (кеш: навсегда)         │
│  /remote-users/v0.0.0/en.json                    │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  Runtime: TranslationManager (Host)              │
│  - Проверяет manifest на версии                  │
│  - Загружает namespace по требованию             │
│  - Кеширует в localStorage с ключом версии       │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  Микрофронтенды: useRemoteTranslations Hook      │
│  const loaded = useRemoteTranslations('users');  │
└──────────────────────────────────────────────────┘
```

**Компоненты архитектуры:**

**1. Translation Manager (Host)**

```typescript
// packages/host/src/i18n/translationManager.ts
class TranslationManager {
  async loadNamespace(namespace: string, lang: string) {
    // 1. Загружаем manifest (кеш 1 час)
    const manifest = await this.loadManifest();
    
    // 2. Проверяем localStorage кеш с версией
    const cacheKey = `i18n:${namespace}:${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached && cached.version === manifest[namespace].version) {
      return cached.data; // Попадание в кеш
    }
    
    // 3. Загружаем с CDN (версионный путь)
    const url = `${CDN}/namespace/v${version}/${lang}.json`;
    const translations = await fetch(url).then(r => r.json());
    
    // 4. Добавляем в i18n и кешируем
    i18n.addResourceBundle(lang, namespace, translations);
    localStorage.setItem(cacheKey, { version, data: translations });
  }
}
```

**2. React хук для ленивой загрузки**

```typescript
// packages/host/src/hooks/useRemoteTranslations.ts
export function useRemoteTranslations(namespace: string): boolean {
  const { i18n } = useTranslation(namespace);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Загружаем при монтировании
    translationManager.loadNamespace(namespace, i18n.language)
      .then(() => setLoaded(true));
    
    // Слушаем смену языка
    const handler = (lng: string) => {
      setLoaded(false); // Показываем loading
      translationManager.loadNamespace(namespace, lng)
        .then(() => setLoaded(true));
    };
    i18n.on('languageChanged', handler);
    
    return () => i18n.off('languageChanged', handler);
  }, [namespace]);

  return loaded;
}
```

**3. Использование в микрофронтендах**

```typescript
// packages/remote-users/src/UsersApp.tsx
import { useRemoteTranslations } from 'host/useRemoteTranslations';

const UsersApp = () => {
  const { t } = useTranslation('remote-users');
  const loaded = useRemoteTranslations('remote-users');
  
  if (!loaded) return <LoadingSpinner />;
  
  return <div>{t('users.page_title')}</div>;
};
```

**4. Извлечение на этапе сборки**

```javascript
// scripts/extract-translations.js
// Использует Babel AST для поиска всех вызовов t('key')
traverse(ast, {
  CallExpression(path) {
    if (isTranslationCall(path)) {
      const key = path.node.arguments[0].value;
      keys.add(key);
    }
  }
});
```

**5. Генерация манифеста**

```javascript
// scripts/translate-and-prepare.js
{
  "host": {
    "version": "0.1.0",        // из package.json
    "size": 5407,
    "keyCount": 27,
    "priority": "critical"
  },
  "remote-users": {
    "version": "0.0.0",
    "size": 1091,
    "keyCount": 6,
    "priority": "low"
  }
}
```

**Структура файлов переводов:**

```
locales-dist/
├── manifest.json                    # Реестр версий
├── host/
│   └── v0.1.0/
│       ├── en.json
│       ├── he.json
│       └── ru.json
├── remote-users/
│   └── v0.0.0/
│       ├── en.json
│       ├── he.json
│       └── ru.json
```

**Стратегия кеширования:**

| Тип файла | Cache-Control | Почему |
|-----------|---------------|--------|
| `manifest.json` | `max-age=3600` | Проверка новых версий каждый час |
| `/host/v0.1.0/en.json` | `max-age=31536000, immutable` | Версия в пути = никогда не меняется |
| localStorage | на основе версии | Инвалидация при несовпадении версии |

**Процесс деплоя:**

```bash
# 1. Извлекаем ключи переводов
npm run i18n:extract

# 2. Обновляем переводы и версию в package.json
# (вручную или через автоматический сервис переводов)

# 3. Подготавливаем переводы с новой версией
npm run i18n:translate
# Создаёт: /host/v0.2.0/en.json (новая версия)

# 4. Деплоим в S3
npm run deploy:translations
# Старая версия (v0.1.0) остаётся доступна
# Новые пользователи получают v0.2.0 из manifest
```

**Преимущества:**

- ✅ **Ленивая загрузка**: Переводы загружаются только при обращении к микрофронтенду
- ✅ **Контроль версий**: localStorage кеш автоматически инвалидируется при изменении версии
- ✅ **Производительность**: 
  - Immutable кеш для версионных файлов (1 год)
  - Manifest кешируется 1 час (маленький файл)
  - Нет дублирования переводов в bundle'ах
- ✅ **Независимые обновления**: Деплой переводов без передеплоя приложений
- ✅ **Масштабируемость**: Поддержка 200+ микрофронтендов
  - Каждый namespace загружается независимо
  - Возможна параллельная загрузка
- ✅ **Типобезопасность**: TypeScript типы для всех ключей переводов
- ✅ **Developer Experience**:
  - Автоматическое извлечение ключей
  - Плоская структура ключей: `'users.page_title'`
  - Одна команда: `npm run i18n:translate`

---

## Структура проекта

```
guesty_test/
├── packages/
│   ├── host/                    # Shell-приложение
│   │   ├── src/
│   │   │   ├── i18n/
│   │   │   │   ├── index.ts                # Инициализация i18n
│   │   │   │   └── translationManager.ts   # Логика ленивой загрузки
│   │   │   ├── hooks/
│   │   │   │   └── useRemoteTranslations.ts
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx              # Переключатель языка
│   │   │   │   └── Home.tsx
│   │   │   └── App.tsx
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── he.json
│   │   │   └── ru.json
│   │   └── webpack.config.js
│   │
│   ├── remote-users/            # Микрофронтенд пользователей
│   │   ├── src/
│   │   │   └── UsersApp.tsx
│   │   ├── locales/
│   │   └── webpack.config.js
│   │
│   ├── remote-statistic/        # Микрофронтенд статистики
│   │   ├── src/
│   │   │   └── StatisticApp.tsx
│   │   ├── locales/
│   │   └── webpack.config.js
│   │
│   └── shared/                  # Shared UI библиотека
│       ├── src/
│       │   ├── components/
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   └── LoadingSpinner.tsx
│       │   └── styles.css       # Tailwind директивы
│       ├── tailwind.config.js
│       └── postcss.config.js
│
├── scripts/
│   ├── extract-translations.js           # Извлечение ключей через AST
│   ├── translate-and-prepare.js          # Генерация manifest
│   ├── deploy-to-s3.sh                   # Деплой приложения
│   └── deploy-translations-to-s3.sh      # Деплой переводов
│
├── locales-dist/                # Сгенерированные переводы
│   ├── manifest.json
│   ├── host/v0.1.0/
│   ├── remote-users/v0.0.0/
│   └── remote-statistic/v0.0.0/
│
└── package.json                 # Workspace скрипты
```

---

## Быстрый старт

### Требования

- Node.js 18+
- npm 9+

### Установка

```bash
# Установить зависимости
npm install

# Собрать shared библиотеку
npm run build:shared

# Подготовить переводы
npm run i18n:translate
```

### Разработка

```bash
# Запустить все микрофронтенды одновременно
npm run dev

# Или запустить по отдельности:
npm run dev:host           # http://localhost:3000
npm run dev:remote-users   # http://localhost:3001
npm run dev:remote-statistic # http://localhost:3002
```

### Сборка

```bash
# Собрать все пакеты
npm run build

# Или собрать по отдельности:
npm run build:host
npm run build:remote-users
npm run build:remote-statistic
```

---

## Деплой

### Настройка AWS Credentials

```bash
# Настроить AWS CLI
aws configure
```

### Переменные окружения

Создать `.env` файл:

```bash
NODE_ENV=production
CLOUDFRONT_DOMAIN=123456.cloudfront.net
CLOUDFRONT_ID=123456
BUCKET_NAME=your_bucket_name
```

### Деплой переводов

```bash
# Извлечь ключи → подготовить переводы → загрузить в S3
npm run i18n:extract
npm run i18n:translate
npm run deploy:translations
```

### Деплой приложения

```bash
# Задеплоить все микрофронтенды
npm run deploy:all

# Или задеплоить по отдельности (выборочная инвалидация):
npm run deploy:host
npm run deploy:remote-users
npm run deploy:remote-statistic
```

**Преимущества выборочного деплоя:**
- Инвалидируется только изменённый микрофронтенд
- Остальные микрофронтенды остаются в кеше
- Более быстрый деплой
- Нет влияния на пользователей неизменённых модулей