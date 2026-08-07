import { Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FaqComponent } from './faq/faq.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ShippingReturnsComponent } from './shipping-returns/shipping-returns.component';
import { TermsComponent } from './terms/terms.component';

export const aboutRoutes: Routes = [{ path: '', component: AboutComponent }];
export const contactRoutes: Routes = [{ path: '', component: ContactComponent }];
export const faqRoutes: Routes = [{ path: '', component: FaqComponent }];
export const shippingReturnsRoutes: Routes = [{ path: '', component: ShippingReturnsComponent }];
export const termsRoutes: Routes = [{ path: '', component: TermsComponent }];
export const privacyRoutes: Routes = [{ path: '', component: PrivacyComponent }];
