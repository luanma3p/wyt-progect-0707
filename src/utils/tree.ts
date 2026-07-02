import type { TreeNode } from '@/api/types/common'

/** 扁平列表转树 */
export function listToTree<T extends { id: string | number; parentId?: string | number | null }>(
  list: T[],
  rootId: string | number | null = null,
): TreeNode<T>[] {
  const map = new Map<string | number, TreeNode<T>>()
  const roots: TreeNode<T>[] = []

  list.forEach((item) => {
    map.set(item.id, { id: item.id, parentId: item.parentId ?? null, data: item })
  })

  list.forEach((item) => {
    const node = map.get(item.id)!
    const parent = map.get((item.parentId ?? null) as string | number)
    if (parent) {
      ;(parent.children ??= []).push(node)
    } else if ((item.parentId ?? null) === rootId) {
      roots.push(node)
    }
  })

  return roots
}

/** 树转扁平列表 */
export function treeToList<T>(nodes: TreeNode<T>[]): TreeNode<T>[] {
  const result: TreeNode<T>[] = []
  const walk = (list: TreeNode<T>[]) => {
    list.forEach((node) => {
      result.push(node)
      if (node.children) walk(node.children)
    })
  }
  walk(nodes)
  return result
}

/** 查找树节点 */
export function findNode<T>(
  nodes: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
): TreeNode<T> | undefined {
  for (const node of nodes) {
    if (predicate(node)) return node
    if (node.children) {
      const found = findNode(node.children, predicate)
      if (found) return found
    }
  }
  return undefined
}
