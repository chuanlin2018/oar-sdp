import { TestBed, inject } from '@angular/core/testing';

import { JsonldService } from './jsonld.service';

describe('JsonldService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonldService]
    });
  });

  it('should be created', inject([JsonldService], (service: JsonldService) => {
    expect(service).toBeTruthy();
  }));
});
