import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';
import { Container } from './hostConfig';

// ReactDom.createRoot(contains).render(App);
export function createRoot(container: Container) {
	const root = createContainer(container);
	return {
		render(element: ReactElementType | null) {
			updateContainer(element, root);
		}
	};
}
