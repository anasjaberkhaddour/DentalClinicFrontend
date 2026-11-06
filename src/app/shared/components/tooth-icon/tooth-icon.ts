import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getToothKind, getToothStatusColor, getToothStatusBorderColor } from '../../../core/models/tooth-chart.model';

@Component({
  selector: 'app-tooth-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      viewBox="0 0 60 90"
      class="w-full h-full transition-transform duration-200"
      [class.tooth-selected]="selected">

      <defs>
        <filter [attr.id]="'shadow-' + toothNumber" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15" />
        </filter>
        <linearGradient [attr.id]="'grad-' + toothNumber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="highlightColor" />
          <stop offset="100%" [attr.stop-color]="fillColor" />
        </linearGradient>
      </defs>

      @if (isUpper) {
        <g [attr.filter]="'url(#shadow-' + toothNumber + ')'">
          <!-- Root(s) -->
          <path
            [attr.d]="rootPath"
            [attr.fill]="'url(#grad-' + toothNumber + ')'"
            [attr.stroke]="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round" />

          <!-- Crown -->
          <path
            [attr.d]="crownPath"
            [attr.fill]="'url(#grad-' + toothNumber + ')'"
            [attr.stroke]="strokeColor"
            stroke-width="1.8"
            stroke-linejoin="round"
            stroke-linecap="round" />

          <!-- Crown highlight -->
          <path
            [attr.d]="highlightPath"
            fill="white"
            opacity="0.35"
            stroke="none" />

          <!-- Surface grooves -->
          @if (kind === 'molar' || kind === 'premolar') {
            <path
              [attr.d]="groovesPath"
              [attr.stroke]="strokeColor"
              stroke-width="0.8"
              fill="none"
              opacity="0.5"
              stroke-linecap="round" />
          }
        </g>
      } @else {
        <g [attr.filter]="'url(#shadow-' + toothNumber + ')'">
          <!-- Crown -->
          <path
            [attr.d]="crownPath"
            [attr.fill]="'url(#grad-' + toothNumber + ')'"
            [attr.stroke]="strokeColor"
            stroke-width="1.8"
            stroke-linejoin="round"
            stroke-linecap="round" />

          <!-- Root(s) -->
          <path
            [attr.d]="rootPath"
            [attr.fill]="'url(#grad-' + toothNumber + ')'"
            [attr.stroke]="strokeColor"
            stroke-width="1.5"
            stroke-linejoin="round" />

          <!-- Crown highlight -->
          <path
            [attr.d]="highlightPath"
            fill="white"
            opacity="0.35"
            stroke="none" />

          <!-- Surface grooves -->
          @if (kind === 'molar' || kind === 'premolar') {
            <path
              [attr.d]="groovesPath"
              [attr.stroke]="strokeColor"
              stroke-width="0.8"
              fill="none"
              opacity="0.5"
              stroke-linecap="round" />
          }
        </g>
      }

      <!-- Status marker: Missing -->
      @if (status === 2) {
        <path
          [attr.d]="crownPath"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.2"
          stroke-dasharray="3,3"
          opacity="0.7" />
      }

      <!-- Status marker: Needs Treatment -->
      @if (status === 10) {
        <circle cx="30" cy="45" r="4" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
      }

      <!-- Status marker: Restored Vital Pulp -->
      @if (status === 11) {
        <circle cx="30" cy="45" r="4" fill="#3b82f6" opacity="0.7" />
      }

      <!-- Status marker: Root Treated With Crown -->
      @if (status === 12) {
        <circle cx="30" cy="45" r="4" fill="#a78bfa" />
        <line x1="26" y1="45" x2="34" y2="45" stroke="white" stroke-width="1.2" />
      }

      <!-- Status marker: Root Treated Without Crown -->
      @if (status === 13) {
        <circle cx="30" cy="45" r="4" fill="#c4b5fd" />
        <line x1="28" y1="45" x2="32" y2="45" stroke="white" stroke-width="1" />
      }

      <!-- Status marker: Bridge Abutment (دمية) -->
      @if (status === 14) {
        <rect x="24" y="40" width="12" height="10" rx="2" fill="#f472b6" opacity="0.8" />
      }

      <!-- Status marker: Impacted -->
      @if (status === 4) {
        <circle cx="30" cy="45" r="5" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2" />
      }

      <!-- Status marker: Implant -->
      @if (status === 8) {
        <rect x="28" y="40" width="4" height="20" fill="#10b981" rx="1" />
        <line x1="26" y1="42" x2="34" y2="42" stroke="#047857" stroke-width="1" />
        <line x1="26" y1="46" x2="34" y2="46" stroke="#047857" stroke-width="1" />
        <line x1="26" y1="50" x2="34" y2="50" stroke="#047857" stroke-width="1" />
      }

      <!-- Status marker: Primary Unerupted -->
      @if (status === 15) {
        <circle cx="30" cy="45" r="4" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2,2" />
      }

      <!-- Status marker: Primary Treated Without Crown -->
      @if (status === 16) {
        <circle cx="30" cy="45" r="4" fill="#7dd3fc" />
      }

      <!-- Status marker: Primary Treated With Crown -->
      @if (status === 17) {
        <circle cx="30" cy="45" r="4" fill="#c084fc" />
        <line x1="27" y1="45" x2="33" y2="45" stroke="white" stroke-width="1" />
      }
    </svg>
  `,
  styles: [`
    .tooth-selected {
      transform: scale(1.15);
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
    }
  `]
})
export class ToothIcon {
  @Input() toothNumber!: number;
  @Input() status: number = 1;
  @Input() selected: boolean = false;

  get isPrimary(): boolean {
    const t = Math.floor(this.toothNumber / 10);
    return t === 5 || t === 6 || t === 7 || t === 8;
  }

  get isUpper(): boolean {
    const t = Math.floor(this.toothNumber / 10);
    return t === 1 || t === 2 || t === 5 || t === 6;
  }

  get kind() {
    return getToothKind(this.toothNumber);
  }

  get fillColor(): string {
    return getToothStatusColor(this.status);
  }

  get highlightColor(): string {
    const c = this.fillColor;
    if (c === '#ffffff') return '#f8fafc';
    return c;
  }

  get strokeColor(): string {
    return getToothStatusBorderColor(this.status);
  }

  // ============ Crown Paths ============

  get crownPath(): string {
    if (this.isPrimary) {
      // Primary teeth are smaller and more rounded
      if (this.isUpper) {
        switch (this.kind) {
          case 'incisor':
            return `M 20 45 C 18 38 18 30 22 24 C 25 20 28 18 30 18 C 32 18 35 20 38 24 C 42 30 42 38 40 45 C 38 48 22 48 20 45 Z`;
          case 'canine':
            return `M 20 45 C 18 38 18 30 23 24 C 26 20 28 18 30 18 C 32 18 34 20 37 24 C 42 30 42 38 40 45 C 38 48 22 48 20 45 Z`;
          case 'molar':
            return `M 15 45 C 13 38 13 30 18 24 C 21 20 25 19 28 22 C 29 23 30 23 32 22 C 35 19 39 20 42 24 C 47 30 47 38 45 45 C 40 50 20 50 15 45 Z`;
        }
      } else {
        switch (this.kind) {
          case 'incisor':
            return `M 20 45 C 18 52 18 60 22 66 C 25 70 28 72 30 72 C 32 72 35 70 38 66 C 42 60 42 52 40 45 C 38 42 22 42 20 45 Z`;
          case 'canine':
            return `M 20 45 C 18 52 18 60 23 66 C 26 70 28 72 30 72 C 32 72 34 70 37 66 C 42 60 42 52 40 45 C 38 42 22 42 20 45 Z`;
          case 'molar':
            return `M 15 45 C 13 52 13 60 18 66 C 21 70 25 71 28 68 C 29 67 30 67 32 68 C 35 71 39 70 42 66 C 47 60 47 52 45 45 C 40 40 20 40 15 45 Z`;
        }
      }
    }

    // Permanent teeth
    if (this.isUpper) {
      switch (this.kind) {
        case 'incisor':
          return `M 18 50 C 15 42 14 32 17 22 C 19 15 24 12 30 12 C 36 12 41 15 43 22 C 46 32 45 42 42 50 C 38 54 22 54 18 50 Z`;
        case 'canine':
          return `M 18 50 C 16 42 15 32 20 18 C 24 10 28 8 30 12 C 32 8 36 10 40 18 C 45 32 44 42 42 50 C 38 54 22 54 18 50 Z`;
        case 'premolar':
          return `M 15 50 C 13 40 13 30 18 22 C 21 18 25 17 28 22 C 29 24 30 24 32 22 C 35 17 39 18 42 22 C 47 30 47 40 45 50 C 40 55 20 55 15 50 Z`;
        case 'molar':
          return `M 12 50 C 10 40 10 30 15 20 C 18 15 22 14 26 18 C 28 20 29 21 30 20 C 31 21 32 20 34 18 C 38 14 42 15 45 20 C 50 30 50 40 48 50 C 42 56 18 56 12 50 Z`;
      }
    } else {
      switch (this.kind) {
        case 'incisor':
          return `M 18 40 C 15 48 14 58 17 68 C 19 75 24 78 30 78 C 36 78 41 75 43 68 C 46 58 45 48 42 40 C 38 36 22 36 18 40 Z`;
        case 'canine':
          return `M 18 40 C 16 48 15 58 20 72 C 24 80 28 82 30 78 C 32 82 36 80 40 72 C 45 58 44 48 42 40 C 38 36 22 36 18 40 Z`;
        case 'premolar':
          return `M 15 40 C 13 50 13 60 18 68 C 21 72 25 73 28 68 C 29 66 30 66 32 68 C 35 73 39 72 42 68 C 47 60 47 50 45 40 C 40 35 20 35 15 40 Z`;
        case 'molar':
          return `M 12 40 C 10 50 10 60 15 70 C 18 75 22 76 26 72 C 28 70 29 69 30 70 C 31 69 32 70 34 72 C 38 76 42 75 45 70 C 50 60 50 50 48 40 C 42 34 18 34 12 40 Z`;
      }
    }
  }

  // ============ Root Paths ============

  get rootPath(): string {
    if (this.isPrimary) {
      // Primary roots are thinner and less branched
      if (this.isUpper) {
        return `M 23 45 C 21 55 21 65 25 75 C 27 78 29 78 30 75 C 31 72 31 65 29 55 L 28 45 Z M 37 45 C 39 55 39 65 35 75 C 33 78 31 78 30 75 L 31 55 L 32 45 Z`;
      } else {
        return `M 23 45 C 21 38 21 28 25 18 C 27 15 29 15 30 18 C 31 21 31 28 29 38 L 28 45 Z M 37 45 C 39 38 39 28 35 18 C 33 15 31 15 30 18 L 31 38 L 32 45 Z`;
      }
    }

    if (this.isUpper) {
      switch (this.kind) {
        case 'incisor':
          return `M 22 50 C 20 60 20 72 24 82 C 26 85 28 85 30 82 C 32 78 32 72 30 62 L 30 50 Z M 38 50 C 40 60 40 72 36 82 C 34 85 32 85 30 82 L 30 62 L 30 50 Z`;
        case 'canine':
          return `M 22 50 C 20 62 20 75 25 84 C 27 87 29 87 30 84 C 31 80 31 72 30 62 L 30 50 Z M 38 50 C 40 62 40 75 35 84 C 33 87 31 87 30 84 L 30 62 L 30 50 Z`;
        case 'premolar':
          return `M 17 50 C 15 60 15 72 19 82 C 21 86 24 86 26 82 C 28 78 28 70 26 60 L 25 50 Z M 43 50 C 45 60 45 72 41 82 C 39 86 36 86 34 82 C 32 78 32 70 34 60 L 35 50 Z`;
        case 'molar':
          return `M 14 50 C 12 60 12 72 16 82 C 18 86 21 86 23 82 C 25 78 25 70 23 60 L 22 50 Z M 46 50 C 48 60 48 72 44 82 C 42 86 39 86 37 82 C 35 78 35 70 37 60 L 38 50 Z M 28 50 L 28 75 C 28 78 30 78 32 78 L 32 50 Z`;
      }
    } else {
      switch (this.kind) {
        case 'incisor':
          return `M 22 40 C 20 30 20 18 24 8 C 26 5 28 5 30 8 C 32 12 32 18 30 28 L 30 40 Z M 38 40 C 40 30 40 18 36 8 C 34 5 32 5 30 8 L 30 28 L 30 40 Z`;
        case 'canine':
          return `M 22 40 C 20 28 20 15 25 6 C 27 3 29 3 30 6 C 31 10 31 18 30 28 L 30 40 Z M 38 40 C 40 28 40 15 35 6 C 33 3 31 3 30 6 L 30 28 L 30 40 Z`;
        case 'premolar':
          return `M 17 40 C 15 30 15 18 19 8 C 21 4 24 4 26 8 C 28 12 28 20 26 30 L 25 40 Z M 43 40 C 45 30 45 18 41 8 C 39 4 36 4 34 8 C 32 12 32 20 34 30 L 35 40 Z`;
        case 'molar':
          return `M 14 40 C 12 30 12 18 16 8 C 18 4 21 4 23 8 C 25 12 25 20 23 30 L 22 40 Z M 46 40 C 48 30 48 18 44 8 C 42 4 39 4 37 8 C 35 12 35 20 37 30 L 38 40 Z M 28 40 L 28 15 C 28 12 30 12 32 12 L 32 40 Z`;
      }
    }
  }

  get highlightPath(): string {
    if (this.isUpper) {
      return `M 22 20 C 25 15 35 15 38 20 C 36 18 24 18 22 20 Z`;
    } else {
      return `M 22 70 C 25 75 35 75 38 70 C 36 72 24 72 22 70 Z`;
    }
  }

  get groovesPath(): string {
    if (this.isUpper) {
      if (this.kind === 'molar') {
        return `M 20 30 Q 25 28 30 30 M 30 30 Q 35 28 40 30 M 22 38 L 38 38`;
      }
      return `M 22 32 L 38 32 M 25 40 L 35 40`;
    } else {
      if (this.kind === 'molar') {
        return `M 20 60 Q 25 62 30 60 M 30 60 Q 35 62 40 60 M 22 52 L 38 52`;
      }
      return `M 22 58 L 38 58 M 25 50 L 35 50`;
    }
  }
}