import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];
@Component({
  selector: 'app-data-center',
  templateUrl: './data-center.component.html',
  styleUrls: ['./data-center.component.scss']
})
export class DataCenterComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  user: any;
  members: any;
  itemRefTeams: AngularFireObject<any>;
  membersList = [];
  globalDataBase = '';
  constructor(private db: AngularFireDatabase) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.getMembers();
  }

  getMembers() {
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRefTeams = this.db.object(this.globalDataBase + 'members');
    this.itemRefTeams.snapshotChanges()
      .subscribe(action => {
        this.members = action.payload.val();
        this.membersList = [];
        if (this.members.length > 0) {
          for (let i = 0; i < this.members.length; i++) {
            this.membersList.push({ item_id: i, item_text: this.members[i]['name'] });
          }
          console.log(this.membersList);
        }
      });
  }
}
