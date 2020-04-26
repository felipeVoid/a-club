import { Component, OnInit } from '@angular/core';
import { Services } from 'src/app/services/services.service';

@Component({
  selector: 'app-local-data',
  templateUrl: './local-data.component.html',
  styleUrls: ['./local-data.component.scss']
})
export class LocalDataComponent implements OnInit {

  constructor(private services: Services) { }

  ngOnInit() {
    console.log(this.services.localData.users.HHC4o74WxucfArmrFpwKeWN7SO13.node);
  }

}
