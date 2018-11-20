import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ServerService } from 'src/app/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  readonly search: FormGroup = new FormGroup({
    stringQuery: new FormControl(''),
  });

  readonly query: BehaviorSubject<string> = new BehaviorSubject<string>('');
  readonly sortType: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(readonly server: ServerService) {
  }

  public setQuery() {
    this.query.next(this.search.controls['stringQuery'].value);
  }

  public setTypeSort(type: string) {
    this.sortType.next(type);
  }

  ngOnInit() {
    // Я не знаю как избавиться от этой подписки.
    // Можно было кидать этот поток сразу в метод сервиса(как я сначала и сделал), но тогда не получилось отменять debounce по клику
    this.search.controls['stringQuery'].valueChanges.pipe(
      debounceTime(1000),
    ).subscribe(() => this.setQuery());

    this.server.getLinks(
      this.query.pipe(
        distinctUntilChanged(),
      ),
    );

    this.server.sortList(this.sortType);
  }
}
