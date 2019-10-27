import { Component, OnInit } from '@angular/core';
import {MatDialogRef, MatTableDataSource} from '@angular/material';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';

@Component({
  selector: 'app-notes-dialog',
  templateUrl: './notes-dialog.component.html',
  styleUrls: ['./notes-dialog.component.scss']
})
export class NotesDialogComponent implements OnInit {
  user: any;
  notesList = [];
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  showProgress = true;
  constructor(private db: AngularFireDatabase,
              public dialogRef: MatDialogRef<NotesDialogComponent>) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.getNotes();
  }

  getNotes() {
    this.itemRef = this.db.object(this.globalDataBase + 'notes');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        if (action.payload.val()) {
          this.notesList = action.payload.val();
        }
        this.showProgress = false;
      });
  }

  saveNotes() {
    this.itemRef = this.db.object(this.globalDataBase + 'notes');
    this.itemRef.set(this.notesList);
    this.dialogRef.close();
  }

  addNote(value) {
    this.notesList.push({ text: value.value, date: this.getDate() });
    value.value = '';
  }

  deleteNote(item) {
    this.notesList = this.notesList.filter(x => x !== item);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const hh = String(today.getHours()).padStart(2, '0');
    const mmm = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0');

    return  dd + '/' + mm + '/' + yyyy + 'T' + hh + ':' + mmm + ':' + ss;
  }
}
