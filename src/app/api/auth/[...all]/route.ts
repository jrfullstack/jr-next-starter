import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/server";

// Every Better Auth endpoint lives under /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);
