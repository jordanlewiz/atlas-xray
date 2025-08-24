declare module 'tiny-tfidf' {
  export class Document {
    constructor(text: string);
  }

  export class Corpus {
    constructor(names: string[], texts: string[]);
    addDocument(document: Document): void;
    removeDocument(id: string): void;
    getTfidf(documentId: string, term: string): number;
  }
}
