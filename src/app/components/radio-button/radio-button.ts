import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  templateUrl: './radio-button.html',
  styleUrl: './radio-button.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonComponent),
      multi: true,
    },
  ],
})
export class RadioButtonComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() value: unknown = '';
  @Input() name = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<unknown>();

  private onChange: (val: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  onSelect(): void {
    if (!this.disabled) {
      this.checked = true;
      this.onChange(this.value);
      this.checkedChange.emit(this.value);
    }
  }

  writeValue(val: unknown): void {
    this.checked = val === this.value;
  }

  registerOnChange(fn: (val: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
