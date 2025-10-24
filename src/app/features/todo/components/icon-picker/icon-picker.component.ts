import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class IconPickerComponent implements OnInit {
  @Input() icons: string[] = [];
  @Input() selectedIcon: string = '';

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  selectIcon(icon: string) {
    this.popoverCtrl.dismiss(icon);
  }

  close() {
    this.popoverCtrl.dismiss();
  }
}
