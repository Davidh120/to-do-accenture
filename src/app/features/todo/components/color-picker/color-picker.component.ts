import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ColorPickerComponent {
  @Input() colors: string[] = [];
  @Input() selectedColor = '';

  private readonly popoverCtrl = inject(PopoverController);

  selectColor(color: string) {
    this.popoverCtrl.dismiss(color);
  }

  close() {
    this.popoverCtrl.dismiss();
  }
}
