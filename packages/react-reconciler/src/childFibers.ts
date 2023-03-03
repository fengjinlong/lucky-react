import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ReactElementType } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { Placement } from './fiberFlags';
import { HostText } from './workTags';

function ChildReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 根据 element 创建 fiber 并返回
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostText, content, null);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		// 首屏渲染 且 应该追踪副作用时候 进行 标记
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}

	//
	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		// 判断 fiber 类型
		if (typeof newChild === 'object' && newChild !== null) {
			// ...
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				// ...
				default:
					if (__DEV__) {
						console.log('未实现的 reconcile 类型', newChild);
					}
					break;
			}
		}
		// TODO 多节点 ul > li*3
		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}
		if (__DEV__) {
			console.log('未实现的 reconcile 类型', newChild);
		}
		return null;
	};
}
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
