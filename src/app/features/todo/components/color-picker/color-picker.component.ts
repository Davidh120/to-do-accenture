import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ColorPickerComponent implements OnInit {
  @Input() colors: string[] = [];
  @Input() selectedColor: string = '';

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  selectColor(color: string) {
    this.popoverCtrl.dismiss(color);
  }

  close() {
    this.popoverCtrl.dismiss();
  }
}
