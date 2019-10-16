import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource} from '@angular/material';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.scss']
})
export class DetailDialogComponent implements OnInit {
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  user: any;
  member = {
    id: '',
    item: {
      active: 'true',
      current_belt: '10gup',
      email: '',
      name: '',
      phone: '',
      picture: '',
      role: 'alumno',
      training_address: ''
    }
  };
  constructor(public dialogRef: MatDialogRef<DetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
  }

  putMemberDetail() {
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem);
    this.itemRef.update(this.data.item);
    this.dialogRef.close();
  }
}
