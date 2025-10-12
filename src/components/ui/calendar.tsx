import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-sm font-medium",
  nav: "space-x-1 flex items-center",
  nav_button: cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
  ),
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",

  table: "w-full table-fixed border-collapse",
  head_row: "grid grid-cols-7 w-full",
  head_cell: "text-muted-foreground font-normal text-[0.8rem] text-center py-1",
  row: "grid grid-cols-7 w-full mt-2",

  /* ✅ no bg on the cell when selected */
  cell: "p-6 relative aspect-square overflow-hidden focus-within:relative focus-within:z-20",

  /* day fills the cell; remove any ring; your colors live here */
  day: cn(
    buttonVariants({ variant: "ghost" }),
    "w-full h-full p-0 flex items-center justify-center rounded-md " +
      " ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-primary/50 hover:text-primary-foreground hover:font-bold"
  ),

  day_range_end: "day-range-end",

  /* ✅ only the button is colored, not the td */
  day_selected: "font-bold bg-primary text-primary-foreground",

  day_today: "font-bold bg-accent text-primary",

  /* ✅ no tinted bg for outside selected days */
  day_outside: "day-outside text-muted-foreground opacity-50",

  day_disabled: "text-muted-foreground opacity-50",

  /* if you don't use range selection, keep this inert */
  day_range_middle: "",

  day_hidden: "invisible",
  ...classNames,
}}

      components={{
        IconLeft: (props) => <ChevronLeft className="h-4 w-4" {...props} />,
        IconRight: (props) => <ChevronRight className="h-4 w-4" {...props} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
export { Calendar };
