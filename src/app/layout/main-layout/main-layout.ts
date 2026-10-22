import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header],
  template: `
    <div class="h-screen flex bg-slate-50 overflow-hidden">
      <app-sidebar class="h-full flex-shrink-0" />
      <div class="flex-1 flex flex-col min-w-0">
        <app-header />
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayout {}