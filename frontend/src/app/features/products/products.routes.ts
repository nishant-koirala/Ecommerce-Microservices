import { Routes } from '@angular/router';

import { ProductDetailComponent } from './product-detail.component';
import { ProductsListingComponent } from './products-listing.component';

export const productsRoutes: Routes = [
  { path: '', component: ProductsListingComponent },
  { path: ':id', component: ProductDetailComponent },
];
