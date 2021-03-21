import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

interface Choice {
  value: number;
  strValue: string;
}

interface Point {
  x: number;
  y: number;
  r: number;
  result: boolean;
}

@Component({
  selector: 'app-admin',
  templateUrl: 'work.component.html',
})
export class WorkComponent implements OnInit {
  xChoices: Choice[];
  rChoices: Choice[];

  currX: number;

  currY: number;
  strY: string;

  currR: number;

  baseApiUrl = 'http://134.0.115.32:8080/unnamed/api/points/';
  baseLkUrl = 'http://134.0.115.32:8080/unnamed/lk/';

  logoutUrl = this.baseLkUrl + 'logout';
  addPointUrl = this.baseApiUrl + 'add';
  resultsUrl = this.baseApiUrl + 'get';
  clearUrl = this.baseApiUrl + 'clear';

  errorResponse = 'failed';
  okResponse = 'ok';
  lastError = 'No errors';

  points: { [key: number]: Point[]; } = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  };
  pointsForTable: Point[] = [];
  pointsForVisual: Point[] = [];

  constructor(private router: Router, private http: HttpClient) {
    this.currX = 0;
    this.currY = 0;
    this.strY = '0';
    this.currR = 1;
    this.xChoices = [
      {value: -3, strValue: '-3'},
      {value: -2, strValue: '-2'},
      {value: -1, strValue: '-1'},
      {value: 0, strValue: '0'},
      {value: 1, strValue: '1'},
      {value: 2, strValue: '2'},
      {value: 3, strValue: '3'},
      {value: 4, strValue: '4'},
      {value: 5, strValue: '5'},
    ];
    this.rChoices = this.xChoices;
    if (localStorage.getItem('key') == null) {
      router.navigate(['']);
    }
    this.fetchPoints();
  }


  onCanvasClick(event: MouseEvent): void {

    if (this.currR < 1) {
      this.lastError = 'R must be greater than 0';
      return;
    }

    const elem = document.getElementById('canvas');
    const br = elem.getBoundingClientRect();
    const left = br.left;
    const top = br.top;

    const mouseX: number = event.clientX - left;
    const mouseY: number = event.clientY - top;

    const transferX = this.currR * (mouseX - 150) / 130;
    const transferY = this.currR * (150 - mouseY) / 130;

    this.http.post(this.addPointUrl, {
        key: localStorage.getItem('key'),
        x: transferX,
        y: transferY,
        r: this.currR
      }
    ).subscribe(data => {
      const response: any = data;
      if (response.status === this.errorResponse) {
        this.lastError = 'Cannot add point';
      } else {
        const lastPt: Point = response.last_point;
        this.points[lastPt.r].push(lastPt);
        this.pointsForTable.push(lastPt);
      }
    });

  }

  fetchPoints(): void {
    this.http.post(this.resultsUrl, {
      key: localStorage.getItem('key')
    }).toPromise()
      .then(response => response as any)
      .then(response => response.data as Point[])
      .then(data => {
        data.forEach(val => this.points[val.r].push(val));

        this.pointsForTable = data;
        this.pointsForVisual = this.points[this.currR];
      });
  }

  onSubmit(): void {

    if (this.currR < 1) {
      return;
    }

    this.http.post(this.addPointUrl, {
        key: localStorage.getItem('key'),
        x: this.currX,
        y: this.currY,
        r: this.currR
      }
    ).subscribe(data => {
      const response: any = data;

      if (response.status === this.errorResponse) {
        this.lastError = 'Failed to add Point';
      } else {
        const lastPt: Point = response.last_point;

        this.points[lastPt.r].push(lastPt);
        this.pointsForTable.push(lastPt);
      }
    });
  }

  logout(): void {
    this.http.post(this.logoutUrl, {key: localStorage.getItem('key')});
    localStorage.removeItem('key');
    this.router.navigate(['']);
  }

  onClear(): void {
    this.http.post(this.clearUrl, {key: localStorage.getItem('key')}).subscribe(data => {
      const resp: any = data;
      if (resp.status === this.errorResponse) {
        this.lastError = 'Cannot clear, check connection';
      } else {
        location.reload(true);
      }
    });
  }

  rChanged(): void {
    this.pointsForVisual = this.points[this.currR];
  }

  validateY(): void {
    while (!(new RegExp('^(-|-?[0-9]+(.[0-9]+)?)$')).test(this.strY) && this.strY.length > 0) {
      this.strY = this.strY.substring(0, this.strY.length - 1);
    }
    if (this.strY[0] === '-') {
      this.strY = this.strY.substring(0, 5);
    } else {
      this.strY = this.strY.substring(0, 4);
    }
    if (Number(this.strY) > -5 && Number(this.strY) < 5) {
      this.currY = Number(this.strY);
    } else {
      this.lastError = 'Y must be in (-5; 5) interval';
    }
  }

  ngOnInit(): void {
  }
}
