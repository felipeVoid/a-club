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
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRef = this.db.object(this.globalDataBase + 'notes');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        if (action.payload.val()) {
          this.notesList = action.payload.val();
        }
        this.showProgress = false;
      });
  }

  addNote(value) {
    this.notesList.push({ text: value.value });
    value.value = '';
  }

  deleteNote(item) {
    this.notesList = this.notesList.filter(x => x !== item);
  }

  saveNotes() {
    this.itemRef = this.db.object(this.globalDataBase + 'notes');
    this.itemRef.set(this.notesList);
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
