import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <>
      <Navbar session={session} />
      {children}
    </>
  );
}
