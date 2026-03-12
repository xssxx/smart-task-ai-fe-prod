"use client"

import { CalendarDateTime, Time } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { DateValue, TimeValue, useInteractOutside } from "react-aria";
import { DatePickerStateOptions, useDatePickerState } from "react-stately";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Toggle } from "./toggle";
import { Calendar } from "./calendar";

interface TimeInputSegmentProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
}

function TimeInputSegment({ value, onChange, max, min = 0 }: TimeInputSegmentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused && inputValue !== ""
    ? inputValue
    : value.toString().padStart(2, "0");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      return;
    }
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      setInputValue("");
      onChange(min);
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    const newInputValue = inputValue + e.key;

    if (newInputValue.length >= 2) {
      const numValue = parseInt(newInputValue, 10);
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue("");
    } else {
      const numValue = parseInt(newInputValue, 10);
      const maxFirstDigit = Math.floor(max / 10);
      
      if (numValue > maxFirstDigit) {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        onChange(clampedValue);
        setInputValue("");
      } else {
        setInputValue(newInputValue);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue("");
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue !== "") {
      const numValue = parseInt(inputValue, 10);
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
    setInputValue("");
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={() => {}}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "w-6 text-center bg-transparent outline-none",
        "focus:rounded-[2px] focus:bg-accent focus:text-accent-foreground"
      )}
      maxLength={2}
    />
  );
}

function TimeField({ hasTime, onHasTimeChange, disabled, value, onChange }: {
  disabled: boolean
  hasTime: boolean
  onHasTimeChange: (hasTime: boolean) => void
  value: TimeValue | null
  onChange: (value: TimeValue | null) => void
}) {
  const hour = value?.hour ?? 0;
  const minute = value?.minute ?? 0;

  const handleHourChange = useCallback((newHour: number) => {
    onChange(new Time(newHour, minute));
  }, [minute, onChange]);

  const handleMinuteChange = useCallback((newMinute: number) => {
    onChange(new Time(hour, newMinute));
  }, [hour, onChange]);

  return (
    <div className={cn("flex items-center space-x-2 mt-1", disabled ? "cursor-not-allowed opacity-70" : "")}>
      <Toggle
        disabled={disabled}
        pressed={hasTime}
        onPressedChange={onHasTimeChange}
        size="lg"
        variant="outline"
        aria-label="Toggle time"
      >
        <ClockIcon size='16px' />
      </Toggle>
      {hasTime && (
        <div className="inline-flex h-10 w-full flex-1 items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <TimeInputSegment
            value={hour}
            onChange={handleHourChange}
            max={23}
            min={0}
          />
          <span className="px-0.5">:</span>
          <TimeInputSegment
            value={minute}
            onChange={handleMinuteChange}
            max={59}
            min={0}
          />
        </div>
      )}
    </div>
  );
}

const dateToCalendarDateTime = (date: Date): CalendarDateTime => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const millisecond = date.getMilliseconds();

  return new CalendarDateTime(year, month, day, hour, minute, second, millisecond);
}

type DatePickerProps = {
  value?: { date?: Date | null, hasTime: boolean }
  onChange: (value: { date: Date, hasTime: boolean }) => void
  isDisabled?: boolean
  placeholder?: string
}

const DateTimePicker = (props: DatePickerProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const hasTime = props.value?.hasTime || false

  const onChangeWrapper = (value: DateValue | null, newHasTime?: boolean) => {
    if (!value) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    props.onChange({ date: value.toDate(timeZone), hasTime: newHasTime ?? hasTime })
  }

  const datePickerProps: DatePickerStateOptions<CalendarDateTime> = {
    value: props.value?.date ? dateToCalendarDateTime(props.value.date) : undefined,
    onChange: onChangeWrapper,
    isDisabled: props.isDisabled,
    granularity: 'minute',
  }

  const state = useDatePickerState(datePickerProps)

  useInteractOutside({
    ref: contentRef,
    onInteractOutside: (e) => {
      const target = e.target as Node;
      if (contentRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    },
  });

  const dateDisplayFormat = hasTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'

  return (
    <Popover open={open} onOpenChange={setOpen} aria-label='Date Time Picker'>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={props.isDisabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !props.value?.date && "text-muted-foreground",
            props.isDisabled && "bg-muted"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.value?.date ? format(props.value.date, dateDisplayFormat) : <span>{props.placeholder || "เลือกวันเวลา"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={contentRef} className="w-auto" align="start">
        <Calendar
          mode="single"
          selected={props.value?.date || undefined}
          onSelect={value => value && onChangeWrapper(dateToCalendarDateTime(value))}
          autoFocus
          footer={
            <TimeField
              aria-label='Time Picker'
              disabled={!props.value?.date}
              hasTime={hasTime}
              onHasTimeChange={newHasTime =>
                props.value?.date && onChangeWrapper(dateToCalendarDateTime(props.value.date), newHasTime)
              }
              value={hasTime ? state.timeValue : null}
              onChange={(value) => value && state.setTimeValue(value)}
            />
          }
        />
      </PopoverContent>
    </Popover>
  );
};

export { DateTimePicker };
