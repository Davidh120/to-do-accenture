import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule,
    IonicStorageModule.forRoot()
  ],
  exports: [IonicModule]
})
export class CoreModule { }
