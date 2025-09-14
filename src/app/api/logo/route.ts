import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'main';
    
    let imagePath: string;
    
    if (type === 'main') {
      imagePath = path.join(process.cwd(), "public", "images", "img.jpg");
    } else {
      imagePath = path.join(process.cwd(), "public", "logo.png");
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return new NextResponse("Logo image not found", { status: 404 });
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Determine content type
    const ext = path.extname(imagePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error serving logo:', error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
