export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}
