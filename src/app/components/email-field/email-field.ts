import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-email-field',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './email-field.html',
  styleUrl: './email-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailFieldComponent),
      multi: true,
    },
  ],
})
export class EmailFieldComponent implements ControlValueAccessor {
  @Input() label = 'Email address';
  @Input() autocomplete = 'email';
  @Input() errorMessage = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value = '';

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
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
