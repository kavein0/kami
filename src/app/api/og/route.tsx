import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const image = searchParams.get("image");

    if (!title) {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0a0a0f",
              backgroundImage: "linear-gradient(to bottom right, #0a0a0f, #1a1a2e)",
            }}
          >
            <h1
              style={{
                fontSize: 100,
                color: "#00f0ff",
                fontFamily: "sans-serif",
                fontWeight: "bolder",
                letterSpacing: "-0.05em",
                textShadow: "0 0 40px rgba(0,240,255,0.8)",
              }}
            >
              MiruVerse
            </h1>
            <p style={{ color: "#e0e0ee", fontSize: 40, marginTop: 20 }}>
              Tracker for Anime & Movies
            </p>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#0a0a0f",
          }}
        >
          {/* Background image blurred layer */}
          <div style={{ display: 'flex', position: 'absolute', inset: 0, opacity: 0.3 }}>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px)' }} />
            )}
          </div>
          
          <div style={{ display: 'flex', position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,1), rgba(10,10,15,0.4))' }}></div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 80,
              width: "60%",
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ padding: '8px 16px', background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', borderRadius: 8, color: '#00f0ff', fontSize: 24, fontWeight: 'bold' }}>
                MiruVerse
              </div>
            </div>
            
            <h1
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "white",
                lineHeight: 1.1,
                fontFamily: "sans-serif",
                textWrap: "balance",
                textShadow: "0 0 20px rgba(0,0,0,0.8)",
              }}
            >
              {title.length > 60 ? title.substring(0, 60) + "..." : title}
            </h1>
            
            <p style={{ color: "#00f0ff", fontSize: 32, marginTop: 20 }}>
              Check out on MiruVerse ✨
            </p>
          </div>
          
          {image && (
            <div style={{ display: 'flex', width: '40%', height: '100%', padding: '60px 80px 60px 0', zIndex: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 40px rgba(0,240,255,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  style={{
                    width: 380,
                    height: 550,
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
