// Use Roboto font to match the example's aesthetic
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Import desired weights
});

export const metadata = {
  title: "YT Course Taker",
  description: "Turn YouTube videos into interactive courses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply the global dark background and primary text color */}
      <body className={`${roboto.className} bg-background text-text-primary`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
