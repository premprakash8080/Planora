import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuillEditorComponent, QuillModules } from 'ngx-quill';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-description-editor',
  templateUrl: './task-description-editor.component.html',
  styleUrls: ['./task-description-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDescriptionEditorComponent implements OnChanges, OnDestroy {
  private static nextToolbarId = 0;

  @Input() control!: FormControl<string>;
  @Input() placeholder = 'Add more details...';
  @Input() emptyLabel = 'No description added';
  @Input() lastEditedLabel: string | null = null;

  @Output() valueChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<string>();

  @ViewChild(QuillEditorComponent) editor?: QuillEditorComponent;

  focused = false;
  editing = false;
  isEmpty = true;
  safeContent: SafeHtml | null = null;
  readonly toolbarId = `task-description-toolbar-${TaskDescriptionEditorComponent.nextToolbarId++}`;
  readonly editorStyles = {
  minHeight: '100px',
  border: 'none'
  };

  private controlSub?: Subscription;
  private blurTimeout?: ReturnType<typeof setTimeout>;
  modules: QuillModules = {
    toolbar: {
      container: `#${this.toolbarId}`,
      handlers: {
        mention: () => this.insertMention()
      }
    },
    keyboard: {
      bindings: {
        tab: false
      }
    }
  };

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control']) {
      this.controlSub?.unsubscribe();

      if (this.control) {
        this.controlSub = this.control.valueChanges.subscribe(value => {
          this.evaluateEmptyState(value ?? '');
        });
        this.evaluateEmptyState(this.control.value ?? '');
      }
    }
  }

  handleFocus(): void {
    this.focused = true;
    this.editing = true;
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  handleBlur(): void {
    this.blurTimeout = setTimeout(() => {
      this.focused = false;
      this.editing = false;
    }, 120);
    if (!this.control) {
      return;
    }
    const value = this.normalizeHtml(this.control.value ?? '');
    this.save.emit(value);
  }

  handleContentChanged(event: { html?: string | null; text?: string | null }): void {
    if (!this.control) {
      return;
    }
    const normalized = this.normalizeHtml(event.html ?? this.control?.value ?? '');

    if (this.control.value !== normalized) {
      this.control.setValue(normalized, { emitEvent: false });
    }

    this.evaluateEmptyState(normalized);
    this.valueChange.emit(normalized);
  }

  ngOnDestroy(): void {
    this.controlSub?.unsubscribe();
  }

  private insertMention(): void {
    const quill = this.editor?.quillEditor;
    if (!quill) {
      return;
    }
    const range = quill.getSelection(true);
    const index = range ? range.index : quill.getLength();
    quill.insertText(index, '@');
    quill.setSelection(index + 1, 0);
  }

  private normalizeHtml(value: string): string {
    if (!value) {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed || trimmed === '<p><br></p>' || trimmed === '<p></p>') {
      return '';
    }

    if (typeof document !== 'undefined') {
      const temp = document.createElement('div');
      temp.innerHTML = value;
      if ((temp.textContent ?? '').trim().length === 0 && !temp.querySelector('img, video, audio')) {
        return '';
      }
    }

    return value;
  }

  private evaluateEmptyState(value: string): void {
    const normalized = this.normalizeHtml(value);
    this.isEmpty = normalized.length === 0;
    this.safeContent = this.isEmpty ? null : this.sanitizer.bypassSecurityTrustHtml(normalized);
    if (this.control && this.control.value !== normalized) {
      this.control.setValue(normalized, { emitEvent: false });
    }
  }

  activateEditor(): void {
    if (this.editing) {
      return;
    }
    this.editing = true;
    this.focused = true;
    setTimeout(() => this.focusEditor(), 0);
  }

  focusEditor(): void {
    const el = this.editor?.quillEditor?.root as HTMLElement | undefined;
    el?.focus();
  }
}

