import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  TooltipLabelStyle
} from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  public accelerationChart: IChartProps = { type: 'line' as ChartType };
  public gyroChart: IChartProps = { type: 'line' as ChartType };
  public vibrationChart: IChartProps = { type: 'line' as ChartType };

  constructor(private http: HttpClient) {}

  getData(): Observable<any[]> {
    const jsonUrl = 'assets/data.json'; // Adjust the path as necessary
    return this.http.get<any[]>(jsonUrl);
  }

  normalizeData(data: number[]): number[] {
    return data.map(value => value / 8192);
  }

  calculateMeanAndStdDev(data: number[]): { mean: number, stdDev: number } {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length);
    return { mean, stdDev };
  }

  isAnomaly(value: number, mean: number, stdDev: number): boolean {
    const threshold = 3; // Number of standard deviations from the mean
    return Math.abs(value - mean) > threshold * stdDev;
  }

  initMainChart(): Observable<void> {
    const brandSuccess = '#4dbd74';
    const brandInfo = '#20a8d8';
    const brandDanger = '#f86c6b';

    return this.getData().pipe(
      map(data => {
        if (!Array.isArray(data)) {
          console.error('Data is not an array');
          return;
        }

        const accDataX = this.normalizeData(data.map(item => item.data?.acc?.x ?? 0));
        const accDataY = this.normalizeData(data.map(item => item.data?.acc?.y ?? 0));
        const accDataZ = this.normalizeData(data.map(item => item.data?.acc?.z ?? 0));

        const gyroDataX = this.normalizeData(data.map(item => item.data?.gyro?.x ?? 0));
        const gyroDataY = this.normalizeData(data.map(item => item.data?.gyro?.y ?? 0));
        const gyroDataZ = this.normalizeData(data.map(item => item.data?.gyro?.z ?? 0));

        const { mean: meanAccX, stdDev: stdDevAccX } = this.calculateMeanAndStdDev(accDataX);
        const { mean: meanAccY, stdDev: stdDevAccY } = this.calculateMeanAndStdDev(accDataY);
        const { mean: meanAccZ, stdDev: stdDevAccZ } = this.calculateMeanAndStdDev(accDataZ);

        const { mean: meanGyroX, stdDev: stdDevGyroX } = this.calculateMeanAndStdDev(gyroDataX);
        const { mean: meanGyroY, stdDev: stdDevGyroY } = this.calculateMeanAndStdDev(gyroDataY);
        const { mean: meanGyroZ, stdDev: stdDevGyroZ } = this.calculateMeanAndStdDev(gyroDataZ);

        const labels = data.map(item => `${item.measurementNumber}`);

        const vibrationData = data.map(item => {
          const accX = item.data?.acc?.x ?? 0;
          const accY = item.data?.acc?.y ?? 0;
          const accZ = item.data?.acc?.z ?? 0;
          return Math.sqrt(accX * accX + accY * accY + accZ * accZ) / 8192;
        });

        const createDataset = (
          data: number[], 
          label: string, 
          color: string, 
          mean: number, 
          stdDev: number
        ): ChartDataset => {
          return {
            data,
            label,
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            pointRadius: data.map(value => this.isAnomaly(value, mean, stdDev) ? 5 : 0),
            pointBackgroundColor: data.map(value => this.isAnomaly(value, mean, stdDev) ? color : 'transparent')
          };
        };

        this.accelerationChart = {
          type: 'line' as ChartType,
          data: {
            labels,
            datasets: [
              createDataset(accDataX, 'Acc X', brandInfo, meanAccX, stdDevAccX),
              createDataset(accDataY, 'Acc Y', brandSuccess, meanAccY, stdDevAccY),
              createDataset(accDataZ, 'Acc Z', brandDanger, meanAccZ, stdDevAccZ)
            ]
          },
          options: this.getChartOptions()
        };

        this.gyroChart = {
          type: 'line' as ChartType,
          data: {
            labels,
            datasets: [
              createDataset(gyroDataX, 'Gyro X', brandInfo, meanGyroX, stdDevGyroX),
              createDataset(gyroDataY, 'Gyro Y', brandSuccess, meanGyroY, stdDevGyroY),
              createDataset(gyroDataZ, 'Gyro Z', brandDanger, meanGyroZ, stdDevGyroZ)
            ]
          },
          options: this.getChartOptions()
        };

        this.vibrationChart = {
          type: 'line' as ChartType,
          data: {
            labels,
            datasets: [
              createDataset(vibrationData, 'Vibration Magnitude', brandInfo, 0, 0) // Assuming no anomaly detection for vibration
            ]
          },
          options: this.getChartOptions()
        };
      })
    );
  }

  getChartOptions(): ChartOptions {
    const colorBorderTranslucent = '#ebedef';
    const colorBody = '#6c757d';

    return {
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
      scales: {
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
      }
    };
  }
}
