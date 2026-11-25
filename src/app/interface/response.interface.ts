export interface IResponse {
  page:             number;
  size:             number;
  totalElements:    number;
  totalPages:       number;
  first:            boolean;
  last:             boolean;
  hasNext:          boolean;
  hasPrevious:      boolean;
  numberOfElements: number;
  empty:            boolean;
}
