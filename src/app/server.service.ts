import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Link } from 'src/app/link.model';

@Injectable()
export class ServerService {

  constructor(private _http: HttpClient) {
  }

  public getLinks(searchQuery: string): Observable<Link[]> {
    return this._http.get('/assets/json/server.json').pipe(
      delay(1000),
      map(res => {
          return res['links'].filter(link => link.title.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1).map(link => new Link(link));
        },
      ),
    );
  }
}
