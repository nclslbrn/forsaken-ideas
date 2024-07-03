export interface Project {
    title: string
    date: string
    topic: string
    src: string
}

export type Sorting = "date" | "title" | "topic" 

export interface Params {
  asc: Boolean,
  sorting: Sorting
}
