import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { AboutComponent } from './pages/about/about.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'savings', component: SavingsComponent },
    { path: '**', component: NotFoundComponent },
];
