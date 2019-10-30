import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {DetailDialogComponent} from './detail-dialog/detail-dialog.component';
import {AddMemberDialogComponent} from './add-member-dialog/add-member-dialog.component';

@Component({
  selector: 'app-data-center',
  templateUrl: './data-center.component.html',
  styleUrls: ['./data-center.component.scss']
})

export class DataCenterComponent implements OnInit {
  displayedColumns: string[] = ['name', 'training_address', 'current_belt', 'money', 'edit']; // 'money'
  displayedColumns2: string[] = ['name', 'edit'];
  user: any;
  members = [];
  membersList = [];
  responsables = [];
  dataSource = new MatTableDataSource();
  dataSource2 = new MatTableDataSource();
  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  showProgress = true;

  constructor(private db: AngularFireDatabase,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.getMembers();
  }

  getMembers() {
    this.itemRef = this.db.object(this.globalDataBase + 'members');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.members = action.payload.val();
        const tempList = [];

        for (const obj in this.members) {
          if (this.members[obj]) {
            tempList.push({
              id: obj,
              dojo: this.members[obj].training_address,
              name: this.members[obj].name,
              grade: this.members[obj].current_belt,
              item: this.members[obj],
              role: this.members[obj].role,
              responsable: this.members[obj].responsable
            });
          }
        }

        this.membersList = tempList.filter(obj => obj.role != 'apoderado');
        this.responsables = tempList.filter(obj => obj.role == 'apoderado');

        if (this.membersList.length > 0) {
          for (const obj of this.membersList) {
            if (obj.responsable) {
              for (const res of obj.responsable) {
                if (this.responsables.filter(x => x.id == res).length <= 0) {
                  obj.item.responsable = obj.item.responsable.filter(y => y != res);
                  this.updateMemberById(obj.item, obj.id);
                }
              }
            }
          }
          this.dataSource = new MatTableDataSource(this.membersList);
        }
        if (this.responsables.length > 0) {
          this.dataSource2 = new MatTableDataSource(this.responsables);
        }
        this.showProgress = false;
      });
  }

  applyFilter(filterValue: string, source) {
    source.filter = filterValue.trim().toLowerCase();
  }

  checkGradeColorPrimary(grade) {
    switch (grade) {
      case '9dan': return '#000000';
      case '8dan': return '#000000';
      case '7dan': return '#000000';
      case '6dan': return '#000000';
      case '5dan': return '#000000';
      case '4dan': return '#000000';
      case '3dan': return '#000000';
      case '2dan': return '#000000';
      case '1dan': return '#000000';
      case '1gup': return '#cf0000';
      case '2gup': return '#cf0000';
      case '3gup': return '#0a08cf';
      case '4gup': return '#0a08cf';
      case '5gup': return '#48be00';
      case '6gup': return '#48be00';
      case '7gup': return '#ffe300';
      case '8gup': return '#ffe300';
      case '9gup': return '#eaeaea';
      default: return '#eaeaea';
    }
  }

  checkGradeColorSecondary(grade) {
    switch (grade) {
      case '9dan': return '#cfbe00';
      case '8dan': return '#cfbe00';
      case '7dan': return '#cfbe00';
      case '6dan': return '#cfbe00';
      case '5dan': return '#cfbe00';
      case '4dan': return '#cfbe00';
      case '3dan': return '#cfbe00';
      case '2dan': return '#cfbe00';
      case '1dan': return '#cfbe00';
      case '1gup': return '#000000';
      case '2gup': return '#cf0000';
      case '3gup': return '#cf0000';
      case '4gup': return '#0a08cf';
      case '5gup': return '#0a08cf';
      case '6gup': return '#48be00';
      case '7gup': return '#48be00';
      case '8gup': return '#ffe300';
      case '9gup': return '#ffe300';
      default: return '#eaeaea';
    }
  }

  checkGradeText(grade) {
    switch (grade) {
      case '9dan': return 'IX';
      case '8dan': return 'VIII';
      case '7dan': return 'VII';
      case '6dan': return 'VI';
      case '5dan': return 'V';
      case '4dan': return 'IV';
      case '3dan': return 'III';
      case '2dan': return 'II';
      case '1dan': return 'I';
      default: return 'I';
    }
  }

  openDialogDetails(data, id): void {
    const dialogRef = this.dialog.open(DetailDialogComponent, {
      width: '750px',
      data: {item: data, idItem: id}
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  openDialogAddMember(): void {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '750px'
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  openDialogMemberDetailById(id) {
    const data = this.responsables.filter(x => x.id == id);
    const dialogRef = this.dialog.open(DetailDialogComponent, {
      width: '750px',
      data: {item: data[0].item, idItem: id}
    });
  }

  addResp(memberId, respId) {
    const data = this.membersList.filter(x => x.id == memberId);
    if (!data[0].item.responsable) {
      data[0].item.responsable = [];
    }
    data[0].item.responsable.push(respId);
    this.updateMemberById(data[0].item, memberId);
  }

  deleteResp(memberId, respId) {
    const data = this.membersList.filter(x => x.id == memberId);
    if (data[0].item.responsable) {
      data[0].item.responsable = data[0].item.responsable.filter(obj => obj != respId);
      this.updateMemberById(data[0].item, memberId);
    }
  }

  updateMemberById(data, memberId) {
    this.itemRef = this.db.object(this.globalDataBase + 'members/' + memberId);
    this.itemRef.update(data);
  }
}
