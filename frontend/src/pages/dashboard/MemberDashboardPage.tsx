import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRecommendations } from "@/api/recommendations";
import { getUserLoans } from "@/api/loans";
import { listBooks } from "@/api/books";
import { RecentLoansTable } from "@/components/dashboard/RecentLoansTable";
import { QuickActions, StatisticsBlock } from "@/components/dashboard/StatisticsBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { isLoanActive, isLoanOverdue } from "@/lib/loans";
import type { Book } from "@/types/book";

interface MemberDashboardPageProps {
  title: string;
  description: string;
}

function buildBookMap(books: Book[]): Map<number, Book> {
  return new Map(books.map((book) => [book.id, book]));
}

export function MemberDashboardPage({ title, description }: MemberDashboardPageProps) {
  const { user } = useAuth();

  const loansQuery = useQuery({
    queryKey: ["loans", user?.id, "dashboard"],
    queryFn: () => getUserLoans(user!.id, { page: 1, pageSize: 50 }),
    enabled: Boolean(user),
  });

  const booksQuery = useQuery({
    queryKey: ["books", "dashboard"],
    queryFn: () => listBooks({ page: 1, pageSize: 200 }),
  });

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", user?.id, "dashboard"],
    queryFn: () => getRecommendations(user!.id),
    enabled: Boolean(user),
  });

  const loans = loansQuery.data?.items ?? [];
  const bookMap = buildBookMap(booksQuery.data?.items ?? []);
  const activeLoans = loans.filter(isLoanActive);
  const overdueLoans = loans.filter(isLoanOverdue);
  const recommendations = recommendationsQuery.data ?? [];

  const bookLabel = (loan: { book_id: number }) => {
    const book = bookMap.get(loan.book_id);
    return book ? `${book.titre}` : `#${loan.book_id}`;
  };

  return (
    <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="xl:col-span-12">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-pretty text-muted-foreground">{description}</p>
      </div>
      <div className="xl:col-span-12">
        <StatisticsBlock
          items={[
            { label: "Emprunts actifs", value: String(activeLoans.length) },
            { label: "En retard", value: String(overdueLoans.length) },
            {
              label: "Recommandations",
              value: recommendationsQuery.isError ? "Indisponible" : String(recommendations.length),
            },
            { label: "Profil", value: user?.type_utilisateur ?? "-" },
          ]}
        />
      </div>
      <div className="xl:col-span-8">
        <RecentLoansTable title="Emprunts recents" loans={loans.slice(0, 6)} bookLabel={bookLabel} />
      </div>
      <div className="xl:col-span-4">
        <QuickActions>
          <Link to="/espace/emprunts">
            <Button>Emprunter</Button>
          </Link>
          <Link to="/espace/recommandations">
            <Button variant="outline">Voir les recommandations</Button>
          </Link>
          <Link to="/catalogue">
            <Button variant="outline">Catalogue</Button>
          </Link>
        </QuickActions>
        <Card className="mt-4 border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            {recommendations.slice(0, 3).map((book) => (
              <p key={book.id}>{book.titre}</p>
            ))}
            {recommendations.length === 0 ? <p>Aucune suggestion pour le moment.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
