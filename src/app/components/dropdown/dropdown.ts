import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

export interface DropdownOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() placeholder = 'Select an option';
  @Input() options: DropdownOption[] = [];
  @Input() disabled = false;
  @Input() errorMessage = '';
  @Output() valueChange = new EventEmitter<string | number>();

  value: string | number = '';

  private onChange: (val: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedLabel(): string {
    return this.options.find(o => o.value === this.value)?.label ?? this.placeholder;
  }

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const option = this.options.find(o => String(o.value) === val);
    if (option) {
      this.value = option.value;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
    }
    this.onTouched();
  }

  writeValue(val: string | number): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (val: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
