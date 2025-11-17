import cors from "cors";

export const corsConfig = cors({
  origin: ["http://localhost:3000", "https://mindcare.vercel.app"], // ajuste para os domínios do frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});
