import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "data",
  "cake-options.json"
);

function readData() {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeData(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  writeData(body);

  return NextResponse.json({
    success: true
  });
}
