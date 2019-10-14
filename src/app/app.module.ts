import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatSidenavModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule,
  MatDialog, MatDialogModule
} from '@angular/material';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomeComponent } from './components/main/home/home.component';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AuthGuard} from './services/auth.guard';
import { DataCenterComponent } from './components/main/data-center/data-center.component';
import {ChartsModule} from 'ng2-charts';
import { DetailDialogComponent } from './components/main/data-center/detail-dialog/detail-dialog.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HomeComponent,
    DataCenterComponent,
    DetailDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDialogModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    ChartsModule
  ],
  providers: [
    AngularFireAuth,
    AuthGuard
  ],
  entryComponents: [
    DetailDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
