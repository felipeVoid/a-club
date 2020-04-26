import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
  selector: 'app-alert-snack-bar',
  templateUrl: './alert-snack-bar.component.html',
  styleUrls: ['./alert-snack-bar.component.scss']
})
export class AlertSnackBarComponent implements OnInit {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  ngOnInit() {
    if (this.data.class == 'error') {
      // console.log(this.data.text);
    }
  }

}
