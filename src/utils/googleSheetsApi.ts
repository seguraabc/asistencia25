import supabase from '../supabase';
import { toast } from 'sonner';

export type AttendanceStatus = 'P' | 'A' | 'J' | 'X' | '';

export interface Grade {
  id: string;
  name: string;
  value: number;
}

export interface Student {
  id: string;
  name: string;
  attendances: Record<string, AttendanceStatus>;
  grades?: Grade[];
}

export interface Course {
  id: string;
  name: string;
  students: Student[];
  dates: string[];
  user_id?: string; // ID del usuario propietario del curso
}

// Función auxiliar para obtener el ID del usuario actual
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
    
    // Si no hay usuario en la sesión actual, intentar obtener de localStorage
    const storedSession = localStorage.getItem('supabaseSession');
    if (storedSession) {
      try {
        const { user: storedUser } = JSON.parse(storedSession);
        if (storedUser?.id) {
          return storedUser.id;
        }
      } catch (e) {
        console.error("Error parsing stored session:", e);
      }
    }
    
    // Si aún no tenemos ID, intentar con tempUserId
    const tempUserId = localStorage.getItem('tempUserId');
    if (tempUserId) {
      return tempUserId;
    }
    
    return null;
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    
    // Intentar obtener el ID de usuario desde localStorage como fallback
    const storedSession = localStorage.getItem('supabaseSession');
    if (storedSession) {
      try {
        const { user: storedUser } = JSON.parse(storedSession);
        if (storedUser?.id) {
          return storedUser.id;
        }
      } catch (e) {
        console.error("Error parsing stored session:", e);
      }
    }
    
    // Si aún no tenemos ID, intentar con tempUserId
    const tempUserId = localStorage.getItem('tempUserId');
    if (tempUserId) {
      return tempUserId;
    }
    
    return null;
  }
};

// Inicializa la tabla de cursos si no existe
const initializeDatabase = async () => {
  try {
    // Verificar si la tabla ya existe
    const { error: checkError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);

    // Si hay un error, probablemente la tabla no existe, así que la creamos
    if (checkError && checkError.code === '42P01') {
      console.log('Inicializando base de datos...');
      
      try {
        // Crear la tabla de cursos directamente con SQL
        const { error } = await supabase.rpc('create_courses_table');
        
        if (error) {
          console.error('Error al crear la tabla:', error);
          
          // Si no podemos usar RPC, informamos al usuario pero seguimos con localStorage
          toast.error('Error al inicializar la base de datos. Usando almacenamiento local temporal.');
        } else {
          console.log('Base de datos inicializada correctamente');
          toast.success('Base de datos inicializada correctamente');
        }
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        toast.error('Error al inicializar la base de datos. Usando almacenamiento local temporal.');
      }
    }
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
    toast.error('Error al verificar la base de datos. Usando almacenamiento local temporal.');
  }
};

// Llamamos a la función de inicialización una vez
initializeDatabase();

// Función para obtener todos los cursos disponibles
export const getCourses = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.warn('Usuario no autenticado al intentar obtener cursos');
      
      // Intentar obtener cursos temporales si existen
      const tempUserId = localStorage.getItem('tempUserId');
      if (tempUserId) {
        const localData = localStorage.getItem(`courses_${tempUserId}`);
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            return parsedData.map((course: Course) => ({
              id: course.id,
              name: course.name
            }));
          } catch (e) {
            console.error('Error al parsear datos locales temporales:', e);
          }
        }
      }
      return [];
    }
    
    const { data, error } = await supabase
      .from('courses')
      .select('id, name')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al obtener cursos desde Supabase:', error);
      throw error;
    }
    
    // Si no hay datos en Supabase o hay error, intentamos obtener de localStorage
    if (!data || data.length === 0) {
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          return parsedData.map((course: Course) => ({
            id: course.id,
            name: course.name
          }));
        } catch (e) {
          console.error('Error al parsear datos locales:', e);
        }
      }
      
      // Si no hay datos locales ni en Supabase, buscamos en tempUserId
      const tempUserId = localStorage.getItem('tempUserId');
      if (tempUserId) {
        const tempData = localStorage.getItem(`courses_${tempUserId}`);
        if (tempData) {
          try {
            const parsedTempData = JSON.parse(tempData);
            return parsedTempData.map((course: Course) => ({
              id: course.id,
              name: course.name
            }));
          } catch (e) {
            console.error('Error al parsear datos temporales:', e);
          }
        }
      }
      
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    
    // Si hay un error, intentamos obtener de localStorage
    const userId = await getCurrentUserId();
    if (userId) {
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          return parsedData.map((course: Course) => ({
            id: course.id,
            name: course.name
          }));
        } catch (e) {
          console.error('Error al parsear datos locales:', e);
        }
      }
    }
    
    // Si no hay datos locales con userId, intentamos con tempUserId
    const tempUserId = localStorage.getItem('tempUserId');
    if (tempUserId) {
      const tempData = localStorage.getItem(`courses_${tempUserId}`);
      if (tempData) {
        try {
          const parsedTempData = JSON.parse(tempData);
          return parsedTempData.map((course: Course) => ({
            id: course.id,
            name: course.name
          }));
        } catch (e) {
          console.error('Error al parsear datos temporales:', e);
        }
      }
    }
    
    return [];
  }
};

// Función para obtener un curso específico
export const getCourse = async (courseId: string): Promise<Course | null> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error al obtener curso:', error);
    
    // Si hay un error, intentamos obtener de localStorage
    const localData = localStorage.getItem(`courses_${await getCurrentUserId()}`);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        const course = parsedData.find((c: Course) => c.id === courseId);
        return course || null;
      } catch (e) {
        console.error('Error al parsear datos locales:', e);
      }
    }
    
    return null;
  }
};

// Función para actualizar la asistencia de un estudiante
export const updateAttendance = async (
  courseId: string,
  studentId: string,
  date: string,
  status: AttendanceStatus
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Primero, obtenemos el curso actual
    const course = await getCourse(courseId);
    if (!course) return false;
    
    // Actualizamos el estado de asistencia
    const studentIndex = course.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return false;
    
    course.students[studentIndex].attendances[date] = status;
    
    // Guardamos el curso actualizado
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
        
        if (courseIndex !== -1) {
          const studentIndex = courses[courseIndex].students.findIndex((s: Student) => s.id === studentId);
          
          if (studentIndex !== -1) {
            courses[courseIndex].students[studentIndex].attendances[date] = status;
            localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para añadir una fecha a un curso
export const addDateToCourse = async (courseId: string, date: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Primero, obtenemos el curso actual
    const course = await getCourse(courseId);
    if (!course) return false;
    
    // Verificamos si la fecha ya existe
    if (course.dates.includes(date)) return false;
    
    // Añadimos la nueva fecha
    course.dates.push(date);
    
    // Inicializamos asistencia vacía para todos los estudiantes
    course.students.forEach(student => {
      student.attendances[date] = '';
    });
    
    // Ordenamos las fechas cronológicamente
    course.dates.sort();
    
    // Guardamos el curso actualizado
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al añadir fecha al curso:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
        
        if (courseIndex !== -1) {
          if (!courses[courseIndex].dates.includes(date)) {
            courses[courseIndex].dates.push(date);
            courses[courseIndex].dates.sort();
            
            courses[courseIndex].students.forEach((student: Student) => {
              student.attendances[date] = '';
            });
            
            localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para calcular porcentaje de asistencia
export const calculateAttendancePercentage = (
  student: Student,
  dates: string[]
): number => {
  let validDates = 0;
  let presentDates = 0;
  
  dates.forEach(date => {
    const status = student.attendances[date];
    // Sólo contamos fechas que no están canceladas (X)
    if (status && status !== 'X') {
      validDates++;
      // Contamos presente como asistencia
      if (status === 'P') {
        presentDates++;
      }
    }
  });
  
  return validDates === 0 ? 0 : Math.round((presentDates / validDates) * 100);
};

// Función para marcar una fecha como cancelada para todos los estudiantes
export const cancelClass = async (
  courseId: string,
  date: string
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Primero, obtenemos el curso actual
    const course = await getCourse(courseId);
    if (!course) return false;
    
    // Verificamos si la fecha existe
    if (!course.dates.includes(date)) return false;
    
    // Marcamos como cancelada para todos los estudiantes
    course.students.forEach(student => {
      student.attendances[date] = 'X';
    });
    
    // Guardamos el curso actualizado
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al cancelar clase:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
        
        if (courseIndex !== -1) {
          if (courses[courseIndex].dates.includes(date)) {
            courses[courseIndex].students.forEach((student: Student) => {
              student.attendances[date] = 'X';
            });
            
            localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para crear un nuevo curso
export const createCourse = async (course: Partial<Course>): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      // Si no tenemos un ID de usuario, crear uno temporal
      const tempUserId = `temp-${Date.now()}`;
      localStorage.setItem('tempUserId', tempUserId);
      
      // Crear un nuevo objeto de curso con ID temporal
      const newCourse: Course = {
        id: Date.now().toString(), // Generamos un ID único
        name: course.name || 'Nuevo Curso',
        students: course.students || [],
        dates: course.dates || [],
        user_id: tempUserId // Usamos ID temporal
      };
      
      // Guardamos en localStorage ya que no tenemos autenticación
      const localData = localStorage.getItem(`courses_${tempUserId}`);
      let courses = [];
      
      if (localData) {
        courses = JSON.parse(localData);
      }
      
      courses.push(newCourse);
      localStorage.setItem(`courses_${tempUserId}`, JSON.stringify(courses));
      
      console.log('Curso guardado en almacenamiento local (modo sin conexión)');
      return true;
    }
    
    // Crear un nuevo objeto de curso
    const newCourse: Course = {
      id: Date.now().toString(), // Generamos un ID único
      name: course.name || 'Nuevo Curso',
      students: course.students || [],
      dates: course.dates || [],
      user_id: userId // Asignamos el ID del usuario actual
    };
    
    // Guardamos el nuevo curso en Supabase
    const { error } = await supabase
      .from('courses')
      .insert(newCourse);
    
    if (error) {
      console.error("Error insertando curso en Supabase:", error);
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    const localData = localStorage.getItem(`courses_${userId}`);
    let courses = [];
    
    if (localData) {
      courses = JSON.parse(localData);
    }
    
    courses.push(newCourse);
    localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
    
    return true;
  } catch (error) {
    console.error('Error al crear curso:', error);
    
    // Si hay un error con Supabase, intentamos guardar localmente
    try {
      const userId = await getCurrentUserId();
      const tempUserId = userId || `temp-${Date.now()}`;
      
      if (!userId) {
        localStorage.setItem('tempUserId', tempUserId);
      }
      
      const newCourse: Course = {
        id: Date.now().toString(),
        name: course.name || 'Nuevo Curso',
        students: course.students || [],
        dates: course.dates || [],
        user_id: tempUserId
      };
      
      const localData = localStorage.getItem(`courses_${tempUserId}`);
      let courses = [];
      
      if (localData) {
        courses = JSON.parse(localData);
      }
      
      courses.push(newCourse);
      localStorage.setItem(`courses_${tempUserId}`, JSON.stringify(courses));
      
      console.log('Curso guardado en almacenamiento local (modo fallback)');
      return true;
    } catch (e) {
      console.error('Error al guardar datos localmente:', e);
    }
    
    return false;
  }
};

// Función para actualizar un curso existente
export const updateCourse = async (course: Course): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Asegurarnos de que el curso pertenece al usuario actual
    course.user_id = userId;
    
    // Actualizamos el curso en Supabase
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', course.id)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === course.id);
        
        if (courseIndex !== -1) {
          course.user_id = userId;
          courses[courseIndex] = course;
          localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
          return true;
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para eliminar un curso
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Eliminamos el curso de Supabase
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    const localData = localStorage.getItem(`courses_${userId}`);
    if (localData) {
      let courses = JSON.parse(localData);
      courses = courses.filter((c: Course) => c.id !== courseId);
      localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    
    // Si hay un error con Supabase, intentamos eliminar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        let courses = JSON.parse(localData);
        courses = courses.filter((c: Course) => c.id !== courseId);
        localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
        return true;
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para añadir una calificación a un estudiante
export const addGradeToStudent = async (
  courseId: string,
  studentId: string,
  grade: Grade
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Primero, obtenemos el curso actual
    const course = await getCourse(courseId);
    if (!course) return false;
    
    // Buscamos el estudiante
    const studentIndex = course.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return false;
    
    // Inicializamos el array de calificaciones si no existe
    if (!course.students[studentIndex].grades) {
      course.students[studentIndex].grades = [];
    }
    
    // Añadimos la nueva calificación
    course.students[studentIndex].grades!.push(grade);
    
    // Guardamos el curso actualizado
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al añadir calificación:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
        
        if (courseIndex !== -1) {
          const studentIndex = courses[courseIndex].students.findIndex((s: Student) => s.id === studentId);
          
          if (studentIndex !== -1) {
            if (!courses[courseIndex].students[studentIndex].grades) {
              courses[courseIndex].students[studentIndex].grades = [];
            }
            
            courses[courseIndex].students[studentIndex].grades!.push(grade);
            localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para actualizar una calificación de un estudiante
export const updateGradeForStudent = async (
  courseId: string,
  studentId: string,
  updatedGrade: Grade
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Primero, obtenemos el curso actual
    const course = await getCourse(courseId);
    if (!course) return false;
    
    // Buscamos el estudiante
    const studentIndex = course.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return false;
    
    // Verificamos si el estudiante tiene calificaciones
    if (!course.students[studentIndex].grades) return false;
    
    // Buscamos el índice de la calificación
    const gradeIndex = course.students[studentIndex].grades!.findIndex(g => g.id === updatedGrade.id);
    if (gradeIndex === -1) return false;
    
    // Actualizamos la calificación
    course.students[studentIndex].grades![gradeIndex] = updatedGrade;
    
    // Guardamos el curso actualizado
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
        
        if (courseIndex !== -1) {
          const studentIndex = courses[courseIndex].students.findIndex((s: Student) => s.id === studentId);
          
          if (studentIndex !== -1 && courses[courseIndex].students[studentIndex].grades) {
            const gradeIndex = courses[courseIndex].students[studentIndex].grades!.findIndex((g: Grade) => g.id === updatedGrade.id);
            
            if (gradeIndex !== -1) {
              courses[courseIndex].students[studentIndex].grades![gradeIndex] = updatedGrade;
              localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para eliminar una calificación de un estudiante
export const removeGradeFromStudent = async (
  courseId: string,
  studentId: string,
  gradeId: string
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Primero, obtenemos el curso actual
    const course = await getCourse(courseId);
    if (!course) return false;
    
    // Buscamos el estudiante
    const studentIndex = course.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return false;
    
    // Verificamos si el estudiante tiene calificaciones
    if (!course.students[studentIndex].grades) return false;
    
    // Filtramos la calificación a eliminar
    course.students[studentIndex].grades = course.students[studentIndex].grades!.filter(g => g.id !== gradeId);
    
    // Guardamos el curso actualizado
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Actualizar también en localStorage como respaldo
    updateLocalStorage(userId, course);
    
    return true;
  } catch (error) {
    console.error('Error al eliminar calificación:', error);
    
    // Si hay un error con Supabase, intentamos actualizar localmente
    try {
      const userId = await getCurrentUserId();
      if (!userId) return false;
      
      const localData = localStorage.getItem(`courses_${userId}`);
      if (localData) {
        const courses = JSON.parse(localData);
        const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
        
        if (courseIndex !== -1) {
          const studentIndex = courses[courseIndex].students.findIndex((s: Student) => s.id === studentId);
          
          if (studentIndex !== -1 && courses[courseIndex].students[studentIndex].grades) {
            courses[courseIndex].students[studentIndex].grades = courses[courseIndex].students[studentIndex].grades!.filter((g: Grade) => g.id !== gradeId);
            localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Error al actualizar datos locales:', e);
    }
    
    return false;
  }
};

// Función para calcular la calificación promedio de un estudiante
export const calculateAverageGrade = (student: Student): number => {
  if (!student.grades || student.grades.length === 0) return 0;
  
  const sum = student.grades.reduce((acc, grade) => acc + grade.value, 0);
  return Math.round((sum / student.grades.length) * 10) / 10;
};

// Función auxiliar para actualizar datos en localStorage
const updateLocalStorage = async (userId: string, updatedCourse: Course) => {
  try {
    const localData = localStorage.getItem(`courses_${userId}`);
    let courses = [];
    
    if (localData) {
      courses = JSON.parse(localData);
      const courseIndex = courses.findIndex((c: Course) => c.id === updatedCourse.id);
      
      if (courseIndex !== -1) {
        courses[courseIndex] = updatedCourse;
      } else {
        courses.push(updatedCourse);
      }
    } else {
      courses = [updatedCourse];
    }
    
    localStorage.setItem(`courses_${userId}`, JSON.stringify(courses));
  } catch (e) {
    console.error('Error al actualizar localStorage:', e);
  }
};

// Función para cargar datos de ejemplo solo si no hay datos
export const loadInitialData = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    
    // Verificar si ya hay cursos para este usuario
    const { data: existingCourses, error } = await supabase
      .from('courses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    // Si ya hay cursos o hubo un error, no hacemos nada
    if (error || (existingCourses && existingCourses.length > 0)) {
      return;
    }
    
    // Datos de ejemplo (usando los mismos que teníamos antes)
    const mockCourses = [
      {
        id: "1",
        name: "Matemáticas",
        dates: [
          "2023-05-02",
          "2023-05-04",
          "2023-05-09",
          "2023-05-11",
          "2023-05-16",
          "2023-05-18",
          "2023-05-23",
          "2023-05-25",
          "2023-05-30",
        ],
        students: [
          {
            id: "1",
            name: "María García",
            attendances: {
              "2023-05-02": "P",
              "2023-05-04": "P",
              "2023-05-09": "A",
              "2023-05-11": "J",
              "2023-05-16": "P",
              "2023-05-18": "P",
              "2023-05-23": "P",
              "2023-05-25": "X",
              "2023-05-30": "P",
            },
            grades: [
              { id: "g1", name: "Parcial 1", value: 8.5 },
              { id: "g2", name: "Parcial 2", value: 7.0 }
            ]
          },
          {
            id: "2",
            name: "Pedro Rodríguez",
            attendances: {
              "2023-05-02": "P",
              "2023-05-04": "A",
              "2023-05-09": "A",
              "2023-05-11": "P",
              "2023-05-16": "P",
              "2023-05-18": "P",
              "2023-05-23": "J",
              "2023-05-25": "X",
              "2023-05-30": "P",
            },
            grades: [
              { id: "g3", name: "Parcial 1", value: 6.5 },
              { id: "g4", name: "Parcial 2", value: 8.0 }
            ]
          },
          {
            id: "3",
            name: "Ana Martínez",
            attendances: {
              "2023-05-02": "P",
              "2023-05-04": "P",
              "2023-05-09": "P",
              "2023-05-11": "P",
              "2023-05-16": "A",
              "2023-05-18": "P",
              "2023-05-23": "P",
              "2023-05-25": "X",
              "2023-05-30": "J",
            },
          },
          {
            id: "4",
            name: "Juan López",
            attendances: {
              "2023-05-02": "A",
              "2023-05-04": "P",
              "2023-05-09": "P",
              "2023-05-11": "P",
              "2023-05-16": "P",
              "2023-05-18": "A",
              "2023-05-23": "P",
              "2023-05-25": "X",
              "2023-05-30": "P",
            },
          },
          {
            id: "5",
            name: "Sofia Hernández",
            attendances: {
              "2023-05-02": "P",
              "2023-05-04": "P",
              "2023-05-09": "J",
              "2023-05-11": "P",
              "2023-05-16": "P",
              "2023-05-18": "P",
              "2023-05-23": "P",
              "2023-05-25": "X",
              "2023-05-30": "A",
            },
          },
        ],
        user_id: userId
      },
      {
        id: "2",
        name: "Física",
        dates: [
          "2023-05-03",
          "2023-05-10",
          "2023-05-17",
          "2023-05-24",
          "2023-05-31",
        ],
        students: [
          {
            id: "6",
            name: "Carlos Sánchez",
            attendances: {
              "2023-05-03": "P",
              "2023-05-10": "P",
              "2023-05-17": "A",
              "2023-05-24": "P",
              "2023-05-31": "P",
            },
          },
          {
            id: "7",
            name: "Laura González",
            attendances: {
              "2023-05-03": "P",
              "2023-05-10": "J",
              "2023-05-17": "P",
              "2023-05-24": "P",
              "2023-05-31": "P",
            },
          },
          {
            id: "8",
            name: "Miguel Torres",
            attendances: {
              "2023-05-03": "A",
              "2023-05-10": "P",
              "2023-05-17": "P",
              "2023-05-24": "X",
              "2023-05-31": "P",
            },
          },
        ],
        user_id: userId
      },
      {
        id: "3",
        name: "Historia",
        dates: [
          "2023-05-01",
          "2023-05-08",
          "2023-05-15",
          "2023-05-22",
          "2023-05-29",
        ],
        students: [
          {
            id: "9",
            name: "Elena Ramírez",
            attendances: {
              "2023-05-01": "P",
              "2023-05-08": "P",
              "2023-05-15": "P",
              "2023-05-22": "A",
              "2023-05-29": "P",
            },
          },
          {
            id: "10",
            name: "Daniel Flores",
            attendances: {
              "2023-05-01": "A",
              "2023-05-08": "J",
              "2023-05-15": "P",
              "2023-05-22": "P",
              "2023-05-29": "P",
            },
          },
        ],
        user_id: userId
      },
    ];
    
    // Insertar los cursos de ejemplo en Supabase
    for (const course of mockCourses) {
      await supabase.from('courses').insert(course);
    }
    
    // También guardar en localStorage como respaldo
    localStorage.setItem(`courses_${userId}`, JSON.stringify(mockCourses));
    
    console.log('Datos iniciales cargados correctamente');
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  }
};
