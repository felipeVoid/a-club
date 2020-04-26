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

  tempListYearKey = [];
  selectedYear: any;
  money: any;

  constructor(public dialogRef: MatDialogRef<MoneyDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    const dateNow = new Date(Date.now());
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';

    if (this.data.item.money) {
      this.money = this.data.item.money;
      this.tempListYearKey = Object.keys(this.money.paid_per_year);
      this.filterYear(this.tempListYearKey[(this.tempListYearKey.length - 1)]);
    } else {      
      this.firstMoneyRegister(dateNow);
    }
  }

  firstMoneyRegister(date) {
    this.money = {
      amount: 0,
      exception: 'N/A',
      paid_per_year: {
        [date.getFullYear()]: [
          {name: 'january'},
          {name: 'february'},
          {name: 'march'},
          {name: 'april'},
          {name: 'may'},
          {name: 'june'},
          {name: 'july'},
          {name: 'august'},
          {name: 'september'},
          {name: 'october'},
          {name: 'november'},
          {name: 'december'}
        ]
      }
    };
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem + '/money');
    this.itemRef.set(this.money);

    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem);
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.data.item = action.payload.val();
        this.tempListYearKey = Object.keys(this.money.paid_per_year);
        this.filterYear(date.getFullYear());
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  filterYear(year) {
    this.selectedYear = {
      yearSelected: year,
      item: this.money.paid_per_year[year]
    };
  }

  registerPaidMonth(obj, index, moneyAmount, moneyException) {
    const dateNow = new Date(Date.now());
    const tempItem = {
      amount_paid: moneyAmount,
      date: dateNow.toString(),
      exception: moneyException,
      name: obj.name
    };
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem + '/money/paid_per_year/' + this.selectedYear['yearSelected'] + '/' + index);
    this.itemRef.set(tempItem);

    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem);
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.money = action.payload.val()['money'];
        this.filterYear(this.selectedYear['yearSelected']);
      });
  }

  cancelPaidMonth(index, name) {
    const tempItem = {
      name: name
    };
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem + '/money/paid_per_year/' + this.selectedYear['yearSelected'] + '/' + index);
    this.itemRef.set(tempItem);

    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem);
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.money = action.payload.val()['money'];
        this.filterYear(this.selectedYear['yearSelected']);
      });
  }

  saveMoneyAmount(value) {
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem + '/money/amount');
    this.itemRef.set(value);
  }

  saveMoneyException(value) {
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + this.data.idItem + '/money/exception');
    this.itemRef.set(value);
  }

  monthTranslate(value) {
    switch (value) {
      case 'january': return 'Enero';
      case 'february': return 'Febrero ';
      case 'march': return 'Marzo';
      case 'april': return 'Abril';
      case 'may': return 'Mayo';
      case 'june': return 'Junio';
      case 'july': return 'Julio';
      case 'august': return 'Agosto';
      case 'september': return 'Septiembre';
      case 'october': return 'Octubre';
      case 'november': return 'Noviembre';
      case 'december': return 'Diciembre';
    }
  }

}
