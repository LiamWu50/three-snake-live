import { SnakeNode } from './snake'

export default class ListNode {
  data: SnakeNode
  next: ListNode | null
  prev: ListNode | null

  constructor(data: SnakeNode) {
    this.data = data
    this.next = null
    this.prev = null
  }

  linkTo(node: ListNode) {
    this.next = node
    node.prev = this
  }
}
