export interface ChecklistItem {
  id: string
  text: string
  category: string
}

export type TrelloMember = {
  id: string
  fullName: string
  username: string
}

export type TrelloCard = {
  id: string
  name: string
  desc: string
  dueComplete: boolean,
  url: string
  members: TrelloMember[]
}