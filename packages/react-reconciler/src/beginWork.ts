import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';

// 递归中的递阶段
export const beginWork = (wip: FiberNode) => {
	// 比较 返回子 fiberNode
	switch (wip.tag) {
		case HostRoot:
			// 进行两个流程
			// 1. 计算属性最新之 2. 创建子 fiberNode
			return updateHostRoot(wip);
		case HostComponent:
			// 进行一个流程
			// 1. 创建子 fiberNode
			return updateHostComponent(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.log('beginWork', 'default');
			}
	}
	return null;
};
function updateHostRoot(wip: FiberNode) {
	//
	const baseState = wip.memoizedState;
	//
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	// update
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	// 当前 hostRootFiber 的 最新状态
	//  update 当是 App，不是 function，则 memoizedState 就是 ReactElement;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
function updateHostComponent(wip: FiberNode) {
	// 创建子 fiberNode
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	// 返回子 fiberNode
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current === null) {
		// mount 大量 placement 操作， 可以优化  只用 placement 一次根节点
		wip.child = mountChildFibers(wip, null, children);
	} else {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	}
}
