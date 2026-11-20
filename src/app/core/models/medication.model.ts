import { MedicationForm } from '../constants/enums';

export interface ActiveIngredientListItem {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  category?: string;
  categoryAr?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ActiveIngredientDetails extends ActiveIngredientListItem {
  description?: string;
  commonDosage?: string;
  createdAt: string;
  brandNamesCount: number;
}

export interface CreateActiveIngredientRequest {
  code: string;
  name: string;
  nameAr: string;
  category?: string;
  categoryAr?: string;
  description?: string;
  commonDosage?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateActiveIngredientRequest {
  name: string;
  nameAr: string;
  category?: string;
  categoryAr?: string;
  description?: string;
  commonDosage?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ActiveIngredientFilter {
  search?: string;
  isActive?: boolean;
  category?: string;
  categoryAr?: string;
  page: number;
  pageSize: number;
}

export interface BrandNameListItem {
  id: string;
  activeIngredientId: string;
  activeIngredientNameAr: string;
  code: string;
  name: string;
  nameAr: string;
  manufacturer?: string;
  form: MedicationForm;
  strength?: string;
  isActive: boolean;
}

export interface BrandNameDetails extends BrandNameListItem {
  activeIngredientName: string;
  country?: string;
  createdAt: string;
}

export interface CreateBrandNameRequest {
  activeIngredientId: string;
  code: string;
  name: string;
  nameAr: string;
  manufacturer?: string;
  country?: string;
  form: MedicationForm;
  strength?: string;
  isActive: boolean;
}

export interface UpdateBrandNameRequest {
  activeIngredientId: string;
  name: string;
  nameAr: string;
  manufacturer?: string;
  country?: string;
  form: MedicationForm;
  strength?: string;
  isActive: boolean;
}

export interface BrandNameFilter {
  search?: string;
  activeIngredientId?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}