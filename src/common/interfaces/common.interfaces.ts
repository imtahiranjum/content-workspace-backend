export interface IPaginationQuery {
  $rpp?: number;
  $page?: number;
  $orderBy: Object;
  $filter: Object;
  $skippedFields: Object;
  $filterLevel2: Object;
}
export interface IPaginationLiveFeedQuery {
  $rpp?: number;
  $page?: number;
}

export interface IPaginatedDataTable {
  pages: string;
  total: number;
  data: Object[];
}

export interface INestedDocumentsCount {
  _id: string;
  count: number;
}
