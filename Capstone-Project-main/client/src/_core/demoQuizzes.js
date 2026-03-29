const DEMO_QUIZZES_KEY = "quizpulse59_demo_quizzes";
function randomPin(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += chars[Math.floor(Math.random() * chars.length)];
  }
  return pin;
}
function getDemoQuizzes() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_QUIZZES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function saveDemoQuiz(quiz) {
  const pin = randomPin(6);
  const id = `demo-${Date.now()}`;
  const newQuiz = {
    id,
    title: quiz.title,
    description: quiz.description,
    pin,
    isPublished: false,
    createdAt: Date.now(),
    questions: quiz.questions ?? []
  };
  const list = getDemoQuizzes();
  list.unshift(newQuiz);
  localStorage.setItem(DEMO_QUIZZES_KEY, JSON.stringify(list));
  return { pin, id };
}
function getDemoQuizByPin(pin) {
  const list = getDemoQuizzes();
  const upper = pin.toUpperCase();
  return list.find((q) => q.pin === upper) ?? null;
}
function removeDemoQuiz(id) {
  const list = getDemoQuizzes().filter((q) => q.id !== id);
  localStorage.setItem(DEMO_QUIZZES_KEY, JSON.stringify(list));
}
export {
  getDemoQuizByPin,
  getDemoQuizzes,
  removeDemoQuiz,
  saveDemoQuiz
};
