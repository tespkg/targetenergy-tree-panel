import { MatchSearch } from 'commons/enums/MatchSearch'

export type TreeNodeData = {
  id: string
  name: string
  type?: string
  parent?: TreeNodeData
  children?: TreeNodeData[]
  // ui state
  showChildren?: boolean
  selected?: boolean
  matchSearch?: MatchSearch
}
