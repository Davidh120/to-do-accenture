import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class IconPickerComponent {
  @Input() icons: string[] = [];
  @Input() selectedIcon = '';

  private readonly popoverCtrl = inject(PopoverController);

  selectIcon(icon: string) {
    this.popoverCtrl.dismiss(icon);
  }

  close() {
    this.popoverCtrl.dismiss();
  }
}
