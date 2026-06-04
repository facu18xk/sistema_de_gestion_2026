import { Suspense } from "react";
import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
