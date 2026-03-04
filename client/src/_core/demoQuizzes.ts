const DEMO_QUIZZES_KEY = "quizpulse59_demo_quizzes";

export type DemoQuestion = {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;
};

export type DemoQuiz = {
  id: string;
  title: string;
  description: string;
  pin: string;
  isPublished: boolean;
  createdAt: number;
  questions?: DemoQuestion[];
};

function randomPin(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += chars[Math.floor(Math.random() * chars.length)];
  }
  return pin;
}

export function getDemoQuizzes(): DemoQuiz[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_QUIZZES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as DemoQuiz[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveDemoQuiz(quiz: {
  title: string;
  description: string;
  questions?: DemoQuestion[];
}): { pin: string; id: string } {
  const pin = randomPin(6);
  const id = `demo-${Date.now()}`;
  const newQuiz: DemoQuiz = {
    id,
    title: quiz.title,
    description: quiz.description,
    pin,
    isPublished: false,
    createdAt: Date.now(),
    questions: quiz.questions ?? [],
  };
  const list = getDemoQuizzes();
  list.unshift(newQuiz);
  localStorage.setItem(DEMO_QUIZZES_KEY, JSON.stringify(list));
  return { pin, id };
}

export function getDemoQuizByPin(pin: string): DemoQuiz | null {
  const list = getDemoQuizzes();
  const upper = pin.toUpperCase();
  return list.find((q) => q.pin === upper) ?? null;
}

export function removeDemoQuiz(id: string): void {
  const list = getDemoQuizzes().filter((q) => q.id !== id);
  localStorage.setItem(DEMO_QUIZZES_KEY, JSON.stringify(list));
}
