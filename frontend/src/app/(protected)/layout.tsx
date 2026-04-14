import Navbar from "@/components/navbar";
/*Este layout es compartido por todas las páginas dentro de (protected)*/
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16"> {/* El padding para que el contenido no quede bajo el navbar */}
        {children}
      </main>
    </>
  );
}