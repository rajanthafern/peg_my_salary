import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiService {

    constructor(private http: HttpClient) {
    }

    public getCurrencies(): any {
        return this.http.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json`,
            { observe: 'response'}
        );
    }

    public getExchangeRateForDate(date: any, currency: string): any {
      return this.http.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/currencies/${currency}.json`,
        { observe: 'response'}
      );
    }

    /*public getActiveCountries(page?: any) {
        return this.http.get(`${this.midAppHost}/countries/active`,
            {params: page !== undefined ? this.setPaginationObj(page) : undefined, headers: this.getHeaders(), observe: 'response'});
    }

    public deleteCountry(countryUuid: string) {
        return this.http.delete(`${this.midAppHost}/countries/${countryUuid}`, {headers: this.getHeaders()});
    }*/

    /*public addCountry(country) {
        return this.http.post(`${this.midAppHost}/countries`, country, {headers: this.getHeaders()});
    }*/
}
