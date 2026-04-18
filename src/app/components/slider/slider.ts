import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.html',
  styleUrl: './slider.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
})
export class SliderComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() minLabel = '';
  @Input() maxLabel = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<number>();

  value = 0;

  private onChange: (val: number) => void = () => {};
  private onTouched: () => void = () => {};

  get fillPercent(): number {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  onSliderInput(event: Event): void {
    this.value = Number((event.target as HTMLInputElement).value);
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  markTouched(): void {
    this.onTouched();
  }

  writeValue(val: number): void {
    this.value = val ?? this.min;
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
