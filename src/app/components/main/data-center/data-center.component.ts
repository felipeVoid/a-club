import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {DetailDialogComponent} from './detail-dialog/detail-dialog.component';

@Component({
  selector: 'app-data-center',
  templateUrl: './data-center.component.html',
  styleUrls: ['./data-center.component.scss']
})

export class DataCenterComponent implements OnInit {
  displayedColumns: string[] = ['name', 'training_address', 'current_belt', 'money', 'edit'];
  user: any;
  members: any;
  membersList = [];
  dataSource = new MatTableDataSource();
  itemRef: AngularFireObject<any>;
  globalDataBase = '';

  constructor(private db: AngularFireDatabase,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.getMembers();
  }

  getMembers() {
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRef = this.db.object(this.globalDataBase + 'members');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.members = action.payload.val();
        this.membersList = [];
        for (const obj in this.members) {
          if (this.members[obj]) {
            this.membersList.push({
              id: obj,
              dojo: this.members[obj].training_address,
              name: this.members[obj].name,
              grade: this.members[obj].current_belt,
              item: this.members[obj]
            });
          }
        }
        if (this.membersList.length > 0) {
          this.dataSource = new MatTableDataSource(this.membersList);
        }
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  checkGradeColorPrimary(grade) {
    switch (grade) {
      case 'VI dan': return '#000000';
      case 'V dan': return '#000000';
      case 'IV dan': return '#000000';
      case 'III dan': return '#000000';
      case 'II dan': return '#000000';
      case 'I dan': return '#000000';
      case 'I gup': return '#cf0000';
      case 'II gup': return '#cf0000';
      case 'III gup': return '#0a08cf';
      case 'IV gup': return '#0a08cf';
      case 'V gup': return '#48be00';
      case 'VI gup': return '#48be00';
      case 'VII gup': return '#ffe300';
      case 'VIII gup': return '#ffe300';
      case 'IX gup': return '#eaeaea';
      default: return '#eaeaea';
    }
  }

  checkGradeColorSecondary(grade) {
    switch (grade) {
      case 'VI dan': return '#cfbe00';
      case 'V dan': return '#cfbe00';
      case 'IV dan': return '#cfbe00';
      case 'III dan': return '#cfbe00';
      case 'II dan': return '#cfbe00';
      case 'I dan': return '#cfbe00';
      case 'I gup': return '#000000';
      case 'II gup': return '#cf0000';
      case 'III gup': return '#cf0000';
      case 'IV gup': return '#0a08cf';
      case 'V gup': return '#0a08cf';
      case 'VI gup': return '#48be00';
      case 'VII gup': return '#48be00';
      case 'VIII gup': return '#ffe300';
      case 'IX gup': return '#ffe300';
      default: return '#eaeaea';
    }
  }

  checkGradeText(grade) {
    switch (grade) {
      case 'VI dan': return 'VI';
      case 'V dan': return 'V';
      case 'IV dan': return 'IV';
      case 'III dan': return 'III';
      case 'II dan': return 'II';
      case 'I dan': return 'I';
      default: return 'II';
    }
  }

  openDialog(data, id): void {
    const dialogRef = this.dialog.open(DetailDialogComponent, {
      width: '350px',
      data: {item: data, idItem: id}
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }
}
