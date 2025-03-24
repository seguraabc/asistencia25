
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { createStableDate } from '@/utils/dateUtils';

interface CalendarGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateCalendar: (generatedDates: string[]) => void;
}

const daysOfWeek = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
];

const CalendarGenerator: React.FC<CalendarGeneratorProps> = ({
  open,
  onOpenChange,
  onGenerateCalendar
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addMonths(new Date(), 3));
  
  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prevDays => 
      prevDays.includes(dayId)
        ? prevDays.filter(id => id !== dayId)
        : [...prevDays, dayId]
    );
  };

  const generateCalendar = () => {
    if (!startDate || !endDate || selectedDays.length === 0) {
      toast.error('Selecciona fecha de inicio, fecha de fin y al menos un día de la semana');
      return;
    }

    if (startDate > endDate) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    const generatedDates: string[] = [];
    
    const currentDate = new Date(startDate);
    currentDate.setHours(12, 0, 0, 0);
    
    const finalDate = new Date(endDate);
    finalDate.setHours(23, 59, 59, 999);

    while (currentDate <= finalDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedDays.includes(dayOfWeek)) {
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        generatedDates.push(formattedDate);
      }
      
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(12, 0, 0, 0);
      currentDate.setTime(nextDate.getTime());
    }

    if (generatedDates.length === 0) {
      toast.error('No se generaron fechas. Verifica el rango y los días seleccionados.');
      return;
    }
    
    onGenerateCalendar(generatedDates);
    toast.success(`Se generaron ${generatedDates.length} fechas`);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generar Calendario de Clases</DialogTitle>
          <DialogDescription>
            Selecciona el período y los días de la semana para generar automáticamente las fechas de clase.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de inicio</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Seleccionar</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Seleccionar</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Días de clase</label>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map(day => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`day-${day.id}`} 
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <label 
                    htmlFor={`day-${day.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {day.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={generateCalendar}>
            Generar Fechas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarGenerator;
