export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
