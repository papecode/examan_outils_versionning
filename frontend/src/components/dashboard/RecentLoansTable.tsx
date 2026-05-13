import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLoanDate, getLoanStatusLabel, isLoanOverdue } from "@/lib/loans";
import type { Loan } from "@/types/loan";

interface RecentLoansTableProps {
  title: string;
  loans: Loan[];
  bookLabel: (loan: Loan) => string;
  userLabel?: (loan: Loan) => string;
  showUser?: boolean;
}

export function RecentLoansTable({
  title,
  loans,
  bookLabel,
  userLabel,
  showUser = false,
}: RecentLoansTableProps) {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun emprunt a afficher.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {showUser ? <TableHead>Utilisateur</TableHead> : null}
                <TableHead>Livre</TableHead>
                <TableHead>Emprunt</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan, index) => (
                <TableRow key={`${loan.user_id}-${loan.book_id}-${loan.date_emprunt ?? index}`}>
                  {showUser ? (
                    <TableCell>{userLabel ? userLabel(loan) : `#${loan.user_id}`}</TableCell>
                  ) : null}
                  <TableCell>{bookLabel(loan)}</TableCell>
                  <TableCell>{formatLoanDate(loan.date_emprunt)}</TableCell>
                  <TableCell>
                    <Badge variant={isLoanOverdue(loan) ? "destructive" : "secondary"}>
                      {getLoanStatusLabel(loan)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
