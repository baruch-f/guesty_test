# TODOS

Формат задачи:
- [ ] Title — Iteration N — Owner — Status
  DoD: <Definition of Done>
  Notes: <короткие примечания>

---

ITERATION 0 — Repo skeleton and dev script
- [ ] Init monorepo (npm workspaces), folders: packages/{host,remote-ui,remote-i18n,shared}
  DoD: repo содержит package.json с workspaces, пустые package.json в пакетах, скрипт "dev:all" запускает два dev-сервера (host, remote-ui) по отдельным портам.
  Notes: использовать npm, не pnpm.

ITERATION 1 — Minimal host + remote basic connection
- [ ] Host imports exposed component from remote-ui via Module Federation
  DoD: host рендерит компонент из remote-ui; в браузере виден UI элемент; консоль сборки без критичных ошибок.

ITERATION 2 — Shared React as singleton and dedupe
- [ ] Configure shared deps: react, react-dom singletons; strictVersion handling
  DoD: host и remote используют одну копию React; проверка: в консоли нет дублирования react, hooks работают корректно.

ITERATION 3 — Hot reload and dev UX
- [ ] Enable HMR for host and remote components when running dev
  DoD: изменения в remote UI видны в host без полного перезагрузки страницы.

ITERATION 4 — Shared utilities and types (shared package)
- [ ] Move common utils/types to packages/shared and use from host+remote
  DoD: типы/утилиты импортируются из shared; нет дублирования кода; сборка проходит.

ITERATION 5 — Tailwind integration (basic)
- [ ] Add Tailwind in shared config; integrate into host and remote builds
  DoD: tailwind классы работают в host и в remote компоненте, классы применяются корректно.

ITERATION 6 — Tailwind CSS sharing strategies and versioning
- [ ] Implement chosen strategy for sharing tailwind (shared package + postcss pipeline) and add versioning policy
  DoD: стили не дублируются; при обновлении версии shared/tailwind контролируемый rollout; пример bump процесса в docs.

ITERATION 7 — PostCSS pipeline and avoiding duplicate CSS
- [ ] Configure PostCSS in shared and ensure single CSS output in host
  DoD: в финальной сборке нет дублированных utility-классов; bundle size оптимизирован.

ITERATION 8 — Module Federation CSS isolation options
- [ ] Evaluate and implement CSS isolation (scoped CSS, CSS Modules, or CSS-in-JS) where необходимо
  DoD: конфликтов глобальных стилей нет; демонстрация кейса с двумя remotes.

ITERATION 9 — Dynamic remotes and discovery
- [ ] Support dynamic remote loading (runtime URL resolution)
  DoD: host может подгружать remote по URL, заданному в рантайме; fallback при недоступности.

ITERATION 10 — Remote-i18n: extraction pipeline (collector)
- [ ] Implement string collector in remote-i18n to gather strings from remotes/host
  DoD: все собранные строки сохраняются локально в JSON; пример payload для переводчика сформирован.

ITERATION 11 — Translation service integration
- [ ] Implement service (mock or real) that accepts batch of strings and returns translated JSON
  DoD: pipeline end-to-end: collector → translator → translated JSON.

ITERATION 12 — Save translations to S3
- [ ] Upload translated JSON to S3 with versioned keys (e.g. /translations/{lang}/{version}.json)
  DoD: файлы доступны по URL; пример public URL через CloudFront.

ITERATION 13 — CloudFront fronting and caching
- [ ] Configure CloudFront distribution in front of S3 with proper cache headers and invalidation process
  DoD: translations отдаются через CloudFront; invalidation documented.

ITERATION 14 — Client-side translation loading
- [ ] Implement loader in host/remote to fetch translations from CloudFront/S3 and initialize i18n instance
  DoD: переключение языка подгружает JSON с S3/CloudFront; UI переведён.

ITERATION 15 — Translation caching strategies on client
- [ ] Implement client cache: localStorage/IndexedDB + version check + stale-while-revalidate
  DoD: при переключении языка количество сетевых запросов минимально; проверка TTL/versioning работает.

ITERATION 16 — ETag/Version checks and conditional requests
- [ ] Add ETag/version check to avoid full downloads when no changes
  DoD: client использует conditional GET и экономит трафик.

ITERATION 17 — Service worker caching (optional)
- [ ] Add service worker to cache translations and assets with SW strategy
  DoD: offline fallback for translations; SW обновляет cached translations on version change.

ITERATION 18 — CI build + smoke tests for host and remotes
- [ ] GitHub Actions (or equivalent) build pipeline: install, build host+remotes, smoke test remote exposed component load in headless browser
  DoD: PRs запускают CI; failed build blocks merge.

ITERATION 19 — Automated deployment to staging S3 + CloudFront invalidation
- [ ] On main branch merge: build artifacts → upload to S3 buckets; trigger CloudFront invalidation for translations
  DoD: staging updated automatically; translations updated; docs describe secret handling.

ITERATION 20 — Versioning strategy for remotes and shared libs
- [ ] Decide and implement versioning for remotes and shared (semver policy, compatibility rules)
  DoD: documented strategy; example bump flow.

ITERATION 21 — Multiple React versions support test
- [ ] Create test case where one remote requires older react version; evaluate isolation strategies
  DoD: solution documented (shadowing, iframe, separate build) and proof-of-concept for chosen approach.

ITERATION 22 — Error boundaries and resilience for remotes
- [ ] Implement robust error handling / boundary for remote load failures
  DoD: host gracefully renders fallback; retry/backoff logic present.

ITERATION 23 — Performance profiling and bundle splits
- [ ] Analyze bundle sizes, split commonly shared libs to reduce duplication, tune Module Federation for runtime performance
  DoD: report with recommendations and measurable bundle improvements.

ITERATION 24 — Security review for S3/CloudFront and remote loading
- [ ] Audit public exposure, signed URLs, CORS, CSP for dynamic remote scripts
  DoD: documented mitigations and config changes applied.

ITERATION 25 — Edge cases: NG failures, network flaps, partial translations
- [ ] Simulate failures and verify app behavior: partial translations, network loss, corrupted remoteEntry
  DoD: app recovers/regresses gracefully; documented fixes.

ITERATION 26 — Final polish: docs, interview prep, recorded demo
- [ ] Summarize decisions in docs/, prepare 10 interview questions with model answers, record short demo (screen) of app running through flows
  DoD: repo ready for demonstration; checklist complete.

---

Progress tracking:
- Use progress.md для daily log
- Тегируй коммиты iter-N-done после каждой итерации
- Если задача блокирована >8 часов — пометить Blocked и создать Issue с логами
