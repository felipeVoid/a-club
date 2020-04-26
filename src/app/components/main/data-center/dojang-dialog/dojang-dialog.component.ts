import { Component, OnInit, Inject } from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-dojang-dialog',
  templateUrl: './dojang-dialog.component.html',
  styleUrls: ['./dojang-dialog.component.scss']
})
export class DojangDialogComponent implements OnInit {
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  user: any;

  orgDoj = [];
  othDoj = [];
  dojangs = [];

  listNames = [];

  scheduleAdd = [];
  formDojang = {
    address: '',
    mail: '',
    name: '',
    phone: '',
    schedule: []
  }

  errorMsg = '';

  constructor(public dialogRef: MatDialogRef<DojangDialogComponent>,
    private db: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.getDojangs();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getDojangs() {
    this.itemRef = this.db.object(this.globalDataBase + 'dojangs');
    this.itemRef.snapshotChanges().subscribe(action => {      
      if (action.payload.val()) {
        this.listNames = [];
        this.orgDoj = action.payload.val();
        this.orgDoj.filter(x => this.listNames.push(x.name));
        this.dojangs = action.payload.val();
        if (this.data) {
          this.dojangs = this.dojangs.filter(x => x.name == this.data.name);
          this.othDoj = this.orgDoj.filter(x => x.name != this.data.name);
          this.scheduleAdd = this.dojangs[0].schedule;
          this.formDojang = {
            address: this.dojangs[0].address,
            mail: this.dojangs[0].mail,
            name: this.dojangs[0].name,
            phone: this.dojangs[0].phone,
            schedule: this.dojangs[0].schedule
          }
        }        
      }      
    });
  }

  addDojang() {
    this.itemRef = this.db.object(this.globalDataBase + 'dojangs');
    if (this.scheduleAdd.length > -1) {
      if (this.data) {
        this.othDoj.push(this.formDojang);
        this.itemRef.set(this.othDoj);
        this.restore();
      } else {
        if(this.listNames.indexOf(this.formDojang.name) == -1) {
          this.orgDoj.push(this.formDojang);
          this.itemRef.set(this.orgDoj);
          this.restore();
        } else {
          this.errorMsg = 'Nombre ya existe, intenta con otro.';
        }
      }                 
    } else {      
      this.errorMsg = 'Agrega un horario primero.';
    }    
  }
  removeDojang(doj) {
    this.orgDoj = this.orgDoj.filter(x => x.name != doj.name);
    this.itemRef = this.db.object(this.globalDataBase + 'dojangs');
    this.itemRef.set(this.orgDoj);
  }

  addSchedule(inDay, inDuration, inTime) {
    const formSchedule = {
      day: inDay.value,
      duration: inDuration.value,
      time: inTime.value
    };

    inDay.value = '';
    inDuration.value = '';
    inTime.value = '';

    this.scheduleAdd.push(formSchedule);
  }

  removeSchedule(schedule) {
    this.scheduleAdd = this.scheduleAdd.filter(x => x != schedule);
  }

  restore() {
    this.data = null;
    this.scheduleAdd = [];
    this.formDojang = {
      address: '',
      mail: '',
      name: '',
      phone: '',
      schedule: this.scheduleAdd
    }
    this.getDojangs();
  }

  setEditDojang(value) {
    this.data = {name: value};
    this.getDojangs();
  }

}
