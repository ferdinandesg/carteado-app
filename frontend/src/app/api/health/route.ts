import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "frontend",
    version: process.env.APP_VERSION || "dev",
    nodeEnv: process.env.NODE_ENV || "development",
  });
}
