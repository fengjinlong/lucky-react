import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

let nextEffect: FiberNode | null = null;
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;
	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			// 子节点 有可能存在 flags
			nextEffect = child;
		} else {
			// 向上遍历 DFS
			up: while (true) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null =
					(nextEffect && nextEffect.sibling) || null;
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = (nextEffect && nextEffect.return) || null;
			}
		}
	}
};

const commitMutationEffectsOnFiber = (finishedWork: any) => {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		// 插入

		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
};
/**
 * @description: 插入节点
 * @param {any} finishedWork
 * @return {*}
 */
function commitPlacement(finishedWork: any) {
	if (__DEV__) {
		console.warn('执行 Placement', finishedWork);
	}
	// 获取父节点
	const hostParent = getHostParent(finishedWork);
	// 插入节点
	if (hostParent) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
}
/**
 * @description: 获取父节点对应的 dom
 * @param {FiberNode} fiber
 * @return {*}
 */
function getHostParent(fiber: FiberNode): Container | null {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		// HostRoot HostComponent
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到父节点', fiber);
	}
	return null;
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
