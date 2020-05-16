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
  MatDialogModule,
  MatMenuModule,
  MatProgressBarModule,
  MatExpansionModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSliderModule
} from '@angular/material';

import {DragDropModule} from '@angular/cdk/drag-drop';

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
import { NotesDialogComponent } from './components/main/notes-dialog/notes-dialog.component';
import { AddMemberDialogComponent } from './components/main/data-center/add-member-dialog/add-member-dialog.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { ExamComponent } from './components/main/exam/exam.component';
import { MoneyDialogComponent } from './components/main/data-center/money-dialog/money-dialog.component';
import { DojangDialogComponent } from './components/main/data-center/dojang-dialog/dojang-dialog.component';
import { NodesComponent } from './components/main/nodes/nodes.component';
import { ArtComponent } from './components/main/art/art.component';

import { HttpClientModule } from '@angular/common/http';
import { AlertSnackBarComponent } from './components/alert-snack-bar/alert-snack-bar.component';
import { Services } from './services/services.service';
import { FileIconPipe } from './pipes/file-icon.pipe';
import { LocalDataComponent } from './components/local-data/local-data.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GamesComponent } from './components/main/games/games.component';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HomeComponent,
    DataCenterComponent,
    DetailDialogComponent,
    NotesDialogComponent,
    AddMemberDialogComponent,
    ExamComponent,
    MoneyDialogComponent,
    DojangDialogComponent,
    NodesComponent,
    ArtComponent,
    AlertSnackBarComponent,
    FileIconPipe,
    LocalDataComponent,
    GamesComponent
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
    MatMenuModule,
    MatProgressBarModule,
    MatExpansionModule,
    DragDropModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    ChartsModule,
    HttpClientModule,
    CKEditorModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    AngularFireAuth,
    AngularFireStorage,
    AuthGuard,
    Services,
    LoginComponent
  ],
  entryComponents: [
    DetailDialogComponent,
    NotesDialogComponent,
    AddMemberDialogComponent,
    DojangDialogComponent,
    MoneyDialogComponent,
    AlertSnackBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
