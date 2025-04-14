import { config } from './config';

// Base API URL - using environment variable
const API_BASE_URL = `${config.apiUrl}/api`;

// Generic fetch function with error handling and auth token
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  
  // Add authentication token if available
  const token = localStorage.getItem('doorway_token');
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.message && errorData.message.includes("JWT expired")) {
        console.error("JWT expired. Logging out...");
        localStorage.clear();
        window.location.href = "/login"; // Redirect to login page
      }
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}

// Form data fetch for multipart/form-data requests
async function fetchFormDataAPI<T>(endpoint: string, formData: FormData, method = "POST"): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add authentication token if available
  const token = localStorage.getItem('doorway_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    body: formData,
    headers
  });

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If parsing JSON fails, use the default error message
    }
    throw new Error(errorMessage);
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Interviewee API
export const intervieweeAPI = {
  getAll: async (decision?: string) => {
    const queryParams = decision ? `?decision=${decision}` : "";
    return fetchAPI<Interviewee[]>(`/interviewees${queryParams}`);
  },
  getById: async (id: string) => {
    return fetchAPI<Interviewee>(`/interviewees/${id}`)
  },
  checkEmail: async (email: string, excludeId?: string) => {
    const queryParams = excludeId ? `?excludeId=${excludeId}` : ""
    return fetchAPI<boolean>(`/interviewees/email/${email}${queryParams}`)
  },
  checkPhone: async (phone: string, excludeId?: string) => {
    const queryParams = excludeId ? `?excludeId=${excludeId}` : ""
    return fetchAPI<boolean>(`/interviewees/phoneNumber/${phone}${queryParams}`)
  },
  create: async (payload: any, image: File, resume: File) => {
    const formData = new FormData()
    formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }))
    formData.append("image", image)
    formData.append("resume", resume)
    return fetchFormDataAPI<Interviewee>("/interviewees", formData)
  },
  update: async (id: string, payload: any, image: File, resume: File) => {
    const formData = new FormData()
    formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }))
    formData.append("image", image)
    formData.append("resume", resume)
    return fetchFormDataAPI<Interviewee>(`/interviewees/${id}`, formData, "PUT")
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/interviewees/${id}`, { method: "DELETE" })
  },
}

// Interviewer API
export const interviewerAPI = {
  getAll: async () => {
    return fetchAPI<Interviewer[]>("/interviewers")
  },
  getById: async (id: string) => {
    return fetchAPI<Interviewer>(`/interviewers/${id}`)
  },
  checkEmail: async (email: string, excludeId?: string) => {
    const queryParams = excludeId ? `?excludeId=${excludeId}` : ""
    return fetchAPI<boolean>(`/interviewers/email/${email}${queryParams}`)
  },
  checkPhone: async (phone: string, excludeId?: string) => {
    const queryParams = excludeId ? `?excludeId=${excludeId}` : ""
    return fetchAPI<boolean>(`/interviewers/phoneNumber/${phone}${queryParams}`)
  },
  create: async (payload: any, image: File) => {
    const formData = new FormData()
    formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }))
    formData.append("image", image)
    return fetchFormDataAPI<Interviewer>("/interviewers", formData)
  },
  update: async (id: string, payload: any, image: File) => {
    const formData = new FormData()
    formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }))
    formData.append("image", image)
    return fetchFormDataAPI<Interviewer>(`/interviewers/${id}`, formData, "PUT")
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/interviewers/${id}`, { method: "DELETE" })
  },
}

// Interview API
export interface InterviewFilter {
  status?: string;
  date?: string;
  interviewer?: string;
}

export const interviewAPI = {
  getAll: async (filter: InterviewFilter, processId: string, intervieweeId: string) => {
    const queryParams = new URLSearchParams();
    if (filter.status) queryParams.append("status", filter.status);
    if (filter.date) queryParams.append("date", filter.date);
    if (filter.interviewer) queryParams.append("interviewer", filter.interviewer);
    return fetchAPI<Interview[]>(`/interviewee/${intervieweeId}/interviewing-process/${processId}/interviews?${queryParams.toString()}`);
  },
  getAllInterviews: async () => {
    return fetchAPI<Interview[]>("/interviews");
  },
  getById: async (id: string) => {
    return fetchAPI<Interview>(`/interviews/${id}`)
  },
  getByInterviewer: async (interviewerId: string) => {
    return fetchAPI<Interview[]>(`/interviewer/${interviewerId}/interviews`)
  },
  create: async (intervieweeId: string, processId: string, payload: any) => {
    return fetchAPI<Interview>(`/interviewee/${intervieweeId}/interviewing-process/${processId}/interviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, intervieweeId: string, processId: string, payload: any) => {
    return fetchAPI<Interview>(`/interviewee/${intervieweeId}/interviewing-process/${processId}/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/interviews/${id}`, { method: "DELETE" })
  },
}

// Interviewing Process API
export const interviewingProcessAPI = {
  getAll: async () => {
    return fetchAPI<InterviewingProcess[]>("/interviewing-processes")
  },
  getById: async (id: string) => {
    return fetchAPI<InterviewingProcess>(`/interviewing-processes/${id}`)
  },
  getByInterviewee: async (intervieweeId: string) => {
    return fetchAPI<InterviewingProcess[]>(`/interviewee/${intervieweeId}/interviewing-processes`)
  },
  create: async (intervieweeId: string, payload: any) => {
    return fetchAPI<InterviewingProcess>(`/interviewee/${intervieweeId}/interviewing-processes`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, payload: any) => {
    return fetchAPI<InterviewingProcess>(`/interviewing-processes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/interviewing-processes/${id}`, { method: "DELETE" })
  },
}

// Technical Question API
export const technicalQuestionAPI = {
  getAll: async () => {
    return fetchAPI<TechnicalQuestion[]>("/technical-questions")
  },
  getById: async (id: string) => {
    return fetchAPI<TechnicalQuestion>(`/technical-questions/${id}`)
  },
  create: async (payload: any) => {
    return fetchAPI<TechnicalQuestion>("/technical-questions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, payload: any) => {
    return fetchAPI<TechnicalQuestion>(`/technical-questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/technical-questions/${id}`, { method: "DELETE" })
  },
}

// Technical Answer API
export const technicalAnswerAPI = {
  getById: async (id: string) => {
    return fetchAPI<TechnicalAnswer>(`/technical-answers/${id}`)
  },
  create: async (technicalQuestionId: string, interviewId: string, payload: any) => {
    return fetchAPI<TechnicalAnswer>(`/technical-answers/${technicalQuestionId}/interview/${interviewId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (answerId: string, questionId: string, interviewId: string, payload: any) => {
    return fetchAPI<TechnicalAnswer>(`/technical-answers/${answerId}/question/${questionId}/interview/${interviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/technical-answers/${id}`, { method: "DELETE" })
  },
  getByInterviewId: async (interviewId: string) => {
    return fetchAPI<TechnicalAnswer[]>(`/technical-answers/interview/${interviewId}`)
  },
}

// Principle Question API
export const principleQuestionAPI = {
  getAll: async (principle?: string) => {
    const queryParams = principle ? `?principle=${principle}` : ""
    return fetchAPI<PrincipleQuestion[]>(`/principle-questions${queryParams}`)
  },
  getById: async (id: string) => {
    return fetchAPI<PrincipleQuestion>(`/principle-questions/${id}`)
  },
  create: async (payload: any) => {
    return fetchAPI<PrincipleQuestion>("/principle-questions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, payload: any) => {
    return fetchAPI<PrincipleQuestion>(`/principle-questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/principle-questions/${id}`, { method: "DELETE" })
  },
}

// Principle Answer API
export const principleAnswerAPI = {
  getById: async (id: string) => {
    return fetchAPI<PrincipleAnswer>(`/principle-answers/${id}`)
  },
  create: async (principleQuestionId: string, interviewId: string, payload: any) => {
    return fetchAPI<PrincipleAnswer>(`/principle-answers/${principleQuestionId}/interview/${interviewId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (answerId: string, questionId: string, interviewId: string, payload: any) => {
    return fetchAPI<PrincipleAnswer>(`/principle-answers/${answerId}/question/${questionId}/interview/${interviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/principle-answers/${id}`, { method: "DELETE" })
  },
  getByInterviewId: async (interviewId: string) => {
    return fetchAPI<PrincipleAnswer[]>(`/principle-answers/interview/${interviewId}`)
  },
}

// Role API
export const roleAPI = {
  getAll: async () => {
    return fetchAPI<Role[]>("/roles")
  },
  getById: async (id: string) => {
    return fetchAPI<Role>(`/roles/${id}`)
  },
  create: async (payload: any) => {
    return fetchAPI<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, payload: any) => {
    return fetchAPI<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/roles/${id}`, { method: "DELETE" })
  },
}

// School API
export const schoolAPI = {
  getAll: async () => {
    return fetchAPI<School[]>("/schools")
  },
  getById: async (id: string) => {
    return fetchAPI<School>(`/schools/${id}`)
  },
  create: async (payload: any) => {
    return fetchAPI<School>("/schools", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update: async (id: string, payload: any) => {
    return fetchAPI<School>(`/schools/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  delete: async (id: string) => {
    return fetchAPI<void>(`/schools/${id}`, { method: "DELETE" })
  },
}

// User API
export const userAPI = {
  getCurrentUser: async () => {
    return fetchAPI<Interviewer>("/me");
  },
};

// Types for the API responses
export enum Decision {
  HIGHLY_INCLINED = "HIGHLY_INCLINED",
  INCLINED = "INCLINED",
  NEUTRAL = "NEUTRAL",
  DECLINED = "DECLINED",
  HIGHLY_DECLINED = "HIGHLY_DECLINED",
}

export enum Bar {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum Language {
  JAVA = "JAVA",
  PYTHON = "PYTHON",
  JAVASCRIPT = "JAVASCRIPT",
  C = "C",
  CPLUSPLUS = "CPLUSPLUS",
  CSHARP = "CSHARP",
  RUBY = "RUBY",
  SWIFT = "SWIFT",
  KOTLIN = "KOTLIN",
  GO = "GO",
  TYPESCRIPT = "TYPESCRIPT",
  PHP = "PHP",
  RUST = "RUST",
  SCALA = "SCALA",
  R = "R",
  SHELL = "SHELL",
  SQL = "SQL",
  HTML = "HTML",
  CSS = "CSS",
  XML = "XML",
  JSON = "JSON",
  YAML = "YAML",
  MARKDOWN = "MARKDOWN",
  LATEX = "LATEX",
}

export enum ExcellencePrinciple {
  IMPACTFUL_DELIVERY = "IMPACTFUL_DELIVERY",
  WISE_INSIGHTS = "WISE_INSIGHTS",
  SIMPLIFIED_INNOVATION = "SIMPLIFIED_INNOVATION",
  OUTSTANDING_MENTORSHIP = "OUTSTANDING_MENTORSHIP",
  OBSESSIVE_AMBITION = "OBSESSIVE_AMBITION",
  CUSTOMER_DEDICATION = "CUSTOMER_DEDICATION",
  DEEP_OWNERSHIP = "DEEP_OWNERSHIP",
  PERFECTIONIST_MASTERY = "PERFECTIONIST_MASTERY",
  EMPATHIC_INCLUSION = "EMPATHIC_INCLUSION",
  CONFIDENT_MODESTY = "CONFIDENT_MODESTY",
}

// Update the interfaces to match the backend entities
export interface TechnicalQuestion {
  id: number;
  question: string;
}

export interface PrincipleQuestion {
  id: number;
  question: string;
  principle: ExcellencePrinciple;
}

export interface School {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Interviewee {
  id: string; // UUID
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  school: School;
  profilePicture: string;
  resume: string;
  newestInterviewingProcess?: InterviewingProcess;
}

export interface Interviewer {
  id: string; // UUID
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: Role;
  profilePicture: string;
}

export interface InterviewingProcess {
  id: string; // UUID
  decision: Decision;
  feedback: string;
  role: Role;
  interviewee: Interviewee;
  intervieweeId: string; // UUID
  interviews: Interview[];
  createdAt: string;
}

export interface Interview {
  id: string; // UUID
  feedback: string;
  decision: Decision;
  scheduledAt: string;
  interviewer: Interviewer;
  interviewingProcess: InterviewingProcess;
  principleAnswers?: PrincipleAnswer[];
  technicalAnswers?: TechnicalAnswer[];
}

export interface PrincipleAnswer {
  id: number;
  answer: string;
  bar: Bar;
  question: PrincipleQuestion;
  interview: Interview;
}

export interface TechnicalAnswer {
  id: number;
  language: Language;
  answer: string;
  bar: Bar;
  question: TechnicalQuestion;
  interview: Interview;
}

