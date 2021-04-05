import { Component, OnInit } from '@angular/core';
// import { ChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-analtyics',
  templateUrl: './analtyics.component.html',
  styleUrls: ['./analtyics.component.css']
})
export class AnaltyicsComponent implements OnInit {

   // Pie
   public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartLabels: Label[] = ['Asset', 'Expense', 'Projects', 'LatAm CostCenter GR', 'Profit Center without GR'];
  public pieChartData: number[] = [300, 50, 100, 40, 120];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [/*pluginDataLabels*/];
  public pieChartColors = [
    {
      backgroundColor: ['#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
      hoverBackgroundColor: ['#FF5A5E', '#5AD3D1', '#FFC870', '#A8B3C5', '#616774'],
    },
  ];

  constructor() { }

  ngOnInit() {
  }

    // events
    public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
      console.log(event, active);
    }

    public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
      console.log(event, active);
    }

    changeLegendPosition() {
      this.pieChartOptions.legend.position = this.pieChartOptions.legend.position === 'left' ? 'top' : 'left';
    }

    // Remember to add a GET DATA function to pull this information from an API at a later date

}
