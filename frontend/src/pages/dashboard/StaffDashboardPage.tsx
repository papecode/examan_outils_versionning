import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listBooks } from "@/api/books";
import { getLoanHistory, getLoanStats } from "@/api/loans";
import { listUsers } from "@/api/users";
import { RecentLoansTable } from "@/components/dashboard/RecentLoansTable";
import { QuickActions, StatisticsBlock } from "@/components/dashboard/StatisticsBlock";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { Book } from "@/types/book";
import type { User } from "@/types/user";

function buildBookMap(books: Book[]): Map<number, Book> {
  return new Map(books.map((book) => [book.id, book]));
}

function buildUserMap(users: User[]): Map<number, User> {
  return new Map(users.map((user) => [user.id, user]));
}

export function StaffDashboardPage() {
  const { user } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["users", "dashboard"],
    queryFn: () => listUsers({ page: 1, pageSize: 200 }),
  });

  const booksQuery = useQuery({
    queryKey: ["books", "dashboard"],
    queryFn: () => listBooks({ page: 1, pageSize: 200 }),
  });

  const statsQuery = useQuery({
    queryKey: ["loans", "stats", "dashboard"],
    queryFn: getLoanStats,
  });

  const historyQuery = useQuery({
    queryKey: ["loans", "history", "dashboard"],
    queryFn: () => getLoanHistory({ page: 1, pageSize: 6 }),
  });

  const recentHistory = historyQuery.data?.items ?? [];
  const bookMap = buildBookMap(booksQuery.data?.items ?? []);
  const userMap = buildUserMap(usersQuery.data?.items ?? []);

  const bookLabel = (loan: { book_id: number }) => {
    const book = bookMap.get(loan.book_id);
    return book ? book.titre : `#${loan.book_id}`;
  };

  const userLabel = (loan: { user_id: number }) => {
    const account = userMap.get(loan.user_id);
    return account ? account.nom : `#${loan.user_id}`;
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6">
      <div className="col-span-12">
        <h1 className="font-heading text-3xl font-semibold">Tableau de bord personnel</h1>
        <p className="mt-2 text-muted-foreground">
          Vue d&apos;ensemble des comptes, ouvrages et emprunts de la bibliotheque.
        </p>
      </div>
      <div className="col-span-12">
        <StatisticsBlock
          items={[
            {
              label: "Comptes",
              value: usersQuery.isError ? "-" : String(usersQuery.data?.total ?? 0),
            },
            {
              label: "Ouvrages",
              value: booksQuery.isError ? "-" : String(booksQuery.data?.total ?? 0),
            },
            {
              label: "Emprunts actifs",
              value: statsQuery.isError ? "-" : String(statsQuery.data?.active ?? 0),
            },
            {
              label: "Retards",
              value: statsQuery.isError ? "-" : String(statsQuery.data?.overdue ?? 0),
            },
          ]}
        />
      </div>
      <div className="col-span-12 xl:col-span-8">
        <RecentLoansTable
          title="Derniers emprunts"
          loans={recentHistory}
          bookLabel={bookLabel}
          userLabel={userLabel}
          showUser
        />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <QuickActions>
          <Link to="/espace/personnel/comptes">
            <Button>Gerer les comptes</Button>
          </Link>
          <Link to="/espace/personnel/historique">
            <Button variant="outline">Historique global</Button>
          </Link>
          <Link to="/espace/personnel/catalogue">
            <Button variant="outline">Catalogue admin</Button>
          </Link>
        </QuickActions>
        <p className="mt-4 text-sm text-muted-foreground">Connecte en tant que {user?.nom}.</p>
      </div>
    </div>
  );
}
