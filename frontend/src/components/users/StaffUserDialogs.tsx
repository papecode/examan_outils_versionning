import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteUser, getUserById, updateUser } from "@/api/users";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invalidateUserQueries } from "@/lib/queryKeys";
import type { UserRole } from "@/types/user";

const editableRoles: UserRole[] = ["Etudiant", "Professeur", "Personnel"];

export type StaffUserDialogMode = "view" | "edit" | "delete" | null;

interface StaffUserDialogsProps {
  userId: number | null;
  mode: StaffUserDialogMode;
  onClose: () => void;
}

export function StaffUserDialogs({ userId, mode, onClose }: StaffUserDialogsProps) {
  const queryClient = useQueryClient();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Etudiant");
  const [password, setPassword] = useState("");

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId!),
    enabled: userId !== null && mode !== null,
  });

  const user = userQuery.data;

  useEffect(() => {
    if (!user || mode !== "edit") {
      return;
    }
    setNom(user.nom);
    setEmail(user.email ?? "");
    setRole(user.type_utilisateur as UserRole);
    setPassword("");
  }, [user, mode]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateUser(userId!, {
        nom: nom.trim(),
        email: email.trim(),
        type_utilisateur: role,
        ...(password.trim() ? { password: password.trim() } : {}),
      }),
    onSuccess: async () => {
      toast.success("Compte mis a jour.");
      await invalidateUserQueries(queryClient);
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(userId!),
    onSuccess: async () => {
      toast.success("Compte supprime.");
      await invalidateUserQueries(queryClient);
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate();
  }

  return (
    <>
      <Dialog open={mode === "view"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Details du compte</DialogTitle>
            <DialogDescription>Informations en lecture seule.</DialogDescription>
          </DialogHeader>
          {userQuery.isLoading ? <p className="text-sm text-muted-foreground">Chargement...</p> : null}
          {user ? (
            <dl className="grid gap-3 text-sm">
              <DetailRow label="ID" value={String(user.id)} />
              <DetailRow label="Nom" value={user.nom} />
              <DetailRow label="Email" value={user.email || "-"} />
              <DetailRow label="Profil" value={user.type_utilisateur} />
            </dl>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mode === "edit"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le compte</DialogTitle>
            <DialogDescription>Mettez a jour les informations du compte.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
            <FormField id="edit-nom" label="Nom complet" value={nom} onChange={setNom} required />
            <FormField
              id="edit-email"
              label="Email institutionnel"
              value={email}
              onChange={setEmail}
              type="email"
              required
            />
            <RoleField value={role} onChange={setRole} />
            <FormField
              id="edit-password"
              label="Nouveau mot de passe"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="Laisser vide pour conserver"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={mode === "delete"} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              {user
                ? `Le compte ${user.nom} sera supprime definitivement. Cette action est impossible si des emprunts sont lies au compte.`
                : "Cette action est definitive."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}


function RoleField({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (value: UserRole) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Profil</Label>
      <Select value={value} onValueChange={(next) => onChange(next as UserRole)}>
        <SelectTrigger>
          <SelectValue placeholder="Choisir un profil" />
        </SelectTrigger>
        <SelectContent>
          {editableRoles.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
