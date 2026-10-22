import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[560px]">

      <!-- Right: Brand panel -->
      <div class="hidden md:flex flex-col justify-between bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-10 text-white relative overflow-hidden">
        <div class="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5"></div>
        <div class="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-white/5"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-16">
            <div class="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden p-1">
            <img src="assets/512X512.png" alt="Logo" class="w-full h-full object-cover rounded-xl" />
            </div>
            <span class="text-xl font-bold">عيادة الأسنان</span>
          </div>

          <h2 class="text-3xl font-bold leading-snug mb-4">
            إدارة عيادتك<br/>بذكاء واحترافية
          </h2>
          <p class="text-white/80 leading-relaxed">
            نظام متكامل لإدارة المرضى والمواعيد والعلاجات والفواتير في مكان واحد.
          </p>
        </div>

        <div class="relative z-10 flex items-center gap-2 text-white/70 text-sm">
          <i class="pi pi-shield"></i>
          <span>اتصال آمن ومشفّر</span>
        </div>
      </div>

      <!-- Left: Form panel -->
      <div class="flex flex-col justify-center p-10 md:p-14">
        <div class="md:hidden text-center mb-8">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-md mb-3 overflow-hidden p-1 border border-slate-100">
          <img src="assets/512X512.png" alt="Logo" class="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 class="text-2xl font-bold text-slate-800">عيادة الأسنان</h1>
        </div>

        <h1 class="hidden md:block text-3xl font-bold text-slate-800 mb-2">مرحباً بعودتك</h1>
        <p class="hidden md:block text-slate-500 mb-10">سجّل الدخول للمتابعة إلى حسابك</p>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">اسم المستخدم</label>
            <input
              pInputText
              [(ngModel)]="userName"
              name="userName"
              class="w-full !py-3 !px-4 !rounded-xl !border-slate-200 focus:!border-primary-500 focus:!ring-2 focus:!ring-primary-100 transition-all"
              placeholder="أدخل اسم المستخدم"
              autocomplete="username" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور</label>
            <p-password
              [(ngModel)]="password"
              name="password"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full !py-3 !px-4 !rounded-xl !border-slate-200 focus:!border-primary-500 focus:!ring-2 focus:!ring-primary-100 transition-all"
              placeholder="أدخل كلمة المرور"
              autocomplete="current-password" />
          </div>

          @if (errorMessage()) {
            <div class="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <button
            pButton
            type="submit"
            label="تسجيل الدخول"
            icon="pi pi-sign-in"
            class="w-full !py-3 !rounded-xl !text-base !font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
            [loading]="loading()">
          </button>
        </form>

        <p class="text-center text-xs text-slate-400 mt-10">
          © {{ currentYear }} عيادة الأسنان. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  `
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  userName = 'admin';
  password = 'Admin@123456';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  currentYear = new Date().getFullYear();

  onSubmit(): void {
    if (!this.userName || !this.password) {
      this.errorMessage.set('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ userName: this.userName, password: this.password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.isSuccess) {
          this.messageService.add({
            severity: 'success',
            summary: 'مرحباً',
            detail: 'تم تسجيل الدخول بنجاح'
          });
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(response.error?.message ?? 'فشل تسجيل الدخول.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.error?.message ?? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
        );
      }
    });
  }
}