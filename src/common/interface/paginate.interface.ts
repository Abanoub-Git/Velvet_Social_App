// 3mlto 3shan a3rf types kol ali al7gat ali rag3a mn alreturn bta3 alpaginate f alrepo
export interface IPaginate<T> {
    count: number;
    limit: number;
    pages: number;
    currentPage: number;
    docs: T[]
}