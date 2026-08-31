import { CategorieBoard } from "@/components/app/categorie-board";

export default function CategoriePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pb-32 pt-8">
      <h1 className="font-display text-display-lg leading-none tracking-tight text-display">
        Categorie
      </h1>
      <CategorieBoard />
    </main>
  );
}