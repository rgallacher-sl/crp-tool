import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-free-text-box',
  standalone: true,
  templateUrl: './free-text-box.html',
  styleUrl: './free-text-box.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FreeTextBoxComponent),
      multi: true,
    },
  ],
})
export class FreeTextBoxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 8;
  @Input() disabled = false;
  @Input() errorMessage = '';
  @Output() valueChange = new EventEmitter<string>();

  value = '';

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  writeValue(val: string): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
