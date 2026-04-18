import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './number-input.html',
  styleUrl: './number-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() disabled = false;
  @Input() errorMessage = '';
  @Output() valueChange = new EventEmitter<number | null>();

  value: number | null = null;

  private onChange: (val: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw === '' ? null : Number(raw);
    this.value = parsed;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  markTouched(): void {
    this.onTouched();
  }

  writeValue(val: number | null): void {
    this.value = val ?? null;
  }

  registerOnChange(fn: (val: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
