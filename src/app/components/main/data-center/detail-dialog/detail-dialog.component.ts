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

  langObj = {
    phone: 'Teléfono',
    name: 'Nombre'
  };

  tempActive = true;
  constructor(public dialogRef: MatDialogRef<DetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    this.onResize(window.innerWidth);
    this.getBelts();
    this.getRoles();
    this.listGup.push({grade: 9, date: '12-10-2013'});
    this.listGup.push({grade: 8, date: '16-12-2013'});
    this.listDan.push({grade: 1, date: '12-10-2017'});
    this.listDan.push({grade: 2, date: '16-10-2019'});
    // this.dataSource = new MatTableDataSource(this.tempData);
    this.tempActive = (this.data.item.active == 'true');
  }

  putMemberDetail() {
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem);
    this.itemRef.update(this.data.item);
    this.dialogRef.close();
  }

  onResize(eventWidth) {
    this.breakpoint = (eventWidth <= 550) ? 1 : 2;
  }

  closeDialog() {
    this.dialogRef.close();
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
        this.checkRole(this.data.item.role);
      });
  }

  changeLang(value) {
    switch (value) {
      case 'eng':
        this.langObj.phone = 'Phone';
        this.langObj.name = 'Name';
        break;
      case 'spa':
        this.langObj.phone = 'Teléfono';
        this.langObj.name = 'Nombre';
        break;
    }
  }

  checkRole(roleSelected) {
    if (roleSelected == 'apoderado') {
      document.getElementById('beltField').style.display = 'none';
      document.getElementById('dojangField').style.display = 'none';
      document.getElementById('gradesTables').style.display = 'none';
    } else {
      document.getElementById('beltField').style.display = 'inline-block';
      document.getElementById('dojangField').style.display = 'inline-block';
      document.getElementById('gradesTables').style.display = 'block';
    }
  }

  activeAction() {
    this.data.item.active = String(this.tempActive);
  }

  getDate(dateIn) {
    const today = new Date(dateIn);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return  dd + '-' + mm + '-' + yyyy;
  }
}
