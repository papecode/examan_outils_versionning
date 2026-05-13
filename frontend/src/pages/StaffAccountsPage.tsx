import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser, listUsers } from "@/api/users";
import { ListSurface } from "@/components/layout/ListSurface";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/layout/PaginationControls";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import type { UserRole } from "@/types/user";

const assignableRoles: UserRole[] = ["Etudiant", "Professeur"];

export function StaffAccountsPage() {
  const queryClient = useQueryClient();
  const { page, pageSize, setPage } = usePagination();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Etudiant");

  const usersQuery = useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => listUsers({ page, pageSize }),
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
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
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

      <Card>
        <CardHeader>
          <CardTitle>Comptes enregistres</CardTitle>
        </CardHeader>
        <CardContent>
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
                <AlertDescription>Aucun compte a afficher.</AlertDescription>
              </Alert>
            ) : null}
            {users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Profil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.id}</TableCell>
                      <TableCell>{account.nom}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{account.type_utilisateur}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </ListSurface>
        </CardContent>
      </Card>
    </div>
  );
}
