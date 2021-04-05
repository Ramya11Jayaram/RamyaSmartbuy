import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

// Spy on any element to which it is applied.
// Usage: <div mySpy>...</div>
@Directive({selector: '[appSpyOnInit]'})

export class SpyOnInitDirective implements OnInit, OnDestroy {
  @Output() loaded = new EventEmitter<string>();

  constructor() { }

  ngOnInit()    { this.onLoad(); }

  ngOnDestroy() {  }

  private onLoad() {
    this.loaded.emit();
  }
}

