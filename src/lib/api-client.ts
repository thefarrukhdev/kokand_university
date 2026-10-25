export type Vacancy = {
  id: string;
  title: string;
  description: string;
  url?: string;
  created_at?: string;
};

export interface SubscriptionPayload {
  fullName: string;
  phone: string;
  major: string;
  vacansy_id: string; // The backend expects this exact typo 'vacansy_id' based on previous code
  captcha: string;
}

export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://univer-production.up.railway.app";

export const fetchVacancies = async (): Promise<Vacancy[]> => {
  const res = await fetch(`${API_BASE_URL}/vacancies`);
  if (!res.ok) {
    throw new Error("Failed to fetch vacancies");
  }
  const json = await res.json();
  const vacancies = json.data || [];
  return vacancies.sort((a: Vacancy, b: Vacancy) => 
    new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
  );
};

export const submitSubscription = async (payload: SubscriptionPayload): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("fullName", payload.fullName);
  formData.append("phone", payload.phone);
  formData.append("major", payload.major);
  formData.append("vacansy_id", payload.vacansy_id);
  formData.append("captcha", payload.captcha);

  const res = await fetch(`${API_BASE_URL}/subscriptions`, {
    method: "POST",
    body: formData,
  });

  const text = await res.text();
  let data: ApiResponse = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data.message || "Server xatosi");
  }

  return data;
};
