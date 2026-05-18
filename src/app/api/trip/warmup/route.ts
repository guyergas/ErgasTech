import { NextRequest, NextResponse } from "next/server";
import * as http from "http";

export const maxDuration = 600;

export async function GET(req: NextRequest) {
  // Check if worker is ready
  try {
    const isReady = await checkWorkerHealth();
    if (isReady) {
      return NextResponse.json({ status: "ready" });
    } else {
      return NextResponse.json(
        { status: "warming" },
        { status: 503 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: "Worker unavailable" },
      { status: 503 }
    );
  }
}

function checkWorkerHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: "localhost",
        port: 9999,
        path: "/health",
        timeout: 5000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}
