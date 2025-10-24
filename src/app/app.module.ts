import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { TodoModule } from './features/todo/todo.module';
import { APP_INITIALIZER } from '@angular/core';
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideRemoteConfig, getRemoteConfig } from '@angular/fire/remote-config';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { FeatureFlagService } from './core/services/feature-flag.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    FormsModule,
    CoreModule,
    TodoModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    FeatureFlagService,
    ScreenTrackingService,
    UserTrackingService,
    provideFirebaseApp(() => initializeApp((environment as any).firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideRemoteConfig(() => {
      const rc = getRemoteConfig();
      rc.settings = { minimumFetchIntervalMillis: (environment as any).production ? 43200000 : 0 } as any;
      (rc as any).defaultConfig = {
        enableCategoryManager: true
      };
      return rc;
    }),
    provideAnalytics(() => getAnalytics()),
    {
      provide: APP_INITIALIZER,
      useFactory: (ff: FeatureFlagService) => () => ff.initialize(),
      deps: [FeatureFlagService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
