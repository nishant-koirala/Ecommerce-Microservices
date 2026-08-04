import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ButtonComponent } from './button.component';
import { LinkButtonComponent } from './link-button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <app-button variant="outline">Press me</app-button>
  `,
})
class ButtonHostComponent {}

@Component({
  standalone: true,
  imports: [LinkButtonComponent],
  template: `
    <app-link-button routerLink="/products">Go somewhere</app-link-button>
  `,
})
class LinkButtonHostComponent {}

describe('ButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('projects the label into a real <button>', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('button')).not.toBeNull();
    expect(el.textContent).toContain('Press me');
  });
});

describe('LinkButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('projects the label into a real <a> with a routerLink', () => {
    const fixture = TestBed.createComponent(LinkButtonHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const anchor = el.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('/products');
    expect(el.textContent).toContain('Go somewhere');
  });
});
