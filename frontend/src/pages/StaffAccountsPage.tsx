import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser, listUsers } from "@/api/users";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
import { StaffUserDialogs, type StaffUserDialogMode } from "@/components/users/StaffUserDialogs";
import { StaffUsersTable } from "@/components/users/StaffUsersTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/usePagination";
import { invalidateUserQueries } from "@/lib/queryKeys";
import type { UserRole } from "@/types/user";

const assignableRoles: UserRole[] = ["Etudiant", "Professeur"];

export function StaffAccountsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { page, pageSize, setPage } = usePagination({ resetKey: searchQuery });
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Etudiant");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dialogUserId, setDialogUserId] = useState<number | null>(null);
  const [dialogMode, setDialogMode] = useState<StaffUserDialogMode>(null);
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["users", page, pageSize, searchQuery],
    queryFn: () =>
      listUsers({
        page,
        pageSize,
        ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
      }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createUser({
        nom: nom.trim(),
        email: email.trim(),
        type_utilisateur: role,
      }),
    onSuccess: async () => {
      toast.success("Compte cree.");
      setNom("");
      setEmail("");
      setRole("Etudiant");
      setCreateConfirmOpen(false);
      await invalidateUserQueries(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateConfirmOpen(true);
  }

  function openDialog(userId: number, mode: Exclude<StaffUserDialogMode, null>) {
    setDialogUserId(userId);
    setDialogMode(mode);
  }

  function closeDialog() {
    setDialogUserId(null);
    setDialogMode(null);
  }

  function toggleUser(userId: number, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }

  function togglePage(checked: boolean) {
    const users = usersQuery.data?.items ?? [];
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const user of users) {
        if (checked) {
          next.add(user.id);
        } else {
          next.delete(user.id);
        }
      }
      return next;
    });
  }

  const users = usersQuery.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personnel"
        title="Gestion des comptes"
        description="Creation des comptes Etudiant et Professeur. Cette action n'est pas accessible depuis le parcours public."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nouveau compte</CardTitle>
          <CardDescription>Le mot de passe initial sera transmis par le personnel selon la politique DIT.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nom">Nom complet</Label>
              <Input id="nom" value={nom} onChange={(event) => setNom(event.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email institutionnel</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Profil</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un profil" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createMutation.isPending}>
                Creer le compte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Rechercher par nom, email ou identifiant"
        className="max-w-xl"
      />

      <ListSurface
        footer={
          usersQuery.data ? (
            <PaginationControls
              page={usersQuery.data.page}
              pageSize={usersQuery.data.pageSize}
              total={usersQuery.data.total}
              onPageChange={setPage}
            />
          ) : null
        }
      >
        {usersQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
        {usersQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Liste indisponible</AlertTitle>
            <AlertDescription>Le service utilisateurs n&apos;est pas joignable pour le moment.</AlertDescription>
          </Alert>
        ) : null}
        {usersQuery.data && users.length === 0 ? (
          <Alert>
            <AlertDescription>
              {searchQuery.trim()
                ? "Aucun compte ne correspond a votre recherche."
                : "Aucun compte a afficher."}
            </AlertDescription>
          </Alert>
        ) : null}
        {users.length > 0 ? (
          <StaffUsersTable
            users={users}
            selectedIds={selectedIds}
            onToggleUser={toggleUser}
            onTogglePage={togglePage}
            onOpenDialog={openDialog}
          />
        ) : null}
      </ListSurface>

      <StaffUserDialogs userId={dialogUserId} mode={dialogMode} onClose={closeDialog} />

      <ConfirmActionDialog
        open={createConfirmOpen}
        title="Creer ce compte ?"
        description={`Confirmez la creation du compte ${nom.trim()} (${email.trim()}, ${role}).`}
        confirmLabel="Creer le compte"
        pending={createMutation.isPending}
        onOpenChange={setCreateConfirmOpen}
        onConfirm={() => createMutation.mutate()}
      />
    </div>
  );
}
