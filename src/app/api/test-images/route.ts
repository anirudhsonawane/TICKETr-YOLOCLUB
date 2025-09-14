import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const publicPath = path.join(process.cwd(), "public");
    
    const imageTests = [
      {
        path: "/images/img.jpg",
        fullPath: path.join(publicPath, "images", "img.jpg"),
        exists: false
      },
      {
        path: "/logo.png", 
        fullPath: path.join(publicPath, "logo.png"),
        exists: false
      }
    ];

    // Check if files exist
    imageTests.forEach(test => {
      test.exists = fs.existsSync(test.fullPath);
    });

    return NextResponse.json({
      success: true,
      message: "Image availability test",
      images: imageTests,
      publicPath: publicPath,
      cwd: process.cwd()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to test images"
    }, { status: 500 });
  }
}
