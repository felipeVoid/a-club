import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {DetailDialogComponent} from './data-center/detail-dialog/detail-dialog.component';
import {MatDialog} from '@angular/material';
import {NotesDialogComponent} from './notes-dialog/notes-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  opened: boolean;
  user: any;
  constructor(public afAuth: AngularFireAuth, public dialog: MatDialog) { }

  ngOnInit() {
    this.init();
  }

  logout() {
    localStorage.removeItem('data');
    this.afAuth.auth.signOut().then(action => {
      window.location.reload();
    }).catch(error => {
      window.location.reload();
    });
  }

  init() {
    this.user = JSON.parse(localStorage.getItem('data'));
  }

  openDialogNotes(): void {
    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '750px'
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }
}
