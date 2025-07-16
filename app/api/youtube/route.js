import { NextResponse } from "next/server";

// Helper functions (moved from the original script)
const extractVideoId = (url) => {
  return (
    (url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
    ) || [])[1] || null
  );
};

const convertTimestampToSeconds = (ts) => {
  const p = ts.split(":").map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
};

const parseTimestamps = (desc) => {
  const segments = [];
  const regex = /(\d{1,2}:)?\d{1,2}:\d{2}/g; // Use global flag
  const lines = desc.split("\n");

  lines.forEach((line) => {
    // A more robust regex to find the timestamp at the start of a line
    const match = line.match(/^(\s*)(\d{1,2}:)?\d{1,2}:\d{2}/);
    if (match) {
      const timestamp = match[0].trim();
      const title = line
        .replace(timestamp, "")
        .replace(/^[\s-–—]*/, "")
        .trim();
      if (title) {
        segments.push({
          start_seconds: convertTimestampToSeconds(timestamp),
          title,
        });
      }
    }
  });
  return segments;
};

const parseISO8601Duration = (dur) => {
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return (
    parseInt(m[1] || 0) * 3600 + parseInt(m[2] || 0) * 60 + parseInt(m[3] || 0)
  );
};

export async function POST(request) {
  const { youtubeUrl } = await request.json();
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key is not configured." },
      { status: 500 }
    );
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    return NextResponse.json(
      { error: "Invalid YouTube URL provided." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );
    if (!res.ok) {
      const errorData = await res.json();
      console.error("YouTube API Error:", errorData);
      return NextResponse.json(
        { error: `API Error: ${errorData.error.message}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    if (!data.items?.length) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const item = data.items[0];
    const segmentsRaw = parseTimestamps(item.snippet.description);

    if (!segmentsRaw.length) {
      return NextResponse.json(
        { error: "No valid timestamps found in the video description." },
        { status: 400 }
      );
    }

    const totalDuration = parseISO8601Duration(item.contentDetails.duration);

    // Add end times and durations to each segment
    const segments = segmentsRaw.map((seg, i) => {
      const end_seconds =
        i < segmentsRaw.length - 1
          ? segmentsRaw[i + 1].start_seconds
          : totalDuration;
      return {
        ...seg,
        end_seconds,
        duration_seconds: end_seconds - seg.start_seconds,
        // These will be used for the Firestore document
        completed: false,
        notes: "",
      };
    });

    return NextResponse.json({
      videoId: videoId,
      title: item.snippet.title,
      segments: segments,
    });
  } catch (error) {
    console.error("Failed to fetch from YouTube API:", error);
    return NextResponse.json(
      { error: "Failed to process the YouTube video." },
      { status: 500 }
    );
  }
}
