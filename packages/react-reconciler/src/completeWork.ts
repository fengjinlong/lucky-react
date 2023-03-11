import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

/**
 * @description: 归 操作
 * @param {FiberNode} wip fiberNode
 * @return {*}
 */
export const completeWork = (wip: FiberNode) => {
	// 比较 返回父 fiberNode
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// 更新 DOM
			} else {
				// 创建 DOM
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);
				// 将DOM 插入 DOM 树
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// 更新 DOM
			} else {
				// 创建 DOM
				const instance = createTextInstance(newProps.content);
				// 将DOM 插入 DOM 树
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的 completWork 情况', wip);
			}
			break;
	}
};

/**
 * @description: 插入所有子节点
 * @param {FiberNode} parent
 * @param {FiberNode} wip
 * @return {*}
 */
function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === wip) return;
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) return;
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * @description: 将子 fiberNode 的 flags 冒泡到父 fiberNode subtreeFlags ，根据根节点的 subtreeFlags 判断是否需要有副作用操作
 * @param {FiberNode} wip 当前 fiberNode
 * @return {*}
 */
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
