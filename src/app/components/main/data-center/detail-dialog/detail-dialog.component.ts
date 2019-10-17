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
  breakpoint = 1;
  disableInput = true;
  belts = [];
  roles = [];
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['grade', 'date'];
  listGup = [];
  listDan = [];
  constructor(public dialogRef: MatDialogRef<DetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    this.onResize(window.innerWidth);
    this.getBelts();
    this.getRoles();
    this.listGup.push({grade: 9, date: '12-10-2013'});
    this.listGup.push({grade: 8, date: '16-12-2013'});
    this.listDan.push({grade: 1, date: '12-10-2017'});
    this.listDan.push({grade: 2, date: '16-10-2019'});
    // this.dataSource = new MatTableDataSource(this.tempData);
  }

  putMemberDetail() {
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem);
    this.itemRef.update(this.data.item);
    this.dialogRef.close();
  }

  onResize(eventWidth) {
    this.breakpoint = (eventWidth <= 550) ? 1 : 2;
  }

  getBelts() {
    this.itemRef = this.db.object('general/belts');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.belts = action.payload.val();
      });
  }

  getRoles() {
    this.itemRef = this.db.object('general/roles');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.roles = action.payload.val();
      });
  }
}
