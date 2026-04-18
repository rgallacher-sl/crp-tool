import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Split slider: a single slider handle controlling two linked percentage values
 * that always sum to 100. The bound value is the left-side percentage (0–100).
 *
 * The number inputs use type="text" + inputmode="numeric" per GOV.UK guidance:
 * avoids accidental increment-on-scroll and gives explicit invalid-input feedback.
 *
 * WCAG 2.5.1 (Pointer Gestures): the editable number inputs serve as the
 * non-drag alternative required when using a range slider.
 */
@Component({
  selector: 'app-split-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './split-slider.html',
  styleUrl: './split-slider.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SplitSliderComponent),
      multi: true,
    },
  ],
})
export class SplitSliderComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() leftLabel = '';
  @Input() rightLabel = '';
  @Input() disabled = false;

  /** Left-side percentage (0–100). Right side = 100 − leftValue. */
  leftValue = 50;

  private onChange: (val: number) => void = () => {};
  private _onTouched: () => void = () => {};

  markTouched(): void {
    this._onTouched();
  }

  get rightValue(): number {
    return 100 - this.leftValue;
  }

  get fillPercent(): string {
    return `${this.leftValue}%`;
  }

  onSliderInput(event: Event): void {
    this.leftValue = Number((event.target as HTMLInputElement).value);
    this.emit();
  }

  onLeftInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      this.leftValue = Math.min(100, Math.max(0, parsed));
      this.emit();
    }
  }

  onRightInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      this.leftValue = 100 - Math.min(100, Math.max(0, parsed));
      this.emit();
    }
  }

  /** Clamp left input to valid range on blur. */
  onLeftBlur(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseInt(raw, 10);
    this.leftValue = isNaN(parsed) ? 50 : Math.min(100, Math.max(0, parsed));
    (event.target as HTMLInputElement).value = String(this.leftValue);
    this.emit();
    this._onTouched();
  }

  /** Clamp right input to valid range on blur. */
  onRightBlur(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseInt(raw, 10);
    const clamped = isNaN(parsed) ? 50 : Math.min(100, Math.max(0, parsed));
    this.leftValue = 100 - clamped;
    (event.target as HTMLInputElement).value = String(clamped);
    this.emit();
    this._onTouched();
  }

  private emit(): void {
    this.onChange(this.leftValue);
  }

  writeValue(val: number): void {
    this.leftValue = val ?? 50;
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
