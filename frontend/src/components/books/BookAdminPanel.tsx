import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createBook, deleteBook, updateBook } from "@/api/books";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invalidateBookQueries } from "@/lib/queryKeys";
import type { Book } from "@/types/book";

const emptyForm = {
  titre: "",
  auteur: "",
  categorie: "",
  isbn: "",
};

export type BookAdminDialogState =
  | { mode: "create" }
  | { mode: "edit"; book: Book }
  | { mode: "delete"; book: Book }
  | null;

interface BookAdminPanelProps {
  dialog: BookAdminDialogState;
  onDialogChange: (state: BookAdminDialogState) => void;
  onComplete: () => void;
}

export function BookAdminPanel({ dialog, onDialogChange, onComplete }: BookAdminPanelProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false);

  const editingBook = dialog?.mode === "edit" ? dialog.book : null;
  const deletingBook = dialog?.mode === "delete" ? dialog.book : null;
  const formOpen = dialog?.mode === "create" || dialog?.mode === "edit";

  useEffect(() => {
    if (dialog?.mode === "edit") {
      setForm({
        titre: dialog.book.titre,
        auteur: dialog.book.auteur,
        categorie: dialog.book.categorie,
        isbn: dialog.book.isbn ?? "",
      });
      return;
    }
    if (dialog?.mode === "create") {
      setForm(emptyForm);
    }
  }, [dialog]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        titre: form.titre.trim(),
        auteur: form.auteur.trim(),
        categorie: form.categorie.trim(),
        ...(form.isbn.trim() ? { isbn: form.isbn.trim() } : {}),
      };

      if (editingBook) {
        return updateBook(editingBook.id, payload);
      }
      return createBook(payload);
    },
    onSuccess: async () => {
      toast.success(editingBook ? "Livre mis a jour." : "Livre ajoute au catalogue.");
      setForm(emptyForm);
      setCreateConfirmOpen(false);
      onDialogChange(null);
      onComplete();
      await invalidateBookQueries(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId: number) => deleteBook(bookId),
    onSuccess: async () => {
      toast.success("Livre supprime.");
      onDialogChange(null);
      onComplete();
      await invalidateBookQueries(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingBook) {
      saveMutation.mutate();
      return;
    }
    setCreateConfirmOpen(true);
  }

  return (
    <>
      <Button onClick={() => onDialogChange({ mode: "create" })}>Ajouter un livre</Button>

      <Dialog open={formOpen} onOpenChange={(open) => !open && onDialogChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBook ? "Modifier un livre" : "Ajouter un livre"}</DialogTitle>
            <DialogDescription>Reserve au personnel de la bibliotheque.</DialogDescription>
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
              <Button type="button" variant="outline" onClick={() => onDialogChange(null)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingBook)} onOpenChange={(open) => !open && onDialogChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce livre ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingBook
                ? `Le livre « ${deletingBook.titre} » sera retire du catalogue.`
                : "Cette action est definitive."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingBook && deleteMutation.mutate(deletingBook.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmActionDialog
        open={createConfirmOpen}
        title="Ajouter ce livre ?"
        description={`Confirmez l'ajout de « ${form.titre.trim()} » par ${form.auteur.trim()}.`}
        confirmLabel="Ajouter"
        pending={saveMutation.isPending}
        onOpenChange={setCreateConfirmOpen}
        onConfirm={() => saveMutation.mutate()}
      />
    </>
  );
}

export function BookCardAdminMenu({
  book,
  onEdit,
  onDelete,
}: {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions admin pour ${book.titre}`}
        className="flex items-center justify-center rounded-full p-2 hover:bg-muted"
        onClick={(event) => event.stopPropagation()}
      >
        <EllipsisVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <Pencil />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
