import { Directive, ElementRef, effect, inject, input, model } from '@angular/core';

/**
 * Makes an element's text editable in place (<h1 skEditableTitle [(title)]="...">).
 * The model is updated with the trimmed text when the element loses focus;
 * empty text is replaced by `fallback`
 */
@Directive({
    selector: '[skEditableTitle]',
    host: {
        contenteditable: 'true',
        '(blur)': 'read()',
        '(keydown.enter)': '$event.preventDefault(); blur()'
    }
})
export class EditableTitle {
    readonly title = model.required<string>();
    readonly fallback = input('');

    private readonly element: HTMLElement = inject(ElementRef).nativeElement;

    constructor() {
        effect(() => this.render(this.title()));
    }

    protected read(): void {
        const title = (this.element.textContent ?? '').trim() || this.fallback();
        this.title.set(title);
        // Also when the model did not change, so the text gets cleaned up
        this.render(title);
    }

    protected blur(): void {
        this.element.blur();
    }

    private render(title: string): void {
        const text = title || this.fallback();
        if (this.element.textContent !== text) {
            this.element.textContent = text;
        }
    }
}
