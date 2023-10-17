export default class LinkedList {
  constructor(head) {
    this.head = head
    this.end = head
  }

  addNode(node) {
    this.end.linkTo(node)
    this.end = node
  }
}
