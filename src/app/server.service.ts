import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, filter, map } from 'rxjs/operators';
import { Link } from 'src/app/link.model';

@Injectable()
export class ServerService {

  public listOfResult: Link[] = null;

  public errors: string = null;
  public countOfRequest: number = 0; // для имитации ошибки сервера

  constructor(private _http: HttpClient) {
  }

  public sortList(typeSort: Observable<string>): void {
    typeSort.pipe(
      filter(type => !!type),
      map(type => {
        this.listOfResult.sort((a, b) => {
          if (a[type] < b[type]) {
            return -1;
          }
          if (a[type] > b[type]) {
            return 1;
          }
          return 0;
        });
      }),
    ).subscribe();
  }

  public getLinks(searchQuery: Observable<string>): void {
    searchQuery.subscribe(
      (query) => {
        this.listOfResult = null;
        this.errors = null;
        this.getLinksFromServer(query);
      },
    );
  }

  private getLinksFromServer(query: string): void {
    this._http.get('/assets/json/server.json').pipe(
      delay(1000),
      map(res => {
        if (this.countOfRequest !== 3) { // для имитации ошибки сервера
          this.listOfResult = res['links']
            .filter(link => {
              return link.title.toLowerCase().indexOf(query.toLowerCase()) > -1 ? new Link(link) : false;
            });
          this.countOfRequest++; // для имитации ошибки сервера
        } else {
          this.listOfResult = null;
          this.errors = 'Ошибка';
          this.countOfRequest = 0; // для имитации ошибки сервера
        }
      }),
    ).subscribe();
  }
}
