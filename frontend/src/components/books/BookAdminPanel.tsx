import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBook, deleteBook, updateBook } from "@/api/books";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Book } from "@/types/book";

const emptyForm = {
  titre: "",
  auteur: "",
  categorie: "",
  isbn: "",
};

interface BookAdminPanelProps {
  selectedBook: Book | null;
  onClearSelection: () => void;
}

export function BookAdminPanel({ selectedBook, onClearSelection }: BookAdminPanelProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        titre: form.titre.trim(),
        auteur: form.auteur.trim(),
        categorie: form.categorie.trim(),
        ...(form.isbn.trim() ? { isbn: form.isbn.trim() } : {}),
      };

      if (selectedBook) {
        return updateBook(selectedBook.id, payload);
      }
      return createBook(payload);
    },
    onSuccess: async () => {
      toast.success(selectedBook ? "Livre mis a jour." : "Livre ajoute au catalogue.");
      setForm(emptyForm);
      setOpen(false);
      onClearSelection();
      await queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId: number) => deleteBook(bookId),
    onSuccess: async () => {
      toast.success("Livre supprime.");
      onClearSelection();
      await queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openCreateDialog() {
    onClearSelection();
    setForm(emptyForm);
    setOpen(true);
  }

  function openEditDialog(book: Book) {
    setForm({
      titre: book.titre,
      auteur: book.auteur,
      categorie: book.categorie,
      isbn: book.isbn ?? "",
    });
    setOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={openCreateDialog}>Ajouter un livre</Button>
      {selectedBook ? (
        <>
          <Button variant="outline" onClick={() => openEditDialog(selectedBook)}>
            Modifier la selection
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm("Supprimer ce livre ?")) {
                deleteMutation.mutate(selectedBook.id);
              }
            }}
          >
            Supprimer la selection
          </Button>
        </>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBook ? "Modifier un livre" : "Ajouter un livre"}</DialogTitle>
            <DialogDescription>Reservé au personnel de la bibliotheque.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(event) => setForm((current) => ({ ...current, titre: event.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="auteur">Auteur</Label>
              <Input
                id="auteur"
                value={form.auteur}
                onChange={(event) => setForm((current) => ({ ...current, auteur: event.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="categorie">Categorie</Label>
              <Input
                id="categorie"
                value={form.categorie}
                onChange={(event) => setForm((current) => ({ ...current, categorie: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={form.isbn}
                onChange={(event) => setForm((current) => ({ ...current, isbn: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
