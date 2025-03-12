import { SocketProvider } from "./context/SocketContext";
import './globals.css'
import 'rsuite/dist/rsuite-no-reset.min.css'
import { CustomProvider } from 'rsuite';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}