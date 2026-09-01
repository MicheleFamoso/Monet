import { Overview } from "@/components/app/overview";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pb-32 pt-8">
      <Overview />
    </main>
  );
}
