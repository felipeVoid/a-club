import { Component, OnInit } from '@angular/core';
import {Label, SingleDataSet} from 'ng2-charts';
import {ChartOptions, ChartType} from 'chart.js';
import {AngularFireDatabase, AngularFireObject} from '@angular/fire/database';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
// Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  public pieChartData: SingleDataSet = [300, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  itemRef: AngularFireObject<any>;
  globalDataBase = '';
  user: any;
  payment = [];
  paymentMonth = [];
  paymentYear = [];
  paymentTotal = [];
  paymentMonthUser = [];
  paymentTotalYear = [];
  paymentTotalUser = [];
  totalAll = 0;

  constructor(private db: AngularFireDatabase) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('data'));
    this.globalDataBase = '/users/' + this.user.uid + '/';
    this.itemRef = this.db.object(this.globalDataBase + 'members');
    this.itemRef.snapshotChanges()
      .subscribe(action => {
        this.payment = action.payload.val();
        for (let key in this.payment) {
          if (this.payment[key]) {
            const p_obj = this.payment[key];
            if (p_obj.money) {
              let p_money = p_obj.money;
              if (p_money.paid_per_year) {
                let pp_year = p_money.paid_per_year;
                for (let year in pp_year) {
                  if (pp_year[year]) {
                    let year_obj = pp_year[year];
                    let total = 0;

                    for (let p_month of year_obj) {
                      if (p_month.amount_paid) {
                        const intPaid = parseInt(p_month.amount_paid);
                        this.totalAll += intPaid;
                      }
                    }
                    
                    const temp_obj_final = {
                      f_key: key,
                      f_year: year,
                      f_total: this.totalAll
                    };
                    console.log(temp_obj_final);
                  }
                }
                const temp_obj_final = {
                  f_key: key,
                  f_total: this.totalAll
                };
                console.log(temp_obj_final);
              }
            }
          }          
        }
        const temp_obj_final = {
          f_total: this.totalAll
        };
        console.log(temp_obj_final);
      });
  }

}
