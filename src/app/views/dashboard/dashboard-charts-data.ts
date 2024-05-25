import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  PluginOptionsByType,
  ScaleOptions,
  TooltipLabelStyle
} from 'chart.js';
import { DeepPartial } from 'chart.js/dist/types/utils';
import { getStyle, hexToRgba } from '@coreui/utils';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType ;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  public mainChart: IChartProps = { type: "line"  as ChartType};

  constructor(private http: HttpClient) {
    this.initMainChart();
  }

  getData(): Observable<any[]> {
    const jsonUrl = 'assets/data.json'; // Adjust the path as necessary
    return this.http.get<any[]>(jsonUrl);
  }

  initMainChart() {
    const brandSuccess = '#4dbd74';
    const brandInfo = '#20a8d8';
    const brandDanger = '#f86c6b';

    this.getData().subscribe(data => {
     
      if (!Array.isArray(data)) {
        console.error('Data is not an array');
        return;
      }

      const accDataX = data.map(item => item.data?.acc?.x ?? null);
      const accDataY = data.map(item => item.data?.acc?.y ?? null);
      const accDataZ = data.map(item => item.data?.acc?.z ?? null);

      const gyroDataX = data.map(item => item.data?.gyro?.x ?? null);
      const gyroDataY = data.map(item => item.data?.gyro?.y ?? null);
      const gyroDataZ = data.map(item => item.data?.gyro?.z ?? null);

      const labels = data.map(item => `Measurement ${item.measurementNumber}`);

      const datasets: ChartDataset[] = [
        {
          data: accDataX,
          label: 'Acc X',
          borderColor: brandInfo,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false
        },
        {
          data: accDataY,
          label: 'Acc Y',
          borderColor: brandSuccess,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false
        },
        {
          data: accDataZ,
          label: 'Acc Z',
          borderColor: brandDanger,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false
        },
        {
          data: gyroDataX,
          label: 'Gyro X',
          borderColor: brandInfo,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          borderDash: [8, 5]
        },
        {
          data: gyroDataY,
          label: 'Gyro Y',
          borderColor: brandSuccess,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          borderDash: [8, 5]
        },
        {
          data: gyroDataZ,
          label: 'Gyro Z',
          borderColor: brandDanger,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          borderDash: [8, 5]
        }
      ];
      console.log( ".>>>>>>>>>>>>>2"+datasets)
      const options: ChartOptions = {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              labelColor: (context) => ({
                backgroundColor: context.dataset.borderColor
              } as TooltipLabelStyle)
            }
          }
        },
        scales: this.getScales()
      };

      this.mainChart = {
        type: 'line' as ChartType,
        data: { labels, datasets },
        options
      };
    });
  }

  getScales() {
    const colorBorderTranslucent = '#ebedef';
    const colorBody = '#6c757d';

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5
        }
      }
    };
    return scales;
  }

}
