import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Output() checkedChange = new EventEmitter<boolean>();

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  onToggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.checkedChange.emit(this.checked);
    }
  }

  writeValue(val: boolean): void {
    this.checked = val;
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
