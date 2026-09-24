import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "cakes.json");

function readData() {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeData(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  const data = readData();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const admin = searchParams.get("admin");

  let cakes = data.cakes;

  if (admin !== "true") {
    cakes = cakes.filter((cake: any) => cake.active);
  }

  if (category && category !== "All") {
    cakes = cakes.filter(
      (cake: any) =>
        cake.category === category ||
        cake.tags?.includes(category)
    );
  }

  if (search) {
    const q = search.toLowerCase();

    cakes = cakes.filter(
      (cake: any) =>
        cake.name.toLowerCase().includes(q) ||
        cake.description.toLowerCase().includes(q) ||
        cake.tags?.some((tag: string) =>
          tag.toLowerCase().includes(q)
        )
    );
  }

  return NextResponse.json(cakes);
}

export async function POST(request: NextRequest) {
  const data = readData();
  const body = await request.json();

  const cake = {
    id: `cake-${Date.now()}`,
    name: body.name,
    slug:
      body.slug ||
      body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-"),
    description: body.description || "",
    category: body.category || "Birthday",
    price: Number(body.price || 0),
    rating: 5,
    reviews: 0,
    eggless: Boolean(body.eggless),
    featured: Boolean(body.featured),
    bestseller: Boolean(body.bestseller),
    customizable: body.customizable !== false,
    active: body.active !== false,
    image: body.image || "",
    tags: body.tags || []
  };

  data.cakes.push(cake);
  writeData(data);

  return NextResponse.json(cake, { status: 201 });
}
