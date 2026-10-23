import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { inject } from '@angular/core';
import { PermissionCheckService } from '../../../core/services/permission-check.service';
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}
interface MenuGroup {
  label: string;
  icon: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  collapsed = signal(false);
  expandedGroups = signal<Set<string>>(new Set(['clinic']));

  menuGroups: MenuGroup[] = [
    {
      label: 'الرئيسية',
      icon: 'pi-home',
      items: [
        { label: 'لوحة التحكم', icon: 'pi-chart-line', route: '/dashboard' },
      ]
    },
    {
      label: 'العيادة',
      icon: 'pi-heart-fill',
      items: [
        { label: 'المرضى', icon: 'pi-users', route: '/patients', permission: 'patients.view' },
        { label: 'المواعيد', icon: 'pi-calendar', route: '/appointments', permission: 'appointments.view' },
        { label: 'طلبات المخبر', icon: 'pi-send', route: '/lab-orders', permission: 'labOrders.view' },
      ]
    },
    {
      label: 'المالية والمخزون',
      icon: 'pi-wallet',
      items: [
        { label: 'الفواتير', icon: 'pi-receipt', route: '/invoices', permission: 'invoices.view' },
        { label: 'المصروفات', icon: 'pi-arrow-up', route: '/expenses', permission: 'expenses.view' },
        { label: 'المخزون', icon: 'pi-box', route: '/inventory', permission: 'inventory.view' },
        { label: 'حركات المخزون', icon: 'pi-history', route: '/inventory/transactions', permission: 'inventory.transactions.view' },
      ]
    },
    {
      label: 'الإدارة',
      icon: 'pi-cog',
      items: [
        { label: 'المستخدمون', icon: 'pi-user-edit', route: '/users', permission: 'users.view' },
        { label: 'الأدوار والصلاحيات', icon: 'pi-shield', route: '/roles', permission: 'roles.view' },
        { label: 'أنواع العلاجات', icon: 'pi-list', route: '/treatments', permission: 'treatments.view' },
        { label: 'أنواع التشخيص', icon: 'pi-list', route: '/diagnosis-types', permission: 'treatments.view' },
        { label: 'أنواع الإجراءات', icon: 'pi-list', route: '/procedure-types', permission: 'proceduretypes.manage' },
        { label: 'المواد الترميمية', icon: 'pi-tag', route: '/materials', permission: 'treatments.view' },
        { label: 'أنواع مواد المخزون', icon: 'pi-tags', route: '/inventory/categories', permission: 'inventory.view' },
        { label: 'أنواع طلبات المخبر', icon: 'pi-sitemap', route: '/lab-order-types', permission: 'labOrders.view' },
        { label: 'أنواع المصروفات', icon: 'pi-tags', route: '/expense-categories', permission: 'expenses.view' },
        { label: 'العيادات', icon: 'pi-building', route: '/clinics', permission: 'clinics.view' },
        { label: 'المخابر السنية', icon: 'pi-briefcase', route: '/dental-labs', permission: 'dentalLabs.view' },
        { label: 'الموردون', icon: 'pi-truck', route: '/suppliers', permission: 'suppliers.view' },
        { label: 'العملات', icon: 'pi-dollar', route: '/currencies', permission: 'currencies.view' },
        { label: 'سجل الأحداث', icon: 'pi-history', route: '/audit', permission: 'audit.view' },
      ]
    },
    {
      label: 'التقارير',
      icon: 'pi-file-pdf',
      items: [
        { label: 'التقارير الإدارية والطبية', icon: 'pi-file', route: '/reports/administrative', permission: 'patients.view' },
        { label: 'التقارير المالية', icon: 'pi-wallet', route: '/reports/financial', permission: 'invoices.view' },
      ]
    }
  ];

  toggle(): void {
    this.collapsed.update(v => !v);
    if (!this.collapsed()) {
      this.expandedGroups.update(s => new Set([...s, 'clinic']));
    }
  }

  toggleGroup(label: string): void {
    this.expandedGroups.update(set => {
      const newSet = new Set(set);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  private permissionCheck = inject(PermissionCheckService);

visibleItems(group: MenuGroup): MenuItem[] {
  return group.items.filter(item =>
    !item.permission || this.permissionCheck.has(item.permission)
  );
}

isGroupVisible(group: MenuGroup): boolean {
  return this.visibleItems(group).length > 0;
}
}