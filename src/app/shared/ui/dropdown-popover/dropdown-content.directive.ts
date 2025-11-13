import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appDropdownContent]'
})
export class DropdownContentDirective {
  constructor(public readonly template: TemplateRef<unknown>) {}
}
