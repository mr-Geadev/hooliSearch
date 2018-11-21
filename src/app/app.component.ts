import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mapTo,
  publishReplay,
  refCount,
  share,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { Link } from 'src/app/link.model';
import { ServerService } from 'src/app/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  readonly search: FormControl = new FormControl('');

  // поток отслеживания изменений в инпуте
  readonly textInput$: Observable<string> = this.search.valueChanges.pipe(
    startWith(''),
    debounceTime(1000),
    map((val) => {
      return val;
    }),
    share(),
  );

  // кнопка поиска
  readonly searchButton = new Subject<boolean>();
  // поток, который немедленно отправляет текущее значение инпута как query параметр
  readonly searchButton$: Observable<string> = this.searchButton.asObservable().pipe(
    map(() => {
      return this.search.value;
    }),
    share(),
  );

  // поток списка ссылок. Делает запрос когда лиюо произошло нажатие на кнопку, либо пользователь ничего не вводит какое-то время
  readonly listLinks$: Observable<Link[]> = merge(
    this.textInput$,
    this.searchButton$,
  ).pipe(
    distinctUntilChanged(),
    switchMap(val => {
      return this.server.getLinks(val);
    }),
    publishReplay(1), // отправляет последнее значение к вновь подписавшимся обзерверам
    refCount(),
  );

  // поток спинера
  readonly spinner$: Observable<boolean> = merge(
    this.textInput$.pipe(mapTo(true)),
    this.searchButton$.pipe(mapTo(true)),
    this.listLinks$.pipe(map(() => false)),
  ).pipe(
    startWith(true),
    share(),
  );

  constructor(readonly server: ServerService) {
  }

}
