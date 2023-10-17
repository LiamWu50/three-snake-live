import ListNode from './list-node'

export default class LinkedList {
  public head: ListNode
  public end: ListNode

  constructor(head: ListNode) {
    this.head = head
    this.end = head
  }

  addNode(node: ListNode) {
    this.end.linkTo(node)
    this.end = node
  }
}
