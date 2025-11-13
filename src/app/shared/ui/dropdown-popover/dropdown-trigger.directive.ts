import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDropdownTrigger]'
})
export class DropdownTriggerDirective {
  constructor(public readonly elementRef: ElementRef<HTMLElement>) {}
}

