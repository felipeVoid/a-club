import {Component, Inject, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-money-dialog',
  templateUrl: './money-dialog.component.html',
  styleUrls: ['./money-dialog.component.scss']
})
export class MoneyDialogComponent implements OnInit {
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  user: any;

  constructor(public dialogRef: MatDialogRef<MoneyDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    if (this.data.item.money) {
      console.log(this.data);
    }
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
