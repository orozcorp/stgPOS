import "./globals.css";

import { ThemeModeScript } from "flowbite-react";
import MainNavbar from "@/components/Navbar";
import { OnlineContainer } from "@/components/Contexts/OnlineContext";
export const metadata = {
  title: "Sterling POS",
  description: "Sterling POS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <ThemeModeScript />
      </head>
      <body>
        <OnlineContainer>
          <main className={` flex flex-col flex-nowrap min-h-screen bg-white `}>
            <MainNavbar />
            <div className="flex-1 flex flex-col flex-nowrap p-4">
              {children}
            </div>
          </main>
        </OnlineContainer>
      </body>
    </html>
  );
}
