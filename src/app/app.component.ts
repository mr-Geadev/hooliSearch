import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
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
  readonly searchButton = new Subject<void>();
  // поток, который немедленно отправляет текущее значение инпута как query параметр
  readonly searchButton$: Observable<string> = this.searchButton.asObservable().pipe(
    filter(() => this.search.value), // не отправлять значение для поиска если строка пустая
    map(() => {
      return this.search.value;
    }),
    share(),
  );

  // кнопка сортировки
  readonly sortButton = new Subject<string>();
  // поток содержащий в себе тип сортировки
  readonly sortedList$: Observable<string> = this.sortButton.asObservable().pipe(
    startWith(null),
    share(),
  );

  // поток списка ссылок. Представляет из себя комбинацию потоков типа сортировки и списка ссылок.
  readonly listLinks$: Observable<Link[]> = combineLatest(
    // этот поток получает новый список при обновлении поискового запроса
    merge(
      this.textInput$,
      this.searchButton$,
    ).pipe(
      distinctUntilChanged(),
      switchMap((val) => {
        return this.server.getLinks(val);
      }),
    ),
    this.sortedList$,
  ).pipe(
    // после чего происходит сортировка
    map(([list, sort]) => {
      if (sort) {
        return list.sort((a, b) => {
          if (a[sort] < b[sort]) {
            return -1;
          }
          if (a[sort] > b[sort]) {
            return 1;
          }
          return 0;
        });
      }
      return list;
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
