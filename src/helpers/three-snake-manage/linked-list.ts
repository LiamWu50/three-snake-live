import { SnakeNode } from './snake'

/**
 * @description A linked list data structure
 */
export class LinkedList {
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

/**
 * @description A node of linked list
 */
export class ListNode {
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
