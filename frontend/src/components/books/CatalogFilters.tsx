import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CatalogFiltersProps {
  categories: string[];
  authors: string[];
  category: string;
  author: string;
  onCategoryChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
}

export function CatalogFilters({
  categories,
  authors,
  category,
  author,
  onCategoryChange,
  onAuthorChange,
}: CatalogFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label>Categorie</Label>
        <Select value={category} onValueChange={(value) => onCategoryChange(value ?? "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Auteur</Label>
        <Select value={author} onValueChange={(value) => onAuthorChange(value ?? "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les auteurs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les auteurs</SelectItem>
            {authors.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
