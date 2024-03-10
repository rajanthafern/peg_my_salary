import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from './shared/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'salary-peg';
  public form: FormGroup;
  public currencies: any;
  public currentBaseSalary: any;
  public peggedBaseSalary: any;
  public maxPegCalculateDate: any;
  public isCalculated = false;
  public loader = false;
  public baseLineExchangeRate: any;
  public peggingExchangeRate: any;
  public alerts: Array<any> = [];

  constructor(private formBuilder: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
        currentSalary: ['', [Validators.required]],
        pegStartDate: ['', [Validators.required]],
        pegCurrency: ['', [Validators.required]],
        pegCalculateDate: ['', [Validators.required]]
      });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.maxPegCalculateDate = yesterday.toISOString().slice(0, 10);

    this.form.patchValue({
      currentSalary: 100000,
      pegStartDate: '2022-03-01',
      pegCalculateDate: this.maxPegCalculateDate
    });

    this.getCurrencies();
  }

  public submit(): void {
    this.alerts.pop();
    this.calculateCurrentBaseSalary();
  }

  get currentSalary(): FormControl {
    return this.form.get('currentSalary') as FormControl;
  }

  get pegStartDate(): FormControl {
    return this.form.get('pegStartDate') as FormControl;
  }

  get pegCurrency(): FormControl {
    return this.form.get('pegCurrency') as FormControl;
  }

  get pegCalculateDate(): FormControl {
    return this.form.get('pegCalculateDate') as FormControl;
  }

  /**
   * API Call to fetch countries
   */
  public getCurrencies(): void {
    this.alerts.pop();
    this.loader = true;
    this.apiService.getCurrencies().subscribe(
      data => {
        this.currencies = data.body;
        this.form.patchValue({
          pegCurrency: 'usd'
        });
        this.loader = false;
      },
      error => {
        this.alerts.push({
          id: 1, type: 'danger', message: `Peg my salary has experienced an issue. Sorry for the inconvenience.`
        });
        this.loader = false;
      }
    );
  }

  public calculateCurrentBaseSalary(): void {
    this.loader = true;
    if (this.currentSalary.value && !this.currentSalary.value.isNaN) {
      this.apiService.getExchangeRateForDate(this.pegStartDate.value, this.pegCurrency.value).subscribe(
        data => {
          this.baseLineExchangeRate = data.body[this.pegCurrency.value].lkr;
          this.currentBaseSalary = this.currentSalary.value / this.baseLineExchangeRate;
          this.calculatePeggedBaseSalary();
        },
        error => {
          this.alerts.push({
            id: 1, type: 'danger', message: `Peg my salary has experienced an issue. Sorry for the inconvenience.`
          });
          this.isCalculated = false;
          this.loader = false;
        }
      );
    }
  }

  public calculatePeggedBaseSalary(): void {
    this.apiService.getExchangeRateForDate(this.pegCalculateDate.value, this.pegCurrency.value).subscribe(
      data => {
        this.peggingExchangeRate = data.body[this.pegCurrency.value].lkr;
        this.peggedBaseSalary = this.currentBaseSalary * this.peggingExchangeRate;
        this.isCalculated = true;
        this.loader = false;
      },
      error => {
        this.alerts.push({
          id: 1, type: 'danger', message: `Peg my salary has experienced an issue. Sorry for the inconvenience.`
        });
        this.loader = false;
      }
    );
  }

  public getAllowance(): number {
    return this.peggedBaseSalary - this.currentSalary.value;
  }

  public closeAlert(alert: any): void {
    const index: number = this.alerts.indexOf(alert);
    this.alerts.splice(index, 1);
  }
}
