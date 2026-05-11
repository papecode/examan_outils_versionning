export interface Book {
  id: number;
  titre: string;
  auteur: string;
  categorie: string;
  isbn?: string;
}

export interface BookInput {
  titre: string;
  auteur: string;
  categorie: string;
  isbn?: string;
}
