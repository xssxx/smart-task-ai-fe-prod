"use client"

import { CalendarDateTime } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useRef, useState } from "react";
import { DateValue, TimeValue, useDateSegment, useInteractOutside, useLocale, useTimeField } from "react-aria";
import { DateFieldState, DatePickerStateOptions, DateSegment as IDateSegment, useDatePickerState, useTimeFieldState } from "react-stately";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Toggle } from "./toggle";
import { Calendar } from "./calendar";

interface DateSegmentProps {
  segment: IDateSegment;
  state: DateFieldState;
}

function DateSegment({ segment, state }: DateSegmentProps) {
  const ref = useRef(null);

  const {
    segmentProps: { ...segmentProps },
  } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        "focus:rounded-[2px] focus:bg-accent focus:text-accent-foreground focus:outline-none",
        segment.type !== "literal" ? "px-px" : "",
        segment.isPlaceholder ? "text-muted-foreground" : ""
      )}
    >
      {segment.text}
    </div>
  );
}

function TimeField({ hasTime, onHasTimeChange, disabled, ...props }: {
  disabled: boolean
  hasTime: boolean
  onHasTimeChange: (hasTime: boolean) => void
  value: TimeValue | null
  onChange: (value: TimeValue | null) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { locale } = useLocale();
  const state = useTimeFieldState({
    ...props,
    locale,
  });

  useTimeField(props, state, ref);

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
        <div
          ref={ref}
          className="inline-flex h-10 w-full flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {state.segments.map((segment, i) => (
            <DateSegment key={i} segment={segment} state={state} />
          ))}
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
    onInteractOutside: () => {
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
            props.isDisabled && "bg-gray-50"
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
