import {TestBed} from '@angular/core/testing';

import {
  EnvironmentService,
  PolygonLowerBoundYPosition,
  TimestampLowerBoundSet,
} from './environment';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CandidateInfo} from '../models/Data';
import {Point} from '../models/Point';
import {Polygon} from '../models/Polygon';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EnvironmentService);
  });

  // TODO(naoai): write getPolygons test
  it('#createPolygon should create a square', () => {
    const lower: Point[] = [
      {x: 0, y: 0},
      {x: 10, y: 0},
      {x: 10, y: 10},
    ];
    const upper: Point[] = [
      {x: 0, y: 0},
      {x: 0, y: 10},
      {x: 10, y: 10},
    ];
    const square: Polygon = new Polygon(
      [
        {x: 0, y: 0},
        {x: 10, y: 0},
        {x: 10, y: 10},
        {x: 0, y: 10},
      ],
      'square'
    );

    // @ts-ignore
    const result: Polygon = service.createPolygon(lower, upper, 'square');

    expect(result).toEqual(square);
  });

  it('#createPolygon should create a line', () => {
    const lower: Point[] = [
      {x: 0, y: 0},
      {x: 10, y: 10},
    ];
    const upper: Point[] = lower;
    const line: Polygon = new Polygon(
      [
        {x: 0, y: 0},
        {x: 10, y: 10},
      ],
      'line'
    );

    // @ts-ignore
    const result: Polygon = service.createPolygon(lower, upper, 'line');

    expect(result).toEqual(line);
  });

  it('#addPointToBorderMap add to empty border', () => {
    const bound: Map<string, Point[]> = new Map();
    const point: Point = {x: 10, y: 20};
    const key = 'key';

    // @ts-ignore
    service.addPointToBorderMap(bound, key, point);

    expect(bound.get(key)).toEqual([point]);
  });

  it('#addPointToBorderMap add to non-empty border', () => {
    const bound: Map<string, Point[]> = new Map();
    const point1: Point = {x: 10, y: 20};
    const point2: Point = {x: 20, y: 10};
    const key = 'key';
    bound.set(key, [point1]);

    // @ts-ignore
    service.addPointToBorderMap(bound, key, point2);

    expect(bound.get(key)).toEqual([point1, point2]);
  });

  it('#computeNextSnapshot inserts new candidate', () => {
    const inputCandInfo: CandidateInfo[] = [
      {name: '1', job_count: 100},
      {name: '2', job_count: 100},
    ];
    const inputSet: TimestampLowerBoundSet = new TimestampLowerBoundSet();
    inputSet.orderMap.set('1', 0);
    inputSet.snapshot[0] = new PolygonLowerBoundYPosition('1', 0);

    const result: [
      TimestampLowerBoundSet,
      number
      // @ts-ignore
    ] = service.computeNextSnapshot(inputCandInfo, inputSet);

    expect(result[0].snapshot[0].position).toEqual(0);
    expect(result[0].snapshot[1].position).toEqual(50);
    expect(result[1]).toEqual(1);
  });

  it('#computeNextSnapshot candidate info list is empty', () => {
    const emptyCandInfo: CandidateInfo[] = [];
    const inputSet: TimestampLowerBoundSet = new TimestampLowerBoundSet();
    inputSet.orderMap.set('1', 0);
    inputSet.snapshot[0] = new PolygonLowerBoundYPosition('1', 0);

    const result: [
      TimestampLowerBoundSet,
      number
      // @ts-ignore
    ] = service.computeNextSnapshot(emptyCandInfo, inputSet);

    expect(result[0]).toBe(inputSet);
  });

  it('#computeNextSnapshot all candidates have 0 jobs', () => {
    const emptyCandInfo: CandidateInfo[] = [
      {name: '1', job_count: 0},
      {name: '2', job_count: 0},
    ];
    const inputSet: TimestampLowerBoundSet = new TimestampLowerBoundSet();
    inputSet.orderMap.set('1', 0);
    inputSet.orderMap.set('2', 1);
    inputSet.snapshot[0] = new PolygonLowerBoundYPosition('1', 0);
    inputSet.snapshot[1] = new PolygonLowerBoundYPosition('2', 50);

    const outputSet: TimestampLowerBoundSet = inputSet;
    outputSet.snapshot[0] = new PolygonLowerBoundYPosition('1', 100);
    outputSet.snapshot[1] = new PolygonLowerBoundYPosition('2', 100);

    const result: [
      TimestampLowerBoundSet,
      number
      // @ts-ignore
    ] = service.computeNextSnapshot(emptyCandInfo, inputSet);

    expect(result).toEqual([outputSet, 0]);
  });

  it('#computeNextSnapshot with old TimestampLowerBoundSet empty', () => {
    const inputCandInfo: CandidateInfo[] = [
      {name: '1', job_count: 105},
      {name: '2', job_count: 300},
      {name: '3', job_count: 595},
    ];
    const emptySet: TimestampLowerBoundSet = new TimestampLowerBoundSet();

    const result: [
      TimestampLowerBoundSet,
      number
      // @ts-ignore
    ] = service.computeNextSnapshot(inputCandInfo, emptySet);

    expect(result[0].snapshot[0].position).toEqual(0);
    expect(result[0].snapshot[1].position).toEqual(10.5);
    expect(result[0].snapshot[2].position).toEqual(40.5);
    expect(result[1]).toEqual(3);
  });

  it('#getPercentages should return 3 candidates with fractional percentages', () => {
    const input: CandidateInfo[] = [
      {name: '1', job_count: 105},
      {name: '2', job_count: 300},
      {name: '3', job_count: 595},
    ];
    // @ts-ignore
    const resultMap: Map<string, number> = service.getPercentages(input);

    expect(resultMap.get('1')).toEqual(10.5);
    expect(resultMap.get('2')).toEqual(30);
    expect(resultMap.get('3')).toEqual(59.5);
  });

  it('#getPercentages should have a candidate with 100', () => {
    const input: CandidateInfo[] = [
      {name: '1', job_count: 2000},
      {name: '2', job_count: 0},
    ];
    // @ts-ignore
    const resultMap: Map<string, number> = service.getPercentages(input);

    expect(resultMap.get('1')).toEqual(100);
  });

  it('#getPercenatges with empty CanditateInfo[]', () => {
    // @ts-ignore
    const resultMap: Map<string, number> = service.getPercentages([]);

    expect(resultMap.size).toBe(0);
  });

  it('#getPercenatges where all candidates have 0 jobs', () => {
    // @ts-ignore
    const resultMap: Map<string, number> = service.getPercentages([
      {name: '1', job_count: 0},
      {name: '2', job_count: 0},
    ]);

    expect(resultMap.size).toBe(2);
    expect(resultMap.get('1')).toEqual(0);
    expect(resultMap.get('2')).toEqual(0);
  });
});
