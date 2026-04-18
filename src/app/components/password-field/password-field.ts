import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './password-field.html',
  styleUrl: './password-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordFieldComponent),
      multi: true,
    },
  ],
})
export class PasswordFieldComponent implements ControlValueAccessor {
  @Input() label = 'Password';
  @Input() autocomplete = 'current-password';
  @Input() errorMessage = '';
  @Input() forgotPasswordHref?: string;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  showPassword = false;

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  toggle(): void {
    this.showPassword = !this.showPassword;
  }

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
