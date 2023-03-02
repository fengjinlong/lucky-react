import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

// 创建 workInProgress
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 初始化
	// 根据当前跟新的 fiber,遍历拿到 根 FiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}
function renderRoot(root: FiberRootNode) {
	/**
	 * 初始化之前做什么？谁来调用renderRoot?
	 */
	// 初始化 拿到当前的 fiber
	prepareFreshStack(root);

	// 执行递归
	do {
		try {
			workLoop();
			break;
		} catch (error) {
			console.log('workLoop error', error);
			workInProgress = null;
		}
	} while (1);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;
	if (next === null) {
		// 没有子 fiber, 进行归， 遍历兄弟节点
		completeUnitOfWork(fiber);
	} else {
		// 有子 fiber, 进行递
		workInProgress = next;
	}
}
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		// 递归中的归阶段
		completeWork(node);
		if (node.sibling !== null) {
			workInProgress = node.sibling;
			return;
		}
		// 指向父fiber
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
