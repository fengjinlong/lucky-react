import { Contanier } from 'hostConfig';
import { Key, Props } from 'shared/ReactTypes';
import { Flags, NoFlags } from './fiberFlags';
import { WorkTag } from './workTags';

export class FiberNode {
	tag: WorkTag;
	type: any;
	pendingProps: Props;
	key: Key;
	stateNode: any;
	ref: any;
	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	index: number;
	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	updateQueue: unknown;
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		this.pendingProps = pendingProps;
		// HostComponent <div> div DOM
		this.stateNode = null;
		// FunctionComponent () => {}
		this.type = null;

		// 父
		this.return = null;
		// 子
		this.child = null;
		// 兄弟
		this.sibling = null;
		// 第一个
		this.index = 0;

		this.ref = null;
		// 开始工作的 props
		this.pendingProps = pendingProps;
		// 工作完成后 props 保存
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		// 作为工作单元
		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}

// 整个应用的根节点  不是 根 dom
export class FiberRootNode {
	container: Contanier;
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Contanier, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

// 创建 workInProgress
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	return wip;
};
