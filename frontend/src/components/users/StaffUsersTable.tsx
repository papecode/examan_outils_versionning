import {
  EllipsisVertical,
  Eye,
  GraduationCap,
  Pencil,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StaffUserDialogMode } from "@/components/users/StaffUserDialogs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";

interface StaffUsersTableProps {
  users: User[];
  selectedIds: Set<number>;
  onToggleUser: (userId: number, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
  onOpenDialog: (userId: number, mode: Exclude<StaffUserDialogMode, null>) => void;
}

const roleStyles: Record<
  string,
  { icon: LucideIcon; iconColor: string; iconBg: string; badge: "default" | "secondary" | "outline" }
> = {
  Etudiant: {
    icon: GraduationCap,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/15",
    badge: "secondary",
  },
  Professeur: {
    icon: UserRound,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/15",
    badge: "outline",
  },
  Personnel: {
    icon: Shield,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/15",
    badge: "default",
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function StaffUsersTable({
  users,
  selectedIds,
  onToggleUser,
  onTogglePage,
  onOpenDialog,
}: StaffUsersTableProps) {
  const pageIds = users.map((user) => user.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  return (
    <Card className="overflow-hidden border-border/80 pb-0">
      <CardHeader className="px-6">
        <CardTitle>Comptes enregistres</CardTitle>
        <CardDescription>Selectionnez des comptes ou utilisez le menu d&apos;actions.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-3xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="p-3 ps-6">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => onTogglePage(checked === true)}
                    aria-label="Selectionner la page"
                  />
                </TableHead>
                <TableHead className="p-2">Compte</TableHead>
                <TableHead className="p-2">Profil</TableHead>
                <TableHead className="p-3 pe-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {users.map((account) => {
                const style = roleStyles[account.type_utilisateur] ?? roleStyles.Etudiant;
                const RoleIcon = style.icon;
                const canDelete = account.type_utilisateur !== "Personnel";

                return (
                  <TableRow key={account.id}>
                    <TableCell className="whitespace-nowrap p-3 ps-6">
                      <Checkbox
                        checked={selectedIds.has(account.id)}
                        onCheckedChange={(checked) => onToggleUser(account.id, checked === true)}
                        aria-label={`Selectionner ${account.nom}`}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <AccountCell account={account} style={style} RoleIcon={RoleIcon} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={style.badge}>{account.type_utilisateur}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap p-3 pe-6">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions pour ${account.nom}`}
                            className="flex items-center justify-center rounded-full p-2 hover:bg-muted"
                          >
                            <EllipsisVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpenDialog(account.id, "view")}>
                              <Eye />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onOpenDialog(account.id, "edit")}>
                              <Pencil />
                              Modifier
                            </DropdownMenuItem>
                            {canDelete ? (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onOpenDialog(account.id, "delete")}
                              >
                                <Trash2 />
                                Supprimer
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountCell({
  account,
  style,
  RoleIcon,
}: {
  account: User;
  style: (typeof roleStyles)[string];
  RoleIcon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-xs font-semibold",
          style.iconBg,
          style.iconColor,
        )}
      >
        {getInitials(account.nom)}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <div className={cn("flex size-9 items-center justify-center rounded-full", style.iconBg)}>
          <RoleIcon className={cn("size-4", style.iconColor)} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{account.nom}</p>
          <p className="truncate text-xs text-muted-foreground">{account.email || "Sans email"}</p>
        </div>
      </div>
    </div>
  );
}
