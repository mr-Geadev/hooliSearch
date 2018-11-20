import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Link } from 'src/app/link.model';

@Injectable()
export class ServerService {

  public listOfResult: Link[] = null;

  constructor(private _http: HttpClient) {
  }

  public getLinks(searchQuery: Observable<string>): void {
    searchQuery.subscribe(
      (query) => {
        console.log(query);
        this.listOfResult = [];
        this.getLinksFromServer(query);
      },
    );
  }

  private getLinksFromServer(query: string): void {
    this._http.get('/assets/json/server.json').pipe(
      delay(1000),
      map(res => {
        this.listOfResult = res['links']
          .filter(link => {
            return link.title.toLowerCase().indexOf(query.toLowerCase()) > -1 ? new Link(link) : false;
          });
      }),
    ).subscribe();
  }
}
