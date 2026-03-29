function pickAiApiUrl() {
  const forge = process.env.BUILT_IN_FORGE_API_URL?.trim();
  if (forge) return forge;
  const openaiBase = process.env.OPENAI_BASE_URL?.trim();
  if (openaiBase) return openaiBase;
  if (process.env.OPENAI_API_KEY?.trim()) return "https://api.openai.com";
  return "";
}
function pickAiApiKey() {
  return process.env.BUILT_IN_FORGE_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "";
}
const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: pickAiApiUrl(),
  forgeApiKey: pickAiApiKey(),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/quizpulse",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiry: process.env.JWT_EXPIRY ?? "7d",
  port: parseInt(process.env.PORT ?? "3000", 10),
  frontendUrl: process.env.FRONTEND_URL ?? ""
};
export {
  ENV
};
