import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ClinicContextService } from '../../../core/services/clinic-context.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule, AvatarModule, TooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private tokenStorage = inject(TokenStorageService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  clinicContext = inject(ClinicContextService);

  userName = signal<string>(this.tokenStorage.getUser()?.userName ?? '');
  photoUrl = signal<string | null>(null);
  fullName = signal<string>('');
  userRole = signal<string>(this.tokenStorage.getUser()?.roles?.[0] ?? '');
  userMenu: MenuItem[] = [
    { label: 'الملف الشخصي', icon: 'pi pi-user', command: () => this.router.navigate(['/profile']) },
    { separator: true },
    { label: 'تسجيل الخروج', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
  ];

  ngOnInit(): void {
    this.profileService.get().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.photoUrl.set(res.value.photoUrl ?? null);
          const full = `${res.value.firstName ?? ''} ${res.value.lastName ?? ''}`.trim();
          this.fullName.set(full);
        }
      }
    });
  }

  switchClinic(): void {
    this.clinicContext.clear();
    this.router.navigate(['/select-clinic']);
  }
}