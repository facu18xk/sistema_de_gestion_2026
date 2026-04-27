/*Este layout es compartido por todas las páginas dentro de (protected)*/
import Navbar from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-3 space-y-3">
        {children}
      </main>
    </div>
  );
}