
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AttendanceStatus, Student, updateAttendance, calculateAttendancePercentage } from '@/utils/googleSheetsApi';
import { toast } from "sonner";

interface StudentRowProps {
  student: Student;
  date: string;
  courseId: string;
  dates: string[];
  onUpdate: () => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, date, courseId, dates, onUpdate }) => {
  const attendanceStatus = student.attendances[date] || '';
  const [status, setStatus] = useState<AttendanceStatus>(attendanceStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Calculate attendance percentage
  const percentage = calculateAttendancePercentage(student, dates);
  
  const handleStatusChange = async (newStatus: AttendanceStatus) => {
    if (status === newStatus) return;
    
    setStatus(newStatus);
    setIsUpdating(true);
    
    try {
      const success = await updateAttendance(courseId, student.id, date, newStatus);
      if (success) {
        onUpdate();
        toast.success(`Asistencia de ${student.name} actualizada`);
      } else {
        toast.error('Error al actualizar asistencia');
        // Reset to previous status on failure
        setStatus(attendanceStatus);
      }
    } catch (error) {
      console.error('Error updating attendance', error);
      toast.error('Error al actualizar asistencia');
      setStatus(attendanceStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card className="p-4 mb-2 glass-card hover:shadow-md transition-all duration-300">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-medium text-primary">{student.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-medium">{student.name}</h3>
            <div className="flex items-center mt-1">
              <Badge 
                variant="outline" 
                className={`
                  ${percentage >= 80 ? 'bg-attendance-present/10 text-attendance-present' : 
                    percentage >= 60 ? 'bg-attendance-justified/10 text-attendance-justified' : 
                    'bg-attendance-absent/10 text-attendance-absent'}
                `}
              >
                {percentage}% Asistencia
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isUpdating ? (
            <Button variant="ghost" disabled className="px-2 py-1">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleStatusChange('P')}
                className={`attendance-button attendance-present ${status === 'P' ? 'active' : ''}`}
                disabled={attendanceStatus === 'X'} // Disable for cancelled classes
                title="Presente"
              >
                P
              </Button>
              <Button
                onClick={() => handleStatusChange('A')}
                className={`attendance-button attendance-absent ${status === 'A' ? 'active' : ''}`}
                disabled={attendanceStatus === 'X'} // Disable for cancelled classes
                title="Ausente"
              >
                A
              </Button>
              <Button
                onClick={() => handleStatusChange('J')}
                className={`attendance-button attendance-justified ${status === 'J' ? 'active' : ''}`}
                disabled={attendanceStatus === 'X'} // Disable for cancelled classes
                title="Justificado"
              >
                J
              </Button>
              {attendanceStatus === 'X' && (
                <Button
                  className="attendance-button attendance-cancelled active"
                  disabled
                  title="Clase Cancelada"
                >
                  X
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StudentRow;
