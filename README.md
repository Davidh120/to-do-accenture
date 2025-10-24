# To-Do Accenture (Ionic Angular)

Aplicación To-Do con categorías, Firebase y Feature Flags (Remote Config), optimizada para rendimiento y preparada para construir APK/IPA con Capacitor.

## Requisitos
- Node 22+
- Java 17 (para Android) + Android SDK (Android Studio)
- Xcode (para iOS, solo macOS)
- Cuenta de Firebase
- Ionic CLI (npm install -g @ionic/cli)

## Configuración de entorno (.env)
Crea un archivo `.env` en la raíz (usa `.env.example` como guía):

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
```

Generación automática de environments:
- Se ejecuta antes de `start` y `build` mediante `scripts/set-env.ts`.
- Los archivos generados están ignorados en Git: `src/environments/environment*.ts`.

## Ejecución local
- Opción A (recomendada):
  - `npm start` (genera environments y levanta la app)
- Opción B (Ionic CLI):
  - `npm run prestart`
  - `ionic serve`

## Firebase y Remote Config
- Inicialización con AngularFire v20 (modular): Firestore, Auth, Storage, Remote Config y Analytics.
- Servicio `FeatureFlagService` usa Remote Config para cargar banderas en `APP_INITIALIZER`.
- Parámetro de ejemplo: `enableCategoryManager` (boolean). Controla la visibilidad del botón de gestionar categorías.
- Desarrollo: Remote Config configurado con `minimumFetchIntervalMillis = 0` para ver cambios al reiniciar.

### Probar feature flag
1. En Firebase Console > Remote Config crea o edita `enableCategoryManager`.
2. Publica los cambios.
3. Reinicia la app o recarga la app web:
   - `npm start`
4. Resultado:
   - `true`: se muestra el botón para abrir el gestor de categorías.
   - `false`: se oculta el botón. El filtrado y asignación de categorías siguen funcionando.

## Optimización de rendimiento aplicada
- `ChangeDetectionStrategy.OnPush` en componentes críticos.
- Lazy loading de `TodoList` con `loadComponent`.
- `trackBy` en `*ngFor` para tareas y categorías.
- Almacenamiento local vía `@ionic/storage-angular`.

## Capacitor: Android/iOS
Instala Capacitor y configura plataformas (una vez):

```
npm i @capacitor/core @capacitor/cli --save
npx cap sync
npx cap add android
npx cap add ios
```

Build de la web y sincronización con plataformas:
```
npm run build:prod
npx cap sync
```

Abrir proyectos nativos:
```
npx cap open android
npx cap open ios
```

Generar binarios:
- Android: desde Android Studio, Build > Build Bundle(s) / APK(s) > Build APK(s)
- iOS: desde Xcode, Product > Archive, luego distribuye IPA

## Scripts útiles
- `npm run build:prod` → `ionic build --prod`
- `npm run cap:sync` → `npx cap sync`
- `npm run cap:add:android` / `npm run cap:add:ios`
- `npm run cap:open:android` / `npm run cap:open:ios`

## Notas
- `.env`, `src/environments/environment*.ts` están en `.gitignore`.
