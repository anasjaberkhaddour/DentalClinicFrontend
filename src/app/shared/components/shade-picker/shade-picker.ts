import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToothShade {
  code: string;
  color: string;
  group: string;
}

@Component({
  selector: 'app-shade-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shade-picker.html',
  styleUrl: './shade-picker.scss'
})
export class ShadePicker {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  open = signal(false);

  shades: ToothShade[] = [
    { code: 'A1', color: '#EAE0CC', group: 'A' },
    { code: 'A2', color: '#DFCDAC', group: 'A' },
    { code: 'A3', color: '#D7BC96', group: 'A' },
    { code: 'A3.5', color: '#C9A87D', group: 'A' },
    { code: 'A4', color: '#B5946F', group: 'A' },
    { code: 'B1', color: '#F1EAD8', group: 'B' },
    { code: 'B2', color: '#E8DBC0', group: 'B' },
    { code: 'B3', color: '#DBC69E', group: 'B' },
    { code: 'B4', color: '#C9B089', group: 'B' },
    { code: 'C1', color: '#E0D3BC', group: 'C' },
    { code: 'C2', color: '#CBB89A', group: 'C' },
    { code: 'C3', color: '#B59F7A', group: 'C' },
    { code: 'C4', color: '#9A8464', group: 'C' },
    { code: 'D2', color: '#DDCFB8', group: 'D' },
    { code: 'D3', color: '#C7B599', group: 'D' },
    { code: 'D4', color: '#AE9575', group: 'D' },
  ];

  groups = ['A', 'B', 'C', 'D'];

  getShadesByGroup(group: string): ToothShade[] {
    return this.shades.filter(s => s.group === group);
  }

  getSelectedShade(): ToothShade | undefined {
    return this.shades.find(s => s.code === this.value);
  }

  toggle(): void {
    this.open.update(v => !v);
  }

  select(shade: ToothShade): void {
    this.value = shade.code;
    this.valueChange.emit(shade.code);
    this.open.set(false);
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value = '';
    this.valueChange.emit('');
  }

  close(): void {
    this.open.set(false);
  }
}